package sdweb

import zio.{TaskLayer, ZIO, ZLayer}

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

trait Hasher {
  def hash(s: String): String
}

object Hasher {
  final private case class Impl(md: MessageDigest) extends Hasher {
    override def hash(s: String): String =
      md.digest(s.getBytes(StandardCharsets.UTF_8)).map("%02x".format(_)).mkString
  }

  val live: TaskLayer[Hasher] =
    ZLayer.make[Hasher](ZLayer(ZIO.attemptBlocking(MessageDigest.getInstance("SHA-512"))), ZLayer.fromFunction(Impl(_)))
}
