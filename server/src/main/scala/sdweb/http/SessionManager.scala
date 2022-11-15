package sdweb.http

import zio._

import java.util.UUID

final case class SessionManager(sessions: Ref[Map[UUID, String]]) {
  def openSession(sessId: UUID, username: String): UIO[Unit] = sessions.update(_ + (sessId -> username))
  def closeSession(sessId: UUID): UIO[Unit]                  = sessions.update(_ - sessId)
  def isValidSession(sessId: UUID): UIO[Boolean]             = sessions.get.map(_.contains(sessId))
}

object SessionManager {
  val live: ULayer[SessionManager] = ZLayer(Ref.make(Map.empty[UUID, String]).map(SessionManager(_)))
}
