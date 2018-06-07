---
title: A Simple Query
pageTitle: "Resolving Queries with a GraphQL Server Tutorial"
description: "Learn how to define a GraphQL schema, implement query resolvers with Node.js and test your queries in a GraphQL Playground."
question: How are GraphQL queries resolved?
answers: ["With schema-driven development", "By invoking all available resolver functions", "By invoking the resolver function of the root field", "By invoking the resolver functions for the fields contained in the query"]
correctAnswer: 3
---

In this section, you are going to implement the first API operation that provides the functionality for a Hacker News clone: Querying a feed of _links_ that were posted by other users.

### Extending the schema definition

Let's start by implementing a `feed` query which allows you to retrieve a list of `Link` elements. In general, when adding a new feature to the API, the process will look pretty similar every time:

1. Extend the GraphQL schema definition with a new _root field_ (and new _data types_, if needed)
1. Implement corresponding _resolver functions_ for the added fields

This process is also referred to as _schema-driven_ or _schema-first development_.

So, let's go ahead and tackle the first step, extending the GraphQL schema definition.

<Instruction>

In `index.js`, update the `typeDefs` constant to look as follows:

```js{4,7-11}(path="../hackernews-node/src/index.js")
const typeDefs = `
type Query {
  info: String!
  feed: [Link!]!
}

type Link {
  id: ID!
  description: String!
  url: String!
}
`
```

</Instruction>

Pretty straightforward. You're defining a new `Link` type that represents the links that can be posted to Hacker News. Each `Link` has an `id`, a `description` and `url`. You're then adding another root field to the `Query` type that allows you to retrieve a list of `Link` elements. This list is guaranteed to never be `null` (if anything, it will be empty) and never contain any elements that are `null` - that's what the two exclamation marks are for.

### Implement resolver functions

The next step is to implement the resolver function for the `feed` query. In fact, one thing we haven't mentioned yet is that not only _root fields_, but virtually _all_ fields on the types in a GraphQL schema have resolver functions. So, you'll add resolvers for the `id`, `description` and `url` fields of the `Link` type as well.

<Instruction>

In `index.js`, add a new list with dummy data as well and update the `resolvers` to look as follows:

```js{2-6,12,15-19}(path="../hackernews-node/src/index.js")
// 1
let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    // 2
    feed: () => links,
  },
  // 3
  Link: {
    id: (root) => root.id,
    description: (root) => root.description,
    url: (root) => root.url,
  }
}
```

</Instruction>

Let's walk through the numbered comments again:

1. The `links` variable is used to store the links at runtime. For now, everything is stored only _in-memory_ rather than being persisted in a database.
1. You're adding a new resolver for the `feed` root field. Notice that a resolver always has to be named after the corresponding field from the schema definition.
1. Finally, you're adding three more resolvers for the fields on the `Link` type from the schema definition. We'll discuss in a bit what the `root` argument is that's passed into the resolver here.

Go ahead and test the implementation by restarting the server (first use **CTRL+C** to stop the server if it is still running, then execute `node src/index.js` again) and navigate to `http://localhost:4000` in your browser. If you expand the documentation of the Playground, you'll notice that another query called `feed` is now available:

![](https://imgur.com/0EQ5P9p.png)

Try it out by sending the following query:

```graphql
query {
  feed {
    id
    url
    description
  }
}
```

Awesome, the server responds with the data you defined in `links`:

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "id": "link-0",
        "url": "www.howtographql.com",
        "description": "Fullstack tutorial for GraphQL"
      }
    ]
  }
}
```

Feel free to play around with the query by removing any fields from the selection set and observe the responses sent by the server.

### The query resolution process

Let's now quickly talk about how a GraphQL server actually resolves incoming queries. As you already saw, a GraphQL query consists of a number of _fields_ that have their source in the type definitions of the GraphQL schema.

Consider again the query from above:

```graphql(nocopy)
query {
  feed {
    id
    url
    description
  }
}
```

All four fields specified in the query, `feed`, `id`, `url` and `description` can also be found inside the schema definition. Now, you also learned that _every_ field inside the schema definition is backed by one resolver function whose responsibility it is to return the data for precisely that field.

Can you imagine what the query resolution process now looks like? Effectively, everything the GraphQL server has to do is invoke all resolver functions for the fields that are contained in the query and then package up the response according to the query's shape. Query resolution thus merely becomes a process of orchestrating the invokation of resolver functions!

One thing that's still a bit weird in the implementation right now are the resolvers for the `Link` type that all seem to follow a very simple and trivial pattern:

```js(nocopy)
Link: {
  id: (root) => root.id,
  description: (root) => root.description,
  url: (root) => root.url,
}
```

First, it's important to note that every GraphQL resolver function actually receives _four_ input arguments. As the remaining three are not needed in our scenario right now, we're simply omitting them. Don't worry, you'll get to know them soon.

The first argument, commonly called `root` (or `parent`) is the result of the previous _resolver execution level_. But what does that mean? 🤔

Well, as you already saw, GraphQL queries can be _nested_. Each level of nesting (i.e. nested curly braces) corresponds to one resolver execution level. The above query therefore has two of these execution levels.

On the first level, it invokes the `feed` resolver and returns the entire data stored in `links`. For the second execution level, the GraphQL server is smart enough to invoke the resolvers of the `Link` type (because thanks to the schema, it knows that `feed` returns a list of `Link` elements) for each element inside the list that was returned on the previous resolver level. Therefore, in every of the three `Link` resolvers, the incoming `root` object is the element inside the `links` list.

> **Note**: To learn more about this, check out [this](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e#9d03) article.

In any case, because the implementation of the `Link` resolvers is trivial, you can actually omit them and the server will work in the same way as it did before 👌
