package sdweb.http

import sdweb.model.User
import zio._

import java.util.UUID

final case class SessionManager(sessions: Ref[Map[UUID, User]]) {
  def openSession(sessId: UUID, user: User): UIO[Unit] = sessions.update(_ + (sessId -> user))
  def closeSession(sessId: UUID): UIO[Unit]            = sessions.update(_ - sessId)
  def userForSession(sessId: UUID): UIO[Option[User]]  = sessions.get.map(_.get(sessId))
  def isValidSession(sessId: UUID): UIO[Boolean]       = userForSession(sessId).map(_.isDefined)
}

object SessionManager {
  val live: ULayer[SessionManager] = ZLayer(Ref.make(Map.empty[UUID, User]).map(SessionManager(_)))
}
