---
title: Filtering, Pagination & Sorting
pageTitle: 'GraphQL Filtering, Pagination & Sorting Tutorial with JavaScript'
description: 'Learn how to add filtering and pagination capabilities to a GraphQL API with Node.js, Fastify & Prisma.'
question: 'What style of pagination comes out of the box in GraphQL'
answers: ["Offset-based pagination", "Cursor-based pagination", "Key-Set based pagination","None, you implement the style which fits your needs"]
correctAnswer: 3
---

This is an exciting section of the tutorial where you'll implement some key features of many robust APIs! The goal is to
allow clients to constrain the list of `Link` elements returned by the `feed` query by providing filtering and
pagination parameters.

Let's jump in! 🚀

### Filtering

By using `PrismaClient`, you'll be able to implement filtering capabilities to your API without too much effort.
Similarly to the previous chapters, the heavy-lifting of query resolution will be performed by Prisma. All you need to
do is forward incoming queries to it.

The first step is to think about the filters you want to expose through your API. In your case, the `feed` query in your
API will accept a _filter string_. The query then should only return the `Link` elements where the `url` _or_ the
`description` _contain_ that filter string.

<Instruction>

Go ahead and add the `filter` string to the `feed` query in your application schema (under `src/schema.graphql`):

```graphql{3}(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String): [Link!]!
  me: User!
}
```

</Instruction>

Next, you need to update the implementation of the `feed` resolver to account for the new parameter clients can provide.

<Instruction>

Now, update the `feed` resolver to look as follows:

```typescript{5-20}(path="hackernews-node-ts/src/schema.ts)
const resolvers = {
  // ... other resolvers ...
  Query: {
    // ... other resolvers ...
    feed: async (
      parent: unknown,
      args: { filter?: string },
      context: GraphQLContext
    ) => {
      const where = args.filter
        ? {
            OR: [
              { description: { contains: args.filter } },
              { url: { contains: args.filter } },
            ],
          }
        : {};

      return context.prisma.link.findMany({ where });
    },
  }
}
```

</Instruction>

If no `filter` string is provided, then the `where` object will be just an empty object and no filtering conditions will
be applied by Prisma Client when it returns the response for the `links` query.

In cases where there is a `filter` carried by the incoming `args`, you're constructing a `where` object that expresses
our two filter conditions from above. This `where` argument is used by Prisma to filter out those `Link` elements that
don't adhere to the specified conditions.

That's it for the filtering functionality! Go ahead and test your filter API - here's a sample query you can use:

```graphql
query {
  feed(filter: "QL") {
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

![sample query](https://i.imgur.com/tICYe2e.png)

### Pagination

Pagination is a tricky topic in API design. On a high-level, there are two major approaches for tackling it:

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

Open your application schema and adjust the `feed` query to accept `skip` and `take` arguments:

```graphql{3}(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int): [Link!]!
  me: User!
}
```

</Instruction>

Now, adjust the resolver implementation:

<Instruction>

And now adjust the implementation of the `feed` resolver:

```typescript{7,19-24}(path="hackernews-node-ts/src/schema.ts)
const resolvers = {
  // ... other resolvers ...
  Query: {
    // ... other resolvers ...
    feed: async (
      parent: unknown,
      args: { filter?: string; skip?: number; take?: number },
      context: GraphQLContext
    ) => {
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
        skip: args.skip,
        take: args.take,
      });
    },
  }
}
```

</Instruction>

Really all that's changing here is that the invocation of the `links` query now receives two additional arguments which
might be carried by the incoming `args` object. Again, Prisma will take care of the rest.

You can test the pagination API with the following query which returns the second `Link` from the list:

```graphql
query {
  feed(take: 1, skip: 1) {
    id
    description
    url
  }
}
```

![test the pagination API ](https://i.imgur.com/XeZgSJo.png)

### Sorting

With Prisma, it is possible to return lists of elements that are sorted (_ordered_) according to specific criteria. For
example, you can order the list of `Link`s alphabetically by their `url` or `description`. For the Hacker News API,
you'll leave it up to the client to decide how exactly it should be sorted and thus include all the ordering options
from the Prisma API in the API of your GraphQL server. You can do so by creating an
[`input`](https://graphql.org/graphql-js/mutations-and-input-types/) type and an enum to represent the ordering options.

<Instruction>

Add the following enum definition to your GraphQL schema:

```graphql(path="hackernews-node-ts/src/schema.graphql)
input LinkOrderByInput {
  description: Sort
  url: Sort
  createdAt: Sort
}

enum Sort {
  asc
  desc
}
```

</Instruction>

This represents the various ways that the list of `Link` elements can be sorted (asc = ascending, desc = descending).

<Instruction>

Now, adjust the `feed` query again to include the `orderBy` argument:

```graphql(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int, orderBy: LinkOrderByInput): [Link!]!
  me: User!
}
```

</Instruction>

The implementation of the resolver is similar to what you just did with the pagination API.

<Instruction>

Update the implementation of the `feed` resolver, change the imports and pass the `orderBy` argument along to Prisma:

```typescript{1,13-17,34}(path="hackernews-node-ts/src/schema.ts)
import { Link, User, Prisma } from "@prisma/client";

const resolvers = {
  // ... other resolvers ...
  Query: {
    // ... other resolvers ...
    feed: async (
      parent: unknown,
      args: {
        filter?: string;
        skip?: number;
        take?: number;
        orderBy?: {
          description?: Prisma.SortOrder;
          url?: Prisma.SortOrder;
          createdAt?: Prisma.SortOrder;
        };
      },
      context: GraphQLContext
    ) => {
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
        skip: args.skip,
        take: args.take,
        orderBy: args.orderBy,
      });
    },
  }
}
```

</Instruction>

Awesome! Here's a query that sorts the returned links by their creation dates:

```graphql
query {
  feed(orderBy: { createdAt: asc }) {
    id
    description
    url
  }
}
```

### Returning the total amount of `Link` elements

The last thing you're going to implement for your Hacker News API is the information _how many_ `Link` elements are
currently stored in the database. To do so, you're going to refactor the `feed` query a bit and create a new type to be
returned by your API: `Feed`.

<Instruction>

Add the new `Feed` type to your GraphQL schema. Then also adjust the return type of the `feed` query accordingly:

```graphql{3,7-10}(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int, orderBy: LinkOrderByInput): Feed!
  me: User!
}

type Feed {
  links: [Link!]!
  count: Int!
}
```

</Instruction>

<Instruction>

Now, go ahead and adjust the `feed` resolver again:

```typescript{1,21-42}(path="hackernews-node-ts/src/schema.ts)
import { Link, User, Prisma } from "@prisma/client";

const resolvers = {
  // ... other resolvers ...
  Query: {
    // ... other resolvers ...
    feed: async (
      parent: unknown,
      args: {
        filter?: string;
        skip?: number;
        take?: number;
        orderBy?: {
          description?: Prisma.SortOrder;
          url?: Prisma.SortOrder;
          createdAt?: Prisma.SortOrder;
        };
      },
      context: GraphQLContext
    ) => {
      const where = args.filter
        ? {
            OR: [
              { description: { contains: args.filter } },
              { url: { contains: args.filter } },
            ],
          }
        : {};

      const totalCount = await context.prisma.link.count({ where });
      const links = await context.prisma.link.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: args.orderBy,
      });

      return {
        count: totalCount,
        links,
      };
    },
  }
}
```

</Instruction>

You can now test the revamped `feed` query as follows:

```graphql
query {
  feed {
    count
    links {
      id
      description
      url
    }
  }
}
```

![test the revamped feed query](https://i.imgur.com/cG95KH0.png)
