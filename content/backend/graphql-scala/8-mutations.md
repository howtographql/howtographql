---
title: Mutations
pageTitle: "GraphQL Scala - Mutations"
description: "In this chapter you will learn how to add data to the database."
question: "What is a mutation?"
answers: ["It's a function which modify a context", "It's a function responsible for authentication", 
"It's a function executed before and after field", "It's a complementor to Query but to update/put data instead of reading it"]
correctAnswer: 3
---

In the last chapters you've learnt how to use GraphQL to read data. Time to add some.
When you want to add data, you use almost the same syntax. How does the server know when you want to write data instead of reading? You have to use the `mutation` keyword instead of `query`. That's all. Actually not all, but you will learn about the differences in this chapter.

### Create an user

Let's start with the mutation which adds a new user to the database, like in the [howtographql.com common schema](https://github.com/howtographql/howtographql/blob/master/meta/structure.graphql)

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

It isn't hard to imagine what this mutation does. The name suggests it matches our interest - it creates an user, 
takes two parameters of type `String` and `AuthProviderSignupData` and returns an `User` in response.

But wait... until now we've been using `type` not `input`. So what is this? `input` is a type that can be used as a parameter. 
You will frequently see it among `mutation`s.

Let's try to implement mutation in the following order:

* Define case classes for inputs
* Define InputObjectType's for those classes,
* Define ObjectType responsible for all Mutations
* Tell a Schema to use this object.


### Create case classes

<Instruction>

Create classes needed for inputs.

```scala

case class AuthProviderEmail(email: String, password: String)

case class AuthProviderSignupData(email: AuthProviderEmail)

```

</Instruction>

### Define InputObjectType's

`InputObjectType` is to `input` what `ObjectType` is to the `type` keyword.
It tells Sangria how to understand data. In fact you can define `ObjectType` and `InputObjectType` for the same case class, or even more than one. A good example is a `User` entity which consists of many fields. But if you need different data when you register a new user and during sign in, you can create different `InputObjectType`'s.

<Instruction>

In `GraphQLSchema.scala` add the following definitions:

```scala
implicit val AuthProviderEmailInputType: InputObjectType[AuthProviderEmail] = deriveInputObjectType[AuthProviderEmail](
   InputObjectTypeName("AUTH_PROVIDER_EMAIL")
)

lazy val AuthProviderSignupDataInputType: InputObjectType[AuthProviderSignupData] = deriveInputObjectType[AuthProviderSignupData]()

```

</Instruction>

To avoid circular dependencies of types, like we've experiences in the last chapter ther a suggestion to use `lazy` keyword for every type.
But in case above, `AuthProviderEmail` is nested object in `AuthProviderSignupData` which is built by macro. Thats why we had to add `implicit`
we have to have this nested object type in the scope in the time of macro executing.


### Define Mutation Object

It will be similar to the process you already know.

<Instruction>

In the same file add the following code:

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

As you can see, we're missing one function in `DAO`

<Instruction>

Add to `DAO` the following function:

```scala
//add to imports
import com.howtographql.scala.sangria.models.AuthProviderSignupData

//add in body
def createUser(name: String, authProvider: AuthProviderSignupData): Future[User] = {
  val newUser = User(0, name, authProvider.email.email, authProvider.email.password)

  val insertAndReturnUserQuery = (Users returning Users.map(_.id)) into {
    (user, id) => user.copy(id = id)
  }

  db.run {
    insertAndReturnUserQuery += newUser
  }

}
  
```

</Instruction>  

### Add Mutation to Schema

<Instruction>

Replace `schemaDefinition` with the code:

```scala
val SchemaDefinition = Schema(QueryType, Some(Mutation))
```

</Instruction>

All mutations are optional so you have to wrap it in `Some`.

If you will try to run a server, you will get errors about unimplemented `FromInput`'s.
It's an additional step we have to do to able run those mutations.

### Provide FromInput for input classes

Sangria needs to read a part of JSON-like structure and convert it to case classes. 
That's the reason why we need such `FromInput` type classes. 
There are two ways to do it, you can write your own mapper, but you can also use any JSON library to help with this process.
In the first step we've added a dependency to the `sangria-spray-json` library, 
but if you want you can use any other library. 
Sangria uses this to convert it into proper `FromInput` type. 
All we need to do is to define a proper JSONReader for that case class and import some converting functions.

<Instruction>

In the `GraphQLSchema` file, add the following code before the definitions of InputObjectTypes:

```scala

import sangria.marshalling.sprayJson._
import spray.json.DefaultJsonProtocol._

implicit val authProviderEmailFormat = jsonFormat2(AuthProviderEmail)
implicit val authProviderSignupDataFormat = jsonFormat1(AuthProviderSignupData)

```

</Instruction>  

Everything should work as expected now.

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

Of course you can use different data :)  
If everything works, we can move forward and implement two more mutations.

### AddLink mutation

Implement a mutation to able run a following code:

```graphql
createLink(description: String!, url: String!, postedById: ID): Link
```

First try on your own, next compare to my solution.

Hint! You can skip creating case classes phase because we don't need any of them. 
In this case parameters uses only `String` and `Int` which are simple scalars available out-of-the-box.

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

Also add a mutation's definition inside the `Mutation.fields` sequence.

<Instruction>

In `GraphQLSchema` file, inside `Mutation` definition, add the following field:

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

That's all, now you should be able to run following query:

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

Add arguments needed by the next mutation and this mutation itself.

<Instruction>

Add argument definitions:

```scala
val LinkIdArg = Argument("linkId", IntType)
val UserIdArg = Argument("userId", IntType)
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

We are done! You can test all those mutations in Graphiql console.

The current state of files changed in this chapter:

[models/package.scala](https://gist.github.com/marioosh/316468a9ac5e1179e226a3191f03fab8#file-models_package-scala)  
[DAO.scala](https://gist.github.com/marioosh/316468a9ac5e1179e226a3191f03fab8#file-dao-scala)  
[GraphQLSchema.scala](https://gist.github.com/marioosh/316468a9ac5e1179e226a3191f03fab8#file-graphqlschema-scala)  

---

Now you know how to send data to the server. 
You will use this knowledge when we implement authentication and authorization logic in the next chapter.
