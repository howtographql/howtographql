---
title: Handling Arguments
pageTitle: "Handling arguments which are provided in query"
description: "In this chapter, at first you will learn how to use arguments."
question: "Does GraphQL needs HTTP Server?"
answers: ["Yes. It needs HTTP server.", "Yes, it needs HTTP server but some of features can be used without that", "No, but it strictly recommended to use. Without HTTP layer, GraphQL is losing some of its features.","No, GraphQL is specification is far away from tranportation protocol. You can use HTTP, Websockets, sockets or even use it internally in you application." ]
correctAnswer: 3
---


### Arguments

Let's assume, we want to fetch links for only one link (giving ID of it) or few links. We will need to manage parsing of arguments.

For example such queries:


```graphql

query {
    link(id: 1){
    	id
    	name
  	}
  	links(ids: [2,3]){
      id
      name
    }  
}
```
What must we do? Firstly add to DAO functions that gives us link by one or more ID's.

<Instruction>

Open `DAO.scala` file, and add following functions:

```scala

def getLink(id: Int): Future[Option[Link]] = db.run(
   Links.filter(_.id === id).result.headOption
 )

 def getLinks(ids: Seq[Int]) = db.run(
   Links.filter(_.id inSet ids).result
 )
```

</Instruction>

Next we have to add fields to the main `Query` object with those functions as resolvers.

<Instruction>

Now open `GraphQLSchema.scala` file, and in codeblock `fields[MyContext, Unit](...)` add two additional fields:

```
Field("link",//1
  OptionType(LinkType),//2
  arguments = List(Argument("id", IntType)),//3
  resolve = c => c.ctx.dao.getLink(c.arg[Int]("id"))//4
),
Field("links",//1
  ListType(LinkType),//2
  arguments = List(Argument("ids", ListInputType(IntType))),//3
  resolve = c => c.ctx.dao.getLinks(c.arg[Seq[Int]]("ids"))//3
)

```

</Instruction>

Let's try to understand what is going on in there:

1. As explained previously, we're adding new fields with these names (`link` and `links`)
1. Second parameter is expected output type. In first query it's Optional Link, in second link of links.
1. `arguments` is defined additinal parameter. It's a list of arguments we expects. In first field, we're expecting an `id` argument of type `Int`. In second case `ids` as list of ints. As you can see we didn't use `ListType` in that case. We've used `ListInputType` instead. The main difference is that all `InputType`s are using for parsing incoming data, and `ObjectType`s (mostly) are used as outgoing data.
1. `arguments` defines which argumets are acceptable, in the resolver, those arguments have to be retrieved from query. `Context` available in resolver has a map of those arguments, is it's easily fetchable.

### DRY with arguments

The code above could be a little simplified. You can extract an `Argument` as constant, and reuse this infield declaration. You can change the `link` declaration on the following:

```scala

val Id = Argument("id", IntType)

Field("link",
      OptionType(LinkType),
      arguments = Id :: Nil, // it's a list!
      resolve = c => c.ctx.dao.getLink(c.arg(Id))
)
```

Now we're able to fetch for single Link, or even a list of chosen links.

<Instruction>
Open the graphiql console in the browser and execute following query:

```graphql

query {

    link(id: 1){
    	id
    	url
  	}

  	links(ids: [2,3]){
      id
      url
    }

}
```

</Instruction>

You should see a proper output. But what if we will execute this query??

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
}
```

### Defining a problem

If you will debug DAO class (even by putting simple `println` in functions) you will find out that `getLink` is called twice for the same `id`. `resolve` function is calling that function directly, so it calls it's every time it needs a data in response. But there is the better way. Sangria provides mechanism which helps with optimizing queries or even uses cache when needed.


### Next chapter

In the next chapter you will learn about Deferred Resolvers, Fetchers and why these are so important.
