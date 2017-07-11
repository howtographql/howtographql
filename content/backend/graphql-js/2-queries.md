---
title: Queries
question: What's the quickest way to test GraphQL apis?
answers: ["Building GraphQL requests with CURL", "Using playgrounds like GraphiQL", "Using Postman or similar app for sending HTTP requests", "Building a frontend client app that sends requests"]
correctAnswer: 1
description: Learn how to use resolvers by building the query for fetching all links, and then test it using GraphiQL
---

### Query field for returning links

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
const resolvers = require('./resolvers');

// ...

module.exports = makeExecutableSchema({typeDefs, resolvers});
```

</Instruction>

### Testing with playground

It's time to test what you've done so far! For this you'll use [GraphiQL](https://github.com/graphql/graphiql), as was said before.

It's super easy to setup. You're going to use the same `graphql-server-express` package for this.

<Instruction>

Just add these lines to `src/index.js`:

```js(path=".../hackernews-graphql-js/src/index.js")
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

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
