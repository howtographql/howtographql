---
title: Handling Arguments
pageTitle: "A query arguments"
description: "In this chapter you will learn how to use arguments and how to handle them and pass to the business logic."
question: "What type is query argument"
answers: ["It's always a String type. You have to unmarshall it to type yo need", "You can define the type of argument in schema.", "It's one of basic types.", "Only numbers."]
correctAnswer: 1
---


### Arguments

Let's assume, we want to fetch selected links using their ids. We will need to parse arguments.

For example such query:

```graphql

query {
    link(id: 1){
    	id
    	name
  	}
  	links(ids: [2, 3]){
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

Next we have to add fields to the main `Query` object and set functions above as resolvers.

<Instruction>

Now open `GraphQLSchema.scala` file, and in function `fields` add two additional definitions:

```
Field("link", //1
  OptionType(LinkType), //2
  arguments = List(Argument("id", IntType)), //3
  resolve = c => c.ctx.dao.getLink(c.arg[Int]("id")) //4
),
Field("links", //1
  ListType(LinkType), //2
  arguments = List(Argument("ids", ListInputType(IntType))), //3
  resolve = c => c.ctx.dao.getLinks(c.arg[Seq[Int]]("ids")) //3
)

```

</Instruction>

Let's try to understand what is going on in there:

1. As explained previously, we're adding new fields with these names (`link` and `links`)
1. Second parameter is expected output type. In first query it's Optional Link, in second list of links.
1. `arguments` is a list of expected arguments defined by name and type. In first field, we're expecting an `id` argument of type `Int`. In second case `ids` as list of integers. As you can see we didn't use `ListType` in that case. We've used `ListInputType` instead. The main difference is that all `InputType`s are used to parse incoming data, and `ObjectType`s (mostly) are used for outgoing data.
1. `arguments` defines which arguments we expect. Mostly such argument isn't forgotten and should be extracted and passed down to the resolver. `Context` object, reachable in `resolve` partial function, contains such information, so you have to fetch those arguments from there.

### DRY with arguments

The code above could be a little simplified. You can extract an `Argument` as constant, and reuse this in field declaration. You can change the `link` declaration on the following:

```scala

val Id = Argument("id", IntType)

Field("link",
      OptionType(LinkType),
      arguments = Id :: Nil, // it's a list!
      resolve = c => c.ctx.dao.getLink(c.arg(Id))
)
```
Similar change you can make for `links` field too.

Now, we have exposed few field. We're able to fetch for single Link, or even a list of chosen links.

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

If you will debug DAO class (even by putting simple `println` in functions) you will find out that `getLink` is called twice for the same `id`. `resolve` function is calling that function directly, so it's being called upon every id. But there is the better way. Sangria provides mechanism which helps to help with query optimization and caching. This is exactly what we need here.


### Next chapter

In the next chapter you will learn about Deferred Resolvers, Fetchers and why these are so important.
