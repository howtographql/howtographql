---
title: Mutations
question: What differentiates a query from a mutation?
answers: ["The query returns just lists of objects", "The mutation is used for pagination", "Mutations are used for getting data and queries for sending data", "Mutations are used for sending data and queries for getting data"]
correctAnswer: 3
description: Creating Data With Mutations
---

### Mutations
The process of sending data to server is called *mutation*. Defining it is pretty similar on how you've defined the query.

<Instruction>

In `hackernews/links/schema.py` add the following:

```python(path=".../graphql-python/hackernews/links/schema.py")
# ...code
#1
class CreateLink(graphene.Mutation):
    id = graphene.Int()
    url = graphene.String()
    description = graphene.String()

    #2
    class Arguments:
        url = graphene.String()
        description = graphene.String()

    #3
    def mutate(self, info, url, description):
        link = Link(url=url, description=description)
        link.save()

        return CreateLink(
            id=link.id,
            url=link.url,
            description=link.description,
        )


#4
class Mutation(graphene.ObjectType):
    create_link = CreateLink.Field()
```

</Instruction>

Let me explain this snippet, piece by piece:

* `#1`: Defines a mutation class. Right after, you define the *output* of the mutation, the data the server can send back to the client. The output is defined *field* by *field* for learning purposes. In the next mutation you'll define them as just one.
* `#2`: Defines the data you can send to the server, in this case, the links' `url` and `description`.
* `#3`: The mutation method: it creates a link in the database using the data sent by the user, through the `url` and `description` parameters. After, the server returns the `CreateLink` class with the data just created. See how this matches the parameters set on `#1`.
* `#4`: Creates a mutation class with a field to be resolved, which points to our mutation defined before.

<Instruction>

In `hackernews/hackernews/schema.py` add the following:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
class Mutation(links.schema.Mutation, graphene.ObjectType):
    pass
```

</Instruction>

<Instruction>

And change the `schema` variable to:

```python(path=".../graphql-python/hackernews/hackernews/schema.py")
schema = graphene.Schema(query=Query, mutation=Mutation)
```

</Instruction>

This will make sure our schema knows the mutation created.

### Creating a Link
Time to play! In the GraphiQL interface, enter the following data and see how a link gets created:

![](http://i.imgur.com/L2BA6eV.png)

After, try to query the data again, you should see the new link.

![](http://i.imgur.com/wjinT5F.png)
