package sdweb.http

import sdweb.Config
import zio._
import zio.http.{Server, ServerConfig}

case class HttpServer(router: Router, server: Server) {
  val start: UIO[Nothing] = Server.serve(router.routes).provide(ZLayer.succeed(server))
}

object HttpServer {
  private val confLayer =
    ZLayer.environment[Config].map(e => ZEnvironment(ServerConfig().binding(e.get.http.bindTo, e.get.http.port)))

  val live: ZLayer[Config with Router, Throwable, HttpServer] =
    ZLayer.makeSome[Config with Router, HttpServer](confLayer, Server.live, ZLayer.fromFunction(apply _))

  val start: RIO[HttpServer, Nothing] = ZIO.serviceWithZIO(_.start)
}
