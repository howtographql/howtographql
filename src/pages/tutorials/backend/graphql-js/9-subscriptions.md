---
title: Subscriptions
---

### Motivation

Your server can now properly handle queries and mutations. There's still one GraphQL operation type left though, which is called **[subscriptions](http://facebook.github.io/graphql/#sec-Subscription)**. While the other two are sent by the client through HTTP requests, subscriptions are a way for the server to push data itself to interested clients, when some kind of event happens. That's how *realtime* communication is handled via GraphQL.

### Updating the schema

Again, start by updating the schema, this time adding the `Subscription` special type with a field for handling events about links.

```
type Subscription {
  Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
}

input LinkSubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}

type LinkSubscriptionPayload {
  mutation: _ModelMutationType!
  node: Link
}

enum _ModelMutationType {
  CREATED
  UPDATED
  DELETED
}
```

Subscriptions can be as simple as you wish them to be. Here you'll be following the same best practice that's also used in the [Graphcool Simple API](https://www.graph.cool/docs/reference/simple-api/overview-heshoov3ai/), once more to make it easier to replace it in your frontend app, in case you went through the other tutorials. But remember that it doesn't have to be this way, you can design your subscriptions to have any format you prefer.

### PubSub Events

After updating the schema, the next step is to implement the resolver, as in all other cases before. Subscription resolvers are special though, since they're not supposed to return a response right away. Instead, they inform the server that a client is interested in *events* that relate to the data from the subscription's payload. 

To handle this subscription and publishing process you're going to use the `[graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions)` package, so install it now:

```
npm install --save graphql-subscriptions
```

You'll need to create an instance of `PubSub`, an object provided by `graphql-subscriptions`. Since there will only be a single instance of it in your server, there's no need to pass it down with the context. You can instead have a file just for this, so create one at `src/pubsub.js` now.

```
const {PubSub} = require('graphql-subscriptions');

module.exports = new PubSub();
```

Make sure to include it at the top of your resolvers' file:

```
const pubsub = require('../pubsub');
```

You can now add the resolver for this subscription, like this:

```
Subscription: {
  Link: {
    subscribe: () => pubsub.asyncIterator('Link'),
  },
},
```

The subscription should be triggered whenever a new link is created, so the publishing logic will be inside `createLink`:

```
Mutation: {
  createLink: async (root, data, {mongo: {Links}, user}) => {
    assertValidLink(data);
    const newLink = Object.assign({postedById: user && user._id}, data)
    const response = await Links.insert(newLink);

    newLink.id = response.insertedIds[0]
    pubsub.publish('Link', {Link: {mutation: 'CREATED', node: newLink}});

    return newLink;
  },
},
    
```

### Configuring the `SubscriptionServer`

The only thing left is to setup a new endpoint to handle subscription requests. That's necessary because this endpoint won't be a simple HTTP handler. It will instead work with a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection, which will be kept open between the server and subscribed clients.

Thankfully, you don't have to know much about WebSockets to get this working. 

Install another package to handle this for you now, called [subscriptions-transport-ws](http://npmjs.com/package/subscriptions-transport-ws).

```
npm install --save subscriptions-transport-ws
```

Now go to `src/index.js` again and add the following imports at the top of the file:

```
const {execute, subscribe} = require('graphql');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
```

After that, replace the call to `app.listen` in this same file with this:

```
const PORT = 3000;
const server = createServer(app);
server.listen(PORT, () => {
  new SubscriptionServer(
    {execute, subscribe, schema},
    {server, path: '/subscriptions'},
  );
  console.log(`Hackernews GraphQL server running on port ${PORT}.`)
});
```

To finish up, tell `graphiqlExpress` that the subscriptions endpoint is different from the regular GraphQL one:

```
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  passHeader: `'Authorization': 'bearer token-foo@bar.com'`,
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
}));
```

### Testing with playground

It's finally time to test your new subscription! Restart the server, refresh your GraphiQL tab and try it out. You'll see that instead of the usual response with data, the right-most text box will show you a message, saying that it will be replaced with data whenever it arrives.

[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/dPYpKYADp7onBb1H6VM3Mg]

Leave this tab open and then open another GraphiQL in a separate tab. In this second tab, send a mutation for creating a new link, as you've done other times before. Once that's done, check the first tab again. You should see the newly created link's data there.

[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/N604jjYvFoDQhPSBsJrUrw]

Adding more subscriptions now will be a breeze, since everything is already setup. Feel free to practice more by adding one for votes as well.
