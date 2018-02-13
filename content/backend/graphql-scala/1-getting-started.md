---
title: Getting Started
pageTitle: "Prepare development stack to build GraphQL server"
description: "In this chapter will be described how to setup the HTTP server, install all dependencies and setup the database."
question: "Does GraphQL needs HTTP Server?"
answers: ["Yes. It needs HTTP server.", "Yes, it needs HTTP server but some of features can be used without that", "No, but it strictly recommended to use. Without HTTP layer, GraphQL is losing some of its features.","No, GraphQL is specification is far away from transport protocol. You can use HTTP, Websockets, sockets or even use it internally in you application." ]
correctAnswer: 3
---

In this chapter you will learn how to:
* Initialize the SBT project from [giter8](http://www.foundweekends.org/giter8/) template.,
* Setup Database schema and connection.

### Initialize new project

For purpose of this tutorial I've prepared a giter8 template you can use to easly bootstrap a project. All you need is SBT in the newest version.

<Instruction>

Go to directory where you want to bootstrap project and run this command:

```bash
sbt new marioosh/howtographql-scala-sangria.g8
```

</Instruction>

You will be asked about name and port to use by the server but you can hit ENTER to keep default values.

After this process you will see simple project created in the directory with the structure like this:

```

howtographql-sangria
├── README.md
├── build.sbt
├── project
│   ├── build.properties
│   └── plugins.sbt
└── src
    └── main
        ├── resources
        │   └── application.conf
        └── scala
            └── com
                └── howtographql
                    └── scala
                        └── sangria
                            ├── DAO.scala
                            ├── DBSchema.scala
                            └── Server.scala
```

I will explain shortly the most important files here.

  - `build.sbt`
  - `project/plugins.sbt`
  - `project/build.properties`

Files above are for SBT itself. There you can find all dependencies to external libraries and plugins we will use in the project.
I assume you're at least beginner in the scala and you understand what is going on in those files. One thing you could be unfamiliar with is `Revolver` plugin.
This plugin is responsible for restarting server every time you save the files, so akka-http will server always updated version. It's very helpful during development process.



### HTTP Server

<Instruction>

Open `Server.scala` file. It will be our HTTP server and entry point for the application.
You should see a content as follows:

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

Our server extends an `App` trait so SBT can find it and run when you'll use `sbt run` command. All the an `App` does is implementing a `main` function which is default entry point when executed. In case there are more such files in your project, SBT will ask you which one you want to run.

At point 2, there is defined port number we want to use, you could choose it during project initialization.

What is worth pointing out here: In our example I use [Spray JSON](https://github.com/spray/spray-json) library for marshalling and unmarshalling JSON objects, but it isn't obligatory for you. You can use whatever JSON library you want. [On this page](http://sangria-graphql.org/download/) you can find which JSON libraries Sagria can play with.

### Database configuration

In our project I chose to use H2 database. It's easy to configure and is able to run in memory - you don't need to install any additional packages in your OS. For such cases like this tutorial H2 works perfectly, but if you want to use another DB, it's up to you, Slick supports many of them.

<Instruction>

Inside `src/main/resources` directory, find an `application.conf`, and confirm a database setup.

```
h2mem = {
  url = "jdbc:h2:mem:howtographqldb"
  driver = org.h2.Driver
  connectionPool = disabled
  keepAliveConnection = true
}
```

</Instruction>

It's all we need to configure a database, now we're ready to use it. For the future purposes we will create two additional files.

`DAO.scala` is almost empty for now. It will contain all the logic for database connection. In future updates.

In the second class: `DBSchema`, we will put database schema configuration along with helper functions like populating data.

</Instruction>

The object above will be useful in the future  We will use it to setup and configure the database. For the sake of simplicity we won't worry too much about blocking.

To recap, in this chapter we learnt how to:
* Initialize the SBT project,
* Setup Database schema and connection.
