package sdweb
package http

import play.core.parsers.FormUrlEncodedParser
import sdweb.http.Router.{AuthHeader, CookieSecret, IntPath, RichRequest, SessionCookie, UuidStr}
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
    proc: RequestProcessor,
    config: Config,
    fileUtil: FileUtil,
    sessionManager: SessionManager,
) {

  private def getSessionId(r: Request) =
    r.cookiesDecoded.find(_.name == SessionCookie).flatMap(_.unSign(CookieSecret)).map(_.content).collect {
      case UuidStr(sessId) => sessId
    }

  private def hasValidSessionId(r: Request) = getSessionId(r) match {
    case Some(sId) => sessionManager.isValidSession(sId)
    case None      => ZIO.succeed(false)
  }

  private def validateAuth(r: Request) =
    r.headerValue(AuthHeader) match {
      case None        => ZIO.fail(HttpError.Unauthorized()).unlessZIO(hasValidSessionId(r))
      case Some(token) => ZIO.fail(HttpError.Unauthorized()).unlessZIO(auth.isValidApiKey(token))
    }

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

  val routes: RHttpApp[Any] = Http
    .collectZIO[Request] {
      case r @ Method.GET -> `base` / "logout" =>
        getSessionId(r).fold(ZIO.unit)(sessionManager.closeSession) as redirectToApp(r)

      case r @ Method.GET -> `base` / "loggedIn" =>
        hasValidSessionId(r).map(loggedIn => Response.json(s"""{"loggedIn":$loggedIn}"""))

      case r @ Method.POST -> `base` / "login" =>
        (if (r.hasContentType(HeaderValues.applicationXWWWFormUrlencoded)) {
           for {
             body <- r.body.asString
             args = FormUrlEncodedParser.parse(body, r.charset.name())
             username <- ZIO.fromOption(args.get("username").flatMap(_.headOption))
             password <- ZIO.fromOption(args.get("password").flatMap(_.headOption))
             valid    <- auth.isValidUserPass(username, password)
             _        <- (ZIO.debug(s"got bad login for $username") *> ZIO.fail {}).unless(valid)
             _        <- ZIO.debug(s"got valid login for $username")
             sessId   <- Random.nextUUID
             _        <- sessionManager.openSession(sessId, username)
           } yield redirectToApp(r)
             .addCookie(Cookie(SessionCookie, sessId.toString).withMaxAge(30.days.getSeconds).sign(CookieSecret))
         } else ZIO.debug(s"got bad login ct") *> ZIO.fail {}).catchAll(e =>
          ZIO.debug(s"login failed with $e") as redirectToApp(r),
        )

      case r @ Method.POST -> `base` / "api" / "key" / "reset" =>
        r.handle { (rak: HttpModel.ResetApiKey) =>
          for {
            isValid <- auth.isValidUserPass(rak.username, rak.password)
            _       <- ZIO.fail(HttpError.Unauthorized()).unless(isValid)
            newKey  <- auth.createApiKeyFor(rak.username)
          } yield HttpModel.ResetApiKeyResponse(newKey)
        }

      case r @ Method.POST -> `base` / "api" / "generate" =>
        validateAuth(r) *> r.handle { (g: HttpModel.Generate) =>
          for {
            _   <- ZIO.debug(s"generate request for ${g.prompt}")
            req <- sdweb.Request.create(g.prompt, g.seed).orElseFail(HttpError.BadRequest())
            _   <- proc.processRequest(req)
          } yield HttpModel.GenerateResponse(req.id)
        }

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
                )
              else sendIndex
          } yield res
        }

    }
    .catchSome { case e: HttpError => Http succeed Response.fromHttpError(e) } @@ Middleware.cors()
}

object Router {
  val live: URLayer[Authentication with RequestProcessor with Config with FileUtil with SessionManager, Router] =
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

  final case class RR[A](r: Request) {
    def apply[B: JsonEncoder](f: A => Task[B])(implicit D: JsonDecoder[A]): ZIO[Any, Throwable, Response] = for {
      json <- r.body.asString
      body <- ZIO.fromEither(json.fromJson[A]).mapError(new Exception(_))
      resp <- f(body)
    } yield Response.json(resp.toJson)
  }
  implicit class RichRequest(val r: Request) extends AnyVal {
    def handle[A]: RR[A] = RR[A](r)
  }
}
