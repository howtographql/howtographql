---
title: Queries
description: Creating Your First Queries
---

### About the Django structure
It's important to understand how the Django project structure works before moving on.

On the last chapter, you created a *Django Project*, which holds everything related to your application. However, Django separates the project into *apps*. Think about apps as a[separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). You will have two apps, one for Users and one for the Links.

Another essential decision is about the database. Django works out of the box with [SQLite](https://www.sqlite.org/) – a file based database – which you will use. On production systems, you should have a more robust database, such as [PostgreSQL](https://www.postgresql.org/). 

### Creating the Links app

<Instruction>

On the project's root (next to the `manage.py` file), create the `links` app:

```bash
python manage.py startapp links
```

</Instruction>

It will create the links app and some default files inside it.

With an app in place, you need to define a Model – the layer between Django and the database.

<Instruction>

On the `links/models.py` file, add the following content:

```python(path=".../graphql-python/hackernews/links/models.py")
class Link(models.Model):
    url = models.URLField()
    description = models.TextField(null=True, blank=True)
```

</Instruction>

<Instruction>

Lastly, configure Django to use the new `links` app on the `hackernews/settings.py` file:

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
In GraphQL, a *Type* is an object that may contain multiple *Fields*. Each field is calculated through *Resolvers*, that returns a value. A collection of types is called a *Schema*. Every schema has a special type called *Query* for getting data from the server and *Mutation* for sending data to the server.

This is a simple overview of the concepts, but it should be enough to go through the tutorial. You can read more about it [here](http://graphql.org/learn/schema/).

<Instruction>

Create the `links/schema.py` file, with the content below:

```python(path=".../graphql-python/hackernews/links/schema.py")
import graphene
from graphene_django import DjangoObjectType

from links.models import Link


class LinkType(DjangoObjectType):
    class Meta:
        model = Link


class Query(graphene.AbstractType):
    links = graphene.List(LinkType)

    @graphene.resolve_only_args
    def resolve_links(self):
        return Link.objects.all()
```

</Instruction>

On the snippet above, the `LinkType` was created using the `DjangoObjectType` – a custom type available in Graphene Django. Also, the special type query was created with a resolver for the field `links`, which returns all the links.

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

Why creating another query? This query just inherits the query defined before. This way, you are able to keep every part of the schema isolated in the apps. After, the schema is defined, with the main query.

Wow, that's a lot, right? But now you can finally query some data!

### Introducing GraphiQL
[GraphiQL](https://github.com/graphql/graphiql) is a graphical interactive in-browser GraphQL IDE. In other words, a playground. Note that you need to disable the [Django CSRF protection](https://docs.djangoproject.com/en/1.11/ref/csrf/).

<Instruction>

To install it, add the following on the `hackernews/urls.py` file:

```python(path=".../graphql-python/hackernews/hackernews/urls.py")
... # code
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),

]
```

</Instruction>

Open your browser and access `http://localhost:8000/graphql/`, you should see a screen like this:

![](http://i.imgur.com/b8Zrtvh.png)

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

![](http://i.imgur.com/bND8TCT.png)

Congratulations! Play around a little bit, try to remove some fields or add others. Break it! It's the best way of learning!
