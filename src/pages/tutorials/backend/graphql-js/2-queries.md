---
title: Queries
---

### Query field for returning links

First, add the query definition for `allLinks` to the schema inside `src/schema/index.js.` No need to add arguments right now, we'll do that once we start handling filtering and pagination.

```
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

### Query resolver

The query is now defined, but the server still doesn't know how to handle it. To do that you will now write your first **resolver**. Resolvers are just functions mapped to GraphQL fields, with their actual behavior.

Start by creating a simple resolver that returns the fixed contents of a local array. Put the resolvers in a separate file, `src/schema/resolvers.js`, since they will grow as more fields are added:

```
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

Now you just have to pass these resolvers when building the schema object with `makeExecutableSchema`:

```
const resolvers = require('./resolvers');

// ...

module.exports = makeExecutableSchema({typeDefs, resolvers});
```

### Testing with playground

It's time to test what you've done so far! For this you'll use [GraphiQL](https://github.com/graphql/graphiql), as was said before.

It's super easy to setup. You're going to use the same `graphql-server-express` package for this. Just add these lines to `src/index.js`:

```
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

// ...

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));
```

That's it! Now restart the server again with `node ./src/index.js` and open your browser at [localhost:3000/graphiql](http://localhost:3000/graphiql). You'll see a nice IDE that looks like this:
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/F7_kfgj4Lu7X-F9WrFND4Q]Click on the **Docs** link at the upper right to see a generated documentation of your schema. You'll see the `Query` type there, and clicking it will show you the new `allLinks` field, exactly as you've defined it.
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/azRDn3RmqApUF4qLqt5XOQ]Try it out! On the left-most text box, type a simple query for listing all links and hit the **Play** button. This is what you'll see:
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/BzZBNEH7JCrFGAmQlPTV6A]You can play around as much as you want with this tool. It makes testing GraphQL APIs so fun and easy, you'll never want to live without it again.
