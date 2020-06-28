---
title: Filtering, Pagination & Sorting
pageTitle: "GraphQL Filtering, Pagination & Sorting Tutorial with JavaScript"
description: "Learn how to add filtering and pagination capabilities to a GraphQL API with Node.js, Express & Prisma."
question: Which arguments are typically used to paginate through a list in the Prisma API using limit-offset pagination?
answers: ["skip & last", "skip & first", "first & last", "where & orderBy"]
correctAnswer: 1
---

This is an exciting section of the tutorial where you'll implement some key features of many robust APIs! The goal is to allow clients to constrain the list of `Link` elements returned by the `feed` query by providing filtering and pagination parameters.

Let's jump in! 🚀

### Filtering

By using PrismaClient, you'll be able to implement filtering capabilities to your API without too much effort. Similarly to the previous chapters, the heavy-lifting of query resolution will be performed by the powerful Prisma engine. All you need to do is forward incoming queries to it.

The first step is to think about the filters you want to expose through your API. In your case, the `feed` query in your API will accept a _filter string_. The query then should only return the `Link` elements where the `url` _or_ the `description` _contain_ that filter string.

<Instruction>

Go ahead and add the `filter` string to the `feed` query in your application schema:

```graphql{3}(path=".../hackernews-node/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String): [Link!]!
}
```

</Instruction>

Next, you need to update the implementation of the `feed` resolver to account for the new parameter clients can provide.

<Instruction>

Open `src/resolvers/Query.js` and update the `feed` resolver to look as follows:

```js{2-9}(path=".../hackernews-node/src/resolvers/Query.js")
async function feed(parent, args, context, info) {
  const where = args.filter
    ? {
        OR: [
          { description_contains: args.filter },
          { url_contains: args.filter },
        ],
      }
    : {}

  const links = await context.prisma.link.findMany({
    where,
  })

  return links
}
```

</Instruction>

If no `filter` string is provided, then the `where` object will be just an empty object and no filtering conditions will be applied by the Prisma engine when it returns the response for the `links` query.

In cases where there is a `filter` carried by the incoming `args`, you're constructing a `where` object that expresses our two filter conditions from above. This `where` argument is used by Prisma to filter out those `Link` elements that don't adhere to the specified conditions.

That's it for the filtering functionality! Go ahead and test your filter API - here's a sample query you can use:

```graphql
query {
  feed(filter:"QL") {
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

![](https://imgur.com/QlAXsKO.png)

### Pagination

Pagination is a tricky topic in API design. On a high-level, there are two major approaches for tackling it:

- **Limit-Offset**: Request a specific _chunk_ of the list by providing the indices of the items to be retrieved (in fact, you're mostly providing the start index (_offset_) as well as a count of items to be retrieved (_limit_)).
- **Cursor-based**: This pagination model is a bit more advanced. Every element in the list is associated with a unique ID (the _cursor_). Clients paginating through the list then provide the cursor of the starting element as well as a count of items to be retrieved.

Prisma supports both pagination approaches (read more in the [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/pagination)). In this tutorial, you're going to implement limit-offset pagination.

> **Note**: You can read more about the ideas behind both pagination approaches [here](https://dev-blog.apollodata.com/understanding-pagination-rest-graphql-and-relay-b10f835549e7).

Limit and offset have different names in the Prisma API:

// TODO (robin-macpherson): @nikolasburk it seems we still need to update this over in the `grraphql-js` project as well
- The _limit_ is called `take`, meaning you're "taking" x elements after a provided start index.
- The _start index_ is called `skip`, since you're skipping that many elements in the list before collecting the items to be returned. If `skip` is not provided, it's `0` by default. The pagination then always starts from the beginning of the list.

So, go ahead and add the `skip` and `take` arguments to the `feed` query.

<Instruction>

Open your application schema and adjust the `feed` query to accept `skip` and `take` arguments:

```graphql{3}(path=".../hackernews-node/src/schema.graphql)
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int): [Link!]!
}
```

</Instruction>

Now, on to the resolver implementation.

<Instruction>

In `src/resolvers/Query.js`, adjust the implementation of the `feed` resolver:

```js{11-12}(path=".../hackernews-node/src/resolvers/Query.js")
async function feed(parent, args, context, info) {
  const where = args.filter ? {
    OR: [
      { description_contains: args.filter },
      { url_contains: args.filter },
    ],
  } : {}

  const links = await context.prisma.links({
    where,
    skip: args.skip,
    take: args.take
  })
  return links
}
```

</Instruction>

Really all that's changing here is that the invocation of the `links` query now receives two additional arguments which might be carried by the incoming `args` object. Again, Prisma will take care of the rest.

You can test the pagination API with the following query which returns the second `Link` from the list:

```graphql
query {
  feed(
    take: 1
    skip: 1
  ) {
    id
    description
    url
  }
}
```

![](https://imgur.com/lwGncCX.png)

### Sorting

With Prisma, it is possible to return lists of elements that are sorted (_ordered_) according to specific criteria. For example, you can order the list of `Link`s alphabetically by their `url` or `description`. For the Hacker News API, you'll leave it up to the client to decide how exactly it should be sorted and thus include all the ordering options from the Prisma API in the API of your GraphQL server. You can do so by creating an enum that represents the ordering options.

<Instruction>

Add the following enum definition to `schema.graphql`:

```graphql(path=".../hackernews-node/src/schema.graphql")
enum LinkOrderByInput {
  description_ASC
  description_DESC
  url_ASC
  url_DESC
  createdAt_ASC
  createdAt_DESC
}
```

</Instruction>

It represents the various ways that the list of `Link` elements can be sorted.

<Instruction>

Now, adjust the `feed` query again to include the `orderBy` argument:

```graphql{3}(path=".../hackernews-node/src/schema.graphql")
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int, orderBy: LinkOrderByInput): [Link!]!
}
```

</Instruction>

The implementation of the resolver is similar to what you just did with the pagination API.

<Instruction>

Update the implementation of the `feed` resolver in `src/resolvers/Query.js` and pass the `orderBy` argument along to Prisma:

```js{13}(path=".../hackernews-node/src/resolvers/Query.js")
async function feed(parent, args, context, info) {
  const where = args.filter
    ? {
        OR: [
          { description_contains: args.filter },
          { url_contains: args.filter },
        ],
      }
    : {}

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  })
  return links
}
```

</Instruction>

Awesome! Here's a query that sorts the returned links by their creation dates:

```graphql
query {
  feed(orderBy: createdAt_ASC) {
    id
    description
    url
  }
}
```

### Returning the total amount of `Link` elements

The last thing you're going to implement for your Hacker News API is the information _how many_ `Link` elements are currently stored in the database. To do so, you're going to refactor the `feed` query a bit and create a new type to be returned by your API: `Feed`.

<Instruction>

Add the new `Feed` type to your GraphQL schema. Then also adjust the return type of the `feed` query accordingly:

```graphql{3,6-9}(path=".../hackernews-node/src/schema.graphql")
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int, orderBy: LinkOrderByInput): Feed!
}

type Feed {
  links: [Link!]!
  count: Int!
}
```

</Instruction>

<Instruction>

Now, go ahead and adjust the `feed` resolver again:

```js{17-26}(path=".../hackernews-node/src/resolvers/Query.js")
async function feed(parent, args, context) {
  const where = args.filter
    ? {
        OR: [
          { description_contains: args.filter },
          { url_contains: args.filter },
        ],
      }
    : {}

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    first: args.first,
    orderBy: args.orderBy,
  })

  const count = await context.prisma.link.count({ where })
  return {
    links,
    count,
  }
}
```

</Instruction>

1. You're first using the provided filtering, ordering, and pagination arguments to retrieve a number of `Link` elements.
// TODO (robin-macpherson): get the updated Prisma Client Query.
1. Next, you're using the `linksConnection` query from the Prisma Client API to retrieve the total number of `Link` elements currently stored in the database.
1. The `links` and `count` are then wrapped in an object to adhere to the `Feed` type that you just added to the GraphQL schema.

The last step is to include that new resolver when instantiating the `GraphQLServer`.

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

![](https://imgur.com/pybtMep.png)
