package sdweb

import zio.{Chunk, URLayer, ZLayer}

import java.util.UUID

final case class FileUtil(config: Config) {
  def images(imgId: UUID): Result = {
    val base    = config.outputDirFile / imgId
    val samples = base / "samples"
    Result(base / "grid-0000.png", Chunk((0 to 5).map(i => samples / s"0000$i.png"): _*))
  }
}

object FileUtil {
  val live: URLayer[Config, FileUtil] = ZLayer.fromFunction(apply _)
}
