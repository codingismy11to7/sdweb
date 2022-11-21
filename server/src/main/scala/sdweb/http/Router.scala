package sdweb
package http

import sdweb.Authentication.AuthError
import sdweb.http.Router.{jsonResponse, AuthHeader, CookieSecret, IntPath, RichRequest, SessionCookie, UuidStr}
import sdweb.{Authentication, Config, FileUtil, RequestProcessor}
import zio._
import zio.http._
import zio.http.model._
import zio.json._
import zio.nio.file.Files
import zio.stream.ZStream

import java.io.File
import java.util.UUID
import scala.annotation.tailrec
import scala.util.Try

final case class Router(
    auth: Authentication,
    users: Users,
    proc: RequestProcessor,
    config: Config,
    fileUtil: FileUtil,
    sessionManager: SessionManager,
    requests: RequestsPersistence,
) {

  private def getSessionId(r: Request) =
    r.cookiesDecoded.find(_.name == SessionCookie).flatMap(_.unSign(CookieSecret)).map(_.content).collect {
      case UuidStr(sessId) => sessId
    }

  private def userForSessionId(r: Request) = getSessionId(r) match {
    case Some(sId) => sessionManager.userForSession(sId)
    case None      => ZIO.succeed(None)
  }

  private def hasValidSessionId(r: Request) = userForSessionId(r).map(_.isDefined)

  private def currentUser(r: Request) = r.headerValue(AuthHeader) match {
    case Some(token) => auth.userFor(token)
    case None        => userForSessionId(r)
  }

  private def currentAdminUser(r: Request) = currentUser(r).map(_.filter(_.admin))

  private def validateAuth(r: Request) =
    ZIO.fail(HttpError.Unauthorized()).unlessZIO(currentUser(r).map(_.isDefined))

  private def validateAdmin(r: Request) =
    ZIO.fail(HttpError.Unauthorized()).unlessZIO(currentAdminUser(r).map(_.isDefined))

  private def sendImage(r: Request)(file: File) =
    for {
      path <- ZIO succeed zio.nio.file.Path.fromJava(file.toPath)
      _    <- ZIO.fail(HttpError.NotFound(r.path.encode)).unlessZIO(Files.exists(path))
    } yield Response(
      headers = Headers.empty.withContentType("image/png").withCacheControlMaxAge(3.days),
      body = Body.fromStream(ZStream.fromFile(file)),
    )

  private val base = config.http.baseUrl.fold(!!)(!! / _)

  private val sendIndex = ZIO succeed Response(
    headers = Headers.empty.withContentType(HeaderValues.textHtml),
    body = Body.fromStream(ZStream.fromFile((config.http.clientDirPath / "index.html").toFile)),
  )

  private def redirectToApp(r: Request) = Response.seeOther(r.referer.getOrElse(config.http.publicUrl))

  private def textResponse(msg: String, status: Status = Status.Ok) = ZIO.succeed(Response.text(msg).setStatus(status))

  private val adminApiRoutes = Http.collectZIO[Request] {
    case r @ Method.GET -> `base` / "api" / "admin" / "users" => validateAdmin(r) *> users.users.map(jsonResponse(_))

    case r @ Method.PUT -> `base` / "api" / "admin" / "users" =>
      validateAdmin(r) *> r.handleStatus[HttpModel.Admin.CreateUser] { cu =>
        val username = cu.username.trim
        import HttpModel.Admin.CreateUserError._
        def excToCUE(e: Exception) = ZIO.logError(s"Error during create user $cu $e").as(ServerError)
        (for {
          _ <- ZIO.fail(UserExists).whenZIO(users.usernameExists(username).flatMapError(excToCUE))
          _ <- ZIO.fail(BadUserName).when(username.isEmpty)
        } yield HttpModel.Admin.CreateUserResponse(None) -> Status.Ok).catchAll { e =>
          ZIO.succeed {
            HttpModel.Admin.CreateUserResponse(Some(e)) -> (e match {
              case ServerError => Status.InternalServerError
              case BadUserName => Status.BadRequest
              case UserExists  => Status.Conflict
            })
          }
        }
      }

    case r @ Method.POST -> `base` / "api" / "admin" / "users" / username / "password" =>
      validateAdmin(r) *> r.handle[HttpModel.Admin.SetUserPassword] { sup =>
        auth.adminUpdatePassword(username, sup.password).as(Response.ok)
      }

    case r @ Method.POST -> `base` / "api" / "admin" / "users" / username / "admin" =>
      r.handle[HttpModel.Admin.SetUserAdmin] { sua =>
        currentAdminUser(r) flatMap {
          case None                              => ZIO.fail(HttpError.Unauthorized())
          case Some(u) if u.username == username => textResponse("Can't modify yourself", Status.BadRequest)
          case Some(_)                           => users.setAdmin(username, sua.admin).as(Response.ok)
        }
      }

    case r @ Method.DELETE -> `base` / "api" / "admin" / "users" / username =>
      currentAdminUser(r) flatMap {
        case None                              => ZIO.fail(HttpError.Unauthorized())
        case Some(u) if u.username == username => textResponse("Can't delete yourself", Status.BadRequest)
        case Some(_)                           => users.delete(username).as(Response.ok)
      }
  }

  private val sessionRoutes = Http.collectZIO[Request] {
    case r @ Method.GET -> `base` / "logout" =>
      getSessionId(r).fold(ZIO.unit)(sessionManager.closeSession) as redirectToApp(r)

    case r @ Method.GET -> `base` / "loggedIn" =>
      hasValidSessionId(r).map(loggedIn => Response.json(s"""{"loggedIn":$loggedIn}"""))

    case r @ Method.POST -> `base` / "login" =>
      (if (r.hasContentType(HeaderValues.applicationXWWWFormUrlencoded)) {
         for {
           body     <- r.body.asString
           args     <- QueryStringDecoder.decode(body, r.charset)
           username <- ZIO.fromOption(args.get("username").flatMap(_.headOption))
           password <- ZIO.fromOption(args.get("password").flatMap(_.headOption))
           userOpt  <- auth.authenticateUser(username, password)
           user     <- ZIO.logWarning(s"got bad login for $username") *> ZIO.fromOption(userOpt).orElseFail {}
           _        <- ZIO.logInfo(s"got valid login for $username")
           sessId   <- Random.nextUUID
           _        <- sessionManager.openSession(sessId, user)
         } yield redirectToApp(r)
           .addCookie(Cookie(SessionCookie, sessId.toString).withMaxAge(30.days.getSeconds).sign(CookieSecret))
       } else ZIO.logInfo(s"got bad login contenttype") *> ZIO.fail {}).catchAll(e =>
        ZIO.logInfo(s"login failed with $e") as redirectToApp(r),
      )
  }

  private val nonAdminApiRoutes = Http.collectZIO[Request] {
    case r @ Method.POST -> `base` / "api" / "key" / "reset" =>
      r.handleJson { (rak: HttpModel.ResetApiKey) =>
        for {
          isValid <- auth.isValidUserPass(rak.username, rak.password).mapError(_.e)
          _       <- ZIO.fail(HttpError.Unauthorized()).unless(isValid)
          newKey  <- auth.createApiKeyFor(rak.username)
        } yield HttpModel.ResetApiKeyResponse(newKey)
      }

    case r @ Method.POST -> `base` / "api" / "user" / "password" =>
      r.handleJson { (chg: HttpModel.ChangePassword) =>
        currentUser(r) flatMap {
          case Some(user) =>
            val resp = HttpModel.ChangePasswordResponse()
            auth.updatePassword(user.username, chg.currentPassword, chg.newPassword).as(resp).catchAll {
              case AuthError.InvalidCredentials(_) => ZIO succeed resp.withError("Incorrect password")
              case AuthError.DatabaseError(e)      => ZIO fail e
            }

          case None => ZIO.logWarning("user not logged in during pw change") *> ZIO.fail(HttpError.Unauthorized())
        }
      }

    case r @ Method.POST -> `base` / "api" / "generate" =>
      validateAuth(r) *> r.handleJson { (g: HttpModel.Generate) =>
        val async = r.url.queryParams.get("async").flatMap(_.head.toBooleanOption).getOrElse(false)
        for {
          _   <- ZIO.logInfo(s"generate request for ${g.prompt}, async=$async")
          req <- sdweb.Request.create(g.prompt, g.seed).orElseFail(HttpError.BadRequest())
          process = proc.processRequest(req)
          _ <- if (async) process.forkDaemon else process
        } yield HttpModel.GenerateResponse(req.id)
      }

    case r @ Method.GET -> `base` / "api" / "prompt" / UuidStr(imageId) =>
      validateAuth(r) *> requests.requestById(imageId).map {
        case Some(request) => Response.json(HttpModel.Generate(request.prompt, request.seed).toJson)
        case None          => Response.status(Status.NotFound)
      }
  }

  private val fileRoutes = Http.collectZIO[Request] {
    case r @ Method.GET -> `base` / "image" / UuidStr(id) => sendImage(r)(fileUtil.images(id).summary)
    case r @ Method.GET -> `base` / "image" / UuidStr(id) / IntPath(idx) =>
      val imgs = fileUtil.images(id)
      ZIO.fromOption(imgs.images.lift(idx)).orElseFail(HttpError.NotFound(r.path.encode)).flatMap(sendImage(r))

    case Method.GET -> `base` / "" => sendIndex

    case Method.GET -> path if path.startsWith(base) =>
      @tailrec
      def remPre(remBase: Path = base, remPath: Path = path): Path =
        if (remBase.isEmpty || remBase.isRoot) remPath
        else remPre(remBase.drop(1), remPath.drop(1))
      val rest = remPre().encode
      val file = (config.http.clientDirPath / rest).toFile.getCanonicalFile.getAbsoluteFile
      if (config.http.clientDirPath.toFile.toPath.relativize(file.toPath).toString.startsWith(".."))
        ZIO.debug("blocking file request") as Response.status(Status.NotFound)
      else {
        def addContentType(headers: Headers) =
          Try(
            Option(java.nio.file.Files.probeContentType(file.toPath)),
          ).toOption.flatten
            .fold(headers)(headers.withContentType(_))

        for {
          f      <- ZIO succeed zio.nio.file.Path.fromJava(file.toPath)
          exists <- Files.exists(f)
          isDir  <- Files.isDirectory(f)
          res <-
            if (exists && !isDir)
              ZIO succeed Response(
                headers = addContentType(Headers.empty),
                body = Body.fromStream(ZStream.fromFile(file)),
              ).withCacheControlMaxAge(3.days)
            else sendIndex
        } yield res
      }
  }

  val routes: RHttpApp[Any] = (sessionRoutes ++ nonAdminApiRoutes ++ adminApiRoutes ++ fileRoutes)
    .catchSome { case e: HttpError => Http succeed Response.fromHttpError(e) } @@ Middleware.cors()
}

object Router {
  val live: URLayer[
    Authentication
      with RequestProcessor
      with Config
      with FileUtil
      with SessionManager
      with RequestsPersistence
      with Users,
    Router,
  ] =
    ZLayer.fromFunction(apply _)

  final private val AuthHeader    = "X-AUTH-TOKEN"
  final private val SessionCookie = "Session"
  final private val CookieSecret  = "uheotnauheotna"

  private object UuidStr {
    def unapply(s: String): Option[UUID] = if (s.length != 36) None else Try(UUID.fromString(s)).toOption
  }
  private object IntPath {
    def unapply(s: String): Option[RuntimeFlags] = s.toIntOption
  }

  private def jsonResponse[A: JsonEncoder](a: A) = Response.json(a.toJson)

  private def decodeJsonBody[A: JsonDecoder](r: Request) = for {
    json <- r.body.asString
    body <- ZIO.fromEither(json.fromJson[A]).mapError(new Exception(_))
  } yield body

  final case class ResponseHandler[A](r: Request) {
    def apply[E <: Throwable](f: A => IO[E, Response])(implicit D: JsonDecoder[A]): Task[Response] =
      for {
        body <- decodeJsonBody[A](r)
        resp <- f(body)
      } yield resp
  }
  final case class JsonResponseHandler[A](r: Request) {
    def apply[B: JsonEncoder, E <: Throwable](f: A => IO[E, B])(implicit D: JsonDecoder[A]): Task[Response] =
      ResponseHandler[A](r)(a => f(a).map(jsonResponse(_)))
  }
  final case class StatusResponseHandler[A](r: Request) {
    def apply[B: JsonEncoder, E <: Throwable](f: A => IO[E, (B, Status)])(implicit D: JsonDecoder[A]): Task[Response] =
      for {
        body           <- decodeJsonBody[A](r)
        (resp, status) <- f(body)
      } yield jsonResponse(resp).setStatus(status)
  }
  implicit class RichRequest(val r: Request) extends AnyVal {
    def decode[A: JsonDecoder]: Task[A]           = decodeJsonBody[A](r)
    def handle[A]: ResponseHandler[A]             = ResponseHandler[A](r)
    def handleJson[A]: JsonResponseHandler[A]     = JsonResponseHandler[A](r)
    def handleStatus[A]: StatusResponseHandler[A] = StatusResponseHandler[A](r)
  }
}
