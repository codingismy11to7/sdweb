package sdweb

import sdweb.Authentication.AuthError
import sdweb.Authentication.AuthError.{DatabaseError, InvalidCredentials}
import sdweb.model.User
import zio._

import java.sql.SQLException

final case class Authentication(users: Users, apiKeys: ApiKeys, hasher: Hasher) {
  private def toDbError(e: SQLException) = DatabaseError(e)

  def authenticateUser(username: String, password: String): IO[DatabaseError, Option[User]] =
    users.userIfValidCreds(username, hasher.hash(password)).mapError(toDbError)

  def isValidUserPass(username: String, password: String): IO[DatabaseError, Boolean] =
    users.isValid(username, hasher.hash(password)).mapError(toDbError)

  def userFor(apiKey: String): IO[SQLException, Option[User]]  = apiKeys.userFor(apiKey)
  def isValidApiKey(apiKey: String): IO[SQLException, Boolean] = userFor(apiKey).map(_.isDefined)

  def createApiKeyFor(username: String): IO[SQLException, String] =
    Random.nextUUID.map(_.toString).tap(apiKeys.saveAPIKey(_, username))

  def adminUpdatePassword(username: String, newPassword: String): IO[SQLException, Long] =
    users.savePassword(username, hasher.hash(newPassword))

  def adminAddUser(username: String, password: String): IO[SQLException, Long] =
    users.saveUser(username, hasher.hash(password))

  def updatePassword(username: String, oldPassword: String, newPassword: String): IO[AuthError, Unit] = for {
    _ <- ZIO.fail(InvalidCredentials(username)).unlessZIO(isValidUserPass(username, oldPassword))
    _ <- users.savePassword(username, hasher.hash(newPassword)).mapError(toDbError)
  } yield {}
}

object Authentication {
  sealed trait AuthError
  object AuthError {
    final case class DatabaseError(e: SQLException)       extends AuthError
    final case class InvalidCredentials(username: String) extends AuthError
  }

  val live: URLayer[Users with ApiKeys with Hasher, Authentication] = ZLayer.fromFunction(apply _)
}
