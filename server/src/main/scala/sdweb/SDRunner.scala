package sdweb

import zio.ZIO.systemWith
import zio.process.{Command, CommandError, ProcessOutput}
import zio.{IO, ZIO, ZLayer}

import java.io.File

final case class SDRunner(config: Config, nul: File) {

  def runSD(r: Request): IO[CommandError, Unit] =
    Command(
      "conda",
      "run",
      "-n",
      "ldm",
      "python",
      "scripts/txt2img.py",
      "--seed",
      r.seed.getOrElse(42).toString,
      "--outdir",
      s"${config.outputDir}/${r.id}",
      "--prompt",
      r.prompt,
      "--plms",
    ).stdout(ProcessOutput.FileRedirect(nul))
      .stderr(ProcessOutput.FileRedirect(nul))
      .workingDirectory(config.stableDiffusionDir)
      .successfulExitCode
      .unit
}

object SDRunner {
  private def noOsName(ot: Option[Throwable]) = ot match {
    case Some(t) => t
    case None    => new Throwable("won't happen")
  }

  val live: ZLayer[Config, Throwable, SDRunner] = ZLayer {
    for {
      config    <- ZIO.service[Config]
      isWindows <- systemWith(_.property("os.name")).some.mapBoth(noOsName, _.startsWith("Windows"))
      nullOutput = if (isWindows) "NUL" else "/dev/null"
      nullFile   = new File(nullOutput)
    } yield SDRunner(config, nullFile)
  }
}
