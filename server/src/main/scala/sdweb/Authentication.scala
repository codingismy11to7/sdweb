package sdweb

import zio._

import java.sql.SQLException

final case class Authentication(users: Users, apiKeys: ApiKeys, hasher: Hasher) {
  def isValidUserPass(username: String, password: String): IO[SQLException, Boolean] =
    users.isValid(username, hasher.hash(password))

  def userFor(apiKey: String): IO[SQLException, Option[String]] = apiKeys.userFor(apiKey)
  def isValidApiKey(apiKey: String): IO[SQLException, Boolean]  = userFor(apiKey).map(_.isDefined)

  def createApiKeyFor(username: String): IO[SQLException, String] =
    Random.nextUUID.map(_.toString).tap(apiKeys.save(_, username))

  def updateUserPass(username: String, newpass: String): IO[SQLException, Long] =
    users.save(username, hasher.hash(newpass))
}

object Authentication {
  val live: URLayer[Users with ApiKeys with Hasher, Authentication] = ZLayer.fromFunction(apply _)
}
