package sdweb.http

import zio._

import java.util.UUID

final case class SessionManager(sessions: Ref[Map[UUID, String]]) {
  def openSession(sessId: UUID, username: String): UIO[Unit] = sessions.update(_ + (sessId -> username))
  def closeSession(sessId: UUID): UIO[Unit]                  = sessions.update(_ - sessId)
  def userForSession(sessId: UUID): UIO[Option[String]]      = sessions.get.map(_.get(sessId))
  def isValidSession(sessId: UUID): UIO[Boolean]             = userForSession(sessId).map(_.isDefined)
}

object SessionManager {
  val live: ULayer[SessionManager] = ZLayer(Ref.make(Map.empty[UUID, String]).map(SessionManager(_)))
}
