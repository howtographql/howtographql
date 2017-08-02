---
title: Using dataloaders
pageTitle: "GraphQL Dataloader with Node.js & MongoDB Tutorial"
description: "Learn how to use dataloader with your GraphQL server for caching and batching to reduce the number of requests to services like MongoDB."
question: What are data loaders useful for?
answers: ["Improving the resolver code's readability", "Catching and handling errors", "Reducing the number of data requests", "Making data fetch calls consistent"]
correctAnswer: 2
---

### Overfetching problem

It's time to start talking a bit about performance. You may have noticed that your server now has multiple resolvers that do data fetching with MongoDB. What happens if you make a query for 10 links, including the users that posted and voted on each of them? This data will all be fetched as expected, but due to the decentralized way in which the resolvers work, you may find that your server is doing multiple requests for the same data!

<Instruction>

Instead of imagining all this, how about doing a small test? Create links via GraphiQL until you have around 10 of them, all posted by the same user. Then, add some temporary logging to the MongoDB connector, like this:

```js{1-1,8-13}(path=".../hackernews-graphql-js/src/mongo-connector.js")
const {Logger, MongoClient} = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/hackernews';

module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);

  let logCount = 0;
  Logger.setCurrentLogger((msg, state) => {
    console.log(`MONGO DB REQUEST ${++logCount}: ${msg}`);
  });
  Logger.setLevel('debug');
  Logger.filter('class', ['Cursor']);

  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),
  };
}
```

</Instruction>

This code will log all requests to the db server, and number them so you can easily know how many were made. 

<Instruction>

Restart the server now and run a query to fetch links with the users that posted them, like this:

```graphql
{
  allLinks {
    url
    postedBy {
      name
    }
  }
}
```

</Instruction>

You should be able to see the logs in the terminal running your server. The screenshot below shows the logs for this query when the db has exactly 10 links, all posted by the same user:
![](https://i.imgur.com/zvrTREp.png)

As you can see, this simple query triggered 12 requests to MongoDB! One of these was for fetching the links data, but all of the others were for the same exact user! That's not good at all, you should be able to reuse data that has already been fetched. That means extra logic for handling cache across different resolver calls...

Thankfully though, there already are great solutions out there for this kind of problem, so you don't really need much extra code to handle this.

### User Dataloader

You're going to be using a library from Facebook called [Dataloader](https://www.npmjs.com/package/dataloader) for this. It's very useful for avoiding unnecessary multiple requests to services like MongoDB. To achieve that, it not only covers caching, but also batching requests, which is important as well. If you test a different use case, where you have multiple links posted by different users, you'll see that a separate request is made to fetch each of these users. After using Dataloader, they would all be fetched using a single batch request to MongoDB instead.

<Instruction>

The first thing you need to do is to install it in your project, via:

```bash
npm install --save dataloader
```

</Instruction>

<Instruction>

Then, create a new file at `src/dataloaders.js` with this content:

```js(path=".../hackernews-graphql-js/src/dataloaders.js")
const DataLoader = require('dataloader');

// 1
async function batchUsers (Users, keys) {
  return await Users.find({_id: {$in: keys}}).toArray();
}

// 2
module.exports = ({Users}) =>({
  // 3
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    {cacheKeyFn: key => key.toString()},
  ),
});
```

</Instruction>

Let's go through this code step by step:

1. As was mentioned before, Dataloader handles batching by default as well, and for that it needs you to provide it with a batch function to be called when it has multiple items to fetch together. This loader will be used for user data, and the keys are going to be user ids. So the batch function just needs to make a single call to MongoDB with all the given ids.
2. One important thing to know about data loaders is that it's not supposed to be reused between different GraphQL requests. Its caching feature should be short-term, to avoid duplicate fetches happening for the same query. Check out its [docs](https://github.com/facebook/dataloader#caching-per-request) for more detailed explanation. Because of this, this file will return a function for creating the data loaders, that will later be called for each request.
3. Finally, create the user data loader, passing it the batch function. In this case you also need to set a data loader option called `cacheKeyFn`. That's because the user ids returned by MongoDB, which will be passed as keys to the data loader, are not actually strings, but objects that may fail comparison checks even when the ids are equal. This option allows you to *normalize* keys so that they may be compared correctly for caching purposes.

<Instruction>

You need the resolvers to use this new data loader instead of MongoDB when fetching users, so add it to the context object now:

```js{1-1,9-9}(path=".../hackernews-graphql-js/src/index.js")
const buildDataloaders = require('./dataloaders');

const start = async () => {
  // ...
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        user
      },
      schema,
    };
  };
  // ...
};
// ...
```

</Instruction>

<Instruction>

Lastly, update the resolvers to use the data loader:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
Link: {
  // ...
  postedBy: async ({postedById}, data, {dataloaders: {userLoader}}) => {
    return await userLoader.load(postedById);
  },
},
Vote: {
  // ...
  user: async ({userId}, data, {dataloaders: {userLoader}}) => {
    return await userLoader.load(userId);
  },
},
```

</Instruction>

If you try restarting the server and running that same `allLinks` query again, you'll clearly see that the outputted logs show a lot less requests. Using the same db as before (10 links posted by the same user), the new logs are:

![](https://i.imgur.com/bGxfKgf.png)

The number of requests dropped by 75%, from 12 to just 3! It could become only 2 if the authentication process fetched the user by the id instead of the email address. But even if it needed to be email based there's a way to reuse the data as well. If you're curious, take a look at the [prime](https://github.com/facebook/dataloader#loading-by-alternative-keys) function from data loader, which can help with this.

There still are other areas that could benefit from data loader in this server, like fetching votes and links. The steps would be the same for these though, which you've already learned, so we won't repeat them here. It's a good chance to practice more though, so feel free to work on that if you'd like to.
