package sdweb.http

import enumeratum._
import sdweb.model.User
import sdweb.util.JsonEnum
import zio.json.{DeriveJsonCodec, JsonCodec}

import java.util.UUID

object HttpModel {
  final case class LoggedInResponse(loggedIn: Boolean, user: Option[User])
  object LoggedInResponse { implicit val codec: JsonCodec[LoggedInResponse] = DeriveJsonCodec.gen[LoggedInResponse] }

  final case class ResetApiKey(username: String, password: String)
  object ResetApiKey { implicit val codec: JsonCodec[ResetApiKey] = DeriveJsonCodec.gen[ResetApiKey] }

  final case class ResetApiKeyResponse(apiKey: String)
  object ResetApiKeyResponse {
    implicit val codec: JsonCodec[ResetApiKeyResponse] = DeriveJsonCodec.gen[ResetApiKeyResponse]
  }

  final case class Generate(prompt: String, seed: Option[Int])
  object Generate { implicit val codec: JsonCodec[Generate] = DeriveJsonCodec.gen[Generate] }
  final case class GenerateResponse(imageId: UUID)
  object GenerateResponse { implicit val codec: JsonCodec[GenerateResponse] = DeriveJsonCodec.gen[GenerateResponse] }

  final case class ChangePassword(currentPassword: String, newPassword: String)
  object ChangePassword { implicit val codec: JsonCodec[ChangePassword] = DeriveJsonCodec.gen[ChangePassword] }
  final case class ChangePasswordResponse(error: Option[String] = None) {
    def withError(e: String): ChangePasswordResponse = copy(error = Some(e))
  }
  object ChangePasswordResponse {
    implicit val codec: JsonCodec[ChangePasswordResponse] = DeriveJsonCodec.gen[ChangePasswordResponse]
  }

  object Admin {
    final case class CreateUser(username: String, password: String)
    object CreateUser { implicit val codec: JsonCodec[CreateUser] = DeriveJsonCodec.gen[CreateUser] }

    sealed trait CreateUserError extends EnumEntry
    object CreateUserError extends Enum[CreateUserError] with JsonEnum[CreateUserError] {
      val values: IndexedSeq[CreateUserError] = findValues

      case object UserExists  extends CreateUserError
      case object BadUserName extends CreateUserError
      case object ServerError extends CreateUserError
    }
    final case class CreateUserResponse(error: Option[CreateUserError])
    object CreateUserResponse {
      implicit val codec: JsonCodec[CreateUserResponse] = DeriveJsonCodec.gen[CreateUserResponse]
    }

    final case class SetUserPassword(password: String)
    object SetUserPassword { implicit val codec: JsonCodec[SetUserPassword] = DeriveJsonCodec.gen[SetUserPassword] }

    final case class SetUserAdmin(admin: Boolean)
    object SetUserAdmin { implicit val codec: JsonCodec[SetUserAdmin] = DeriveJsonCodec.gen[SetUserAdmin] }
  }
}
