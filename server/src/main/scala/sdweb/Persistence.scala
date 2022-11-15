package sdweb

import com.typesafe.config.ConfigFactory
import io.getquill.SnakeCase
import io.getquill.jdbczio.Quill
import sdweb.ApiKeys.ApiKey
import sdweb.Users.User
import zio._

import java.sql.SQLException
import javax.sql.DataSource

final case class RequestsPersistence(quill: Quill.Sqlite[SnakeCase]) {
  import quill._

  val finishedRequests: IO[SQLException, List[Request]] = run(query[Request])
  def finishedRequest(prompt: String, seed: Option[Int]): IO[SQLException, Option[Request]] = {
    val id = Request.idFor(prompt, seed)
    run(query[Request].filter(_.id == lift(id))).map(_.headOption)
  }

  def save(r: Request): IO[SQLException, Long] = run(query[Request].insertValue(lift(r)))
}

object Users {
  final private case class User(username: String, passwordHash: String)
}
final case class Users(quill: Quill.Sqlite[SnakeCase]) {
  import quill._

  def save(username: String, hashedPw: String): IO[SQLException, Long] =
    run(query[User].insertValue(lift(User(username, hashedPw))))

  def isValid(username: String, hashedPw: String): IO[SQLException, Boolean] =
    run(query[User].filter(u => u.username == lift(username) && u.passwordHash == lift(hashedPw))).map(_.nonEmpty)
}

object ApiKeys {
  final private case class ApiKey(key: String, username: String)
}
final case class ApiKeys(quill: Quill.Sqlite[SnakeCase]) {
  import quill._

  def save(key: String, username: String): IO[SQLException, Long] =
    run(query[ApiKey].insertValue(lift(ApiKey(key, username))))

  def userFor(apiKey: String): IO[SQLException, Option[String]] =
    run(query[ApiKey].filter(_.key == lift(apiKey))).map(_.headOption.map(_.username))
}

object Persistence {

  private val datasource = {
    val ds = Quill.DataSource.fromConfig(ConfigFactory.load().getConfig("ctx"))

    val init = ZIO.serviceWithZIO[DataSource] { ds =>
      ZIO
        .acquireRelease(ZIO.attemptBlocking(ds.getConnection))(c => ZIO.attemptBlocking(c.close()).ignore)
        .map { conn =>
          val stmt = conn.createStatement()
          stmt.executeUpdate("""create table if not exists request (
              | id varchar not null,
              | prompt varchar not null,
              | seed integer,
              | mod_time integer not null,
              | constraint requests_pkey primary key (id)
              |)""".stripMargin)
          stmt.executeUpdate("""create table if not exists user (
              | username varchar not null,
              | password_hash varchar not null,
              | primary key (username) on conflict ignore
              |)""".stripMargin)
          stmt.executeUpdate(
            """insert into user (username, password_hash) values (
              | 'steven',
              | 'cc63dc1e5cd9de1c603d9d934f4f14e70a6b4ebfb59d205491a2bcc2da3ffef7855c72a7f8f5e39d366fadb38ae5acaa286a861fbd2033ac449fe48ba70c7833'
              |)""".stripMargin,
          )
          stmt.executeUpdate("""create table if not exists api_key (
              | key varchar not null,
              | username varchar not null,
              | primary key (key),
              | foreign key (username) references user (username) on delete cascade on update cascade
              |)""".stripMargin)
        }
        .unit
    }
    val initLayer = ZLayer.scoped(init)

    ZLayer.make[DataSource](ds, initLayer)
  }

  val live: TaskLayer[RequestsPersistence with Users with ApiKeys] =
    ZLayer.make[RequestsPersistence with Users with ApiKeys](
      ZLayer.fromFunction(RequestsPersistence(_)),
      ZLayer.fromFunction(Users(_)),
      ZLayer.fromFunction(ApiKeys(_)),
      datasource,
      Quill.Sqlite.fromNamingStrategy(SnakeCase),
    )
}
