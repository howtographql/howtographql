---
title: Connecting Server and Database with Prisma Bindings
pageTitle: "Connecting a Database to a GraphQL Server with Prisma Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: "What is the main responsibility of the Prisma binding instance that's attached to the 'context'?"
answers: ["Expose the application schema to client applications", "Translate the GraphQL operations from the Prisma API into JavaScript functions", "Translate the GraphQL operations from the application layer into JavaScript functions", "Generate SQL queries"]
correctAnswer: 1
---

In this section, you're going to connect your GraphQL server with the [Prisma](https://www.prisma.io) API which provides the interface to your database. The connection is implemented via the [Prisma client](https://www.prisma.io/docs/prisma-client/).

### Updating the resolver functions to use Prisma client

You're going to start this section with a bit of cleanup and refactoring.

<Instruction>

Open `index.js` and entirely remove the `links` array as well as the `idCount` variable - you don't need those any more since the data will now be stored in an actual database.

</Instruction>

Next, you need to update the implementation of the resolver functions because they're still accessing the variables that were just deleted. Plus, you now want to return actual data from the database instead of local dummy data.

<Instruction>

Still in `index.js`, update the `resolvers` object to look as follows:

```js{4-6,8-17}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: (root, args, context, info) => {
      return context.prisma.links()
    },
  },
  Mutation: {
    post: (root, args, context) => {
      return context.prisma.createLink({
        url: args.url,
        description: args.description,
      })
    },
  },
}
```

</Instruction>

Wow, that looks weird! There's a bunch of new stuff happening, let's try to understand what's going on, starting with the `feed` resolver.

#### The `context` argument

Previously, the `feed` resolver didn't take any arguments - now it receives _four_. In fact, the first two and the fourth are not needed for this particular resolver. But the third one, called `context`, is.

Remember how we said earlier that all GraphQL resolver functions _always_ receive four arguments. Now you're getting to know another one, so what is `context` used for?

The `context` argument is a plain JavaScript object that every resolver in the resolver chain can read from and write to - it thus basically is a means for resolvers to communicate. As you'll see in a bit, it's also possible to already write to it at the moment when the GraphQL server itself is being initialized. So, it's also a way for _you_ to pass arbitrary data or functions to the resolvers. In this case, you're going to attach this `prisma` client instance to the `context` - more about that soon.

> **Note**: This tutorial actually doesn't cover the fourth resolver argument. To learn more about this topic, check out these two articles:
> - [GraphQL Server Basics: The Schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e)
> - [GraphQL Server Basics: Demystifying the `info` Argument in GraphQL Resolvers](https://blog.graph.cool/graphql-server-basics-demystifying-the-info-argument-in-graphql-resolvers-6f26249f613a)

Now that you have a basic understanding of the arguments that are passed into the resolver, let's see how they're being used inside the implementation of the resolver function.

#### Understanding the `feed` resolver

The `feed` resolver is implemented as follows:

```js(path=".../hackernews-node/src/index.js"&nocopy)
feed: (root, args, context, info) => {
  return context.prisma.links()
},
```

It accesses a `prisma` object on `context`. As you will see in a bit, this `prisma` object actually is a `Prisma` client instance that's imported from the generated `prisma-client` library.

This `Prisma` client instance effectively lets you access your database through the Prisma API. It exposes a number of methods that let you perform CRUD operations for your models. 

#### Understanding the `post` resolver

The `post` resolver now looks like this:

```js(path=".../hackernews-node/src/index.js"&nocopy)
post: (root, args, context) => {
  return context.prisma.createLink({
    url: args.url,
    description: args.description,
  })
},
```

Similar to the `feed` resolver, you're simply invoking a function on the `prisma` client instance which is attached to the `context`.

You're sending the `createLink` method from the Prisma client API. As arguments, you're passing the data that the resolvers receive via the `args` parameter.

So, to summarize, Prisma client exposes a CRUD API for the models in your datamodel for your to read and write in your database. These methods are auto-generated based on your model definitions in `datamodel.prisma`.  

But, how do you make sure your resolvers actually get access to that magical and often-mentioned `prisma` client instance?

### Attaching the generated Prisma client to `context`

Before doing anything else, go ahead and do what JavaScript developers love most: Add a new dependency to your project 😑

<Instruction>

In the root directory of your project (not inside `prisma`), run the following command:

```bash(path=".../hackernews-node")
yarn add prisma-client-lib
```

</Instruction>

This dependency is required to make the auto-generated Prisma client work.

Now you can attach the generated `prisma` client instance to the `context` so that your resolvers get access to it.

<Instruction>

First, import the `prisma` client instance into `index.js`. At the top of the file, add the following import statement:

```js(path=".../hackernews-node/src/index.js")
const { prisma } = require('./generated/prisma-client')
```

</Instruction>

Now you can attach it to the `context` when the `GraphQLServer` is being initialized.

<Instruction>

In `index.js`, update the instantiation of the `GraphQLServer` to look as follows:

```js{4-12}(path=".../hackernews-node/src/index.js")
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: { prisma },
})
```

</Instruction>

The `context` object that's passed into all your GraphQL resolvers is being initialized right here. Because you're attaching the `prisma` client instance to it when the `GraphQLServer` is instantiated, you can access `context.prisma` in your resolvers.

### Testing the new implementation

With these code changes, you can now go ahead and test if the new implementation with a database works as expected. As usual, run the following command in your terminal to start the GraphQL server:

```bash(path=".../hackernews-node")
node src/index.js
```

Then, open the GraphQL Playground at `http://localhost:4000`. You can send the same `feed` query and `post` mutation as before. However, the difference is that this time the submitted links will be persisted in your Prisma Cloud demo database. Therefore, if you restart the server, the `feed` query will keep returning the correct links.

> **Note**: Because you're using a demo database in Prisma Cloud, you can view the stored data in the [Prisma Cloud Console](https://app.prisma.io/). 
> ![](https://imgur.com/ZXJ8RIY.png)
