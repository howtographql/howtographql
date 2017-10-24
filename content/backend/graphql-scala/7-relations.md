---
title: Relations
pageTitle: "You have defined three separated models in the app, now we will connect them with relations"
description: "In this chapter you will learn how to connect models with relations. You will also learn how to prepare fetchers to use either relations or ids to get entities."
---

Relations define how entities are connected one to each other. Probably you met those when you've been working with databases. In point of view of graphql (and sangria) relations are strictly connected with deferred resolvers and has similar role. When you want to find related entities, query could be optimized and fetched at once.

In other words: Relations expand Fetchers, allows for finding entities not only by their id field, by also by ids quite often stored in fields of another entity.

Lets try to define how many relations we have in our schema.

`User` has `links` and `votes` fields.

`Link` has `postedBy` and `votes` fields.

`Vote` has `user` and `link`

How those relations works?
`Link` is a main entity, first created by us and the most important. `Link` is added by (single) user, on the other hand, user can have more than one link.

`User` also can vote for link. He can vote for single link once, but link can has more than one votes.

So, in our app we have 3 one-to-many relations.

### Begin from preparing database

First change slightly `Link` model:

<Instruction>

Add `postedBy` field to the `Link` case class, the class should looks like this:

```scala

case class Link(id: Int, url: String, description: String, postedBy: Int, createdAt: DateTime = DateTime.now) extends Identifiable

```

</Instruction>

Change the database schema. In the `DBSchema` change `LinksTable`, apply changes from the following code:

```scala
class LinksTable(tag: Tag) extends Table[Link](tag, "LINKS"){
    // ...
    def postedBy = column[Int]("USER_ID")
    //def createdAt = column[DateTime]("CREATED_AT")

    def * = (id, url, description, postedBy, createdAt) <> ((Link.apply _).tupled, Link.unapply)

}
  ```

  </Instruction>


Add foreign keys:

<Instruction>

In `LinksTable` add:

```scala

def postedByFK = foreignKey("postedBy_FK", postedBy, Users)(_.id)
```

</Instruction>

Add for `Votes`:

<Instruction>

in `VotesTable` add:

```scala

  def userFK = foreignKey("user_FK", userId, Users)(_.id)
  def linkFK = foreignKey("link_FK", linkId, Links)(_.id)

```

</Instruction>

Change also sample links inserted into database:

<Instrunction>

`databaseSetup` should be changes in the following code:

```scala
/**
  * Load schema and populate sample data within this Sequence od DBActions
  */
val databaseSetup = DBIO.seq(
  Users.schema.create,
  Links.schema.create,
  Votes.schema.create,

  Users ++= Seq(
    User(1, "mario", "mario@example.com", "s3cr3t"),
    User(2, "Fred", "fred@flinstones.com", "wilmalove")
  ),

  Links ++= Seq(
    Link(1, "http://howtographql.com", "Awesome community driven GraphQL tutorial",1, DateTime(2017,9,12)),
    Link(2, "http://graphql.org", "Official GraphQL webpage",1, DateTime(2017,10,1)),
    Link(3, "https://facebook.github.io/graphql/", "GraphQL specification",2, DateTime(2017,10,2))
  ),

  Votes ++= Seq(
    Vote(1, 1, 1),
    Vote(2, 1, 2),
    Vote(3, 1, 3),
    Vote(4, 2, 2),
  )
)

```

</Instruction>

Because of relations, some operations should be executed in proper order.


### Defining User->Link relation

Lets begin from relation `User`-`Link`. In the first entity we have to add field `links` in the second `postedBy`, both defined by single relation.

Because of relation with `User`, `Link` has two fields that could be used to fetch it by: `id` and `postedBy`.
The first is default and used in normal way, the second is used if we want to find link for proper user.

<Instruction>

Add relation to able to find `Link`s by userId.

```scala

val linkByUserRel = Relation[Link, Int]("byUser", l => Seq(l.postedBy))
```

</Instruction>

This kind Relation is of type `SimpleRelation` and has only two arguments: the first is name, and the second is a function which somehow extracts sequence of user id's from link entity. In our case is super easy, because `postedBy` has such id. All we need to do is wrap it into the sequence.

Now we have to add this relation to the fetcher, to do this, we have to use `Fetcher.rel` function instead previously used `apply`

<Instruction>

Change `linksFetcher` to the following:

```scala
val linksFetcher = Fetcher.rel(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getLinks(ids),
    (ctx: MyContext, ids: RelationIds[Link]) => ctx.dao.getLinksByUserIds(ids(linkByUserRel))
  )

```

</Instruction>

What do we have here? As I mentioned above, now we're using `.rel` function. It needs the second function to be passed as the argument. This function is for fetching related data from datasource. In our case it uses a function `getLinksByUserIds` what we have to add to our dao.


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

Actually we've simplified the code above a little. When you will thing more about the part `ctx.dao.getLinksByUserIds(ids(linkByUserRel)` you can ask "And what if link has two relations? Does `getLinkByUserIds` could be replaced by another function?" Be patient, such case will be covered later in this chapter.
In our case we have only one relation, so we can retrieve all `userId`'s by calling `ids(linkByUserRel)` functions.

### Add fields to GraphQL Objects

Let's begin from `LinkType`. `Link` already has `postedBy` field, but for now it's only an `Int` and we need entire user.

<Instruction>

Add `ReplaceField` type class to the `LinkType` constructor.

```scala
ReplaceField("postedBy",
      Field("postedBy", UserType, resolve = c => usersFetcher.defer(c.value.postedBy))
)
```

</Instruction>

As you can see `resolve` uses basic users fetcher on this side.

In the same way we will change the `UserType` but we won't replace any existing field, so we have to use `AddField` instead.

<Instruction>

```scala
AddFields(
      Field("links", ListType(LinkType), resolve = c =>  linksFetcher.deferRelSeq(linkByUserRel, c.value.id))
)
```

</Instruction>

Now you can see, there is called another fetcher's function. All `.deferRel...` functions needs two arguments instead of one. We have to add relation object as first.

We just added two relations to both: `User` and `Link` object types. If you tried to run this, probably you've experienced some issues. It's because now we have circular reference in Object type declaration. There are two things we have to do to avoid this issue:

<Instruction>

Make `Link` and `User` lazy values, and type annotation if you didn't it yet:

```scala
implicit lazy val UserType: ObjectType[MyContext, User] = deriveObjectType[MyContext, User](//...
implicit lazy val LinkType: ObjectType[MyContext, Link] = deriveObjectType[MyContext, Link](//...
```

</Instruction>

Now open the `graphiql` console in browser and try to execute this query:

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
      }  
}
```  

As you can both relations works perfectly.

Time to add the rest of the relations.

### Vote - User Relation

Before I go further, try to do it yourself. All you need to do, is similar to the things we have already done.

To be honest, half of work you have already done :D There is `userId` field in the `Vote` model. Database is also prepared, there is not much work to do here.

Ok. Lets finish it. Lets begin from proper database function.

<Instruction>

In `DAO` class add  following function:

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

Add relation between `Vote` and `User`

```scala
val voteByUserRel = Relation[Vote, Int]("byUser", v => Seq(v.userId))
```

</Instruction>

Also we have to change fetcher definition.

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

Inside `AddField` type class add new field:

```scala
Field("votes", ListType(VoteType), resolve = c =>  votesFetcher.deferRelSeq(voteByUserRel, c.value.id))
```

</Instruction>

Also modify the defined `VoteType`:

<Instruction>

Replace `VoteType` with the following code:

```scala
implicit val VoteType = deriveObjectType[MyContext, Vote](
  Interfaces[MyContext, Vote](IdentifiableType),
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

As you can see we can ask for users that votes for links posted by author of current link. Simple like that.

### Vote - Link Relation

One relation is still missing in our example. In my opinion you have a lot of knowledge to try it write yourself.
After that I'll do it step by step. For a reminder: case classes and database setup supports this relation, you no need anything there.

Lets start from defining relation object:

<Instruction>

Add `voteByLinkRel` constant.

```scala
val voteByLinkRel = Relation[Vote, Int]("byLink", v => Seq(v.linkId))
```

</Instruction>

Now we can add `votes` field to the `LinkType`, add the following code after the existing `ReplaceField`.

```scala
AddFields(
      Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByLinkRel, c.value.id))
)
```

</Instruction>

Now you should be able to query for this field.

The second part won't be such easy.

Please look on the existing `votesFetcher` definition:

```
val votesFetcher = Fetcher.rel(
    (ctx: MyContext, ids: Seq[Int]) => ctx.dao.getVotes(ids),
    (ctx: MyContext, ids: RelationIds[Vote]) => ctx.dao.getVotesByUserIds(ids(voteByUserRel))
)
```
The first function fetcher votes by their id. Nothing to comment here. The second function on the other hand, fetcher votes by relation. Actually by `voteByUserRel` relation. There is no fetcher API that supports more than one relation function, so we have to change the existing code.

In our case, we want to fetch Votes by any relation, either with `User` or with `Link`
`ids(voteByUserRel)` extracts users' ids and passes those to the db function, we have to change it. It good idea to pass `ids` down to the repository, and there fuction will deceide which field it should use to filter.

<Instruction>

Replace second function of `votesFetcher` with the following one:

```scala
(ctx: MyContext, ids: RelationIds[Vote]) => ctx.dao.getVotesByRelationIds(ids)
```

</Instruction>

Lets see on `votes` field of either `User` and `Link` types:

```scala
//UserType
Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByUserRel, c.value.id))

//LinkType
Field("votes", ListType(VoteType), resolve = c => votesFetcher.deferRelSeq(voteByLinkRel, c.value.id))
```

Both are almost the same, the only difference is a type of `Relation` we're using as the first argument.
Actually in this way you can add any relation you want.

There is one missing part: `DAO.getVotesBYRelationIds` fuction, lets make it. This function should match what kind of relation we're asking for, and filter by field depends of that relation.

<Instruction>

To the `DAO` file add `getVotesByRelationIds` function with code:

```scala
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

</Instruction>

You can also delete `DAO.getVotesByUserIds` function, we won't need it anymore.

### Recap

We achieved our goal for ths chapter, our models have new fuctions:

`User` has `links` and `votes` fields.
`Link` has `postedBy` and `votes` fields.
`Vote` has `user` and `link`

Now we can fetch for the related data...

In the next chapter you will learn how to add entities.
