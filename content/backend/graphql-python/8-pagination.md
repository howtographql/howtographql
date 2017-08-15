---
title: Pagination
description: Simple Pagination with Graphene
---

Imagine that your Hackernews has thousands of created links – that would be awesome for you – but the clients making the request wouldn't be happy. Retrieving too much data on a single request is unpractical and may even break your app. Pagination exists to solve this problem, allowing the client to specify how many items it wants.

The simple way defined in the GraphQL [pagination](http://graphql.org/learn/pagination/) documentation is to slice the results using two parameters: `first`, which returns the first *n* items and `skip`, which skips the first *n* items.

Let's implement it on the links query.

### Paginating Links 

<Instruction>

Change your links query class to the following:

```python(path=".../graphql-python/hackernews/links/schema.py")
class Query(graphene.AbstractType):
    # Add the first and skip parameters
    links = graphene.List(
        LinkType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
    )
    votes = graphene.List(VoteType)

    # Use them to slice the Django queryset
    def resolve_links(self, args, context, info):
        search = args.get('search')
        first = args.get('first')
        skip = args.get('skip')

        qs = Link.objects.all()

        if search:
            filter = (
                Q(url__icontains=search) | 
                Q(description__icontains=search)
            )
            qs = qs.filter(filter)

        if skip:
            qs = qs[skip::]

        if first:
            qs = qs[:first]

        return qs

    @graphene.resolve_only_args
    def resolve_votes(self):
        return Vote.objects.all()

```

</Instruction>

The `skip` and `first` uses [Python Slicing](https://www.dotnetperls.com/slice-python).

Testing it on the GraphiQL interface:

![](http://i.imgur.com/LtRMZrv.png)
