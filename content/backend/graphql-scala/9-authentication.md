---
title: Authentication
pageTitle: "Providing authentication and authorization mechanisms to secure API. "
description: "Sagria's Middleware allows to pre-processing queries. Gather all useful data in the following subqueries."
---

In real live examples the most of the API's are secured. It checks whether client has proper permissions to read/write data. In GraphQL you will do the same. I don't even imagine to allow anybody add any data to our service anonymously.

### Our goal

1. Provide possibility to use email and password to signin.
1. Secure a query to check whether user is signed in.


#### The worst case scenario

Authentication/Authorization engine also should supports cases when user provides wrong credentials during signing in. Also secured queries should be rejected when user isn't signed in. We will begin for providing an implementation for both mentioned cases.

 Sangria way to manage bad cases is to throw an `Exception` and catch it by proper handler on the top level.
Let's implement our cases in the suggested way.  

<Instruction>

First we have to define two exception classes.

```scala
case class AuthenticationException(message: String) extends Exception(message)
case class AuthorisationException(message: String) extends Exception(message)
```

</Instruction>

`AuthenticationException` will be used during signing in action, when provided `email` and `password` values don't match to existing user. The second, `AuthorisationException`, will be thrown when secured query will be fetched without authorization.

Now we have to implement custom exception handler.

Custom `ExceptionHandler` needs partial function which converts type of an exception to `HandledException`. Next this exception is internally converted into proper JSON response.

<Instruction>

In `GraphQLSchema` add following function:

```
val errorHandler = ExceptionHandler {
    case (m, AuthenticationException(message)) ⇒ HandledException(message)
    case (m, AuthorisationException(message)) ⇒ HandledException(message)
}

```

</Instruction>

The last step and we're done.

<Instruction>

Add this handler to our `Executor`

```
...
exceptionHandler = GraphQLSchema.ErrorHandler

```

</Instruction>

The Executor should now looks like the following:

```scala
Executor.execute(
  GraphQLSchema.SchemaDefinition,
  query,
  MyContext(dao),
  variables = vars,
  operationName = operation,
  deferredResolver = GraphQLSchema.Resolver,
  exceptionHandler = GraphQLSchema.ErrorHandler
).map(OK -> _)
  .recover {
  case error: QueryAnalysisError => BadRequest -> error.resolveError
  case error: ErrorWithResolver => InternalServerError -> error.resolveError
}
```

### Signing in

In the next step we will focus on signing in action. But what do we need to implement it?
Firstly we need an endpoint the user could use to authenticate. Next, we have to find way to keep information whether the user is signed in correctly. At the end we have to check somehow the endpoint needs authorization.

#### FieldTag

Sangria could tag every field in queries. We could use this tags in many cases. In our example we can use a tag to check whether a field is secured. All we need is creating object class which extends `FieldTag` trait.

<Instruction>
Create `Authorized` case object to check secured fields.

```
case object Authorised extends FieldTag

```
</Instruction>

Now we can tag a field. In our example we will make `addLink` mutation secured. To do so, add `tags` property with above implemented tag.

<Instruction>

Add `Authorised` fieldtag to the `createLink` mutation field. Entire mutation definition should looks like the following one:

```
Field("createLink",
        LinkType,
        arguments = UrlArg :: DescArg :: PostedByArg :: Nil,
        tags = Authorised :: Nil,
        resolve = c => c.ctx.dao.createLink(c.arg(UrlArg), c.arg(DescArg), c.arg(PostedByArg))),
```

</Instruction>

Field is tagged, but Sangria won't make anything without that, because tags are mostly informative and you have to manage logic yourself. So it's time to implement such logic now. Assume the scenario, when user is logged in Sangria will keep information about that, and when during execution it will meet the field tagged with `Authorised` tag it checks whether user is signed in.

To keep information about user we could use `Context` class. As you probably remember you can use the same context object in every subsequent query. So it fits perfectly to our case.

<Instruction>

Extends `MyContext` to keep information about current user, with some helper function we will use later in this chapter.
The `MyContext` after chagnes should look like this:

```
case class MyContext(dao: DAO, currentUser: Option[User] = None){
  def login(email: String, password: String): User = {
    val userOpt = Await.result(dao.authenticate(email, password), Duration.Inf)
    userOpt.getOrElse(
      throw AuthenticationException("email or password are incorrect!")
    )
  }

  def ensureAuthenticated() =
    if(currentUser.isEmpty)
      throw AuthorisationException("You do not have permission. Please sign in.")
}
```

</Instruction>

The `currentUser` is a property to keep information abuot signed in user. `login` function is a helper function for authorization, it responds with user when credential fits to existing user, in the other case it will throw an exception we've defined at the begining of this chapter. Just note I've used `Duration.Inf` you should avoid in production code, but I wanted to keep it simple. `ensureAuthenticated` checks `currentUser` property and throw en exception in case it's empty.

<Instruction>

Add `authenticate` function to the `DAO` class, to able look over the database for user with provided credentials.

```
def authenticate(email: String, password: String): Future[Option[User]] = db.run {
    Users.filter(u => u.email === email && u.password === password).result.headOption
}
```

</Instruction>

The last step is to provide `login` mutation.

<Instruction>

Add `login` mutation with the following code:

```
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

At this point you should understand the most of the code above. But I have to explain how `resolve` work in this case.
`UpdateCtx` is an action which takes two parameters. First is a function responsible for producing response. The output of first function is passed to the second function wich have to response with context type. This context is replaced and used in all subsequent queries.
In our case I use `ctx.ctx.login(ctx.arg(EmailArg), ctx.arg(PasswordArg))` as first function because I want to get `User` type in resposnse. When the first function will succeed, this user will be passed the the second one and used to set in `currentUser` property.

At this point you can execute `login` mutation successfully. But executing `createLink` still could be passed without authorization.


#### Middleware

Sangria provides solution for middleware during execution. `Middleware` classes would be executed in the row one by one during query execution. In this way you can add logic which be executed aourd field or entire query. The main advantage of such solution is to keep this logic completely separate from business code. So you can use it for benchmarking and utrning it off in the production. We will use `Middleware` to catch secured fields.

Our implementation needs to get access to field before resolving. When the field has `Authorised` FieldTag it should checks whether user is authenticated.

<Instruction>

Provide AuthenticationMiddleware with the following code:

```
object AuthMiddleware extends Middleware[MyContext] with MiddlewareBeforeField[MyContext] {
  override type QueryVal = Unit
  override type FieldVal = Unit

  override def beforeQuery(context: MiddlewareQueryContext[MyContext, _, _]) = ()

  override def afterQuery(queryVal: QueryVal, context: MiddlewareQueryContext[MyContext, _, _]) = ()

  override def beforeField(queryVal: QueryVal, mctx: MiddlewareQueryContext[MyContext, _, _], ctx: Context[MyContext, _]) = {
    val requireAuth = ctx.field.tags contains Authorised

    if(requireAuth) ctx.ctx.ensureAuthenticated()

    continue
  }
}
```

</Instruction>

The last step is to add this middleware to the executor.

<Instruction>
`Executor` should looks like the following:

```  
Executor.execute(
      GraphQLSchema.SchemaDefinition, //#
      query, //#
      MyContext(dao), //#
      variables = vars, //#
      operationName = operation,
      deferredResolver = GraphQLSchema.Resolver,
      exceptionHandler = GraphQLSchema.ErrorHandler,
      middleware = AuthMiddleware :: Nil
    ).map//...
  ```

### Recap  
At this point we have `createLink` mutation secured. So we have to login before. We can do it in the same query, like this:

```
mutation loginAndAddLink {
  login(
    email:"user@email.com",
    password:"p4ssw0rd"
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

Please assume I wanted to keep this code clear, you can extend the logic in many ways. For example you take `user_id` from signed in user instead of a field. You can also use token based authentication instead of including email or password in every query. You can also use FieldTags to check whether user has proper role to execute a query.

That's all. I hope this tutorial was useful for you and you've learnt something. Don't forget the official documentation is always up to date and you can find there many helpful examples.
