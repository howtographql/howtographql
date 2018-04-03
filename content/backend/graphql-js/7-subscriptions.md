---
title: Subscriptions
pageTitle: "GraphQL Realtime Subscriptions with JavaScript Tutorial"
description: "Learn how to implement server-side GraphQL subscriptions with grahpql-js, Node.js, Express & MongoDB to add realtime functionality to an app."
question: Which of the following is true?
answers: ["Real time support should be implemented via regular queries", "It's not currently possible to test subscriptions via GraphiQL", "Subscriptions can be implemented via web sockets", "The only way to implement subscriptions is by using the `subscriptions-transport-ws` package"]
correctAnswer: 2
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

> **WARNING**: There's currently a [bug](https://github.com/graphcool/prisma/issues/1734) in the Prisma subscription API where the `where` filter is broken. So, a subscription using it is not going to fire.

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

##### `node: Link`

This field represents the `Link` element which was created, updated or deleted and allows to retrieve more information about it.

Notice that for `DELETED`-mutations, `node` will always be `null`! If you need to know more details about the `Link` that was deleted, you can use the `previousValues` field instead (more about that soon).

> **Note**: The terminology of a _node_ is sometimes used in GraphQL to refer to single elements. A node essentially corresponds to a record in the database.

##### `updatedFields: [String!]`

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

##### `previousValues: LinkPreviousValues`

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

##### Putting everything together

Consider the sampe `updateLink`-mutation from the previous section again. But let's now assume, the subscription query includes all the fields we just discussed:

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

1. Rather than returning any data directly, they returning an `AsyncIterator` which subsequently is used by the GraphQL server to push the event data to the client.
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
const newLink = {
  subscribe: (parent, args, context, info) => {
    return context.db.subscription.link(
      // Uncomment when the following bug is fixed:
      // https://github.com/graphcool/prisma/issues/1734
      // { where: { mutation_in: ['CREATED'] } },
      { },
      info,
    )
  },
}

module.exports = {
  newLink,
}
```

</Instruction>

As mentioned above, the `where` filter currently doesn't work in the Prisma API. We're still including the code here as a comment to show you how it will work once the [bug](https://github.com/graphcool/prisma/issues/1734) is fixed.

Otherwise the code seems pretty straightforward. As mentioned before, the subscription resolver is provided as the value for a `subscribe` field inside a plain JavaScript object. 

The `Prisma` binding instance on the `context` also exposes a `subscription` object which proxies the subscriptions from the Prisma GraphQL API. This function is used to resolve subscriptions and push the event data to subscribed clients. Prisma is taking care of all the complexity of handling the realtime functionality under the hood.

### Adding a voting feature

The next feature to be added is a voting feature which allows to users to upvote certain links. The very first step here is to extend your Prisma data model to represent votes.

<Instruction>

Open `database/datamodel.graphql` and addjust it to look as follows:

```{6,14,17-21}graphql(path=".../hackernews-node/database/datamodel.graphql")
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

As you can see, you added a new `Vote` type to the data model. It has a one-to-many relationships to the `User` and the `Link` type. This expresses that one `User` can vote for the same `Link` exactly once.

To apply the changes and update your Prisma GraphQL API so it includes CRUD operations for the new `Vote` type, you need to deploy the service again.

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node)
prisma deploy
```

</Instruction>

Now, with the process of schema-driven development in mind, go ahead and extend the schema definition of your application schema so thar your GraphQL server exposes a `vote` mutation:

```graphql(path=".../hackernews-node")

``` 