---
title: Authentication
question: Which is the best way to authorize users in the modern web?
answers: ["Sessions", "Cookies", "Tokens", "Local Storage"]
correctAnswer: 2
description: Authenticating on GraphQL
---

### Creating the Users app
> Quick note: The Django already comes with the whole Users concept, you will extend it to accept tokens.

<Instruction>

On the project's root, run the following command:

```bash
python manage.py startapp users
```

</Instruction>

<Instruction>

Configure Django to use the new `users` app on the `hackernews/settings.py` file:

```python(path=".../graphql-python/hackernews/hackernews/settings.py")
INSTALLED_APPS = (
    # After the graphene_django app
    'users',
)
```

</Instruction>


After creating the `users` app, define its model – the layer between Django and the database.

<Instruction>

On the `users/models.py` file, add the following content:

```python(path=".../graphql-python/hackernews/users/models.py")
import binascii
import os

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    token = models.CharField(max_length=40)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = binascii.hexlify(os.urandom(20)).decode()
        return super().save(*args, **kwargs)
```

</Instruction>

<Instruction>

Configure Django to use this `User` model instead of its builtin one by adding the following on the `hackernews/settings.py` file:

```python(path=".../graphql-python/hackernews/hackernews/settings.py")
# Our custom user model
AUTH_USER_MODEL = 'users.User'
```

</Instruction>

To reflect this changes on the database, create a [migration](https://docs.djangoproject.com/en/1.11/topics/migrations/) and run it. 

Unfortunately, there's an issue here: since you initialized Django with its own `User` model, you need to flush the database.

<Instruction>

On your terminal, execute the migrations and add the links again:

```bash
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

</Instruction>

<Instruction>

Enter the Django shell with the command `python manage.py shell` and create some links:

```bash
from links.models import Link
Link.objects.create(url='https://www.howtographql.com/', description='The Fullstack Tutorial for GraphQL')
Link.objects.create(url='https://twitter.com/jonatasbaldin/', description='The Jonatas Baldin Twitter')
```

</Instruction>

### Creating a User
To create a user data must be sent to the server through a mutation.

<Instruction>

Create the file `users/schema.py`, add the `UserType` and the `CreateUser` mutation:

```python(path=".../graphql-python/hackernews/user/schema.py")
import graphene
from graphene_django import DjangoObjectType

from users.models import User


class UserType(DjangoObjectType):
    class Meta:
        model = User


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    def mutate(self, info, username, password, email):
        user = User(
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

![](http://i.imgur.com/DHwqXxQ.png)

On the response, you already can see the new user. Hurray!

### Querying the Users
Before authenticating, let's create a query for listing all users:

<Instruction>

On the `users/schema.py` file, add the following:

```python(path=".../graphql-python/hackernews/user/schema.py")
# ...code
class Query(graphene.ObjectType):
    users = graphene.List(UserType)

    def resolve_users(self, info):
        return User.objects.all()
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

### Authenticating a User
In modern web applications – when clients and servers are different applications – authentication generally happens with *tokens*. The client gets a token during the authentication process and send it on all subsequent requests. One of the most used methods is [JWT](https://jwt.io/).

Unfortunately, neither Django or Graphene comes with the token approach builtin, so you are going to use *sessions* to accomplish the same task. Sessions are little pieces of information the server can store and retrieve from the client.

But keep in mind this method may not be recommend for production systems! Take a look at JWT if you need to go this way!

<Instruction>

Create the `LogIn` mutation on the `users/schema.py` file. It will accept a pair of `username`/`password` to authenticate the user. If the operation is successful, it'll store the token on the client session. If not, returns an error message.

```python(path=".../graphql-python/hackernews/user/schema.py")
# ...code
# Import the authenticate method
from django.contrib.auth import authenticate


# ...code
class LogIn(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String()
        password = graphene.String()

    def mutate(self, info, username, password):
        user = authenticate(username=username, password=password)

        if not user:
            raise Exception('Invalid username or password!')

        info.context.session['token'] = user.token
        return LogIn(user=user)


# ...code
# Add the login mutation
class Mutation(graphene.AbstractType):
    create_user = CreateUser.Field()
    login = LogIn.Field()
```

</Instrution>

Before testing the mutation, how would you really know that the authentication worked? For that, create a query called `me` to display the information about the logged user.

<Instruction>

Let's add a method to check the client's session and, on the `Query` class, a new field and resolver:

```python(path=".../graphql-python/hackernews/user/schema.py")
# ...code

# Add this method after the imports 
# It tries to get a user from the session content
def get_user(info):
    token = info.context.session.get('token')

    if not token:
        return

    try:
        user = User.objects.get(token=token)
        return user
    except:
        raise Exception('User not found!')


# ...code
# Add the `me` field and `resolve_me` resolver, it will look like this:
class Query(graphene.AbstractType):
    me = graphene.Field(UserType)
    users = graphene.List(UserType)

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_me(self, info):
        user = get_user(info)
        if not user:
            raise Exception('Not logged!')

        return user
```

</Instruction>

Now, let's authenticate and see if it worked by checking the `me` query:

![](http://i.imgur.com/wUcAtLY.png)

OK, looking good!

![](http://i.imgur.com/AQss82P.png)

Awww yeah! You are now able to create users and sign in with them. Try to create a couple more and see how it goes!
