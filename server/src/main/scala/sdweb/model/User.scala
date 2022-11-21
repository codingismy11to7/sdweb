package sdweb.model

import zio.json.{DeriveJsonCodec, JsonCodec}

final case class User(username: String, admin: Boolean)

object User { implicit val codec: JsonCodec[User] = DeriveJsonCodec.gen[User] }
