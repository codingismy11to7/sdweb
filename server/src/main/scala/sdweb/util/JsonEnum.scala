package sdweb.util

import enumeratum._
import zio.json.{JsonCodec, JsonDecoder, JsonEncoder}

trait JsonEnum[A <: EnumEntry] { this: Enum[A] =>
  implicit val codec: JsonCodec[A] = JsonEnum.codec(this)
}

object JsonEnum {
  def encoder[A <: EnumEntry]: JsonEncoder[A] = JsonEncoder.string.contramap(_.entryName)
  def decoder[A <: EnumEntry](enm: Enum[A]): JsonDecoder[A] =
    JsonDecoder.string.mapOrFail(s => enm.withNameEither(s).left.map(_.getMessage()))
  def codec[A <: EnumEntry](enm: Enum[A]): JsonCodec[A] = JsonCodec(encoder[A], decoder(enm))
}
