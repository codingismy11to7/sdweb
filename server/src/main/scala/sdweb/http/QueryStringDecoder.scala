package sdweb.http

import io.netty.handler.codec.http.{QueryStringDecoder => QSD}
import zio.{NonEmptyChunk, ZIO}

import java.nio.charset.Charset
import scala.collection.immutable.ListMap
import scala.jdk.CollectionConverters._

object QueryStringDecoder {
  def decode(
      data: String,
      charset: Charset,
      maxParams: Int = 1024,
  ): ZIO[Any, IllegalArgumentException, ListMap[String, NonEmptyChunk[String]]] = ZIO
    .attempt {
      val qsd    = new QSD(data, charset, false, maxParams, true)
      val params = qsd.parameters().entrySet().asScala.view
      ListMap.from(
        params.map(entry => entry.getKey -> NonEmptyChunk.fromIterableOption(entry.getValue.asScala)).collect {
          case (key, Some(value)) => key -> value
        },
      )
    }
    .refineToOrDie[IllegalArgumentException]
}
