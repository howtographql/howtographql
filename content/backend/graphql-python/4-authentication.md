---
title: Authentication
question: Which is the best way to authorize users in the modern web?
answers: ["Sessions", "Cookies", "Tokens", "Local Storage"]
correctAnswer: 2
description: Authenticating on GraphQL
---

### Creating a User
Django already comes with the concept of Users built in. Before talking about authentication, let's create our first User.

To do it so, we need to send data to the server through a mutation.

<Instruction>

Create a new folder under `hackersnews` called `users` and a new file called `schema.py`:

```python(path=".../graphql-python/hackernews/user/schema.py")
from django.contrib.auth import get_user_model

import graphene
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    def mutate(self, info, username, password, email):
        user = get_user_model()(
            username=username,
            email=email,
        )
        user.set_password(password)
        user.save()

        return CreateUser(user=user)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
```

</Instruction>

In this mutation the server will receive a `username`, `password` and `email`, returning the created user information. Remember that on your last mutation – `CreateLink` – the mutation returned field by field, now, you are returning a full `User`, where the client can ask the fields it wants.

<Instruction>

Before executing it, you need to put the new mutation on the root schema file, `hackernews/schema.py`. It will look like this:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
import graphene

import links.schema
import users.schema


class Query(links.schema.Query, graphene.ObjectType):
    pass


class Mutation(users.schema.Mutation, links.schema.Mutation, graphene.ObjectType,):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
```

</Instruction>

Execute the following code on the GraphiQL interface:

![](https://i.imgur.com/dyRB15P.png)

On the response, you already can see the new user. Hurray!

### Querying the Users
Let's create a query for listing all users:

<Instruction>

On the `users/schema.py` file, add the following:

```python(path=".../graphql-python/hackernews/user/schema.py")
# ...code
class Query(graphene.ObjectType):
    users = graphene.List(UserType)

    def resolve_users(self, info):
        return get_user_model().objects.all()
```

</Instruction>

<Instruction>

Enable the users query on the main query class:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
# ...code

# Add the users.schema.Query
class Query(users.schema.Query, links.schema.Query, graphene.ObjectType):
    pass
```

</Instruction>

To test it, send a query to the server:

![](http://i.imgur.com/zqz6miO.png)

### User Authentication
The concept of authentication and authorization is enabled by default on Django using sessions. Since most of the web apps today are *stateless*, we are going to use the [django-graphql-jwt](https://github.com/flavors/django-graphql-jwt) library to implement [JWT Tokens](https://jwt.io/) in Graphene (thanks [mongkok](https://github.com/mongkok)!).

Basically, when a User sings up or logs in a token will be returned: a piece of data that identify the User. This token must be sent by the User in the HTTP Authorization header with *every request* when authentication is needed. If you want to know more about how the token is generated, take a look at the JWT site above.

Unfortunally, the GraphiQL web interface that we used before does not accept adding custom HTTP headers. From now on, we will be using the Insomnia desktop app. You can download and install it [here](https://insomnia.rest/download).

### Configuring django-graphql-jwt

<Instruction>

On the `hackernews/settings.py` file, add a new `MIDDLEWARE`:

```python(path=".../graphql-python/hackernews/hackernews/settings.py")
MIDDLEWARE = [
    # After django.contrib.auth.middleware.AuthenticationMiddleware...
    'graphql_jwt.middleware.JSONWebTokenMiddleware',
[
```

</Instruction>

<Instruction>

On the same file, add the `AUTHENTICATION_BACKENDS` setting:

```
AUTHENTICATION_BACKENDS = [
    'graphql_jwt.backends.JSONWebTokenBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```

</Instruction>

<Instruction>

On the top of `hackernews/hackernews/schema.py`, import our library:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
import graphene
import graphql_jwt

# ...code
```

</Instruction>

<Instruction>

On the `hackernews/hackernews/schema.py`, change the `Mutation` class to have the following variables:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
class Mutation(users.schema.Mutation, links.schema.Mutation, graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
```

</Instruction>

The library creates three Mutations for us, let's take a look at them.

`TokenAuth` is used to authenticate the User with its username and password to obtain the JSON Web token.

![](https://i.imgur.com/v8e8sjK.png)

`VeriryToken` to confirm that the token is valid, passing it as an argument.

![](https://i.imgur.com/d03jVtP.png)

`RefreshToken` to obtain a new token within the renewed expiration time for non-expired tokens, if they are enable to expire. Using it is outside the scope of this tutorial.

Besides that, various aspects of the Mutations and JWT can be configured on the library. Please check the [documentation](https://github.com/flavors/django-graphql-jwt) for more information.

### Testing the authentication
To test if our authentication is working, let's create a Query called `me`, which should return the User's information if logged in or an error otherwise.

<Instruction>

Let's add a the `me` Query in the `user/schema.py` file within the `Query` class:

```python(path=".../graphql-python/hackernews/user/schema.py")
class Query(graphene.AbstractType):
    me = graphene.Field(UserType)
    users = graphene.List(UserType)

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_me(self, info):
        user = info.context.user
        if user.is_anonymous:
            raise Exception('Not logged!')

        return user
```

</Instruction>

To test it out, we need to get a token using the `VerifyToken` Mutation and use it in our Query with the `AUTHORIZATION` HTTP header, using the `JWT` prefix. Now, we are going to the Inmsonia client:

![](https://i.imgur.com/VelVdDB.png)

Under the `Header` tab on Inmsonia, add the `AUTHORIZATION` HTTP header with your token content, prefixed by the word `JWT`:

![](https://i.imgur.com/TyIN8zd.png)

Finally, let's make the `me` query, which should identify our User:

![](https://i.imgur.com/v5lSss5.png)

Awww yeah! You are now able to create users and sign in with them. Try to make the query without the HTTP header and an error message should appear.
