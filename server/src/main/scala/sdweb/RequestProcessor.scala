package sdweb

import zio._

sealed trait ResponseMaker {
  def fileUtil: FileUtil
  protected def toResponse(request: Request): Result = fileUtil.images(request.id)
}

final case class RequestProcessor(
    sdRunner: SDRunner,
    requests: RequestsPersistence,
    config: Config,
    fileUtil: FileUtil,
    taskQueue: Enqueue[(Request, Promise[Exception, Result])],
) extends ResponseMaker {

  def processRequest(request: Request): IO[Exception, Result] =
    requests.finishedRequest(request.prompt, request.seed).flatMap {
      case Some(r) => ZIO succeed toResponse(r)
      case None =>
        for {
          p   <- Promise.make[Exception, Result]
          _   <- taskQueue.offer(request -> p)
          res <- p.await
        } yield res
    }
}

object RequestProcessor {
  val live: URLayer[SDRunner with RequestsPersistence with Config with FileUtil, RequestProcessor] = ZLayer {
    for {
      sdRunner <- ZIO.service[SDRunner]
      requests <- ZIO.service[RequestsPersistence]
      config   <- ZIO.service[Config]
      fileUtil <- ZIO.service[FileUtil]
      queue    <- Queue.unbounded[(Request, Promise[Exception, Result])]
      taskRunner = TaskRunner(sdRunner, requests, fileUtil, queue)
      _ <- taskRunner.start.forkDaemon
    } yield RequestProcessor(sdRunner, requests, config, fileUtil, queue)
  }

  final private case class TaskRunner(
      sdRunner: SDRunner,
      requests: RequestsPersistence,
      fileUtil: FileUtil,
      tasks: Dequeue[(Request, Promise[Exception, Result])],
  ) extends ResponseMaker {

    private def computeImages(request: Request) =
      (sdRunner.runSD(request) *> requests.save(request)).as(toResponse(request))

    val start = (for {
      (req, p) <- tasks.take
      _ <- requests.finishedRequest(req.prompt, req.seed).flatMap {
        case Some(r) => p.succeed(toResponse(r))
        case None    => computeImages(req).intoPromise(p)
      }
    } yield {}).forever
  }

}
