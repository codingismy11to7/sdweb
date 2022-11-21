package sdweb

import sdweb.http.{HttpServer, Router, SessionManager}
import zio._
import zio.logging.backend.SLF4J

object Main extends ZIOAppDefault {

  override val bootstrap: ZLayer[ZIOAppArgs, Any, Any] = Runtime.removeDefaultLoggers >>> SLF4J.slf4j

  final val run =
    HttpServer.start.provide(
      HttpServer.live,
      Router.live,
      Config.live,
      Authentication.live,
      Persistence.live,
      Hasher.live,
      RequestProcessor.live,
      SDRunner.live,
      FileUtil.live,
      SessionManager.live,
    )
}
