import java.io.File

package object sdweb {
  implicit class RichFile(val f: File) extends AnyVal {
    def /(n: Any) = new File(f, n.toString)
  }
}
