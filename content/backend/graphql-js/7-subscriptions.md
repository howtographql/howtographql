---
title: Realtime GraphQL Subscriptions
pageTitle: "Realtime GraphQL Subscriptions with Node.JS Tutorial"
description: "Learn how to implement GraphQL subscriptions with Node.js, Express & Prisma to add realtime functionality to an app."
question: Which of the following statements is true?
answers: ["Subscriptions follow a request-response-cycle", "Subscriptions are best implemented with MailChimp", "Subscriptions are typically implemented via WebSockets", "Subscriptions are defined on the 'Query' type and annotated with the @realtime-directive"]
correctAnswer: 2
---

In this section, you'll learn how you can bring realtime functionality into your app by implementing GraphQL subscriptions. The goal is to implement two subscriptions to be exposed by your GraphQL server:

- Send realtime updates to subscribed clients when a new `Link` element is _created_
- Send realtime updates to subscribed clients when an existing `Link` element is _upvoted_

### What are GraphQL subscriptions?

Subscriptions are a GraphQL feature that allows a server to send data to its clients when a specific _event_ happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket). In that setup, the server maintains a steady connection to its subscribed client. This also breaks the "Request-Response-Cycle" that were used for all previous interactions with the API.

Instead, the client initially opens up a long-lived connection to the server by sending a _subscription query_ that specifies which _event_ it is interested in. Every time this particular event happens, the server uses the connection to push the event data to the subscribed client(s).

### Subscriptions with Prisma

Luckily, Prisma comes with out-of-the-box support for subscriptions.

For each model in your Prisma datamodel, Prisma lets you subscribe to the following _events_:

- A new model is **created**
- An existing model **updated**
- An existing model is **deleted**

You can subscribe to these events using the `$subscribe` method of the Prisma client.

### Subscribing to new `Link` elements

Enough with the talking, more of the coding! Let's implement the subscription that allows your clients to subscribe to newly created `Link` elements.

Just like with queries and mutations, the first step to implement a subscription is to extend your GraphQL schema definition.

<Instruction>

Open your application schema and add the `Subscription` type:

```graphql(path=".../hackernews-node/src/schema.graphql)
type Subscription {
  newLink: Link
}
```

</Instruction>

Next, go ahead and implement the resolver for the `newLink` field. Resolvers for subscriptions are slightly different than the ones for queries and mutations:

1. Rather than returning any data directly, they return an `AsyncIterator` which subsequently is used by the GraphQL server to push the event data to the client.
1. Subscription resolvers are wrapped inside an object and need to be provided as the value for a `subscribe` field. You also need to provide another field called `resolve` that actually returns the data from the data emitted by the `AsyncIterator`.

<Instruction>

To adhere to the modular structure of your resolver implementation, first create a new file called `Subscription.js`:

```bash(path=".../hackernews-node)
touch src/resolvers/Subscription.js
```

</Instruction>

<Instruction>

Here's how you need to implement the subscription resolver in that new file:

```js
function newLinkSubscribe(parent, args, context, info) {
  return context.prisma.$subscribe.link({ mutation_in: ['CREATED'] }).node()
}

const newLink = {
  subscribe: newLinkSubscribe,
  resolve: payload => {
    return payload
  },
}

module.exports = {
  newLink,
}
```

</Instruction>

The code seems pretty straightforward. As mentioned before, the subscription resolver is provided as the value for a `subscribe` field inside a plain JavaScript object.

As mentioned, the `prisma` client instance on the `context` exposes a `$subscribe` property which proxies the subscriptions from the Prisma API. This function is used to resolve subscriptions and push the event data. Prisma is taking care of all the complexity of handling the realtime functionality under the hood.

<Instruction>

Open `index.js` and add an import statement for the `Subscription` module to the top of the file:

```js(path=".../hackernews-node/src/index.js")
const Subscription = require('./resolvers/Subscription')
```

</Instruction>

<Instruction>

Then, update the definition of the `resolvers` object to looks as follows:

```js{4}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
}
```

</Instruction>

### Testing subscriptions

With all the code in place, it's time to test your realtime API ⚡️ You can do so, by using two instances (i.e. windows) of the GraphQL Playground at once.

<Instruction>

If you haven't already, restart the server by first killing it with **CTRL+C**, then run `node src/index.js` again.

</Instruction>

<Instruction>

Next, open two browser windows and navigate both to the endpoint of your GraphQL server: [`http://localhost:4000`](http://localhost:4000).

</Instruction>

As you might guess, you'll use one Playground to send a subscription query and thereby create a permanent websocket connection to the server. The second one will be used to send a `post` mutation which triggers the subscription.

<Instruction>

In one Playground, send the following subscription:

```graphql
subscription {
  newLink {
      id
      url
      description
      postedBy {
        id
        name
        email
      }
  }
}
```

</Instruction>

In contrast to what happens when sending queries and mutations, you'll not immediately see the result of the operation. Instead, there's a loading spinner indicating that it's waiting for an event to happen.

![](https://imgur.com/hmqRJws.png)

Time to trigger a subscription event.

<Instruction>

Send the following `post` mutation inside a GraphQL Playground. Remember that you need to be authenticated for that (see the previous chapter to learn how that works):

```graphql
mutation {
  post(
    url: "www.graphqlweekly.com"
    description: "Curated GraphQL content coming to your email inbox every Friday"
  ) {
    id
  }
}
```

</Instruction>

Now observe the Playground where the subscription was running:

![](https://imgur.com/0BJQhWj.png)

### Adding a voting feature

#### Implementing a `vote` mutation

The next feature to be added is a voting feature which lets users _upvote_ certain links. The very first step here is to extend your Prisma datamodel to represent votes in the database.

<Instruction>

Open `prisma/datamodel.prisma` and adjust it to look as follows:

```graphql{7,16,19-23}(path=".../hackernews-node/prisma/datamodel.prisma")
type Link {
  id: ID! @id
  createdAt: DateTime! @createdAt
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}

type User {
  id: ID! @id
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}

type Vote {
  id: ID! @id
  link: Link!
  user: User!
}
```

</Instruction>

As you can see, you added a new `Vote` type to the datamodel. It has one-to-many relationships to the `User` and the `Link` type.

To apply the changes and update your Prisma client API so it includes CRUD operations for the new `Vote` type, you need to deploy the service again.

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node)
prisma deploy
```

</Instruction>

Thanks to the post-deploy hook, you don't need to manually run `prisma generate` again to update your Prisma client.

Now, with the process of schema-driven development in mind, go ahead and extend the schema definition of your application schema so that your GraphQL server also exposes a `vote` mutation:

```graphql{5}(path=".../hackernews-node/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote
}
```

<Instruction>

The referenced `Vote` type also needs to be defined in the GraphQL schema:

```graphql(path=".../hackernews-node/src/schema.graphql")
type Vote {
  id: ID!
  link: Link!
  user: User!
}
```

</Instruction>

It should also be possible to query all the `votes` from a `Link`, so you need to adjust the `Link` type in `schema.graphql` as well.

<Instruction>

Open `schema.graphql` and add the `votes` field to `Link`:

```graphql{6}(path=".../hackernews-node/src/schema.graphql")
type Link {
  id: ID!
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}
```

</Instruction>

You know what's next: Implementing the corresponding resolver functions.

<Instruction>

Add the following function to `src/resolvers/Mutation.js`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
async function vote(parent, args, context, info) {
  // 1
  const userId = getUserId(context)

  // 2
  const linkExists = await context.prisma.$exists.vote({
    user: { id: userId },
    link: { id: args.linkId },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  // 3
  return context.prisma.createVote({
    user: { connect: { id: userId } },
    link: { connect: { id: args.linkId } },
  })
}
```

</Instruction>

Here is what's going on:

1. Similar to what you're doing in the `post` resolver, the first step is to validate the incoming JWT with the `getUserId` helper function. If it's valid, the function will return the `userId` of the `User` who is making the request. If the JWT is not valid, the function will throw an exception.
1. The `prisma.$exists.vote(...)` function call is new for you. The `prisma` client instance not only exposes CRUD methods for your models, it also generates one `$exists` function per model. The `$exists` function takes a `where` filter object that allows to specify certain conditions about elements of that type. Only if the condition applies to _at least_ one element in the database, the `$exists` function returns `true`. In this case, you're using it to verify that the requesting `User` has not yet voted for the `Link` that's identified by `args.linkId`.
1. If `exists` returns `false`, the `createVote` method will be used to create a new `Vote` that's _connected_ to the `User` and the `Link`.

<Instruction>

Also, don't forget to adjust the export statement to include the `vote` resolver in the module:

```js{5}(path=".../hackernews-node/src/resolvers/Mutation.js")
module.exports = {
  post,
  signup,
  login,
  vote,
}
```

</Instruction>

You also need to account for the new relations in your GraphQL schema:

- `votes` on `Link`
- `user` on `Vote`
- `link` on `Vote`

Similar to before, you need to implement resolvers for these.

<Instruction>

Open `Link.js` and add the following function to it:

```js(path=".../hackernews-node/src/resolvers/Link.js")
function votes(parent, args, context) {
  return context.prisma.link({ id: parent.id }).votes()
}
```

</Instruction>

<Instruction>

Don't forget to include the new resolver in the exports:

```js{3}(path=".../hackernews-node/src/resolvers/Link.js")
module.exports = {
  postedBy,
  votes,
}
```

</Instruction>

Finally you need to resolve the relations from the `Vote` type. 

<Instruction>

Create a new file called `Vote.js` inside `resolvers`:

```bash(path=".../hackernews-node")
touch src/resolvers/Vote.js
```

</Instruction>


<Instruction>

Now add the following code to it:

```js(path=".../hackernews-node/src/resolvers/Vote.js")
function link(parent, args, context) {
  return context.prisma.vote({ id: parent.id }).link()
}

function user(parent, args, context) {
  return context.prisma.vote({ id: parent.id }).user()
}

module.exports = {
  link,
  user,
}
```

</Instruction>

Finally the `Vote` resolver needs to be included in the main `resolvers` object in `index.js`.

<Instruction>

Open `index.js` and add a new import statement to its top:

```js(path=".../hackernews-node/src/index.js")
const Vote = require('./resolvers/Vote')
```

</Instruction>

<Instruction>

Finally, include the `Vote` resolver in the `resolvers` object:

```js{7}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
}
```

</Instruction>

Your GraphQL API now accepts `vote` mutations! 👏

#### Subscribing to new votes

The last task in this chapter is to add a subscription that fires when new `Vote`s are being created. You'll use an analogous approach as for the `newLink` query for that.

<Instruction>

Add a new field to the `Subscription` type of your GraphQL schema:

```graphql{3}(path=".../hackernews-node/src/schema.graphql")
type Subscription {
  newLink: Link
  newVote: Vote
}
```

</Instruction>

Next, you need to add the subscription resolver function.

<Instruction>

Add the following code to `Subscription.js`:

```js(path=".../hackernews-node/src/resolvers/Subscription.js")
function newVoteSubscribe(parent, args, context, info) {
  return context.prisma.$subscribe.vote({ mutation_in: ['CREATED'] }).node()
}

const newVote = {
  subscribe: newVoteSubscribe,
  resolve: payload => {
    return payload
  },
}
```

</Instruction>

<Instruction>

And update the export statement of the file accordingly:

```js{3}(path=".../hackernews-node/src/resolvers/Subscription.js")
module.exports = {
  newLink,
  newVote,
}
```

</Instruction>


All right, that's it! You can now test the implementation of your `newVote` subscription.

<Instruction>

If you haven't done so already, stop and restart the server by first killing it with **CTRL+C**, then run `node src/index.js`. Afterwards, open a new Playground with the GraphQL CLI by running `graphql playground`.

</Instruction>

You can use the following subscription for that:

```graphql
subscription {
  newVote {
    id
    link {
      url
      description
    }
    user {
      name
      email
    }
  }
}
```

If you're unsure about writing one yourself, here's a sample `vote` mutation you can use. You'll need to replace the `__LINK_ID__` placeholder with the `id` of an actual `Link` from your database. Also, make sure that you're authenticated when sending the mutation.

```graphql
mutation {
  vote(linkId: "__LINK_ID__") {
    link {
      url
      description
    }
    user {
      name
      email
    }
  }
}
```

![](https://imgur.com/cYkqy1j)
