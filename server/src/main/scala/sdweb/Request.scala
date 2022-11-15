package sdweb

import zio.{Clock, IO, UIO, ZIO}

import java.io.{ByteArrayOutputStream, DataOutputStream}
import java.util.UUID

final case class Request(id: UUID, prompt: String, seed: Option[Int], modTime: Long)

object Request {
  sealed trait Error
  case object EmptyPrompt extends Error

  def idFor(prompt: String, seed: Option[Int]): UUID = {
    val baos = new ByteArrayOutputStream()
    val bado = new DataOutputStream(baos)
    bado.writeUTF(prompt)
    seed.filterNot(_ == 42).foreach(bado.writeInt)
    bado.flush()
    UUID.nameUUIDFromBytes(baos.toByteArray)
  }

  def create(prompt: String, seed: Option[Int]): IO[Error, Request] = prompt.toLowerCase.trim match {
    case ""     => ZIO fail EmptyPrompt
    case prompt => Clock.instant.map(_.toEpochMilli).map(Request(idFor(prompt, seed), prompt, seed, _))
  }
}
