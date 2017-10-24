---
title: Deferred Resolvers
pageTitle: "Usage of Deferred Resolvers for better performance"
description: "In this chapter, at first you will learn how to use deferred resolvers for better performance."
question: "Check the correct statement about Deferred Resolvers"
answers: ["Fetcher is higher level API for Deferred Resolver", "Deferred Resolver is of optimizing a query, Fetcher is for taking data from data source in batch","Fetcher is light version of Deferred Resolver without cache or support for relations", "Deferred Resolver and Fetcher are completely different, not related one to each other things" ]
correctAnswer: 0
---


### Deferred Resolvers and Fetchers

`Fetcher`s and `Deferred Resolver`s are mechanisms for batch retrieval of object from their sources like database or external API. `Deferred Resolver` provides low-level efficient API but, on the other hand, it’s more complicated in use and less secured. `Fetcher` is a specialized version of `Deferred Resolver`. It provides high-level API, it’s easier to use and usually provides all you need. It optimizes resolution of fetched entities based on its ID or relation, it deduplicates entities and caches the results, to name but a few possibilities.

Let's implement one for `Link`:

<Instruction>

Add definition of fetcher for link to the `GraphQLSchema` object:

```scala

val linksFetcher = Fetcher(
  (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids)
)

```

</Instruction>

Now we have to change fields in `QueryType`:

<Instruction>

Change Fields definition for the `link` and `links` with the following code:

```scala

Field("link",
  OptionType(LinkType),
  arguments = Id :: Nil,
  resolve = c => linksFetcher.deferOpt(c.arg[Int]("id"))
),
Field("links",
  ListType(LinkType),
  arguments = List(Argument("ids", ListInputType(IntType))),
  resolve = c => linksFetcher.deferSeq(c.arg[Seq[Int]]("ids"))
)

```

</Instruction>

We're still using `dao.getLinks` to fetch links from database, but now it's wrapped in `Fetcher`. It optimizes the query **before** call. Firstly it gathers all data it should fetch and then it execuees the queries. Caching and deduplication mechanisms allow to avoid duplicated queries and give results faster.

ok, if we have our fetcher defined, we push it to lower level.

<Instruction>

in `GraphQLSchema` create constant for deferred resolver.

```scala

val Resolver = DeferredResolver.fetchers(linksFetcher)

```

</Instruction>

Such resolver have to be passed into the `Executor` to make it available for use. As you can see, we use the same fetcher in two fields, in the first example we're providing only single id and expecting one, optional object (`deferOpt` function). In the second case we're providing a list of ids and expecting a sequence of objects (`deferSeq`).

<Instruction>

Add resolver to the executor, open the `GraphQLServer.scala` file, and change `executeGraphQLQuery` function content as follows:

```scala

Executor.execute(
  GraphQLSchema.SchemaDefinition,
  query,
  MyContext(dao),
  variables = vars,
  operationName = operation,
  deferredResolver = GraphQLSchema.Resolver
).map( //the rest without changes

```

</Instruction>

Since, we're using `DAO.getLinks` to fetch single entity or entire list, we don't need `getLink` function anymore.

<Instruction>

Open a `DAO` class and remove `getLink` function.

</Instruction>


### HasId type class

If you tried to execute a query, you get an error. Because there one more thing we have to do. `Fetcher` needs 'something' what extraxts id from entity. This thing is `HasId` type class. You have few choices how to provide usch class for your model. Firstly you can explicitly pass it, like this:

```scala

val linksFetcher = Fetcher(
  (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids)
)(HasId(_.id))

```

On the other hand. You can declare implicit constant in the same context so fetcher will take it implicitly.
The third way is to provide `HasId` implicitly inside companion object for our model, like this:

```scala

object Link {
    implicit val hasId = HasId[Link, Int](_.id)
}

```
There one more way, more generic, but to avoid a mess, I'll back to this in chapter about interfaces.

<Instruction>

Add implicit hasId in the `GraphQLServer`

```scala

implicit val linkHasId = HasId[Link, Int](_.id)

```

</Instruction>


### Test it

You can debug `DAO.getLinks` function in any way, and execute following query:

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

As you can see `getLinks` is called only once!

### What's next?

In the next chapter we will extern `Link` model about date fields. H2 doesn't support the type we need so we have to manage it somehow. You will learn about custom scalar types.
