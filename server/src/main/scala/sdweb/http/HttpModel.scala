package sdweb.http

import zio.json.{DeriveJsonCodec, JsonCodec}

import java.util.UUID

object HttpModel {
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
}
