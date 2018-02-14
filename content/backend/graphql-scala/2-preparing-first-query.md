---
title: The first query
pageTitle: "The last steps of preparation to able run first GraphQL query."
description: "In this chapter you will learn last steps of preparation, add graphiql console for easy debugging and at the end, run your first query."
question: "Which key doesn't exists in the root JSON object."
answers: ["operationName", "variables", "fields","query" ]
correctAnswer: 2
---

### Goal

Our goal for this chapter is to run following query:

```graphql

query {
  allLinks {
    id
    name
    description
  }
}
```
The expected result is a list of links.

### Define a model

Let's start from defining a really basic model

<Instruction>

Create file `Link.scala`:

```scala

case class Link(id: Int, url: String, description: String)

```

</Instruction>

As you can see, a `Link` model has less fields than in the Schema You saw in the first chapter, but no worries, we will improve the model in the future. Now we're focusing on completing execution stack so it would be better to keep this model simple.

<Instruction>

Add following chanages to the `DBSchema.scala`:

```scala

//1
class LinksTable(tag: Tag) extends Table[Link](tag, "LINKS"){

    def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def url = column[String]("URL")
    def description = column[String]("DESCRIPTION")

    def * = (id, url, description) <> ((Link.apply _).tupled, Link.unapply)

}

//2
val Links = TableQuery[LinksTable]

//3
val databaseSetup = DBIO.seq(
    Links.schema.create,

    Links forceInsertAll Seq(
      Link(1, "http://howtographql.com", "Awesome community driven GraphQL tutorial"),
      Link(2, "http://graphql.org", "Official GraphQL webpage"),
      Link(3, "https://facebook.github.io/graphql/", "GraphQL specification")
    )
)
```

</Instruction>

We just added database definition of our first model.
* **1** defines mapping to database table,
* **2** gives us a helper we will use to accessing data in this table.
* The last change, **3** is responsible for creating schema and adding three entities to the database.

### Context

Context is an object that flows across the whole execution, in the most cases this object doesn't change at all. The main responsibility of the Context is providing data and utils needed to fulfill the query. In our example we will put there `DAO` so all queries will have access to the database. In the future we will also put there authentication data.

<Instruction>

Create `MyContext` class :

```scala

case class MyContext(dao: DAO)

```

</Instruction>

### GraphQL Server

Time to implement GraphQL Server. This object will be in the second layer of architecture just after HTTP server. Proper HTTP request will be converted into JSON object and send to this server. GraphQL serve will parse that JSON as GraphQL query, executes it and through HTTP layer sends response back to the client. It also will catch GraphQL parsing errors and converts those into the proper HTTP responses.

<Instruction>

Create `GraphQLServer.scala` file:

```scala

import akka.http.scaladsl.server.Route
import sangria.parser.QueryParser
import spray.json.{JsObject, JsString, JsValue}
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.Directives._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}
import akka.http.scaladsl.server._
import sangria.ast.Document
import sangria.execution._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import sangria.marshalling.sprayJson._


object GraphQLServer {

  // 1
  private val dao = DBSchema.createDatabase

  // 2
  def endpoint(requestJSON: JsValue)(implicit ec: ExecutionContext): Route = {

    // 3
    val JsObject(fields) = requestJSON

    // 4
    val JsString(query) = fields("query")

    // 5
    QueryParser.parse(query) match {
      case Success(queryAst) =>
        // 6
        val operation = fields.get("operationName") collect {
          case JsString(op) => op
        }

        // 7
        val variables = fields.get("variables") match {
          case Some(obj: JsObject) => obj
          case _ => JsObject.empty
        }
        // 8
        complete(executeGraphQLQuery(queryAst, operation, variables))
      case Failure(error) =>
        complete(BadRequest, JsObject("error" -> JsString(error.getMessage)))
    }

  }

  private def executeGraphQLQuery(query: Document, operation: Option[String], vars: JsObject)(implicit ec: ExecutionContext) = {
    // 9
    Executor.execute(
      GraphQLSchema.SchemaDefinition, // 10
      query, // 11
      MyContext(dao), // 12
      variables = vars, // 13
      operationName = operation // 14
    ).map(OK -> _)
      .recover {
      case error: QueryAnalysisError => BadRequest -> error.resolveError
      case error: ErrorWithResolver => InternalServerError -> error.resolveError
    }
  }

}

```

</Instruction>

It's one of the most important files in entire backend server so let's analyze it step by step:
* **1** We need access to the database, so it's the step where such connection is created.
* **2** `endpoint` responds with `Route` type. It will be used directly in the routing of HTTP server. It expects JSON object as parameter.
* **3** Main JSON Object is extracted from the root object. From this object will be extracted three children. The format of root JSON object expected by GraphQL implementation looks like this, and every from those 3 keys will be extracted and passed for execution.

  ```
  {
  query: {},
  variables: {},
  operationName: ""    
  }
  ```

  `query` is a query itself, `variables` is additional data for that query. In GraphQL you can send the query and arguments separately. You can also set name for the query, it’s what the third object is for. Imagine that query is like a function, usually you’re using anonymous functions, but for logging or other purposes you could add names. It’s sent as `operationName`.

* **4** We're extracting `query` from request at this point.
* When we have the query, we have to parse it. Sangria provides `QueryParser.parse` (**5**) function we can use in this case. When it failures, server will respond with status 400 and error description int he body of response. After successful parsing, we're also trying to extract other two keys `operationName`(**6**) and `variables`(**7**).At the end all those three object we're passing to the execution function (**8**).
* **9** `Executor.execute` is the most important call in this class because it's the point where query is executed. If executor responds with success, the result is sent back to the client, in all other cases server will respond with status code 4xx and some kind of explanation what was wrong with the query. Executor needs some data to fulfill the request. Three of them are `query`(**11**), `operationName`(**13**) and `variables`(**14**) which are read from request.
The last two are: `GraphQLSchema.SchemaDefinition` and `MyContext(dao)`.
* **12** MyContext is a context object mentioned above. In our exampleyou can see the context is built with DAO object within.
* `GraphQLSchema.SchemaDefinition` is the last object we have to explain here. It contains our Schema - what we are able to query for. It also interprets how data is fetched and which data source it could use (i.e. one or more databases, REST call to the other server…). In short our `SchemaDefinition` file defines what we want to expose. There are defined types (from GraphQL point of view) and shape of the schema a client is able to query for.

### Define GraphQLSchema

<Instruction>

Create GraphQLSchema object:

```scala

import sangria.schema.{Field, ListType, ObjectType}
// #
import sangria.schema._
import sangria.macros.derive._

object GraphQLSchema {

  // 1
  val LinkType = ObjectType[Unit, Link](
       "Link",
       fields[Unit, Link](
         Field("id", IntType, resolve = _.value.id),
         Field("url", StringType, resolve = _.value.url),
         Field("description", StringType, resolve = _.value.description)
       )
     )

  // 2
  val QueryType = ObjectType(
    "Query",
    fields[MyContext, Unit](
      Field("allLinks", ListType(LinkType), resolve = c => c.ctx.dao.allLinks)
    )
  )

  // 3
  val SchemaDefinition = Schema(QueryType)
}
```

</Instruction>

Sangria cannot reuse case classes defined in our domain, it needs its own object of type `ObjectType`. On the other hand, it allows us to decouple API/Sangria models from database representation. This abstraction allows us to freely hide, add or aggregate fields.
* **1** is a definition of ObjectType for our `Link` class. First (String) argument defines the name in the schema. If you want it could differ from name of case class. In `fields` you have to define all those fieds/functions you want to expose. Every field have to contain `resolve` function which tells Sangria how to retireve data for this field. As you can see there is also explicitly defined type for that field.
Manuall mapping could be boring in many cases like you have to map couple of case classes. To avoid boilerplace you can use provided macro.

```scala
implicit val LinkType = deriveObjectType[Unit, Link]()
```

will give the same result as example I used in the code above.
When you want to use macro-way to define objects don't forget to import `sangria.macros.derive._`

* **2** `val QueryType` is a top level object of our schema. Probably it also could be defined by macro but I decided to make it manually. As you can see, the top level object has name `Query` and it (along with nested object) will be available to see in the graphiql console what we will include farther in this chapter. In `fields` definition I've added only one `Field` at this moment.

```scala

  Field("allLinks", ListType(LinkType), resolve = c => c.ctx.dao.allLinks)

```

The snippet above defines a GraphQL field. It's name is "allLinks". It's a list (ListType) of link items (LinkType). At the end we have to provide a function wich will resolve a result. In this case it's a `DAO`'s function `allLinks`. We have to implement it now.

<Instruction>

Add a function to the `DAO` object:

```scala

def allLinks = db.run(Links.result)

```

</Instruction>


### GraphiQL console

[Graphiql](https://github.com/graphql/graphiql) makes able to run queries against our server from the browser. Let's implement it now.

Giter8 template I provided for this example also contains proper file. You can find it in `src/main/resources/graphiql.html`. All we need to do is to define the HTTP server is such way that this file will be exposed and available to be reached in the browser.

### Configure HTTP Server endpoints

The last thing we have to do to fulfill this chapter goal is to configure HTTP server. We have to expose our freshly downloaded `graphiql.html` file and open an endpoint where graphql queries would be sent.

<Instruction>

open the `Server.scala` file and replace `route` function with the following one:

```scala

val route: Route =
    (post & path("graphql")) {
      entity(as[JsValue]) { requestJson =>
        GraphQLServer.endpoint(requestJson)
      }
    } ~ {
      getFromResource("graphiql.html")
    }

```    

</Instruction>

As you can see, a new `route` definition has only two endpoints. Every `POST` to `/graphql` endpoint is delegated to GraphQLServer, everything else is managed by `graphiql.html` file.


### Run the query

<Instruction>

Run the server
```scala

sbt run

```

</Instruction>

And open in the browser an url [http://localhost:8080/graphiql](http://localhost:8080/graphiql)

<Instruction>

In graphiql console execute the following code:

```graphql
query {
  allLinks {
    id
    name
    description
  }
}
```

</Instruction>

The response should looks like that:

```json

{
  "data": {
    "allLinks": [
      {
        "id": 1,
        "url": "http://howtographql.com",
        "description": "Awesome community driven GraphQL tutorial"
      },
      {
        "id": 2,
        "url": "http://graphql.org",
        "description": "Official GraphQL webpage"
      },
      {
        "id": 3,
        "url": "https://facebook.github.io/graphql/",
        "description": "GraphQL specification"
      }
    ]
  }
}

```


### Goal achieved

In this chapter we've finished configuring entire GraphQL server stack and defined very basic first query.
