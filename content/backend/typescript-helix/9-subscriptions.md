---
title: Realtime GraphQL Subscriptions
pageTitle: 'Realtime GraphQL Subscriptions with Node.JS Tutorial'
description: 'Learn how to implement GraphQL subscriptions with Node.js, Express & Prisma to add realtime functionality to an app.'
question: 'Which of the following statements is true?'
answers:
  [
    'Subscriptions follow a request-response-cycle',
    'Subscriptions are best implemented with MailChimp',
    'Subscriptions are a real-time GraphQL contract, and can be implemented with different real-time transports',
    "Subscriptions are defined on the 'Query' type and annotated with the @realtime-directive"
  ]
correctAnswer: 2
---

In this section, you'll learn how you can bring realtime functionality into your app by implementing GraphQL subscriptions. The goal is to implement two subscriptions to be exposed by your GraphQL server:

- Send realtime updates to subscribed clients when a new `Link` element is _created_
- Send realtime updates to subscribed clients when an existing `Link` element is _upvoted_

### What are GraphQL subscriptions?

Subscriptions are a GraphQL feature that allows a server to send data to its clients when a specific _event_ happens. Subscriptions are just part of your GraphQL contract, and they refer to _events_. To be able to send these _events_ in real-time, you need to choose a transport that has support for that. 

In this chapter of the tutorial, you are about to add GraphQL Subscriptions to your server, based on a transport called SSE (Server-Sent Events). This protocol is an extension of simple HTTP, with streaming and real-time capabilities, and doesn't require any special setup or a new server (as described before, there are many options to implement subscriptions, like WebSockets).

Sever-Sent Events are a way to "upgrade" a basic HTTP request into a long-living request that will emit multiple data items. This is a perfect fit for GraphQL Subscriptions, and implementing and scaling is just simpler than WebSockets. 

### Implementing GraphQL subscriptions

You'll be using a simple `PubSub` implementation from the `graphql-subscriptions` library to implement subscriptions to the following _events_:

- A new model is **created**
- An existing model **updated**
- An existing model is **deleted**

> `Pub/Sub` refers to a technique used to create a messaging pattern, where some parts of the code publishes events/messages, and other parts of the code subscribes and being notified about the events/messages. You are going to use that technique in order to create a simple subscription for the GraphQL Subscriptions, based on events published by the GraphQL mutations.  

You will do this by first adding an instance of `PubSub` to the context, just as you did with `PrismaClient`, and then calling its methods in the resolvers that handle each of the above events.

### Setting up `PubSub`

<Instruction>

To setup your PubSub object, start by installing the following packages: 

```bash
npm install graphql-subscriptions typed-graphql-subscriptions
```

</Instruction>

You'll use `graphql-subscriptions` library in order to create an instance of `PubSub`, and `typed-graphql-subscriptions` to get better type-safety for the events emitted.

<Instruction>

To get start with an instance of your `PubSub`, create a new file called `src/pubsub.ts` with the following:

```typescript(path="hackernews-node-ts/src/pubsub.ts)
import { PubSub } from "graphql-subscriptions";
import { TypedPubSub } from "typed-graphql-subscriptions";

// 1
export type PubSubChannels = {};

// 2
export const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());
```

</Instruction>

1. First, you declare a TypeScript `type PubSubChannels`, you'll later use that to define your type-safe events.
1. Then, create an instance of `PubSub` and combine it with the type-safe events wrapper to form a fully-typed Pub/Sub instance.

Now, you're adding the global instance of your `PubSub` and make sure it's available for your during your GraphQL execution, by injecting it to your `context`, just as you stored an instance of `PrismaClient` in the variable `prisma`.

<Instruction>

Now, in `src/context.ts`, add `pubsub` to the context, just as did with `prisma`:

```typescript{4,11,20}graphql(path="hackernews-node-ts/src/context.ts)
import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { authenticateUser } from "./auth";
import { pubSub } from "./pubsub";

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  currentUser: User | null;
  pubSub: typeof pubSub;
};

export async function contextFactory(
  request: FastifyRequest
): Promise<GraphQLContext> {
  return {
    prisma,
    currentUser: await authenticateUser(prisma, request),
    pubSub,
  };
}
```

</Instruction>

Great! Now you can access the methods you need to implement our subscriptions from inside our resolvers via `context.pubSub`!

### Subscribing to new `Link` elements

Alright – let's go ahead and implement the subscription that allows your clients to subscribe to newly created `Link` elements.

Just like with queries and mutations, the first step to implement a subscription is to extend your GraphQL schema definition.

<Instruction>

Open your application schema and add the `Subscription` type:

```graphql(path="hackernews-node-ts/src/schema.graphql")
type Subscription {
  newLink: Link
}
```

</Instruction>

Next, go ahead and implement the resolver for the `newLink` field. Resolvers for subscriptions are slightly different than the ones for queries and mutations:

1. Rather than returning any data directly, they return an `AsyncIterator` which subsequently is used by the GraphQL server to push the event data to the client.
1. Subscription resolvers are wrapped inside an object and need to be provided as the value for a `subscribe` field. You also need to provide another field called `resolve` that actually returns the data from the data emitted by the `AsyncIterator`.

> Iterators in JavaScript bring the concept of iteration directly into the core language and provide a mechanism for customizing the behavior of loops. `AsyncIterator` is a built-in JavaScript types, that allow to to write iterators that might get the values updates in an `async` way ([you can find more information here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)).

To get started with a new event, first make sure it's declared correctly by the `PubSubChannels`. In this case, you are going to declare an event called `NEW_LINK`, and use the created `Link` object as payload.

<Instruction>

Open `src/pubsub.ts` and delcare the new event:

```typescript{1,6}(path="hackernews-node-ts/src/pubsub.ts")
import { Link } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { TypedPubSub } from "typed-graphql-subscriptions";

export type PubSubChannels = {
  newLink: [{ createdLink: Link }];
};

export const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());
```

</Instruction>

Now that the PubSub knows our events and their payload, you can connect it to your GraphQL subscription resolver.

<Instruction>

Here's how you need to implement the subscription resolver in `src/schema.ts`:

```typescript{1,6-15}(path="hackernews-node-ts/src/schema.ts")
import { PubSubChannels } from "./pubsub";

const resolvers = {
  Query: { /* ... */ },
  Mutation: { /* ... */ }, 
  Subscription: {
    newLink: {
      subscribe: (parent: unknown, args: {}, context: GraphQLContext) => {
        return context.pubSub.asyncIterator("newLink");
      },
      resolve: (payload: PubSubChannels["newLink"][0]) => {
        return payload.createdLink;
      },
    },
  },
};
```

</Instruction>

In the code above, in `subscribe` function, you are using the `context.pubSub` to create an instance of `AsyncIterable` that listens to the `newLink` event. This will be the trigger for our GraphQL subscriptions. So in case of an active subscription, the `AsyncIterable` will be created, and a listener for the events will be active.

Then, on every value emitted for that event, you'll get our `resolve` function called with the event _payload_ (that matches the structure that you use for our events declaration in `PubSubChannels`).

### Adding subscriptions to your resolvers

The last thing you need to do for our subscription implementation itself is to actually trigger that `newLink` event from our code!

<Instruction>

Still in `src/schema.ts`, locate your `post` resolver function, adding the following call to `pubSub.publish()` right before you return the `newLink`:

```typescript{16}(path="hackernews-node-ts/src/schema.ts)
const resolvers = {
  Mutation: {
    post: async (parent: unknown, args: { url: string; description: string }, context: GraphQLContext) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }

      const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
          postedBy: { connect: { id: context.currentUser.id } },
        },
      });

      context.pubSub.publish("newLink", { createdLink: newLink });

      return newLink;
    },
  }
}
```

</Instruction>

Now you can see how you pass the same string to the `publish` method as you added in your `subscribe` function just above, along with passing in the `newLink` as a second
argument!

Ok, I'm sure you're dying to test out your brand-spanking new Subscription! All you need to do now is make sure your GraphQL server knows about your changes.

All you need to do in order to test your GraphQL Subscription is to open GraphiQL and try it! 

</Instruction>

### Testing subscriptions

With all the code in place, it's time to test your realtime API ⚡️ You can do so by using two instances (i.e. browser windows) of the GraphiQL at once.

<Instruction>

If you haven't already, restart the server by first killing it with **CTRL+C**, then run `npm run start` again.

</Instruction>

<Instruction>

Next, open two browser windows and navigate both to the endpoint of your GraphQL server: [`http://localhost:3000/graphql`](http://localhost:3000/graphql).

</Instruction>

As you might guess, you'll use one GraphiQL to send a subscription query and thereby create a permanent websocket connection to the server. The second one will be used to send a
`post` mutation which triggers the subscription.

<Instruction>

In one GraphiQL, send the following subscription:

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

In contrast to what happens when sending queries and mutations, you'll not immediately see the result of the operation. Instead, there's a loading spinner indicating that it's
waiting for an event to happen.

![loading spinner](https://i.imgur.com/e9JOJ0Y.png)

Time to trigger a subscription event.

<Instruction>

Send the following `post` mutation inside a GraphiQL. Remember that you need to be authenticated for that (see the previous chapter to learn how that works):

```graphql
mutation {
  post(url: "www.graphqlweekly.com", description: "Just testing this new real-time thing") {
    id
  }
}
```

</Instruction>

Now observe the GraphiQL where the subscription was running (left side is the subscription, and right side the mutation)

![subscription running](https://i.imgur.com/6n0JdHh.png)

> **Note**: If you see a loading spinner indefinitely, it maybe because of SSE disconnecting when the tab goes idle. Ensure that both the tabs are active.

### Adding a voting feature

#### Implementing a `vote` mutation

The next feature to be added is a voting feature which lets users _upvote_ certain links. The very first step here is to extend your Prisma data model to represent votes in the
database.

<Instruction>

Open `prisma/schema.prisma` and adjust it to look as follows:

```graphql{8,17,20-27}(path="hackernews-node-ts/prisma/schema.prisma")
model Link {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String
  url         String
  postedBy    User?     @relation(fields: [postedById], references: [id])
  postedById  Int?
  votes       Vote[]
}

model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  links    Link[]
  votes    Vote[]
}

model Vote {
  id     Int  @id @default(autoincrement())
  link   Link @relation(fields: [linkId], references: [id])
  linkId Int
  user   User @relation(fields: [userId], references: [id])
  userId Int

  @@unique([linkId, userId])
}
```

</Instruction>

As you can see, you added a new `Vote` type to the data model. It has one-to-many relationships to the `User` and the `Link` type.

<Instruction>

Now migrate your database schema with the following commands:

```
npx prisma migrate dev --name "add-vote-model"
```

</Instruction>


Now, with the process of schema-driven development in mind, go ahead and extend the schema definition of your application schema so that your GraphQL server also exposes a `vote` mutation:

```graphql{5}(path="hackernews-node-ts/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote
}
```

<Instruction>

The referenced `Vote` type also needs to be defined in the GraphQL schema:

```graphql(path="hackernews-node-ts/src/schema.graphql")
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

```graphql{6}(path="hackernews-node-ts/src/schema.graphql")
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

Add the following function to `src/schema.ts`:

```typescript{3-42}(path="hackernews-node-ts/src/schema.ts")
const resolvers = {
  Mutation: {
    vote: async (
      parent: unknown,
      args: { linkId: string },
      context: GraphQLContext
    ) => {
      // 1
      if (!context.currentUser) {
        throw new Error("You must login in order to use upvote!");
      }

      // 2
      const userId = context.currentUser.id;

      // 3
      const vote = await context.prisma.vote.findUnique({
        where: {
          linkId_userId: {
            linkId: Number(args.linkId),
            userId: userId,
          },
        },
      });

      if (vote !== null) {
        throw new Error(`Already voted for link: ${args.linkId}`);
      }

      // 4
      const newVote = await context.prisma.vote.create({
        data: {
          user: { connect: { id: userId } },
          link: { connect: { id: Number(args.linkId) } },
        },
      });

      // 5
      context.pubSub.publish("newVote", { createdVote: newVote });

      return newVote;
    },
  }
};
```

</Instruction>

Here is what's going on:

1. Make sure that our server don't allow upvote without being authenticated.
1. Similar to what you're doing in the `post` resolver, the first step is to validate the incoming JWT with the `getUserId` helper function. If it's valid, the function will return
   the `userId` of the `User` who is making the request. If the JWT is not valid, the function will throw an exception.
1. To protect against those pesky "double voters" (or honest folks who accidentally click twice), you need to check if the vote already exists or not. First, you try to fetch a
   vote with the same `linkId` and `userId`. If the vote exists, it will be stored in the `vote` variable, resulting in the boolean `true` from your call to `Boolean(vote)` --
   throwing an error kindly telling the user that they already voted.
1. If that `Boolean(vote)` call returns `false`, the `vote.create` method will be used to create a new `Vote` that's _connected_ to the `User` and the `Link`.
1. Publish a new event over the Pubsub called `newVote`.

Now, just like before, we'll add the event to our typed PubSub.

<Instruction>

Open `src/pubsub.ts` and declare the `newVote` event:

```typescript{1,7}(path="hackernews-node-ts/src/pubsub.ts")
import { Link, Vote } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { TypedPubSub } from "typed-graphql-subscriptions";

export type PubSubChannels = {
  newLink: [{ createdLink: Link }];
  newVote: [{ createdVote: Vote }];
};

export const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());
```

</Instruction>


You also need to account for the new relations in your GraphQL schema:

- `votes` on `Link`
- `user` on `Vote`
- `link` on `Vote`

Similar to before, you need to implement resolvers for these.

<Instruction>

Open `src/schema.ts` and add the missing resolvers function to it, starting with `Link.votes`:

```typescript{5-6}(path="hackernews-node-ts/src/schema.ts")
const resolvers = {
  // ... other resolvers ...
  Link: {
    // ... other resolvers ...
    votes: (parent: Link, args: {}, context: GraphQLContext) =>
      context.prisma.link.findUnique({ where: { id: parent.id } }).votes(),
  }
}
```

</Instruction>

Finally you need to resolve the relations from the `Vote` type.

<Instruction>

Add a new type and fields resolvers in `src/schema.ts`:

```typescript{3-8}(path="hackernews-node-ts/src/schema.ts")
const resolvers = {
  // ... other resolvers ...
  Vote: {
    link: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).link(),
    user: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).user(),
  },
}
```

</Instruction>

Your GraphQL API now accepts `vote` mutations! 👏

#### Subscribing to new votes

The last task in this chapter is to add a subscription that fires when new `Vote`s are being created. You'll use an analogous approach as for the `newLink` query for that.

<Instruction>

Add a new field to the `Subscription` type of your GraphQL schema:

```graphql{3}(path="hackernews-node-ts/src/schema.graphql")
type Subscription {
  newLink: Link
  newVote: Vote
}
```

</Instruction>

Next, you need to add the subscription resolver function.

<Instruction>

Add the following Subscription resolver code to `src/schema.ts`:

```typescript{5-12}(path="hackernews-node-ts/src/schema.ts")
export const resolvers = {
  // ... other resolvers ...
  Subscription: {
    // ... other resolvers ...
    newVote: {
      subscribe: (parent: unknown, args: {}, context: GraphQLContext) => {
        return context.pubSub.asyncIterator("newVote");
      },
      resolve: (payload: PubSubChannels["newVote"][0]) => {
        return payload.createdVote;
      },
    },
  },
}
```

</Instruction>

All right, that's it! You can now test the implementation of your `newVote` subscription!

<Instruction>

If you haven't done so already, stop and restart the server by first killing it with **CTRL+C**, then run `npm run start`.

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

If you're unsure about writing one yourself, here's a sample `vote` mutation you can use. You'll need to replace the `__LINK_ID__` placeholder with the `id` of an actual `Link`
from your database. Also, make sure that you're authenticated when sending the mutation.

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

