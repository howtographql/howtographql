---
title: Queries
pageTitle: "Resolving Queries with a Javascript GraphQL Server Tutorial"
description: "Learn how to define the GraphQL schema using graphql-js, implement query resolvers with Javascript & Node.js and test your queries in a GraphiQL Playground."
question: What's the quickest way to test GraphQL apis?
answers: ["Building GraphQL requests with CURL", "Using playgrounds like GraphiQL", "Using Postman or similar app for sending HTTP requests", "Building a frontend client app that sends requests"]
correctAnswer: 1
---

In this section, you'll learn how

### Define a `Link` type for your data model

In this section, you'll remove the default `Post` type that was generated for you by `graphql create` and replace it with the `Link` type we already mentioned above.

Every link to be stored in the database should have a unique _id_, a _description_ and a _URL_ (just like in the real Hackernews app). Here is how you can translate that into SDL.

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
graphcool deploy
```

</Instruction>

The Graphcool API now exposes queries and mutations to create, read, update and delete elements of type `Link`. Here's a slightly simplified version of the generated operations (if you want to see what's actually generated, you can check the Graphcool schema in `src/generated/graphcool.graphql`):

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

### Implement the `feed` resolver

Every field on your `Query` and `Mutation` types will be backed by a resolver function responsible to fetch the corresponding data. The first resolver you'll implement is the one for the `feed` query.

In terms of code organization, the resolvers for your queries, mutations and subscriptions will be written in dedicated files called `Query.js` and `Mutation.js` and `Subscription.js`. They'll then be referenced in `index.js` to instantiate your `GraphQLServer`.

<Instruction>

Create a new directory in `src` called `resolvers`. Then create a new file called `Query.js` in that new directory. Paste the following code into that file:

```js(path=".../hackernews-node/src/resolvers/Query.js)
function feed(parent, args, ctx, info) {
  const { search, first, skip } = args // destructure input arguments
  const where = search
    ? { OR: [{ url_contains: search }, { description_contains: search }] }
    : {}

  return ctx.db.query.links({ first, skip, where }, info)
}

module.exports = {
  feed,
}
```

</Instruction>

There are couple of things to note about this implementation:

- The name of the resolver function `feed` is identical to the name of the field on the `Query` type
- The resolver receives 4 input arguments:
  - `parent`: Contains an initial value for the resolver chain (you don't have to understand in detail what it's used for in this tutorial; if you're curios though, you can check [this](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e#9d03) article).
  - `args`: This object contains the input arguments for the query that are defined in the application schema. In your case that's `search`, `first` and `skip` for filtering and pagination.
  - `ctx`: The context (short: `ctx`) is an object that can hold custom data that's passed through the resolver chain, i.e. every resolver can read from and write to it.
  - `info`: Contains the [abstract syntax tree](https://medium.com/@cjoudrey/life-of-a-graphql-query-lexing-parsing-ca7c5045fad8) (AST) of the query and information about _where_ the execution in the resolver chain currently is.
- The `search` argument is used to build a filter object (called `where`) to retrieve link elements where the `description` or the `url` contains that `search` string.

<!--

<Instruction>

First, add the query definition for `allLinks` to the schema inside `src/schema/index.js.` 

```js(path=".../hackernews-graphql-js/src/schema/index.js")
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
  }

  type Query {
    allLinks: [Link!]!
  }
`;
```

</Instruction>

No need to add any arguments right now, we'll do that once we start handling filtering and pagination.

### Query resolver

The query is now defined, but the server still doesn't know how to handle it. To do that you will now write your first **resolver**. Resolvers are just functions mapped to GraphQL fields, with their actual behavior.

<Instruction>

Start by creating a simple resolver that returns the fixed contents of a local array. Put the resolvers in a separate file, `src/schema/resolvers.js`, since they will grow as more fields are added:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
const links = [
  {
    id: 1,
    url: 'http://graphql.org/',
    description: 'The Best Query Language'
  },
  {
    id: 2,
    url: 'http://dev.apollodata.com',
    description: 'Awesome GraphQL Client'
  },
];

module.exports = {
  Query: {
    allLinks: () => links,
  },
};
```

</Instruction>

<Instruction>

Now you just have to pass these resolvers when building the schema object with `makeExecutableSchema`:

```js(path=".../hackernews-graphql-js/src/schema/index.js")
const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// ...

module.exports = makeExecutableSchema({typeDefs, resolvers});
```

</Instruction>

### Testing with playground

It's time to test what you've done so far! For this you'll use [GraphiQL](https://github.com/graphql/graphiql), as was said before.

It's super easy to setup. You're going to use the same `apollo-server-express` package for this.

<Instruction>

Just add these lines to `src/index.js`:

```js(path=".../hackernews-graphql-js/src/index.js")
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

// ...

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));
```

</Instruction>

<Instruction>

That's it! Now restart the server again with `node ./src/index.js` and open your browser at [localhost:3000/graphiql](http://localhost:3000/graphiql). You'll see a nice IDE that looks like this:

![](http://i.imgur.com/0s8NcWR.png)

</Instruction>

<Instruction>

Click on the **Docs** link at the upper right to see a generated documentation of your schema. You'll see the `Query` type there, and clicking it will show you the new `allLinks` field, exactly as you've defined it.

![](http://i.imgur.com/xTTcAZl.png)

</Instruction>

<Instruction>

Try it out! On the left-most text box, type a simple query for listing all links and hit the **Play** button. This is what you'll see:

![](http://i.imgur.com/LuALGY6.png)

</Instruction>

You can play around as much as you want with this tool. It makes testing GraphQL APIs so fun and easy, you'll never want to live without it again.
 -->

