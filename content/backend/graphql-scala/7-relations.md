---
title: Relations
pageTitle: "GraphQL Scala - Relations"
description: "In this chapter you will learn how to connect models with relations. You will also learn how to prepare fetchers to use either relations or ids to get entities."
question: "Are we limited to amount of defined relations per model?"
answers: ["Yes, 1 per model", "Yes, 2 per model", "No, there is no such limitation", "No, but relation could be based only on models's id"]
correctAnswer: 2
---

Relations define how entities are connected with one another. You probably encountered those while working with databases. 
In GraphQL (and Sangria) relations are strictly connected with deferred resolvers and have a similar role. 
When you want to find related entities, the query can be optimized and all needed data fetched at once.

In other words: Relations expand Fetchers, allows for finding entities not only by their id field, 
but also by ids quite often stored in fields of another entity.

Lets try to define how many relations we have in our schema.

`User` has `links` and `votes` fields.

`Link` has `postedBy` and `votes` fields.

`Vote` has `user` and `link`

How do those relations work?
`Link` is a main entity, first created by us and the most important. `Link` is added by a (single) user. On the other hand, a user can have more than one link.

`User` also can vote for a link. He can vote for a single link once, but a link can have more than one votes.

So, in our app we have 3 one-to-many relations.

### Preparing database

First change slightly `Link` model:

<Instruction>

Add `postedBy` field to the `Link` case class, the class should look like this:

```scala

case class Link(id: Int, url: String, description: String, postedBy: Int, createdAt: DateTime = DateTime.now) extends Identifiable

```

</Instruction>

Update `LinksTable`.
<Instruction>

Change the database schema. In the `DBSchema` change `LinksTable`, apply changes from the following code:

```scala
class LinksTable(tag: Tag) extends Table[Link](tag, "LINKS"){
    // ...
    def postedBy = column[Int]("USER_ID")

    def * = (id, url, description, postedBy, createdAt).mapTo[Link]

}
```

</Instruction>


Add foreign keys.

<Instruction>

In `LinksTable` add:

```scala

def postedByFK = foreignKey("postedBy_FK", postedBy, Users)(_.id)
```

</Instruction>

`Votes` model already has proper fields for storing external ids, we only have to add foreign keys in database setup.

<Instruction>

In `VotesTable` add:

```scala

  def userFK = foreignKey("user_FK", userId, Users)(_.id)
  def linkFK = foreignKey("link_FK", linkId, Links)(_.id)

```

</Instruction>

Because domain models has slightly changed, we also have to redefine our data.

<Instruction>

`databaseSetup` should be changed as in the following code:

```scala
/**
  * Load schema and populate sample data within this Sequence od DBActions
  */
val databaseSetup = DBIO.seq(
  Users.schema.create,
  Links.schema.create,
  Votes.schema.create,

  Users forceInsertAll Seq(
    User(1, "mario", "mario@example.com", "s3cr3t"),
    User(2, "Fred", "fred@flinstones.com", "wilmalove")
  ),

  Links forceInsertAll Seq(
    Link(1, "http://howtographql.com", "Awesome community driven GraphQL tutorial",1, DateTime(2017,9,12)),
    Link(2, "http://graphql.org", "Official GraphQL web page",1, DateTime(2017,10,1)),
    Link(3, "https://graphql.org/", "GraphQL specification",2, DateTime(2017,10,2))
  ),

  Votes forceInsertAll Seq(
    Vote(1, 1, 1),
    Vote(2, 1, 2),
    Vote(3, 1, 3),
    Vote(4, 2, 2),
  )
)

```

</Instruction>

I think we're done with the Database part of changes. The following code represents the current state of `DBSchema` file:

[DBSchema.scala](https://gist.github.com/marioosh/033380591bc796c7b7b002f0860dfb79#file-dbschema-scala)

Now we can go and do the GraphQL part of changes.


### Defining User->Link relation

Let's begin with User-Link relation. In the first entity we have to add the field `links` and in the second the field `postedBy`. 
Both fields uses the same Relation model.

Actually a `Link` entity has to have two defined relations. First because we can lookup the database to find a link with a particular Id,
Second, when we want to filter links by user ids stored in `postedBy` column. Our Fetcher accepts the provided id already, so we have what covers the first case
but we still have to define the second one:

<Instruction>

In `GraphQLSchema` Add a relation to be able to find `Link`s by userId.

```scala
//add to imports:
import sangria.execution.deferred.Relation

//place before fetchers definition
val linkByUserRel = Relation[Link, Int]("byUser", l => Seq(l.postedBy))
```

</Instruction>

This relation is of type `SimpleRelation` and has only two arguments: the first is the name, the second is a function which extracts a sequence of user ids from the link entity. Our case is super easy, because `postedBy` has such id. All we need to do is wrap it into the sequence.

Now we have to add this relation to the fetcher. To do this, we have to use `Fetcher.rel` function instead of the previously used `apply`

<Instruction>

Change `linksFetcher` to the following:

```scala
//add to imports:
import sangria.execution.deferred.RelationIds

//replace the current `linksFetcher` declaration
val linksFetcher = Fetcher.rel(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids),
    (ctx: MyContext, ids: RelationIds[Link]) => ctx.dao.getLinksByUserIds(ids(linkByUserRel))
  )

```

</Instruction>

What do we have here? As I mentioned above, now we're using `.rel` function. It needs the second function to be passed as the argument. This function is for fetching related data from a datasource. In our case it uses a function `getLinksByUserIds` that we have to add to our dao. `ids(linkByUserRel)` extracts user ids by the defined in relation way and passes it into the DAO function.

<Instruction>

In `DAO` class add a function:

```scala
def getLinksByUserIds(ids: Seq[Int]): Future[Seq[Link]] = {
    db.run {
      Links.filter(_.postedBy inSet ids).result
    }
}
```

</Instruction>

Actually we've simplified the code above a little. When you look into the part `ctx.dao.getLinksByUserIds(ids(linkByUserRel))` a bit, you can wonder "And what if link has two relations? Could `getLinkByUserIds` be replaced by another function?" Be patient, such case will be covered later in this chapter.
In our case we have only one relation, so we can retrieve all `userId`'s by calling `ids(linkByUserRel)` functions.

### Add fields to GraphQL Objects

Let's begin with `LinkType`. `Link` already has a `postedBy` field, but for now it's only an `Int` and we need the entire user.
To achieve this we have to replace the entire field definition and instruct resolver to use already defined fetcher to do this.

<Instruction>

Add `ReplaceField` type class to the `LinkType` constructor.

```scala
ReplaceField("postedBy",
      Field("postedBy", UserType, resolve = c => usersFetcher.defer(c.value.postedBy))
)
```

</Instruction>

In similar way we will change the `UserType` but `User` entity hasn't `links` property so we have to add such field manually to the ObjectType.
`AddField` type class is for such reason:

<Instruction>

```scala
AddFields(
  Field("links", ListType(LinkType), 
  resolve = c =>  linksFetcher.deferRelSeq(linkByUserRel, c.value.id))
)
```

</Instruction>

Now you can see that another fetcher function is being called. All `.deferRel...` functions needs two arguments instead of one. We have to add the relation object as the first argument, the second is a function which will get a mapping value from entity.

We just added two relations to both `User` and `Link` object types. If you have tried to run this, you have probably experienced some issues. It's because now we have a circular reference in the Object type declaration. There are two things we have to do to avoid this issue:

<Instruction>

Make `Link` and `User` lazy values. Additionally  all types explicitly if you haven't done so yet:

```scala
lazy val UserType: ObjectType[Unit, User] = deriveObjectType[Unit, User]//...

lazy val LinkType: ObjectType[Unit, Link] = deriveObjectType[Unit, Link]//...
```

Wait, but why there is a `Unit` in type where should be a our context type? Because if we don't use it explicitly inside field declaration (for example to get some
data stored in context) we can do it this way. In such case our object field fit any context, not only defined one.

</Instruction>

Now open the `graphiql` console in browser and try to execute this query: (tip: if the autocomplete doesn't work for the new fields, try to refresh a page)

```graphql
query {
  link(id: 1){
    id
    url
    createdAt
    postedBy {
      name
      links {
        id
        url
      }
    }
  }
}
```

As you can see, both relations work perfectly.

Time to add the rest of them.

### Vote - User Relation

Before I go further, try to do it yourself. All steps you need to do, are similar to the those we have already done.

To be honest, half of work you have already done :D There is `userId` field in the `Vote` model. Database is also prepared, there is not much work to do here.

Ok. Let's begin from proper database function.

<Instruction>

In `DAO` class add following function:

```scala
def getVotesByUserIds(ids: Seq[Int]): Future[Seq[Vote]] = {
    db.run {
      Votes.filter(_.userId inSet ids).result
    }
}
```

</Instruction>

The rest of the changes will be applied in the `GraphQLSchema` file.

<Instruction>

Add a relation between `Vote` and `User`

```scala
val voteByUserRel = Relation[Vote, Int]("byUser", v => Seq(v.userId))
```

</Instruction>


Don't forget in `Relation` we always have to return a sequence!
Also we have to change the fetcher definition.

<Instruction>

Change the `votesFetcher` definition with the following:

```scala
val votesFetcher = Fetcher.rel(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getVotes(ids),
    (ctx: MyContext, ids: RelationIds[Vote]) => ctx.dao.getVotesByUserIds(ids(voteByUserRel))
)
```

</Instruction>

Change `UserType`:

<Instruction>

Inside `AddField` type class, add a new field:

```scala
Field("votes", ListType(VoteType), resolve = c =>  votesFetcher.deferRelSeq(voteByUserRel, c.value.id))
```

</Instruction>

Also modify the defined `VoteType`:

<Instruction>

Replace `VoteType` with the following code:

```scala
lazy val VoteType: ObjectType[Unit, Vote] = deriveObjectType[Unit, Vote](
    Interfaces(IdentifiableType),
    ExcludeFields("userId"),
    AddFields(Field("user",  UserType, resolve = c => usersFetcher.defer(c.value.userId)))
  )
```

</Instruction>

That's all. After this changes you should be able to execute the query like this:

```
query {
  link(id: 1){
    id
    url
    createdAt
    postedBy {
      name
      links {
        id
        url
      }
      votes {
        id
        user {
          name
        }
      }
    }
  }
}
```

As you can see we can ask for users who vote for links posted by the author of the current link. Simple like that.

### Vote - Link Relation

One relation is still missing in our example. In my opinion you have enough knowledge to try and write it yourself.
After that I'll do it step by step. Reminder: case classes and database setup support this relation, you do not need to change anything there.

Lets start from defining relation object:

<Instruction>

Add `voteByLinkRel` constant to the `GraphQLSchema` file.

```scala
val voteByLinkRel = Relation[Vote, Int]("byLink", v => Seq(v.linkId))
```

</Instruction>

Now we can add the `votes` field to the `LinkType`.

<Instruction>

Add the following code after the existing `ReplaceField`.

```scala
AddFields(
      Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByLinkRel, c.value.id))
)
```

</Instruction>

You see the similarities between both `votes` fields, don't you? 

```scala
//UserType
Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByUserRel, c.value.id))

//LinkType
Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByLinkRel, c.value.id))
```

Both are almost the same, the only difference is the type of `Relation` we're using as the first argument.
Actually in this way you can add any relation you want.

Now you should be able to query for this field.

---

The second part won't be as easy.

Please look at the existing `votesFetcher` definition:

```scala
val votesFetcher = Fetcher.rel(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getVotes(ids),
    (ctx: MyContext, ids: RelationIds[Vote]) => ctx.dao.getVotesByUserIds(ids(voteByUserRel))
)
```

The first function fetches votes by their id. Nothing to comment here. 
The second function, on the other hand, fetches votes by relation. Actually by `voteByUserRel` relation. 
There is no fetcher API that supports more than one relation function, so we have to refactor it a little bit.

In our case, we want to fetch votes by any relation, either with `User` or with `Link`.

`ids(voteByUserRel)` extracts the users' ids and passes those to the db function, 
we have to change it. It is a  good idea to pass `ids` down to the function, and in `DAO` decide which field it should use to filter.

<Instruction>

Replace the second function of `votesFetcher` with the following one:

```scala
(ctx: MyContext, ids: RelationIds[Vote]) => ctx.dao.getVotesByRelationIds(ids)
```

</Instruction>

There is one missing part: `DAO.getVotesByRelationIds` function, let's create it now. This function should match the kind of relation we're asking for, and filter by field depends on that relation.

<Instruction>

To the `DAO` file add `getVotesByRelationIds` function with code:

```scala
//add to imports:
import sangria.execution.deferred.{RelationIds, SimpleRelation}

//add in body
def getVotesByRelationIds(rel: RelationIds[Vote]): Future[Seq[Vote]] =
  db.run(
    Votes.filter { vote =>
      rel.rawIds.collect({
        case (SimpleRelation("byUser"), ids: Seq[Int]) => vote.userId inSet ids
        case (SimpleRelation("byLink"), ids: Seq[Int]) => vote.linkId inSet ids
      }).foldLeft(true: Rep[Boolean])(_ || _)

    } result
  )
```

The function above use pattern matching to recognize which type of relation it has and depending on that relation uses the proper filter.

</Instruction>

The last thing to do is to change `VoteType` definition. We have to remove `linkId` property and instead add `link` field which returns 
the entire `Link` object.

<Instruction>

Replace current `VoteType` declaration with the following one:
    
```scala

lazy val VoteType: ObjectType[Unit, Vote] = deriveObjectType[Unit, Vote](
    Interfaces(IdentifiableType),
    ExcludeFields("userId", "linkId"),
    AddFields(Field("user",  UserType, resolve = c => usersFetcher.defer(c.value.userId))),
    AddFields(Field("link",  LinkType, resolve = c => linksFetcher.defer(c.value.linkId)))
  )
    
```

</Instruction>

Now you're ready to execute a query like that:

```graphql

query {
  links(ids :[1,2]){
    url
    votes {
      user{
        name
      }
    }
  }
}

```


You can also delete `DAO.getVotesByUserIds` function, we won't need it anymore.

### Recap

We achieved our goal for this chapter, our models have new functions:

`User` has `links` and `votes` fields.  
`Link` has `postedBy` and `votes` fields.  
`Vote` has `user` and `link` fields.  

Now we can fetch the related data...

The current state of fileds we've changed in this chapter you can compare with those gists:

[DAO.scala](https://gist.github.com/marioosh/7c3ee5fed1238c5daf89a4459727f575#file-dao-scala)  
[models/package.scala](https://gist.github.com/marioosh/7c3ee5fed1238c5daf89a4459727f575#file-models_package-scala)  
[DBSchema.scala](https://gist.github.com/marioosh/7c3ee5fed1238c5daf89a4459727f575#file-dbschema-scala)  
[GraphQLSchema.scala](https://gist.github.com/marioosh/7c3ee5fed1238c5daf89a4459727f575#file-graphqlschema-scala)  

In the next chapter you will learn how to add and save entities with GraphQL mutations.
