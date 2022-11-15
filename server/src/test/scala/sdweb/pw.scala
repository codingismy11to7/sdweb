package sdweb

import zio._

object pw extends ZIOAppDefault {
  override def run: ZIO[Any with ZIOAppArgs with Scope, Any, Any] = (for {
    pw     <- Console.readLine("input pw")
    hasher <- ZIO.service[Hasher]
    _      <- Console.printLine(hasher.hash(pw.trim))
  } yield {}).provide(Hasher.live)
}
