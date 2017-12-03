---
title: Error Handling
question: Why can GraphQL predetermine if a query is valid?
answers: ["GraphQL language has a strong type system", "GraphQL is a new language", "GraphQL can be implemented in various languages", "GraphQL has security built-in"]
correctAnswer: 0
description: Handling Errors on GraphQL
---

All applications fail, and GraphQL it's no different. Some clients may ask for information that's not available or execute a forbidden action. In this chapter, you'll understand how GraphQL and Graphene address these issues.

### Schema Errors
Being a language with a strong type system, GraphQL can predetermine if a query is valid. All the fields from queries and mutations have a strong type, so requesting and inputting wrong data will generate an error.

Try it out! On the links query, ask for the `cheese` field and see how GraphQL returns back an error:

![](http://i.imgur.com/9F0jCC7.png)

### Graphene Errors
On the application level, you can use the `GraphQLError` class or the good and old [Python exceptions](https://docs.python.org/3/tutorial/errors.html).

You already used the `raise Exception('message')` through the code, for example, when checking if the user or link were valid before creating a vote. Let's try the other one!

<Instruction>

To refresh your mind, let's take a look at that code snippet:

```python(path=".../graphql-python/hackernews/links/schema.py")
# ...code
# Add after the imports
from graphql import GraphQLError

# ...code
class CreateVote(graphene.Mutation):
    user = graphene.Field(UserType)
    link = graphene.Field(LinkType)

    class Arguments:
        link_id = graphene.Int()

    def mutate(self, info, link_id):
        user = get_user(info) or None
        if not user:
            #1
            raise GraphQLError('You must be logged to vote!')

        link = Link.objects.filter(id=link_id).first()
        if not link:
            #2
            raise Exception('Invalid Link!')

        Vote.objects.create(
            user=user,
            link=link,
        )

        return CreateVote(user=user, link=link)
```

</Instruction>

On `#1` and `#2` the code raises an exception – using two different exception classes – but giving the same result, stopping its execution and returning the message between parentheses.

Try to vote in an invalid link and see what happens:

![](http://i.imgur.com/8L4eP3J.png)
