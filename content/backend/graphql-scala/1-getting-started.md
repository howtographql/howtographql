---
title: Getting Started
pageTitle: "Prepare development stack to build GraphQL server"
description: "In this chapter will be described how to setup the HTTP server, install all dependencies and setup the database."
question: "Does GraphQL needs HTTP Server?"
answers: ["Yes. It needs HTTP server.", "Yes, it needs HTTP server but some of features can be used without that", "No, but it strictly recommended to use. Without HTTP layer, GraphQL is losing some of its features.","No, GraphQL is specification is far away from tranportation protocol. You can use HTTP, Websockets, sockets or even use it internally in you application." ]
correctAnswer: 3
---

In this chapter you will learn how to:
* Initialize the SBT project,
* Add all dependencies,
* Setup basic HTTP server,
* Setup Database schema and connection.

### Initialize new project

First step will be preparation of SBT project.

I assume you're familiar with any modern IDE which improve you productivity.But,  if you don't know any, I recommend to try [IntelliJ IDEA CE](https://www.jetbrains.com/idea/download) which has awsome plugin for Scala.

Either you use IDE or not, you have to start from preparing `build.sbt` configuration file.

<Instruction>

Create `build.sbt` file in empty folder with following content:

```scala

name := "howtograph-sangria"

version := "1.0"

description := "GraphQL server with akka-http and sangria"

scalaVersion := "2.12.3"

scalacOptions ++= Seq("-deprecation", "-feature")

libraryDependencies ++= Seq(
  "org.sangria-graphql" %% "sangria" % "1.3.0",
  "org.sangria-graphql" %% "sangria-spray-json" % "1.0.0",
  "com.typesafe.akka" %% "akka-http" % "10.0.10",
  "com.typesafe.akka" %% "akka-http-spray-json" % "10.0.10",

  "com.typesafe.slick" %% "slick" % "3.2.1",
  "com.typesafe.slick" %% "slick-hikaricp" % "3.2.1",
  "org.slf4j" % "slf4j-nop" % "1.6.6",
  "com.h2database" % "h2" % "1.4.196",

  "org.scalatest" %% "scalatest" % "3.0.4" % Test
)

Revolver.settings

```

</Instruction>

As you can see at the end of file, I'm using [Revolver Plugin](https://github.com/spray/sbt-revolver). This plugin is really helpful during development. It watches filesystem, recompiles changed files and after that reloads HTTP server. So are able to see all the changes without restarting the server manually.

Let's add Revolver to the project:


<Instruction>

Create also directory `project` inside of it create two files: `build.properties` and `plugins.sbt`
In first place type `sbt.version=0.13.6` to define that we want to use the latest version of SBT.

In the second of these files add dependency to the plugin:

```scala

addSbtPlugin("io.spray", % "sbt-revolver" % "0.7.2")

```

</Instruction>

### HTTP Server

Time to create HTTP Server

<Instruction>

Create `Server.scala` file which will be our HTTP server and entry point for the application.
Use content as follows:

```scala
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import akka.http.scaladsl.server.Directives._
import spray.json._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._

import scala.concurrent.Await
import scala.language.postfixOps

//1
object Server extends App {

  //2
  val PORT = 8080

  implicit val actorSystem = ActorSystem("graphql-server")
  implicit val materializer = ActorMaterializer()

  import actorSystem.dispatcher
  import scala.concurrent.duration._

  scala.sys.addShutdownHook(() -> shutdown())

  //3
  val route: Route = {
    complete("Hello GrahpQL Scala!!!")
  }

  Http().bindAndHandle(route, "0.0.0.0", PORT)
  println(s"open a browser with URL: http://localhost:$PORT")


  def shutdown(): Unit = {
    actorSystem.terminate()
    Await.result(actorSystem.whenTerminated, 30 seconds)
  }
}
```

</Instruction>

Our server extends an `App` trait so SBT can find it and run when you'll use `sbt run` command. When there are more such files in your project, SBT will ask you which one you want to run.

At point 2, there is defined port number we want to use, choose what you want if proposed `8080` doesn't work for you. The main point of the file is `val route` definitions. For now, in all cases, server responds with simple text to prove it's working, but no worries, you will change this value in the near future.

What is worth to point out here: In our example I use [Spray JSON](https://github.com/spray/spray-json) library for marshalling and unmarshalling JSON objects, but it isn't obligatory for you. You can use whatever JSON library you want, but in such case you have to change dependencies. [On this page](http://sangria-graphql.org/download/) you can find what JSON libraries Sagria can play with.

### Database configuration

In our project I chose to use H2 database. It's easy to configure and is able to run in memory - you no need to install any additional pakcages in your OS. In such cases like this tutorial H2 works perfectly, but if want to use another DB, it's up to you, Slick supports many of them.

<Instruction>

Inside `src/main/resources` directory, create an `application.conf` file with the following content:

```
h2mem = {
  url = "jdbc:h2:mem:howtographqldb"
  driver = org.h2.Driver
  connectionPool = disabled
  keepAliveConnection = true
}
```

</Instruction>

It's all we need to configure a Database, now we're ready to use it. For the future purposes we will create two additional files.
The first `DAO` object will be responsible for accessing database. We will put there all the functions responsible for managing database data.

<Instruction>

Create `DAO.scala` file:

```scala
import slick.jdbc.H2Profile.api._

class DAO(db: Database) {}
```

</Instruction>

In the second class: `DBSchema`, we will put Database Schema configuration along helper functions like pupulating data.

<Instruction>

Create `DBSchema.scala` file:
```scala
import slick.jdbc.H2Profile.api._

import scala.concurrent.duration._
import scala.concurrent.Await
import scala.language.postfixOps


object DBSchema {

  //1
  val databaseSetup = DBIO.seq(

  )

  //2
  def createDatabase: DAO = {
    val db = Database.forConfig("h2mem")

    Await.result(db.run(databaseSetup), 10 seconds)

    new DAO(db)

  }

}
```

</Instruction>

In the first function in the class will be entire logic that should be executed during server start. Second function creates Database object based on loaded configuration. No worries about blocking logic here, I wanted to keep it simple here.

To recap, in this chapter we learnt how to:
* Initialize the SBT project,
* Add all dependencies,
* Setup basic HTTP server,
* Setup Database schema and connection.
