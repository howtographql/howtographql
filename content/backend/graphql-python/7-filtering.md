---
title: Filtering
question: What you happen if you run the last query without the search parameter?
answers: ["The application would break", "The search parameter is mandatory", "All the Links would be returned", "Just the first Link would be returned"]
correctAnswer: 2
description: Filtering GraphQL Queries
---

You already can list all links, but another feature of Hackernews is to search them, by URL or description. In GraphQL, this concept is the same as mutations: you pass an argument to the `links` field, used by the resolver to filter the results.

### Filtering Links

<Instruction>

Change your links query class to the following:

```python(path=".../graphql-python/hackernews/links/schema.py")
# ..code
# After the imports, add
from django.db.models import Q

# ...code
class Query(graphene.ObjectType):
    # Add the search parameter inside our links field
    links = graphene.List(LinkType, search=graphene.String())
    votes = graphene.List(VoteType)

    # Change the resolver
    def resolve_links(self, info, search=None, **kwargs):
        # The value sent with the search parameter will be on the args variable
        if search:
            filter = (
                Q(url__icontains=search) | 
                Q(description__icontains=search)
            )
            return Link.objects.filter(filter)

        return Link.objects.all()

    def resolve_votes(self, info, **kwargs):
        return Vote.objects.all()
```

</Instruction>

To test it, just pass the `search` argument to the query:

![](https://i.imgur.com/JdUSjJx.png)
