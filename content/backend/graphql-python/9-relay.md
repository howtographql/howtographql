---
title: Relay
description: Using Relay on Graphene
---

[Relay](https://facebook.github.io/relay/) is a Javascript framework built by Facebook with the purpose of improving the GraphQL architecture by making some core assumptions:

* A mechanism for refetching an object.
* A description of how to page through connections.
* Structure around mutations to make them predictable.

Basically speaking, it gives every object a global unique identifier, creates a cursor-based pagination structure and introduces the input parameter to mutations.

You can read more about the GraphQL server side considerations on the [GraphQL Relay Specification](https://facebook.github.io/relay/docs/graphql-relay-specification.html) and on the [Graphene Documentation](http://docs.graphene-python.org/projects/django/en/latest/tutorial-relay/).

### Relay and Graphene
Graphene and Graphene Django already comes with the Relay implementation, making your life easier.

You are going to recreate a little part of the application. Some code will be duplicated, but it's just for learning purposes. On production systems I recommend you to use Relay whenever possible. 

### Using Relay on Links
First of all, let's implement our link query using Relay. You will write all the following code in a new schema file, keeping things separated. The nomenclature used across the code – prefixed with *Relay* – is used to avoid confusion and it's not needed on real world scenarios.

<Instruction>

Create a new file `links/schema_relay.py`:

```python(path=".../graphql-python/hackernews/links/schema_relay.py")
import graphene
import django_filters
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from links.models import Link
from users.schema import get_user


#1
class LinkFilter(django_filters.FilterSet):
    class Meta:
        model = Link
        fields = ['url', 'description']


#2
class LinkNode(DjangoObjectType):
    class Meta:
        model = Link
        #3
        interfaces = (graphene.relay.Node, )


class VoteNode(DjangoObjectType):
    class Meta:
        model = Vote
        interfaces = (graphene.relay.Node,)


class RelayQuery(graphene.AbstractType):
    #4
    relay_link = graphene.relay.Node.Field(LinkNode)
    #5
    relay_links = DjangoFilterConnectionField(LinkNode, filterset_class=LinkFilter)
```

</Instruction>

Let's go over the essential changes:

* `#1`: Relay allows you to use [django-filter](https://github.com/carltongibson/django-filter/) for filtering data. Here, you've defined a *FilterSet*, with the `url` and `description` fields.
* `#2`: The data is exposed in *Nodes*, so you must create one for the links.
* `#3`: Each node implements an interface with an unique ID (you'll see the result of this in a bit).
* `#4`: Uses the `LinkNode` with the `relay_link` field inside the your new query.
* `#5`: Defines the `relay_links` field as a *Connection*, which implements the pagination structure.

<Instruction>

On the root schema file, add the new query:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
# ...code
# Import your new schema
import links.schema_relay


# Add on the main Query
class Query(
    users.schema.Query,
    links.schema.Query,
    links.schema_relay.RelayQuery,
    graphene.ObjectType
):
    pass
```

</Instruction>

On the GraphiQL platform, try out the Relay query:

![](http://i.imgur.com/QiBbyoD.png)

Some differences from the last queries:

* *Edges* and *Nodes*: they're the main structure of Relay. Edges represents a collection, which has pagination properties. Nodes are the final object or an edge for a new list of objects.
* The IDs are now a global unique *base64* encoded string.

What about the pagination? Each field has some arguments for controlling it: `before`, `after,` `first` and `last`. On top of that, each edge has a `pageInfo` object, including the cursor for navigating between pages.

![](http://i.imgur.com/iq8GpjN.png) 

The `first: 1` parameter limits the response for the first result. You also requested the `pageInfo`, which returned the navigation cursors.

![](http://i.imgur.com/s25FQwu.png)

With `first: 1, after:"YXJyYXljb25uZWN0aW9uOjA="` the response returned is the first one after the last link.

### Relay and Mutations
Defining mutations with Relay is pretty straightforward.

<Instruction>

Add the following code on `links/schema_relay.py`:

```python(path=".../graphql-python/hackernews/links/schema_relay.py")
class RelayCreateLink(graphene.relay.ClientIDMutation):
    link = graphene.Field(LinkNode)

    class Input:
        url = graphene.String()
        description = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, input, context, info):
        user = get_user(context) or None

        link = Link(
            url=input.get('url'),
            description=input.get('description'),
            posted_by=user,
        )
        link.save()

        return RelayCreateLink(link=link)


class RelayMutation(graphene.AbstractType):
    relay_create_link = RelayCreateLink.Field()
```

</Instruction>

<Instruction>

On the root schema file, add the new mutation:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
# ...code
# Add on the main Query
class Mutation(
    users.schema.Mutation,
    links.schema.Mutation,
    links.schema_relay.RelayMutation,
    graphene.ObjectType,
):
    pass
```

</Instruction>

The changes here are mostly on classes and methods names. You can now create links!

![](http://i.imgur.com/hNz7M9e.png)

The variation here is the `input` argument, which accepts the defined `url` and `description` arguments as a dictionary.
