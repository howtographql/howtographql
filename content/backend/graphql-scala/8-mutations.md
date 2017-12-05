---
title: Mutations
pageTitle: "Mutations are about adding data by the API, is like a POST request in the REST"
description: "In this chapter you will learn how to add data to the database."
---

In last chapters you've learnt how to use GraphQL to read a data. Time to add some.
When you want to add data, you have to use almost the same sytax. So, where server know from you want to write data instead of reading? You have to use `mutation` keyword instead of `query`. Thats all. Actually not all, but you will learn about differences in this chapter.

### Create an User

Let's start from mutation which adds new user to the database, like in the [howtographql.com common schema](https://github.com/howtographql/howtographql/blob/master/meta/structure.graphql)

```graphql

mutation {
  createUser(name: String!, authProvider: AuthProviderSignupData!): User
}

input AuthProviderSignupData {
  email: AUTH_PROVIDER_EMAIL
}

input AUTH_PROVIDER_EMAIL {
  email: String!
  password: String!
}
```

It isn't hard to imagine what this mutation does. Name suggests it's point of our interests - it creates an user, takes two paramaters of type `String` and `AuthProviderSignupData` and returns a `User`

But wait... until now we've used `type` not `input`. So what is this? `input` is a type that can be used as parameter. You very often will see it along `mutation`s.

Let's try to implement in order similar to creation of new query:

* Define case classes for inputs
* Define ObjectInputType's for those classes,
* Define ObjectType responsible for all Mutations
* Tell a Schema to use this object.


### Create case classes

<Instruction>

Create classes we will need for inputs

```scala

case class AuthProviderEmail(email: String, password: String)

case class AuthProviderSignupData(email: AuthProviderEmail)

```

</Instruction>

### Define ObjectInputType's

`ObjectInputType` is the same for input what `ObjectType` to `type` keyword.
It tells Sangria how to understand a data. In fact you can define `ObjetType` and `ObjectInputType` for the same case class, or even more than one of each. Good example is an `User` entity which could consist many fields. But when you register new user and during signup action you need a different kind of data so you can create different ObjectInputTypes.

<Instruction>

In `GraphQLSchema.scala` add following definitions:

```scala
implicit val AuthProviderEmailInputType: InputObjectType[AuthProviderEmail] = deriveInputObjectType[AuthProviderEmail](
   InputObjectTypeName("AUTH_PROVIDER_EMAIL")
)

implicit val AuthProviderSignupDataInputType: InputObjectType[AuthProviderSignupData] = deriveInputObjectType[AuthProviderSignupData]()

```

</Instruction>

### Define Mutation Object

It would be really similar to the process you already know.

<Instruction>

In the same file add a following code:

```scala
  val NameArg = Argument("name", StringType)
  val AuthProviderArg = Argument("authProvider", AuthProviderSignupDataInputType)

  val Mutation = ObjectType(
    "Mutation",
    fields[MyContext, Unit](
      Field("createUser",
        UserType,
        arguments = NameArg :: AuthProviderArg :: Nil,
        resolve = c => c.ctx.dao.createUser(c.arg(NameArg), c.arg(AuthProviderArg))
      )
    )
  )
```

</Instruction>

### Add Mutation to Schema

<Instruction>

Replace `schemaDefinition` with the code:

```scala
val SchemaDefinition = Schema(QueryType, Some(Mutation))
```

All mutations are optional so you have to wrap it in `Some`.

If you will try to run a server now you will get errors about not implemented `FromInput`'s.
It's additional step we have to do to able run a mutations above.

### Provide FromInput for input classes

Sangria needs to read a part of JSON like structure and converts it to case classes. That's the reason why we need such `FromInput` type classes. In fact you can implement it on your own. But there is another way: graphql syntax is JSON, so you can use any of JSON parsing libraries for this.
In the first step we've added dependency to the `sangria-spray-json` library, but if you want you can use any other supported. Sangria uses this library JSON implementation to convert it into proper `FromInput` type. All we need to do is to define proper JSONReader for that case class.

<Instruction>

In the same file, before definitions of objectInputTypes add following code:

```scala

import sangria.marshalling.sprayJson._
import spray.json.DefaultJsonProtocol._

implicit val authProviderEmailFormat = jsonFormat2(AuthProviderEmail)
implicit val authProviderSignupDataFormat = jsonFormat1(AuthProviderSignupData)

```

</Instruction>  

Almost done.

<Instruction>

Add in `DAO` following function:

```
def createUser(name: String, authProvider: AuthProviderSignupData): Future[User] = {
    val newUser = User(0, name, authProvider.email.email, authProvider.email.password )

    val insertAndReturnUserQuery = (Users returning Users.map(_.id)) into {
      (user, id) => user.copy(id = id)
    }

    db.run {
      insertAndReturnUserQuery += newUser
    }

  }
```

</Instruction>  

Now everything should works as expected.

### Test case

Perform a query in graphQL console:

```graphql

mutation addMe {
  createUser(
    name: "Mario",
    authProvider:{
      email:{
        email:"mario@example.com",
        password:"p4ssw0rd"
      }
    }){
    id
    name
  }
}
```

Of course you can use another data :D If everything works we can go forward to implement two more mutations

### AddLink mutation

Implement a mutation to able run a following code:

```graphql
createLink(description: String!, url: String!, postedById: ID): Link
```

First try on your own, next check whther I have similar solution.
Hint! You can skip creating case classes phase because we no need any of them. In this case parameters uses only `String` and `Integer` which are simple scalars available out-of-the-box.

<Instruction>

In `DAO` add a function:

```scala

def createLink(url: String, description: String, postedBy: Int): Future[Link] = {

  val insertAndReturnLinkQuery = (Links returning Links.map(_.id)) into {
    (link, id) => link.copy(id = id)
  }
  db.run {
    insertAndReturnLinkQuery += Link(0, url, description, postedBy)
  }
}

```

</Instruction>

Also add a mutation's defintion inside of `Mutation.fields` sequence.

<Instruction>

In `Mutation` definition add following field:

```scala
Field("createLink",
  LinkType,
  arguments = UrlArg :: DescArg :: PostedByArg :: Nil,
  resolve = c => c.ctx.dao.createLink(c.arg(UrlArg), c.arg(DescArg), c.arg(PostedByArg)))
```

</Instruction>


We're missing arguments definitions

<Instruction>

Add arguments definitions somewhere before `Mutation`

```

val UrlArg = Argument("url", StringType)
val DescArg = Argument("description", StringType)
val PostedByArg = Argument("postedById", IntType)

```

</Instruction>

That's all, now you should be able to run following command:

```graphql
mutation addLink {
  createLink(
    url: "howtographql.com",
    description: "Great tutorial page",
    postedById: 1
  ){
    url
    description
    postedBy{
      name
    }
  }

}
```

Let's implement the last mutation for voting:

### Create mutation for voting

<Instruction>

In `DAO` add function which will be able to save new vote.

```scala
def createVote(linkId: Int, userId: Int): Future[Vote] = {
  val insertAndReturnVoteQuery = (Votes returning Votes.map(_.id)) into {
    (vote, id) => vote.copy(id = id)
  }
  db.run {
    insertAndReturnVoteQuery += Vote(0, userId, linkId)
  }
}
```

</Instruction>

Add arguments defintions:

```scala
val LinkId = Argument("linkId", IntType)
val UserId = Argument("userId", IntType)
```

</Instruction>

Add mutation definition.

<Instruction>

Add another field inside `Mutation` objectType:

```scala
Field("createVote",
  VoteType,
  arguments = LinkIdArg :: UserIdArg :: Nil,
  resolve = c => c.ctx.dao.createVote(c.arg(LinkIdArg), c.arg(UserIdArg)))
```

</Instruction>

Now you know how to send data to the server. You will use this knowledge when we will implement authentication and authorization logic in the next chapter.
