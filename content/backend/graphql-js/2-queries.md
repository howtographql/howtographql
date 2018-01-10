---
title: Queries
pageTitle: "Resolving Queries with a JavaScript GraphQL Server Tutorial"
description: "Learn how to define the GraphQL schema, implement query resolvers with JavaScript & Node.js and test your queries in a GraphQL Playground."
question: What's the quickest way to test GraphQL APIs?
answers: ["Building GraphQL requests with CURL", "Using GraphQL Playground", "Using Postman or similar app for sending HTTP requests", "Building a frontend client app that sends requests"]
correctAnswer: 1
---

In this section, you'll learn how to implement the resolver for the `feed` query so your clients are able to retrieve a list of links from your server.

### Define a `Link` type for your data model

The first thing to do is remove the default `Post` type that was generated for you by `graphql create` and replace it with the `Link` type we already mentioned before.

Every link to be stored in the database should have a unique _id_, a _description_ and a _URL_ (just like the real Hackernews app). Here is how you can translate that requirement into SDL.

<Instruction>

Open your data model (defined in `database/datamodel.graphql`) and replace its current contents with the following type definition:

```graphql(path=".../hackernews-node/database/datamodel.graphql")
type Link {
  id: ID! @unique
  description: String!
  url: String!
}
```

</Instruction>

### Deploy the database to apply changes

With the `Link` type in place, you can go ahead and deploy your Graphcool database service.

<Instruction>

In your terminal, navigate to the root directory of your project and run the following command:

```bash(path=".../hackernews-node/")
yarn graphcool deploy
```

</Instruction>

> Notice that you don't have to explicitly install the Graphcool CLI as it's listed as a _development dependency_ in your `package.json`.

The Graphcool API now exposes queries and mutations to create, read, update and delete elements of type `Link`. Here's a slightly simplified version of the generated operations (if you want to see _everything_ that's generated, you can check the Graphcool schema in `src/generated/graphcool.graphql`):

```graphql(path=".../hackernews-node/src/generated/graphcool.graphql&nocopy)
type Query {
  links(where: LinkWhereInput, orderBy: LinkOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Link]!
  link(where: LinkWhereUniqueInput!): Link
}

type Mutation {
  createLink(data: LinkCreateInput!): Link!
  updateLink(data: LinkUpdateInput!, where: LinkWhereUniqueInput!): Link
  deleteLink(where: LinkWhereUniqueInput!): Link
  updateManyLinks(data: LinkUpdateInput!, where: LinkWhereInput!): BatchPayload!
  deleteManyLinks(where: LinkWhereInput!): BatchPayload!
}
```

The `links` and `link` queries allow to retrieve a list of links as well a single link. The different mutations allow to create, update and delete links.

### Adjust the application schema

At this point, your Graphcool database service already allows to perform CRUD operations for the `Link` type. You can test this inside a GraphQL Playground if you like.

The next step for you is now to update the application schema and define the `feed` query there.

<Instruction>

Open the application schema in `src/schema.graphql` and replace its contents with the following:

```graphql(path=".../hackernews-node/src/schema.graphql)
# import Link from "./generated/graphcool.graphql"

type Query {
  feed(filter: String, skip: Int, first: Int): [Link!]!
}
```

</Instruction>

Notice that you're _importing_ the `Link` type from the generated Graphcool schema rather than copying it over or entirely redefining it here. The import syntax is enabled by the [`graphql-import`](https://github.com/graphcool/graphql-import) package.

### Implement the `feed` resolver

Every field on your `Query` and `Mutation` types will be backed by a resolver function which is responsible for fetching the corresponding data. The first resolver you'll implement is the one for `feed`.

In terms of code organization, the resolvers for your queries, mutations and subscriptions will be written in dedicated files called `Query.js` and `Mutation.js` and `Subscription.js`. They'll then be referenced in `index.js` to instantiate your `GraphQLServer`.

<Instruction>

Create a new directory in `src` called `resolvers`. Then create a new file called `Query.js` in that directory. Paste the following code into `src/resolvers/Query.js`:

```js(path=".../hackernews-node/src/resolvers/Query.js)
function feed(parent, args, context, info) {
  const { filter, first, skip } = args // destructure input arguments
  const where = filter
    ? { OR: [{ url_contains: filter }, { description_contains: filter }] }
    : {}

  return context.db.query.links({ first, skip, where }, info)
}

module.exports = {
  feed,
}
```

</Instruction>

There are a couple of things to note about this implementation:

- The name of the resolver function `feed` is identical to the name of the field on the `Query` type. This is a requirement from `graphql-js` and `graphql-tools` which are used by `graphql-yoga`.
- The resolver receives four input arguments:
  1. `parent`: Contains an initial value for the resolver chain (you don't have to understand in detail what it's used for in this tutorial; if you're curios though, you can check [this](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e#9d03) article).
  1. `args`: This object contains the input arguments for the query. These are defined in the application schema. In your case that's ``, `first` and `skip` for filtering and pagination.
  1. `context`: The `context` is an object that can hold custom data that's passed through the resolver chain, i.e. every resolver can read from and write to it.
  1. `info`: Contains the [abstract syntax tree](https://medium.com/@cjoudrey/life-of-a-graphql-query-lexing-parsing-ca7c5045fad8) (AST) of the query and information about _where_ the execution in the resolver chain currently is.
- The `filter` argument is used to build a filter object (called `where`) to retrieve link elements where the `description` or the `url` contains that `filter` string.
- Finally, the resolver simply delegates the execution of the incoming query to the `links` resolver from the Graphcool API and returns the result of that execution.

Notice that in the line `context.db.query.links({ first, skip, where }, info)`, you're accessing the `Graphcool` instance which you previously attached to the `context` object when instantiating the `GraphQLServer`.

To finalize the implementation, you need to make sure the `feed` resolver you just implemented is used when your `GraphQLServer` is instantiated.

<Instruction>

Open `index.js` and replace the definition of the `resolvers` object with the following:

```js(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
}
```

</Instruction>

For this to work, you of course need to import the `Query` object.

<Instruction>

Add the following import statement to the top of `index.js`:

```js(path=".../hackernews-node/src/index.js")
const Query = require('./resolvers/Query')
```

</Instruction>

### Test the API

You can now go ahead and test the `feed` query. Before you do so, you should store some dummy data in the database.

<Instruction>

In the root directory of your project, run the following command to start the server:

```bash(path=".../hackernews-node/)
yarn start
```

</Instruction>

The server is now running on [`http://localhost:4000`](http://localhost:4000).

<Instruction>

Open a browser window and add navigate to [`http://localhost:4000`](http://localhost:4000).

</Instruction>

You now opened a GraphQL Playground which allows you to interact with two GraphQL APIs:

- `app`: This is the API defined by your application schema, at the moment it only exposes the `feed` query.
- `database`: This is the Graphcool API exposing all the CRUD operations for the `Link` type.

![](https://imgur.com/vZ6fJVv.png)

To create some initial data, you need to send a `createLink` mutation to the Graphcool API.

<Instruction>

In the left side-menu, select the `dev` Playground in the `database` section. Then add the following mutation to it and click the **Play**-button:

```graphql
mutation {
  createLink(data: {
    url: "https://www.graph.cool",
    description: "A GraphQL Database"
  }) {
    id
  }
}
```

</Instruction>

Awesome, you just created your first `Link` instance in the database 🎉  You can either retrieve it using the `links` query from the Graphcool API. In that case, you can simply use the same `dev` Playground in the `database` section again.

However, you can now also retrieve this new `Link` with the `feed` query from your application schema.

<Instruction>

Switch to the `default` Playground in the `app` section from the left side-menu and send the following query:

```graphql
{
  feed {
    description
    url
  }
}
```

</Instruction>

The server should return the following response:

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "description": "A GraphQL Database",
        "url": "https://www.graph.cool"
      }
    ]
  }
}
```

Notice that you can also provide the `filter`, `first` and `skip` arguments to the `feed` query. For example, you can try to retrieve only those links that contain the string "cool" in their `url` _or_ their `description`:

```graphql
{
  feed(filter: "cool") {
    description
    url
  }
}
```