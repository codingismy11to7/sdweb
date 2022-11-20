package sdweb

import com.typesafe.config.ConfigFactory
import io.getquill.SnakeCase
import io.getquill.jdbczio.Quill
import sdweb.model.User
import zio._

import java.sql.SQLException
import java.util.UUID
import javax.sql.DataSource

trait RequestsPersistence {
  def finishedRequests: IO[SQLException, List[Request]]
  def requestById(imageId: UUID): IO[SQLException, Option[Request]]
  def finishedRequest(prompt: String, seed: Option[Int]): IO[SQLException, Option[Request]]
  def save(r: Request): IO[SQLException, Long]
}

trait Users {
  def saveUser(username: String, hashedPw: String): IO[SQLException, Long]
  def userIfValidCreds(username: String, hashedPw: String): IO[SQLException, Option[User]]
  def isValid(username: String, hashedPw: String): IO[SQLException, Boolean]
  def savePassword(username: String, hashedPw: String): IO[SQLException, Long]
}

trait ApiKeys {
  def saveAPIKey(key: String, username: String): IO[SQLException, Long]
  def userFor(apiKey: String): IO[SQLException, Option[User]]
}

object Persistence {
  final private case class PersistUser(username: String, passwordHash: String, admin: Boolean) {
    def toUser: User = User(username, admin)
  }
  final private case class ApiKey(key: String, username: String)

  final private case class PersistenceImpl(quill: Quill.Sqlite[SnakeCase])
      extends RequestsPersistence
      with Users
      with ApiKeys {
    import quill._

    // Requests
    override val finishedRequests: IO[SQLException, List[Request]] = run(query[Request])

    override def requestById(imageId: UUID): IO[SQLException, Option[Request]] =
      run(query[Request].filter(_.id == lift(imageId))).map(_.headOption)

    override def finishedRequest(prompt: String, seed: Option[Int]): IO[SQLException, Option[Request]] =
      requestById(Request.idFor(prompt, seed))

    override def save(r: Request): IO[SQLException, Long] = run(query[Request].insertValue(lift(r)))

    private val userQuery = quote(querySchema[PersistUser]("user"))

    // Users
    override def saveUser(username: String, hashedPw: String): IO[SQLException, Long] =
      run(userQuery.insertValue(lift(PersistUser(username, hashedPw, admin = false))))

    override def userIfValidCreds(username: String, hashedPw: String): IO[SQLException, Option[User]] =
      run(userQuery.filter(u => u.username == lift(username) && u.passwordHash == lift(hashedPw)))
        .map(_.headOption.map(_.toUser))

    override def isValid(username: String, hashedPw: String): IO[SQLException, Boolean] =
      userIfValidCreds(username, hashedPw).map(_.nonEmpty)

    override def savePassword(username: String, hashedPw: String): IO[SQLException, Long] =
      run(userQuery.filter(_.username == lift(username)).update(_.passwordHash -> lift(hashedPw)))

    // API Keys
    override def saveAPIKey(key: String, username: String): IO[SQLException, Long] =
      run(query[ApiKey].insertValue(lift(ApiKey(key, username))))

    override def userFor(apiKey: String): IO[SQLException, Option[User]] =
      run {
        for {
          a <- query[ApiKey].filter(_.key == lift(apiKey))
          u <- userQuery if a.username == u.username
        } yield u
      }.map(_.headOption.map(_.toUser))
  }

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
              | admin boolean not null,
              | primary key (username) on conflict ignore
              |)""".stripMargin)
          stmt.executeUpdate(
            """insert into user (username, password_hash, admin) values (
              | 'steven',
              | 'cc63dc1e5cd9de1c603d9d934f4f14e70a6b4ebfb59d205491a2bcc2da3ffef7855c72a7f8f5e39d366fadb38ae5acaa286a861fbd2033ac449fe48ba70c7833',
              | true
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
      ZLayer.fromFunction(PersistenceImpl.apply _),
      datasource,
      Quill.Sqlite.fromNamingStrategy(SnakeCase),
    )
}
