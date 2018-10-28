---
title: Deferred Resolvers
pageTitle: "GraphQL Scala - Resolvers"
description: "In this chapter you will learn how to improve performance with deferred resolvers."
question: "Check the correct statement about Deferred Resolvers"
answers: ["Fetcher is a higher level API for Deferred Resolver", "Deferred Resolver is for optimizing a query, Fetcher is for taking data from data source in batch","Fetcher is light version of Deferred Resolver without cache or support for relations", "Deferred Resolver and Fetcher are completely different, not related one to each other" ]
correctAnswer: 0
---


### Deferred Resolvers and Fetchers

`Fetcher`s and `Deferred Resolver`s are mechanisms for batch retrieval of objects from their sources like database or external API. 
`Deferred Resolver` provides an efficient, low-level API but, on the other hand, it’s more complicated to use and less secure. 
`Fetcher` is a specialized version of `Deferred Resolver`. 
It provides a high-level API, it’s easier to use and usually provides all you need. 
It optimizes resolution of fetched entities based on ID or relation. Also, it deduplicates entities and caches the results 
and much more.

Let's implement one for the `Link` entity:

<Instruction>

In `GraphQLSchema` file add a fetcher for `Link` entity.
Place it before `QueryType` declaration and don't forget about imports:

```scala
//in import section: 
import sangria.execution.deferred.Fetcher

//in the body:
val linksFetcher = Fetcher(
  (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids)
)

```

</Instruction>

Now we have to change fields in `QueryType` to use that Fetcher:

<Instruction>

Change fields definition for `link` and `links` with the following code:

```scala

Field("link",
  OptionType(LinkType),
  arguments = Id :: Nil,
  resolve = c => linksFetcher.defer(Id)
),
Field("links",
  ListType(LinkType),
  arguments = List(Argument("ids", ListInputType(IntType))),
  resolve = c => linksFetcher.deferSeq(Ids)
)

```

</Instruction>

We're still using `dao.getLinks` to fetch links from database, but now it's wrapped in `Fetcher`. 
It optimizes the query **before** call. Firstly it gathers all data it should fetch and then it executes queries. 
Caching and deduplication mechanisms allow to avoid duplicated queries and give results faster.

As you can see, we use the same fetcher in two fields, in the first example we're providing only a single id and expecting one
entity in response, optional object (`deferOpt` function). 
In the second case we're providing a list of ids and expecting a sequence of objects (`deferSeq`).

After defining a resolver we have to inform executor to use it.
Firstly, push it to the lower level by using proper `DefferedResolver` function which rebuild it:

<Instruction>

In `GraphQLSchema` create a constant for the deferred resolver.

```scala
//add to imports:
import sangria.execution.deferred.DeferredResolver

//add after linksFetcher:
val Resolver = DeferredResolver.fetchers(linksFetcher)

```

</Instruction>

Such resolver have to be passed into the `Executor` to make it available for use.

<Instruction>

Add the resolver to the executor, open the `GraphQLServer.scala` file, and change `executeGraphQLQuery` function content as follows:

```scala

Executor.execute(
  GraphQLSchema.SchemaDefinition,
  query,
  MyContext(dao),
  variables = vars,
  operationName = operation,
  deferredResolver = GraphQLSchema.Resolver
)
//the rest without changes
```

</Instruction>

Since, we're using `DAO.getLinks` to fetch a single entity or an entire list, we don't need the `getLink` function anymore.

<Instruction>

Open a `DAO` class and remove the `getLink` function.

</Instruction>

### HasId type class

If you tried to execute a query, you got an error at this point. 
The reason is that `Fetcher` needs 'something' what extracts ids from entities. 
This thing is `HasId` type class. You have a few choices on how to provide such class for your model. 
Firstly you can pass it explicitly, like this:

```scala

val linksFetcher = Fetcher(
  (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids)
)(HasId(_.id))

```

On the other hand, you can declare an implicit constant in the same context so the fetcher will take it implicitly.
The third way is to provide `HasId` implicitly inside the companion object of our model, like this:

```scala

object Link {
    implicit val hasId = HasId[Link, Int](_.id)
}

```

For now we're going the second path, but in the `Interfaces` chapter it will change.

<Instruction>

Add an implicit hasId in `GraphQLSchema`

```scala
//add to imports section:
import sangria.execution.deferred.HasId

//add just below LinkType declaration
implicit val linkHasId = HasId[Link, Int](_.id)

```

</Instruction>

---

After the last changes, our `GraphQLSchema` file content should looks like the this:

```scala

package com.howtographql.scala.sangria

import sangria.schema.{ListType, ObjectType}
import models._
import sangria.execution.deferred.{DeferredResolver, Fetcher, HasId}
import sangria.schema._
import sangria.macros.derive._

object GraphQLSchema {

  implicit val LinkType = deriveObjectType[Unit, Link]()
  implicit val linkHasId = HasId[Link, Int](_.id)

  val linksFetcher = Fetcher(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids)
  )

  val Resolver = DeferredResolver.fetchers(linksFetcher)


  val Id = Argument("id", IntType)
  val Ids = Argument("ids", ListInputType(IntType))

  val QueryType = ObjectType(
    "Query",
    fields[MyContext, Unit](
      Field("allLinks", ListType(LinkType), resolve = c => c.ctx.dao.allLinks),
      Field("link",
        OptionType(LinkType),
        arguments = Id :: Nil,
        resolve = c => linksFetcher.deferOpt(c.arg(Id))
      ),
      Field("links",
        ListType(LinkType),
        arguments = Ids :: Nil,
        resolve = c => linksFetcher.deferSeq(c.arg(Ids))
      )
    )
  )

  val SchemaDefinition = Schema(QueryType)
}


```

### Test it

You can debug the `DAO.getLinks` function in any way and execute the following query:

```graphql

query {

    l1: link(id: 1){
      id
      url
    }

  l2: link(id: 1){
      id
      url
    }

    links(ids: [2,3]){
      id
      url
    }

}

```

Even though the query request the same link twice, when you debug it, you can see that `getLinks` is called only once for that ID!

### What's next?

In the next chapter we will add an additional field to the `Link` class. We need to add information about the moment when the link is added. The best type to cover such needs is datetime. 
H2 doesn't support the type we need so we have to manage it somehow manually. 
In Sangria you can define your own scalar types and this is what we will learn about. 
