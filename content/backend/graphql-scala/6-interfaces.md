---
title: Interfaces
pageTitle: "Extracting common parts as an Interface"
description: "In this chapter we will introduce two additional models. We show the most common parts and extract those as an interface. This time you will work alone."
---

 At this point you should know the basics, so it's a perfect time for some hands-on training. The following paragraph will give you hints on what needs to be done. Try implementing it yourself. At the end I will add an example solution in case you are stuck. Later in this chapter we will learn about interfaces and how they relate to the work you've done.

### Your DIY kit

Before you'll go further, try to do something. I think, at this point, you have a knowledge that let you add `User` and `Vote` models. Of course, I'll show what to do later in this chapter, but before you will go there, try to implement it alone.

What you have to do:  

1. Add `User` class with fields: `id`, `name`, `email`, `password` and `createdAt`
1. Add `Vote` class with fields: `id`, `createdAt`, `userId`, `linkId`(you don't have to to define any relations for now)
1. Create database tables for both,
1. Add object types for both,
1. Add fetchers for both,
1. Implement `HasId` type class,
1. Add fields in main `ObjectType` which allows for fetching a list of entities like `users` and `votes`

Please, go ahead with your implementation ... I will wait here

### User entity

Let's start from user entity:

<Instruction>

Add `User.scala` class with content:

```scala
case class User(id: Int, name: String, email: String, password: String, createdAt: DateTime = DateTime.now)
```

</Instruction>

Database setup.

<Instruction>

Add following content to the `DBSchema` class:

```scala

class UsersTable(tag: Tag) extends Table[User](tag, "USERS"){
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME")
  def email = column[String]("EMAIL")
  def password = column[String]("PASSWORD")
  def createdAt = column[DateTime]("CREATED_AT")

  def * = (id, name, email, password, createdAt).mapTo[User]
}

val Users = TableQuery[UsersTable]
```

</Instruction>

Sample entities:

<Instruction>

In file DBSchema in function `databaseSetup`: Add an action `Users.schema.create` at beginning of the sentence and then
add few users later in this function

```scala  
Users forceInsertAll Seq(
    User(1, "mario", "mario@example.com", "s3cr3t"),
    User(2, "Fred", "fred@flinstones.com", "wilmalove")
  )
```

</Instruction>

Add functional responsible for user's retrieving:

<Instruction>

In `DAO` class add a function:

```scala
def getUsers(ids: Seq[Int]): Future[Seq[User]] = {
    db.run(
      Users.filter(_.id inSet ids).result
    )
}
```  

</Instruction>

GraphQL part:

<Instruction>

In `GraphQLSchema` add :

```scala
implicit val UserType = deriveObjectType[Unit, User]() //ObjectType for user
implicit val userHasId = HasId[User, Int](_.id) //HasId type class
val usersFetcher = Fetcher(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getUsers(ids)
)// resolver

```

</Instruction>

Add fetcher to resolvers.

<Instruction>

Add lastly created fetcher to the resolvers list. In the same file, replace constant `Resolver` with:

```
val Resolver = DeferredResolver.fetchers(linksFetcher, usersFetcher)
```

</Instruction>

Add fields to main ObjectType:

<Instruction>

Add to `QueryType.fields`:

```scala
Field("users",
        ListType(UserType),
        arguments = List(Ids),
        resolve = c => usersFetcher.deferSeq(c.arg(Ids))
)
```

</Instruction>

We're ready... you can now execute query like this:

```graphql

query {

    users(ids: [1, 2]){
    	id
			name
    	email
    	createdAt
  	}
}  
```


### Vote entity

If you want, you can make similar step for `Vote` entity. And then follow instructions and check everything is ok.

<Instruction>

Create `Vote` class

```scala
case class Vote(id: Int, userId: Int, linkId: Int, createdAt: DateTime = DateTime.now)
```

</Instruction>

Database setup.

<Instruction>

Add following content to the `DBSchema` class:

```scala
class VotesTable(tag: Tag) extends Table[Vote](tag, "VOTES"){
    def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
    def userId = column[Int]("USER_ID")
    def linkId = column[Int]("LINK_ID")
    def createdAt = column[DateTime]("CREATED_AT")

    def * = (id, userId, linkId, createdAt).mapTo[Vote]
  }

  val Votes = TableQuery[VotesTable]
```

</Instruction>

The next step is creating relations.

<Instruction>

In file `DBSchema` in function databaseSetup: Add an action `Votes.schema.create` at beginning of the sentence and then add few users later in this function:

```scala
Votes forceInsertAll Seq(
  Vote(id = 1, userId = 1, linkId = 1),
  Vote(id = 2, userId = 1, linkId = 2),
  Vote(id = 3, userId = 1, linkId = 3),
  Vote(id = 4, userId = 2, linkId = 2),
)
```

</Instruction>

Add votes retrieval function.

<Instruction>

In `DAO` class add a function:

```scala
def getVotes(ids: Seq[Int]): Future[Seq[Vote]] = {
    db.run(
      Votes.filter(_.id inSet ids).result
    )
}
```

</Instruction>

GraphQL part:

<Instruction>

In `GraphQLSchema` add :

```scala
implicit val VoteType = deriveObjectType[Unit, Vote]()
implicit val voteHasId = HasId[Vote, Int](_.id)

val votesFetcher = Fetcher(
  (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getVotes(ids)
)
```

</Instruction>

Add fetcher to resolvers.

<Instruction>

Add lastly created fetcher to the resolvers list. In the same file, replace constant `Resolver` with:

```
val Resolver = DeferredResolver.fetchers(linksFetcher, usersFetcher)
```

</Instruction>

Add fields to main ObjectType:

<Instruction>

Add to `QueryType.fields`:

```scala
//val Ids = Argument("ids", ListInputType(IntType))
Field("votes",
        ListType(VoteType),
        arguments = List(Ids),
        resolve = c => votesFetcher.deferSeq(c.arg(Ids))
)
```

</Instruction>

Following query now should be able to execute:

```graphql

query {

    votes(ids: [1, 2]){
    	id
    	createdAt
  	}
}  
```

### Finding a common parts

As you can see parts that are very similar. Like `HasId` for all three types:

```scala
implicit val linkHasId = HasId[Link, Int](_.id)
implicit val userHasId = HasId[User, Int](_.id)
implicit val voteHasId = HasId[Vote, Int](_.id)
```

What if you want to add more entities? You will duplicate code even more.

The solution for this is an interface. We can provide an interface that will be extended by any of the entities. This way, for example, you will need just one HasId

<Instrunction>

Create trait `Identifable`:

```scala
trait Indentifable {
  val id: Int
}
```

</Instruction>

And then extend this trait by all of those classes like:

```scala
case class User(...) extends Identifiable
```

</Instruction>

Now we can replace all above `HasId` type classes with the single one:

<Instruction>

Remove `linkHasId`, `userHasId` and `voteHasId`, and add companion object to the Identifiable trait:

```scala
object Identifiable {
    implicit def hasId[T <: Identifiable]: HasId[T, Int] = HasId(_.id)
}
```

</Instruction>

When you will keep `implicit HasId` type converted in the companion object it will be accessible when needed.

Now, let's create an interface from GraphQL point of view.

<Instruction>

Change the `LinkType` for the following:

```scala
implicit val LinkType = deriveObjectType[Unit, Link](
    Interfaces(IdentifiableType)
)
```

</Instruction>

Add also such field to the object type for `User` and `Vote`.

Now if you will look into the schema definition in graphiql console you will see there are provided three models with this common interface.

Ok, thats all for this chapter. In the next one you will learn about relations.
