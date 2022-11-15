package sdweb

import zio.config.{toKebabCase, ReadError}
import zio.config.magnolia.descriptor
import zio.config.typesafe.TypesafeConfig
import zio.nio.file.Path
import zio.{Layer, URIO, ZIO}

import java.io.File

final case class HttpConfig(bindTo: String, port: Int, baseUrl: Option[String], clientDir: String, publicUrl: String) {
  lazy val clientDirPath: Path = Path(clientDir)
}
final case class Config(outputDir: String, sdDir: String, http: HttpConfig) {
  lazy val stableDiffusionDir = new File(sdDir)
  lazy val outputDirFile      = new File(outputDir)
}

object Config {
  val config: URIO[Config, Config] = ZIO.service[Config]

  private val desc = descriptor[Config].mapKey(toKebabCase)

  val live: Layer[ReadError[String], Config] = TypesafeConfig.fromResourcePath(desc)
}
