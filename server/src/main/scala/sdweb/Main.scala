package sdweb

import sdweb.http.{HttpServer, Router, SessionManager}
import zio._

object Main extends ZIOAppDefault {
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
