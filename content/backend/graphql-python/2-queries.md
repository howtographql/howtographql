---
title: Queries
question: In GraphQL, what type of method returns the value of a field?
answers: ["Query", "Mutation", "Type", "Resolver"]
correctAnswer: 3
description: Creating Your First Queries
---

### About the Django structure
It's important to understand how the Django project structure works before moving on.

In the last chapter, you created a *Django Project*, which holds everything related to your application. However, Django separates the project into *apps*. Think about apps as a [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). You will have two apps, one for Users and one for the Links.

Another essential decision is about the database. Django works out of the box with [SQLite](https://www.sqlite.org/) – a file based database – which you will use. On production systems, you should have a more robust database, such as [PostgreSQL](https://www.postgresql.org/).

### Creating the Links app

<Instruction>

In the project's root (next to the `manage.py` file), create the `links` app:

```bash
python manage.py startapp links
```

</Instruction>

It will create the links app and some default files inside it.

With an app in place, you need to define a Model – the layer between Django and the database.

<Instruction>

In the `links/models.py` file, add the following content:

```python(path=".../graphql-python/hackernews/links/models.py")
class Link(models.Model):
    url = models.URLField()
    description = models.TextField(blank=True)
```

</Instruction>

<Instruction>

Lastly, configure Django to use the new `links` app in the `hackernews/settings.py` file:

```python(path=".../graphql-python/hackernews/hackernews/settings.py")
INSTALLED_APPS = (
    # After the graphene_django app
    'links',
)
```

</Instruction>

<Instruction>

Create the database tables:

```bash
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

### Creating your first Type and Schema
In GraphQL, a *Type* is an object that may contain multiple *fields*. Each field is calculated through *resolvers*, that returns a value. A collection of types is called a *schema*. Every schema has a special type called *query* for getting data from the server and *mutation* for sending data to the server.

This is a simple overview of the concepts, but it should be enough to go through the tutorial. You can read more about it [here](http://graphql.org/learn/schema/).

<Instruction>

Create the `links/schema.py` file, with the content below:

```python(path=".../graphql-python/hackernews/links/schema.py")
import graphene
from graphene_django import DjangoObjectType

from .models import Link


class LinkType(DjangoObjectType):
    class Meta:
        model = Link


class Query(graphene.ObjectType):
    links = graphene.List(LinkType)

    def resolve_links(self, info, **kwargs):
        return Link.objects.all()
```

</Instruction>

In the snippet above, the `LinkType` was created using the `DjangoObjectType` – a custom type available in Graphene Django. Also, the special type query was created with a resolver for the field `links`, which returns all the links.

<Instruction>

Create the `hackernews/schema.py` file, with the query type:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
import graphene

import links.schema


class Query(links.schema.Query, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query)
```

</Instruction>

Why creating another query? This query just inherits the query defined before. This way, you are able to keep every part of the schema isolated in the apps.

Wow, that's a lot, right? But now you can finally query some data!

### Introducing GraphiQL
[GraphiQL](https://github.com/graphql/graphiql) is a graphical interactive in-browser GraphQL IDE. In other words, a playground. Note that you need to disable the [Django CSRF protection](https://docs.djangoproject.com/en/2.0/ref/csrf/).

<Instruction>

To install it, add the following in the `hackernews/urls.py` file:

```python(path=".../graphql-python/hackernews/hackernews/urls.py")
... # code
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
]
```

</Instruction>

Open your browser and access `http://localhost:8000/graphql/`, you should see a screen like this:

![Access GraphiQL at localhost:8000/graphql](http://i.imgur.com/b8Zrtvh.png)

On the right there's the **Documentation Explorer**, information about our schema created automatically through [introspection](http://graphql.org/learn/introspection/). On the left, to create your first query, typing the following:

```
query {
  links {
    id
    description
    url
  }
}
```

You should see a response link this:

![Query response](http://i.imgur.com/bND8TCT.png)

Congratulations! Play around a little bit, try to remove some fields or add others. Break it! It's the best way of learning!
