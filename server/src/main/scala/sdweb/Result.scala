package sdweb

import zio.Chunk

import java.io.File

final case class Result(summary: File, images: Chunk[File])
