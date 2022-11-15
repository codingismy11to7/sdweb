ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.10"

ThisBuild / scalafmtOnCompile := true

(ThisBuild / scalacOptions) ++= Seq("-deprecation")

val V = new {
  val logback    = "1.3.4"
  val quill      = "4.6.0"
  val sqlite     = "3.39.3.0"
  val zio        = "2.0.2"
  val zioConfig  = "3.0.2"
  val zioHttp    = "0.0.1+0-0d0f2c07+20221113-0052-SNAPSHOT"
  val zioJson    = "0.3.0"
  val zioNio     = "2.0.0"
  val zioProcess = "0.7.1"
}

lazy val server = project
  .settings(
    name := "sdweb",
    libraryDependencies ++= Seq(
      "ch.qos.logback" % "logback-classic"     % V.logback,
      "dev.zio"       %% "zio"                 % V.zio,
      "dev.zio"       %% "zio-config-magnolia" % V.zioConfig,
      "dev.zio"       %% "zio-config-typesafe" % V.zioConfig,
      "dev.zio"       %% "zio-http"            % V.zioHttp,
      "dev.zio"       %% "zio-http-logging"    % V.zioHttp,
      "dev.zio"       %% "zio-json"            % V.zioJson,
      "dev.zio"       %% "zio-nio"             % V.zioNio,
      "dev.zio"       %% "zio-process"         % V.zioProcess,
      "io.getquill"   %% "quill-jdbc-zio"      % V.quill,
      "org.xerial"     % "sqlite-jdbc"         % V.sqlite,
    ),
    addCompilerPlugin("com.olegpy" %% "better-monadic-for" % "0.3.1"),
  )

lazy val root = (project in file(".")).aggregate(server)
