---
title: Realtime GraphQL Subscriptions
pageTitle: "Realtime GraphQL Subscriptions with Node.JS Tutorial"
description: "Learn how to implement GraphQL subscriptions with Node.js, Express & Prisma to add realtime functionality to an app."
question: Which of the following statements is true?
answers: ["The 'node' field of a subscription is always null for CREATED-mutations", "The 'previousValues' field of a subscription is always null for DELETED-mutations", "The 'previousValues' field of a subscription is always null for UPDATED-mutations", "The 'node' field of a subscription is always null for DELETED-mutations"]
correctAnswer: 3
---

In this section, you'll learn how you can bring realtime functionality into your app by implementing GraphQL subscriptions. The goal is to implement two subscriptions to be exposed by your GraphQL server:

- Send realtime updates to subscribed clients when a new `Link` element is _created_
- Send realtime updates to subscribed clients when an existing `Link` element is _upvoted_

### What are GraphQL subscriptions?

Subscriptions are a GraphQL feature that allows a server to send data to its clients when a specific _event_ happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket). In that setup, the server maintains a steady connection to its subscribed client. This also breaks the "Request-Response-Cycle" that were used for all previous interactions with the API.

Instead, the client initially opens up a long-lived connection to the server by sending a _subscription query_ that specifies which _event_ it is interested in. Every time this particular event happens, the server uses the connection to push the event data to the subscribed client(s).

### Subscriptions with Prisma

Luckily, Prisma comes with out-of-the-box support for subscriptions. In fact, if you take a look at the Prisma schema in `src/generated/prisma.graphql`, you'll notice that the `Subscription` type is already there and currently looks as follows:

```graphql(path=".../hackernews-node/src/generated/prisma.graphql"&nocopy)
type Subscription {
  link(where: LinkSubscriptionWhereInput): LinkSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}
```

These subscriptions can fire for the following _events_:

- A new node is **created**
- An existing node **updated**
- An existing node is **deleted**

Notice that you can constrain for which events exactly a subscription should fire. For example, if you only want to subscribe to updates made to one specific `Link` or when a specific `User` is deleted, you can do so as well by providing the `where` argument to the subscription query.

GraphQL subscriptions follow the same syntax as queries and mutations, so you could for example subscribe to _events_ of existing `Link` elements being updated with the following subscription:

```graphql(nocopy)
subscription {
  link(where: {
    mutation_in: [UPDATED]
  }) {
    node {
      id
      url
      description
    }
  }
}
```

This subscription fires everytime an existing `Link` is updated and the server would send along the (potentially updated) `url` and `description` values for the updated `Link`.

Let's also quickly consider the `LinkSubscriptionPayload` type from `src/generated/prisma.graphql`:

```graphql(nocopy)
type LinkSubscriptionPayload {
  mutation: MutationType!
  node: Link
  updatedFields: [String!]
  previousValues: LinkPreviousValues
}
```

Here's what the individual fields are being used for:

#### `mutation: MutationType!`

`MutationType` is an `enum` with three values:

```graphql(nocopy)
enum MutationType {
  CREATED
  UPDATED
  DELETED
}
```

The `mutation` field on the `LinkSubscriptionPayload` type therefore carries the information what kind of mutation happened.

#### `node: Link`

This field represents the `Link` element which was created, updated or deleted and allows to retrieve more information about it.

Notice that for `DELETED`-mutations, `node` will always be `null`! If you need to know more details about the `Link` that was deleted, you can use the `previousValues` field instead (more about that soon).

> **Note**: The terminology of a _node_ is sometimes used in GraphQL to refer to single elements. A node essentially corresponds to a record in the database.

#### `updatedFields: [String!]`

One piece of information you might be interested in for `UPDATED`-mutations is which _fields_ have been updated inside a mutation. That's what this field is used for.

Assume a client has subscribed with the following subscription query:

```graphql(nocopy)
subscription {
  link {
    updatedFields
  }
}
```

Now, assume the server receives the following mutation:

```graphql(nocopy)
mutation {
  updateLink(
    where: {
      id: "..."
    }
    data: {
      description: "An even greater website"
    }
  )
}
```

The subscribed client will then receive the following payload:

```json(nocopy)
{
  "data": {
    "link": {
      "updatedFields": ["description"]
    }
  }
}
```

This is because the mutation only updated the `Link`'s `description` field - not the `url`.

#### `previousValues: LinkPreviousValues`

The `LinkPreviousValues` type looks very similar to `Link` itself:

```graphql(nocopy)
type LinkPreviousValues {
  id: ID!
  description: String!
  url: String!
}
```

It basically is a helper type that mirrors the fields from `Link`.

`previousValues` is only used for `UPDATED`- and `DELETED`-mutations. For `CREATED`-mutations, it will always be `null` (for the same reason that `node` is null for `DELETED`-mutations).

#### Putting everything together

Consider the sample `updateLink`-mutation from the previous section again. But let's now assume, the subscription query includes all the fields we just discussed:

```graphql(nocopy)
subscription {
  link {
    mutation
    updatedFields
    node {
      url
      description
    }
    previousValues {
      url
      description
    }
  }
}
```

Here's what the payload will look like that the server pushes to the client after it performed the mutation:

```json
{
  "data": {
    "link": {
      "mutation": "UPDATED",
      "updatedFields": ["description"],
      "node": {
        "url": "www.example.org",
        "description": "An even greater website"
      },
      "previousValues": {
        "url": "www.example.org",
        "description": "A great website"
      }
    }
  }
}
```

Note that this assumes the updated `Link` had the following values before the mutation was performed:

- `url`: `www.example.org`
- `description`: `A great website`

### Subscribing to new `Link` elements

Enough with the talking, more of the coding! Let's implement the subscription that allows your clients to subscribe to newly created `Link` elements.

Just like with queries and mutations, the first step to implement a subscription is to extend your GraphQL schema definition.

<Instruction>

Open your application schema and add the `Subscription` type:

```graphql(path=".../hackernews-node/src/schema.graphql)
type Subscription {
  newLink: LinkSubscriptionPayload
}
```

</Instruction>

<Instruction>

Because you're referencing `LinkSubscriptionPayload` from the Prisma schema, you also need to adjust your import statement on top of the file and import that type as well:

```graphql(path=".../hackernews-node/src/schema.graphql)
# import Link, LinkSubscriptionPayload from "./generated/prisma.graphql"
```

</Instruction>

Next, go ahead and implement the resolver for the `newLink` field. Resolvers for subscriptions are slightly different than the ones for queries and mutations:

1. Rather than returning any data directly, they return an `AsyncIterator` which subsequently is used by the GraphQL server to push the event data to the client.
2. Subscription resolvers are wrapped inside an object and need to be provided as the value for a `subscribe` field.

<Instruction>

To adhere to the modular structure of your resolver implementation, first create a new file called `Subscription.js`:

```bash(path=".../hackernews-node)
touch src/resolvers/Subscription.js
```

</Instruction>

<Instruction>

Here's how you need to implement the subscription resolver in that new file:

```js
function newLinkSubscribe (parent, args, context, info) {
  return context.db.subscription.link(
    { where: { mutation_in: ['CREATED'] } },
    info,
  )
}

const newLink = {
  subscribe: newLinkSubscribe
}

module.exports = {
  newLink,
}
```

</Instruction>

The code seems pretty straightforward. As mentioned before, the subscription resolver is provided as the value for a `subscribe` field inside a plain JavaScript object.

The `Prisma` binding instance on the `context` also exposes a `subscription` object which proxies the subscriptions from the Prisma GraphQL API. This function is used to resolve subscriptions and push the event data to subscribed clients. Prisma is taking care of all the complexity of handling the realtime functionality under the hood.

<Instruction>

Open `index.js` and import the Subscription module at the top of the file:

```js(path=".../hackernews-node/src/index.js")
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const AuthPayload = require('./resolvers/AuthPayload')
const Subscription = require('./resolvers/Subscription')
```

</Instruction>

<Instruction>

Then, update the definition of the `resolvers` object to looks as follows:

```js(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
  Mutation,
  AuthPayload,
  Subscription,
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
    node {
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
}
```

</Instruction>

In contrast to what happens when sending queries and mutations, you'll not immediately see the result of the operation. Instead, there's a loading spinner indicating that it's waiting for an event to happen.

![](https://imgur.com/wSkSXZE.png)

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

![](https://imgur.com/V89gYLE.png)

### Adding a voting feature

The next feature to be added is a voting feature which lets users _upvote_ certain links. The very first step here is to extend your Prisma data model to represent votes.

<Instruction>

Open `database/datamodel.graphql` and addjust it to look as follows:

```graphql{7,16,19-23}(path=".../hackernews-node/database/datamodel.graphql")
type Link {
  id: ID! @unique
  createdAt: DateTime!
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}

type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}

type Vote {
  id: ID! @unique
  link: Link!
  user: User!
}
```

</Instruction>

As you can see, you added a new `Vote` type to the data model. It has one-to-many relationships to the `User` and the `Link` type.

To apply the changes and update your Prisma GraphQL API so it includes CRUD operations for the new `Vote` type, you need to deploy the service again.

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node)
prisma deploy
```

</Instruction>

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

The referenced `Vote` type also needs to be imported from the Prisma database schema:

```graphql(path=".../hackernews-node/src/schema.graphql")
# import Link, LinkSubscriptionPayload, Vote from "./generated/prisma.graphql"
```

</Instruction>

You know what's next: Implementing the corresponding resolver function.

<Instruction>

Add the following function to `src/resolvers/Mutation.js`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
async function vote(parent, args, context, info) {
  // 1
  const userId = getUserId(context)

  // 2
  const linkExists = await context.db.exists.Vote({
    user: { id: userId },
    link: { id: args.linkId },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  // 3
  return context.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } },
      },
    },
    info,
  )
}
```

</Instruction>

Here is what's going on:

1. Similar to what you're doing in the `post` resolver, the first step is to validate the incoming JWT with the `getUserId` helper function. If it's valid, the function will return the `userId` of the `User` who is making the requests. If the JWT is not valid, the function will throw an exception.
1. The `db.exists.Vote(...)` function call is new for you. The `Prisma` binding object not only exposes functions that mirror the queries, mutations and subscriptions from the Prisma database schema. It also generates one `exists` function per type from your data model. The `exists` function takes a `where` filter object that allows to specify certain conditions about elements of that type. Only if the condition applies to _at least_ one element in the database, the `exists` function returns `true`. In this case, you're using it to verify that the requesting `User` has not yet voted for the `Link` that's identified by `args.linkId`.
1. If `exists` returns `false`, the `createVote` will be used to create a new `Vote` element that's _connected_ to the `User` and the `Link`.

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

The last task in this chapter is to add a subscription that fires when new `Vote`s are being created. You'll use an analogous approach as for the `newLink` query for that.

<Instruction>

Add a new field to the `Subscription` type of your application schema:

```graphql{3}(path=".../hackernews-node/src/schema.graphql")
type Subscription {
  newLink: LinkSubscriptionPayload
  newVote: VoteSubscriptionPayload
}
```

</Instruction>

<Instruction>

Next, import the `VoteSubscriptionPayload` from the GraphQL schema of the Prisma API into the application schema:

```graphql(path=".../hackernews-node/src/schema.graphql")
# import Link, LinkSubscriptionPayload, Vote, VoteSubscriptionPayload from "./generated/prisma.graphql"
```

</Instruction>

Finally, you need to add the subscription resolver function.

<Instruction>

Add the following code to `Subscription.js`:

```js(path=".../hackernews-node/src/resolvers/Subscription.js")
function newVoteSubscribe (parent, args, context, info) {
  return context.db.subscription.vote(
    { where: { mutation_in: ['CREATED'] } },
    info,
  )
}

const newVote = {
  subscribe: newVoteSubscribe
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

You can use the following subscription for that:

```graphql
subscription {
  newVote {
    node {
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

![](https://imgur.com/ii2X4Yc.png)
