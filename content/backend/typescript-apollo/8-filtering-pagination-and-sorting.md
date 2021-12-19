---
title: Filtering, Pagination & Sorting
pageTitle: 'GraphQL Filtering, Pagination & Sorting Tutorial with TypeScript'
description: 'Learn how to add filtering and pagination capabilities to a GraphQL API with TypeScript, Apollo Server & Prisma.'
question:
  Which arguments are typically used to paginate through a list in the Prisma Client API using limit-offset pagination?
answers: ['skip & take', 'skip & orderBy', 'take & where', 'where & orderBy']
correctAnswer: 0
---


This is an exciting section of the tutorial where you'll implement some key features of many robust APIs! The goal is to
allow clients to constrain the list of `Link` elements returned by the `feed` query by providing filtering and
pagination parameters.

Let's jump in! 🚀

### Filtering

By using `PrismaClient`, you'll be able to implement filtering capabilities to your API without too much effort.
Similar to the previous chapters, the heavy-lifting of query resolution will be performed by Prisma. All you need to do is forward incoming queries to it.

The first step is to think about the filters you want to expose through your API. In your case, the `feed` query in your
API will accept a _filter string_. The query then should only return the `Link` elements where the `url` _or_ the
`description` _contain_ that filter string.


To implement this feature, you will need to make changes to the `feed` query. 

<Instruction>

Add a new string type argument called `filter` to the `feed` query in `Link.ts` and update the resolver function: 

```typescript{6-21}(path="../hackernews-typescript/src/graphql/Link.ts")
export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            args: {
                filter: stringArg(),   // 1
            },
            resolve(parent, args, context) {
                const where = args.filter   // 2
                    ? {
                          OR: [
                              { description: { contains: args.filter } },
                              { url: { contains: args.filter } },
                          ],
                      }
                    : {};
                return context.prisma.link.findMany({
                    where,
                });
            },
        });
    },
});
```

Let's go through the comments and see what is going on: 

1. Notice that the `filter` argument is _optional_. It can be omitted to skip filtering. 

2. In case a `filter` argument is provided, you're constructing a `where` object that expresses the filter condition. The filter condition can be defined as: _The `description` or `url` (or both) should have some substring that matches the filter string_. This `where` argument is used by Prisma to filter out those `Link` elements that don't adhere to the specified conditions. If no `filter` argument is provided, the `where` condition will be an empty object and work as it did previously. 


After this change, this is what the updated `feed` query should look like:

```graphql{2}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Query {
  feed(filter: String): [Link!]!
}
```

That's it for the filtering functionality! Go ahead and test your filter API - here's a sample query you can use:


```graphql
query {
  feed(filter: "nexus") {
    id
    description
    url
    postedBy {
      id
      name
    }
  }
}
```

You should see a result similar to the following: 

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "id": 1,
        "description": "Code-First GraphQL schemas for JavaScript/TypeScript",
        "url": "nexusjs.org",
        "postedBy": {
          "id": 1,
          "name": "alice"
        }
      }
    ]
  }
}
```

![Preview of filter feature](https://i.imgur.com/B52UtzC.png)


Try around with other filters. Note that if you provide a filter that doesn't match any of the links, you will receive an empty array. 


### Pagination

Pagination is a tricky topic in API design. On a high level, there are two major approaches for tackling it:

- **Limit-Offset**: Request a specific _chunk_ of the list by providing the indices of the items to be retrieved (in
  fact, you're mostly providing the start index (_offset_) as well as a count of items to be retrieved (_limit_)).
- **Cursor-based**: This pagination model is a bit more advanced. Every element in the list is associated with a unique
  ID (the _cursor_). Clients paginating through the list then provide the cursor of the starting element as well as a
  count of items to be retrieved.

Prisma supports both pagination approaches (read more in the
[docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/pagination)). In this tutorial, you're
going to implement limit-offset pagination.

> **Note**: You can read more about the ideas behind both pagination approaches
> [here](https://dev-blog.apollodata.com/understanding-pagination-rest-graphql-and-relay-b10f835549e7).

Limit and offset have different names in the Prisma API:

- The _limit_ is called `take`, meaning you're "taking" `x` elements after a provided start index.
- The _start index_ is called `skip`, since you're skipping that many elements in the list before collecting the items
  to be returned. If `skip` is not provided, it's `0` by default. The pagination then always starts from the beginning
  of the list.

So, go ahead and add the `skip` and `take` arguments to the `feed` query.

<Instruction>

Add two new arguments to the `feed` query defined in `src/graphql/Link.ts` and accordingly update the resolver: 

```typescript{10-11,24-25}(path="../hackernews-typescript/src/graphql/Link.ts")
import { extendType, idArg, nonNull, objectType, stringArg, intArg } from "nexus";

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            args: {
                filter: stringArg(),  
                skip: intArg(),   // 1
                take: intArg(),   // 1 
            },
            resolve(parent, args, context) {
                const where = args.filter  
                    ? {
                          OR: [
                              { description: { contains: args.filter } },
                              { url: { contains: args.filter } },
                          ],
                      }
                    : {};
                return context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,    // 2
                    take: args?.take as number | undefined,    // 2
                });
            },
        });
    },
});
```

</Instruction>

Let's dig deeper into the changes:

1. The `skip` and `take` arguments are both optional integers, representing the offset and limit, respectively. 
2. The Prisma Client API will take the `skip` and `take` arguments as additional options to the `findMany` query and return the `link` records accordingly. If either of the arguments is absent, we pass `undefined` to Prisma client. Prisma Client interprets any undefined value as _do nothing_. There is a type mismatch between the Nexus generated type (`number | undefined | null`) and the type expected by Prisma (`number | undefined`) for these two options. For this reason, typecasting is needed.

> **Note:** In JavaScript and TypeScript, `undefined` and `null` are often used interchangeably. However, Prisma makes a distinction between the two. In Prisma, `null` is a specific _value_ and `undefined` means _do nothing_ or ignore. More information is available in the [Prisma docs](https://www.prisma.io/docs/concepts/components/prisma-client/null-and-undefined). 


The updated feed query should look like this in your GraphQL schema:

```graphql{2}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Query {
  feed(filter: String, skip: Int, take: Int): [Link!]!
}
```

You can test the pagination API with the following query, which returns the second `Link` from the list:


```graphql
query {
  feed(take: 1, skip: 1) {
    id
    description
    url
  }
}
```

You should see a result like this:  

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "id": 2,
        "description": "Next-generation Node.js and TypeScript ORM",
        "url": "www.prisma.io"
      }
    ]
  }
}
```


### Sorting

With Prisma, it is possible to return lists of elements that are sorted (_ordered_) according to specific criteria. For
example, you can order the list of `Link`s alphabetically by their `url` or `description`. This can be done in both ascending (`asc`) and descending (`desc`) order. For the Hacker News API,
you'll leave it up to the client to decide how exactly it should be sorted and thus include all the ordering options
from the Prisma API in the API of your GraphQL server. You can do so by creating an
[`input`](https://graphql.org/graphql-js/mutations-and-input-types/) type and an enum to represent the ordering options. 


<Instruction>

Create a new input type and enum to define the ordering options for sorting: 

```typescript{1-16}(path="../hackernews-typescript/src/graphql/Link.ts")
import { extendType, nonNull, objectType, stringArg, intArg, inputObjectType, enumType, arg } from "nexus";

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});
```

</Instruction>


This will generate the following types in your GraphQL schema:

```graphql{1-10}(path="../hackernews-typescript/schema.graphql"&nocopy)
input LinkOrderByInput {
  createdAt: Sort
  description: Sort
  url: Sort
}

enum Sort {  
  asc 
  desc
}
```

`LinkOrderByInput` represents the criteria by which that the list of `Link` elements can be sorted. The `Sort` enum is used to define the sorting order. 

<Instruction>

Now, implement sorting in the `feed` query by adding a new `orderBy` argument and updating the resolver:

```typescript{1-2,13,28}(path="../hackernews-typescript/src/graphql/Link.ts")
import { extendType, nonNull, objectType, stringArg, intArg, inputObjectType, enumType, arg, list } from "nexus";
import { Prisma } from "@prisma/client"

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            args: {
                filter: stringArg(),
                skip: intArg(),   
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),  // 1
            },
            resolve(parent, args, context) {
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};
                return context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,    
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,  // 2
                });
            },
        });
    },
});

```
</Instruction>

There are two changes here:

1. The new `orderBy` argument is an array of input type `LinkOrderByInput`. In this argument, you can provide one or more sorting criteria (`createdAt`, `description` and `url`) and specify the sorting order (`asc` or `desc`) and the links in the feed will be ordered accordingly. In this scheme, it is possible to sort the feed by _multiple_ fields (eg: Sort by `url`, in case of match, sort of `createdAt`) by passing more than one instance of `LinkOrderByInput`. 

2. The `orderBy` option you're passing to Prisma works very similar to the previous `skip` and `take` options. Once again, typecasting is necessary to strip the `null` option from the Nexus generated type. 

It's time to give it a try. Here's a query that sorts the links by their creation date:


```graphql
query {
  feed(orderBy: [{ createdAt: desc }]) {
    id
    createdAt
    description
    url
  }
}
```

The result that you see should be similar to this: 

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "id": 3,
        "createdAt": "2021-12-15T04:20:33.616Z",
        "description": "Next-generation Node.js and TypeScript ORM",
        "url": "www.prisma.io"
      },
      {
        "id": 1,
        "createdAt": "2021-12-14T23:21:52.620Z",
        "description": "Code-First GraphQL schemas for JavaScript/TypeScript",
        "url": "nexusjs.org"
      }
    ]
  }
}
```

> **Suggestion:** At this point you should add a few more links and try sorting with multiple fields (eg: `orderBy: [{ url: asc }, { createdAt: desc }]` ). Also, experiment with different combinations of sorting, filtering and pagination together and see what the results look like. 

### Returning the total amount of `Link` elements

The last thing you're going to implement for your Hacker News API is the information _how many_ `Link` elements are
currently stored in the database. To do so, you're going to refactor the `feed` query a bit and create a new type to be
returned by your API: `Feed`.


<Instruction>

Create a new `Feed` type for your schema in `Link.ts`:

```typescript{1-7}(path="../hackernews-typescript/src/graphql/Link.ts")
export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }); // 1
        t.nonNull.int("count"); // 2
    },
});
```

The `Feed` type will be used as the return type of the `feed` query. Let's take a look at how it's defined:

1. `links` is an array of `Link` type objects. This is infact the current return type of the `feed` query.
2. `count` is an integer that will mention the number of `links` available in the database that match the `feed` query criteria. This is important to have as when using the `take` pagination argument, the number of `links` _returned_ might be different from the number of links _available_ in the database. 


</Instruction>

The newly generated `Feed` type looks like this in your GraphQL schema:

```graphql{1-4}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Feed {
  count: Int!
  links: [Link!]!
}
```

<Instruction>

Now, adjust the `feed` query signature and resolver: 

```typescript{4-5,12,21-35}(path="../hackernews-typescript/src/graphql/Link.ts")
export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {  // 1
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }), 
            },
            async resolve(parent, args, context) {  
                const where = args.filter
                    ? {
                          OR: [
                              { description: { contains: args.filter } },
                              { url: { contains: args.filter } },
                          ],
                      }
                    : {};

                const links = await context.prisma.link.findMany({  
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                const count = await context.prisma.link.count({ where });  // 2

                return {  // 3
                    links,
                    count,
                };
            },
        });
    },
});
```

</Instruction>

Let's see what has changed:

1. The return type of the `feed` query has been updated. It now returns a single non-nullable instance of the `Feed` type. 

2. Here, you are using the Prisma [`count` API](https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing#count) to return the number of records in the database that match the current filtering condition. The `skip`, `take` and `orderBy` options are not relevant when finding the count, so they have been omitted in this query. 

3. The object returned by the `resolve` function has been updated to match the signature of the `Feed` type. 

Let's try the updated `feed` query: 

```graphql
query {
  feed (take: 1) {
    count
    links {
      id
      createdAt
      description
    }
  }
}
```

You should see a return similar to the following: 

```json(nocopy)
{
  "data": {
    "feed": {
      "count": 2,
      "links": [
        {
          "id": 1,
          "createdAt": "2021-12-14T23:21:52.620Z",
          "description": "Code-First GraphQL schemas for JavaScript/TypeScript"
        }
      ]
    }
  }
}
```

Notice that the `count` does not match the number of links returned. This is because the `take` argument limits the number of links returned, but it does not affect the `count`, which mentions the number of links _available_ in the database. 



