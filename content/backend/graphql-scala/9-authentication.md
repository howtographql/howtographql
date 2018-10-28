---
title: Authentication
pageTitle: "GraphQL Scala - Authentication"
description: "Sangria's Middleware allows pre-processing queries. Gather all useful data in the following subqueries."
question: "Which feature haven't we used to provide authentication?"
answers: ["ExceptionHandler", "Middleware", "InterfaceType", "Context"]
correctAnswer: 2
---

In real live examples most of the API's are secured. It checks whether the client has proper permissions to read/write data. In GraphQL you will do the same. I can't even imagine to allow anyone to add any data to our service anonymously.

### Our goal

1. Provide possibility to use email and password to sign in.
1. Secure a query to check whether user is signed in.


#### The worst case scenario

The authentication/authorisation engine should support cases when the user provides the wrong credentials during sign in. Secured queries should be rejected when the user isn't signed in. We will start by providing an implementation for both cases.

Sangria's way to manage bad cases is to throw an `Exception` and catch it with the proper handler at the top level.
Let's implement our cases in the suggested way.  

<Instruction>

First we have to define two exception classes in the `models` package.

```scala
case class AuthenticationException(message: String) extends Exception(message)
case class AuthorizationException(message: String) extends Exception(message)
```

</Instruction>

`AuthenticationException` will be used during sign in, when the provided `email` and `password` values don't match the existing user.
`AuthorizationException` will be thrown when a secured query is fetched without provided credentials.

Now we have to implement a custom exception handler.

A custom `ExceptionHandler` needs a partial function which converts the type of an exception into a `HandledException`. 
Next this exception is internally converted into proper JSON response and sent back to the client.

<Instruction>

In `GraphQLServer` add the following function:

```scala
//add to imports: 
import com.howtographql.scala.sangria.models.{AuthenticationException, AuthorizationException}
import sangria.execution.{ExceptionHandler => EHandler, _}

//later in the body
val ErrorHandler = EHandler {
    case (_, AuthenticationException(message)) ⇒ HandledException(message)
    case (_, AuthorizationException(message)) ⇒ HandledException(message)
}

```

We've changed the name of imported `ExecutionHandler` because there is another such class in the scope, but of course you can
manage this conflict in the way you prefer.

</Instruction>

The last step and we're done.

<Instruction>

Add this handler to our `Executor`

```scala
...
exceptionHandler = ErrorHandler

```

</Instruction>

The Executor should now look like the following:

```scala
Executor.execute(
      GraphQLSchema.SchemaDefinition,
      query,
      MyContext(dao),
      variables = vars,
      operationName = operation,
      deferredResolver = GraphQLSchema.Resolver,
      exceptionHandler = ErrorHandler
    ).map(OK -> _)
      .recover {
        case error: QueryAnalysisError => BadRequest -> error.resolveError
        case error: ErrorWithResolver => InternalServerError -> error.resolveError
      }
```

### Signing in

In the next step we will focus on the sign in action. But what do we need to implement it?
Firstly we need an endpoint the user could use to authenticate. 
Next, we have to find a way to keep information whether the user is signed in correctly. 
At the end we have to check somehow whether the endpoint needs authorization.

#### FieldTag

Sangria can tag every field in queries. 
We could use these tags in many cases. 
In our example we can use a tag to check whether a field is secured. 
All we need is to create an object class which extends the `FieldTag` trait.

<Instruction>

Create `Authorized` case object to check secured fields. Add to `models`

```scala
//add to imports:
import sangria.execution.FieldTag

//bottom of the body
case object Authorized extends FieldTag

```

</Instruction>

Now we can tag a field. 
In our example we will make `addLink` mutation secured. 
To do so, add `tags` property with the above implemented tag.

<Instruction>

Add `Authoried` field's tag to the `createLink` mutation field. Entire mutation's definition should look like the following one:

```scala
Field("createLink",
        LinkType,
        arguments = UrlArg :: DescArg :: PostedByArg :: Nil,
        tags = Authorized :: Nil,
        resolve = c => c.ctx.dao.createLink(c.arg(UrlArg), c.arg(DescArg), c.arg(PostedByArg))),
```

</Instruction>

The field is tagged, but Sangria won't do anything because tags are mostly informative and you have to manage the logic yourself. 
So it's time to implement such logic now. 
Assume the scenario, when the user is logged in, 
Sangria will keep that information and when during execution it will meet the field tagged with an `Authorised` tag,
 it will check whether the user is signed in.

To keep information about the user we could use the `MyContext` class. 
As you probably remember you can use the same context object in every subsequent query. So it perfectly fits our case.

<Instruction>

Extend `MyContext` to keep information about the current user, with some helper function we will use later in this chapter.
The `MyContext` class should look like this after changes:

```scala
package com.howtographql.scala.sangria

import com.howtographql.scala.sangria.models.{AuthenticationException, AuthorizationException, User}

import scala.concurrent._
import scala.concurrent.duration.Duration

case class MyContext(dao: DAO, currentUser: Option[User] = None){
  def login(email: String, password: String): User = {
    val userOpt = Await.result(dao.authenticate(email, password), Duration.Inf)
    userOpt.getOrElse(
      throw AuthenticationException("email or password are incorrect!")
    )
  }

  def ensureAuthenticated() =
    if(currentUser.isEmpty)
      throw AuthorizationException("You do not have permission. Please sign in.")
}
```

</Instruction>

The `currentUser` is a property to keep information about the signed in user. 
`login` function is a helper function for authorisation, it responds with user when credential fits an existing user, 
in the other case it will throw an exception we've defined at the beginning of this chapter. 
Just note I've used `Duration.Inf` you should avoid it in production code, but I wanted to keep it simple. 
`ensureAuthenticated` checks the `currentUser` property and throws an exception in case it's empty.

<Instruction>

Add the `authenticate` function to the `DAO` class, to look in the database for an user with the provided credentials.

```scala
def authenticate(email: String, password: String): Future[Option[User]] = db.run {
    Users.filter(u => u.email === email && u.password === password).result.headOption
}
```

</Instruction>

The last step is to provide the `login` mutation.

<Instruction>

Add the `login` mutation with the following code:

```scala
//before Mutation object definition:
val EmailArg = Argument("email", StringType)
val PasswordArg = Argument("password", StringType)

//in Mutation definition
Field("login",
  UserType,
  arguments = EmailArg :: PasswordArg :: Nil,
  resolve = ctx => UpdateCtx(
    ctx.ctx.login(ctx.arg(EmailArg), ctx.arg(PasswordArg))){ user =>
      ctx.ctx.copy(currentUser = Some(user))
    }
)
```

</Instruction>

At this point you should understand most of the code above. But I have to explain how `resolve` works in this case.
`UpdateCtx` is an action which takes two parameters. The first is a function responsible for producing a response. The output of first function is passed to the second function which has to respond with a context type. This context is replaced and used in all subsequent queries.
In our case I use `ctx.ctx.login(ctx.arg(EmailArg), ctx.arg(PasswordArg))` as a first function because I want to get `User` type in response. When the first function succeeds, this user will be passed to the second one and used to set the `currentUser` property.

At this point you can execute `login` mutation successfully. But `createLink` can still be accessible to anyone.


#### Middleware

Sangria provides a solution for middleware during execution. 
`Middleware` classes are executed during query execution.
 If there is more than one `Middleware` class, all of them will be executed one by one.
 In this way you can add logic which will be executed around a field or even around an entire query. 
 The main advantage of such solution is to keep this logic completely separate from the business code. 
 For example you can use it for benchmarking and turn it off on production environment. 
 But in our case we will use `Middleware` to catch secured fields.

Our implementation needs to get access to the field before resolving. 
When the field has an `Authorized` FieldTag it should check whether the user is authenticated.

<Instruction>

Create a file named `AuthMiddleware.scala` with the following code:

```scala
package com.howtographql.scala.sangria

import com.howtographql.scala.sangria.models.Authorized
import sangria.execution.{Middleware, MiddlewareBeforeField, MiddlewareQueryContext}
import sangria.schema.Context

object AuthMiddleware extends Middleware[MyContext] with MiddlewareBeforeField[MyContext] {
  override type QueryVal = Unit
  override type FieldVal = Unit

  override def beforeQuery(context: MiddlewareQueryContext[MyContext, _, _]) = ()

  override def afterQuery(queryVal: QueryVal, context: MiddlewareQueryContext[MyContext, _, _]) = ()

  override def beforeField(queryVal: QueryVal, mctx: MiddlewareQueryContext[MyContext, _, _], ctx: Context[MyContext, _]) = {
    val requireAuth = ctx.field.tags contains Authorized //1

    if(requireAuth) ctx.ctx.ensureAuthenticated() //2

    continue //3
  }
}
```

The main logic you can see in the `beforeField` function body. Firstly (*1*) it tries to read `Authorized` FieldTag and if it exists
run `ensureAuthenticated` function from our context (*2*). If nothing bad happens Sangria will continue execution of a query (*3*)

</Instruction>

The last step is to add this middleware to the executor.

<Instruction>

`Executor` should look as follows:

```scala  
Executor.execute(
      GraphQLSchema.SchemaDefinition,
      query,
      MyContext(dao),
      variables = vars,
      operationName = operation,
      deferredResolver = GraphQLSchema.Resolver,
      exceptionHandler = GraphQLSchema.ErrorHandler,
      middleware = AuthMiddleware :: Nil
    ).map//...
```

</Instruction>

### Recap

At this point we have secured the `createLink` mutation. So we have to login before. We can do it in the same query, like this:

```graphql
mutation loginAndAddLink {
  login(
    email:"fred@flinstones.com",
    password:"wilmalove"
  ){
    name
  }

  createLink(
    url: "howtographql.com",
    description: "Great tutorial page",
    postedById: 2
  ){
    url
    description
    postedBy{
      name
    }
  }
}
```

You can experiment with the query above, check the reponse when you provide wrong email or password, or what will happen when you'll skip
entire `login` mutation.


the current state of files you can find under link below:

[package/models.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-package_models-scala)  
[AuthMiddleware.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-authmiddleware-scala)  
[DAO.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-dao-scala)  
[GraphQLSchema.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-graphqlschema-scala)  
[GraphQLServer.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-graphqlserver-scala)  
[MyContext.scala](https://gist.github.com/marioosh/8350d0bbb8e59b06b07ca0cd20822635#file-mycontext-scala)  


And the repository with entire project you can find [under this link](https://github.com/marioosh/howtographql_tutorial_code).  

---
### The last words
Please assume I wanted to keep this code clear, 
you can extend the logic in many ways. 
For example you take `user_id` from signed in user instead of a field. 
You can also use token based authentication instead of including email or password in every query. 
You can also use FieldTags to check whether user has proper role to execute a query. 
Do whatever you want, I just wanted to show you paths you can follow.

That's all. 
I hope this tutorial was useful for you and you've learnt something. 
Don't forget the official documentation is always up to date and you can find there many helpful examples.


