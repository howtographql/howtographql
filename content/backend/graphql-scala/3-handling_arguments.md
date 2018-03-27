---
title: Handling Arguments
pageTitle: "A query arguments"
description: "In this chapter you will learn how to use arguments and how to handle them and pass them to the business logic."
question: "What is the type of the query argument"
answers: ["It's always a String type. You have to unmarshall it to the type you need", "You can define the type of the argument in the schema.", "It's one of the basic types.", "Only numbers."]
correctAnswer: 1
---


### Arguments

Let's assume, we want to fetch the selected links using their ids. We will need to parse the arguments.

Take this query for instance:

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

What must we do? Firstly add to DAO the functions that give us a link by one or more ID's.

<Instruction>

Open the file `DAO.scala` and add the following functions:

```scala

def getLink(id: Int): Future[Option[Link]] = db.run(
   Links.filter(_.id === id).result.headOption
 )

 def getLinks(ids: Seq[Int]) = db.run(
   Links.filter(_.id inSet ids).result
 )
```

</Instruction>

Next we have to add the fields to the main `Query` object and set the functions above as resolvers.

<Instruction>

Now open the file `GraphQLSchema.scala` and add two additional definitions in the `fields` function of the `QueryType` object:

```scala

Field("link", //1
  OptionType(LinkType), //2
  arguments = List(Argument("id", IntType)), //3
  resolve = c => c.ctx.dao.getLink(c.arg[Int]("id")) //4
),
Field("links", //1
  ListType(LinkType), //2
  arguments = List(Argument("ids", ListInputType(IntType))), //3
  resolve = c => c.ctx.dao.getLinks(c.arg[Seq[Int]]("ids")) //4
)

```

</Instruction>

Let's try to understand what is going on in there:

1. As explained previously, we're adding new fields with these names (`link` and `links`)
1. The second parameter is the expected output type. In the first query it's an Optional Link, in second it's a list of links.
1. `arguments` is a list of expected arguments defined by name and type. In the first field, we're expecting an `id` argument of type `Int`. In the second case, we're expecting `ids` as a list of integers. As you can see we didn't use `ListType` in that case. We've used `ListInputType` instead. The main difference is that all `InputType`s are used to parse incoming data, and `ObjectType`s (mostly) are used for outgoing data.
1. `arguments` defines which arguments we expect. Mostly such argument isn't forgotten and should be extracted and passed down to the resolver. `Context` object, reachable in `resolve` partial function, contains such information, so you have to fetch those arguments from there.

### DRY with arguments

The code above could be a little simplified. You can extract an `Argument` as constant, and reuse this in the field declaration. You can change the `link` declaration as follows:

```scala

val Id = Argument("id", IntType)

Field("link",
      OptionType(LinkType),
      arguments = Id :: Nil, // it's a list!
      resolve = c => c.ctx.dao.getLink(c.arg(Id))
)
```
You can make a similar change for the `links` field too.

Now, we have exposed a few fields. We're able to fetch a single link or a list of chosen links.

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

You should see a proper output. But what if we execute this query?

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

If you debug the DAO class (even by putting simple `println` in functions) you will find out that `getLink` is called twice for the same `id`. `resolve` function is calling that function directly, so it's being called upon every id. But there is the better way. Sangria provides a mechanism which helps with query optimization and caching. This is exactly what we need here.


### Next chapter

In the next chapter you will learn about Deferred Resolvers, Fetchers and why these are so important.
