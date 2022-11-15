package sdweb

import zio.{IO, ZLayer}
import zio.process.{Command, CommandError}

final case class SDRunner(config: Config) {

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
    ).inheritIO
      .workingDirectory(config.stableDiffusionDir)
      .successfulExitCode
      .unit
}

object SDRunner {
  val live: ZLayer[Config, Nothing, SDRunner] = ZLayer.fromFunction(SDRunner(_))
}
