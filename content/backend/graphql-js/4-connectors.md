---
title: Connectors
description: Learn to connect your resolvers with MongoDB
---

### Set up MongoDB

You surely can't keep using an array to store the data forever. For a more long-term approach you'll probably want to have some kind of database to handle this. In this tutorial you'll be using [MongoDB](https://www.mongodb.com/) but, just like with the other parts of the stack being used here, keep in mind that you can replace it with anything else you prefer.


> These pieces of code that access some service inside GraphQL requests are commonly referred to as **[Connectors](https://github.com/apollographql/graphql-tools/blob/master/designs/connectors.md#what-is-a-connector)**.

First you'll need to get MongoDB up and running.

<Instruction>

**Step 1**: Install and run MongoDB, if you haven't already. You can find instructions on how to do this [here](https://docs.mongodb.com/master/administration/install-community/).

</Instruction>

<Instruction>

**Step 2**: Install MongoDB's driver for NodeJS, via the command `npm i --save mongodb`.

</Instruction>

### Connecting MongoDB

Now you can actually connect to MongoDB in the code and start using it.

<Instruction>

Create a file at `src/mongo-connector.js` like this:

```js(path=".../hackernews-graphql-js/src/mongo-connector.js")
const {MongoClient} = require('mongodb');

// 1
const MONGO_URL = 'mongodb://localhost:27017/hackernews';

// 2
module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  return {Links: db.collection('links')};
}
```

</Instruction>

This piece of code is doing the following things:

1. First, specify the url for connecting to the desired MongoDB instance. This is the default url usually available, but feel free to replace it with your own if different.
2. Then, export a function that connects to the db and returns the collections your resolvers will use (just `Links` for now). Since connecting is an asynchronous operation, the function needs to be annotated with the `async` keyword.

With the connector ready, you need to pass it down to your resolvers somehow.

<Instruction>

Go back to the main `src/index.js` file and change it to be like this:

```js{6-30}(path=".../hackernews-graphql-js/src/index.js")
const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
const schema = require('./schema');

// 1
const connectMongo = require('./mongo-connector');

// 2
const start = async () => {
  // 3
  const mongo = await connectMongo();
  var app = express();
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    context: {mongo}, // 4
    schema
  }));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

// 5
start();
```

</Instruction>

Let's go over the changes here, step by step:

1. Import the function you've just created.
2. Wrap the whole app setup code with an async function. That's just so you can use **[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)** syntax, now that there's an asynchronous step. You could use [promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) syntax instead as well.
3. Call the MongoDB connect function and wait for it to finish.
4. Put the MongoDB collections into the `context` object. This is a special GraphQ object that gets passed to all resolvers, so it's the perfect place to share code (such as connectors like this) between them.
5. Run the `start` function

<Instruction>

All that's left now is to replace that array logic in the resolvers with calls to MongoDB:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
module.exports = {
  Query: {
    allLinks: async (root, data, {mongo: {Links}}) => { // 1
      return await Links.find({}).toArray(); // 2
    },
  },

  Mutation: {
    createLink: async (root, data, {mongo: {Links}}) => {
      const response = await Links.insert(data); // 3
      return Object.assign({id: response.insertedIds[0]}, data); // 4
    },
  },

  Link: {
    id: root => root._id || root.id, // 5
  },
};
```

</Instruction>

Going step by step once more:

1. The **context** object you've specified in that call to `graphqlExpress` is the third argument passed down to each resolver.
2. For the `allLinks` query all you need is to call MongoDB's `find` function in the `Links` collection, and then turn the results into an array.
3. For the `createLink` mutation you save the data via `Links.insert.`
4. Still inside `createLink`, use `insertedIds` from MongoDB to return the final `Link` object from the resolver.
5. MongoDB will automatically generate ids for you, which is great! Unfortunately, it calls them `_id`, while your schema calls them `id`. You could change the schema to use `_id` as well instead, but this is the perfect opportunity to talk about other kinds of resolvers. As you can see, you can have resolvers for any GraphQL type in your schema, it doesn't have to be just for `Query` and `Mutation`. In this case, you've created one for the `id` field in the `Link` type. The server will now trigger that function whenever this field is requested, so you can have it grab `_id` instead there. The first argument in a resolver (called `root`) is an object with the current data for that type. It should be null for `Query` and `Mutation`, but for other types it will already have whatever your other resolvers have returned for them.

Try restarting the server again and adding some new links in GraphiQL via `createLink`, and then retrieving them with `allLinks`. It should be working as before, except that now the data will still be there whenever you restart the server again.
