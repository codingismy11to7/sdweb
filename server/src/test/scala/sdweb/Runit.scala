package sdweb

import zio.{ZIO, ZIOAppArgs, ZIOAppDefault}

object Runit extends ZIOAppDefault {
  private def runcmd(prompt: String, seed: Option[Int]) =
    for {
      req <- Request.create(prompt, seed)
      res <- ZIO.serviceWithZIO[RequestProcessor](_.processRequest(req))
    } yield res

  override def run: ZIO[ZIOAppArgs, Any, Any] =
    getArgs
      .flatMap(args => runcmd(args.head, args.lift(1).flatMap(_.toIntOption)))
      .flatMap(ZIO.debug(_))
      .provideSome(RequestProcessor.live, SDRunner.live, Config.live, Persistence.live, FileUtil.live)
}
