---
title: Connecting The Server and Database with Prisma Client
pageTitle: "Connecting a Database to a GraphQL Server with Prisma Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: "What is the main responsibility of the Prisma binding instance that's attached to the 'context'?"
answers: ["Expose the application schema to client applications", "Translate the GraphQL operations from the Prisma API into JavaScript functions", "Translate the GraphQL operations from the application layer into JavaScript functions", "Generate SQL queries"]
correctAnswer: 1
---

// -- TODO (robin-macpherson) --//

@nikolasburk as I was working through this myself, it was a stark difference to go from having the amazing autocompletion in the last section and then no autocompletion here while writing out these first steps. 

I'd like to re-structure the steps of this chapter so that it's a bit more intuitive and it would be great if we could get autocompletion working before they begin typing out the refactoring of the resolvers!

Below is my first effort of restructuring and re-ordering things.

Other change notes:

- I updated the original code to continue using `parent` instead of `root`. In my experience, `parent` is much more common and that's what was used in previous sections, so it felt a little jarring to suddenly switch to `root` here. Let me know if you disagree, though, since you have a lot more experience than me here!
- I decided that it would be nice to add a little more focus/emphasis on helping people become comfortable with the overall system and workflow behind a Prisma/GraphQL project. I might been a little repetitive on this point so let me know if you think so. I thought it was better to start out very clear and we can always make it a little more concise if needed.
- I changed the order in which we present and explain the information. As I was going through the original, I found myself asking questions like, "Wait, how do we have access to the `prisma` object?" and while typing "Why am I getting these errors?". The way I wrote it now feels a little smoother to me, by introducing the objective, then concepts like the `context` argument up front which we will use to accomplish that objective, and then showing it in action. In the same line of thinking, I also presented the steps of importing `PrismaClient` and setting up the `context` before then implementing the refactored resolvers. Let me know how you like this approach and educational flow! 😄

// --------------------------- //

In this section, you're going to learn how to connect your GraphQL server to the [Prisma](https://www.prisma.io) API you set up in the last chapter, which provides the interface to your database. This connection is implemented via [Prisma Client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).

### Wiring up your GraphQL schema with Prisma Client

The first thing you need to do is import your generated Prisma Client library and wire up the GraphQL server so that you can access the CRUD operations that your new Prisma API exposes in order to access your new database.

#### The GraphQL Context Resolver Argument

Remember how we said earlier that all GraphQL resolver functions _always_ receive four arguments? To accomplish this step, you'll need to get to know another one -- the `context` argument!

The `context` argument is a plain JavaScript object that every resolver in the resolver chain can read from and write to. Thus, it is basically a means for resolvers to communicate. A really helpful feature is that you can already write to the context at the moment when the GraphQL server itself is being initialized.

This means that we can attach an instance of Prisma Client to the _context_ when initializing the server and then access is from inside our resolvers via the _context_ argument!

That's all a bit theoretical, so let's see how it looks in action 💻

### Updating the resolver functions to use Prisma Client

<Instruction>

First, import `PrismaClient` into `index.js` at the top of the file:

```js(path=".../hackernews-node/src/index.js")
const { PrismaClient } = require('@prisma/client')
```

</Instruction>

Now you can attach an instance of PrismaClient to the `context` when the `GraphQLServer` is being initialized.

<Instruction>

In `index.js`, save an instance of PrismaClient to a variable and update the instantiation of the `GraphQLServer` to add is to the context as follows:

```js{4-12}(path=".../hackernews-node/src/index.js")
const prisma = new PrismaClient()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => {
    return {
      ...request,
      prisma,
    }
  },
})
```

</Instruction>

Awesome! Now, the `context` object that's passed into all your GraphQL resolvers is being initialized right here and because you're attaching an instance of `PrismaClient` (as `prisma`) to it when the `GraphQLServer` is instantiated, you'll now be able to access `context.prisma` in all of your resolvers.

Finally, it's time to refactor your resolvers. Again, we encourage you to type these changes yourself so that you can get used to Prisma's autocompletion and how to leverage that to intuitively figure out what resolvers should be on your own.

<Instruction>

Open `index.js` and remove the `links` array entirely, as well as the `idCount` variable -- you don't need those any more since the data will now be stored in an actual database.

</Instruction>

Next, you need to update the implementation of the resolver functions because they're still accessing the variables that were just deleted. Plus, you now want to return actual data from the database instead of local dummy data.

<Instruction>

Still in `index.js`, update the `resolvers` object to look as follows:

```js{4-6,8-17}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context, info) => {
      return context.prisma.link.findMany()
    },
  },
  Mutation: {
    post: (parent, args, context, info) => {
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      })
      return newLink
    },
  },
}
```

</Instruction>

Now let's understand how these new resolvers are working!

#### Understanding the `feed` resolver

The `feed` resolver is implemented as follows:

```js(path=".../hackernews-node/src/index.js"&nocopy)
feed: async (parent, args, context, info) => {
  return context.prisma.link.findMany()
},
```

It accesses the `prisma` object via the `context` argument we discussed a moment ago. As a reminder, this is actually an entire `PrismaClient` instance that's imported from the generated `@prisma/client` library, effectively allowing you to access your database through the Prisma API we set up in chapter 4.

Now, you should be able to imagine the complete system and workflow of a Prisma/GraphQL project, where our Prisma API exposes a number of methods that let you perform CRUD operations on your database models. As we add new functionality, we expose the appropriate methods to the GraphQL server via `PrismaClient` and then use them inside your resolvers via the `context` argument! 

#### Understanding the `post` resolver

The `post` resolver now looks like this:

```js(path=".../hackernews-node/src/index.js"&nocopy)
post: (parent, args, context) => {
  const newLink = context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
    },
  })
  return newLink
},
```

Similar to the `feed` resolver, you're simply invoking a function on the PrismaClient instance which is attached to the `context`.

You're calling the `create` method on a `link` from your Prisma Client API. As arguments, you're passing the data that the resolvers receive via the `args` parameter.

So, to summarize, Prisma Client exposes a CRUD API for the models in your datamodel for you to read and write in your database. These methods are auto-generated based on your model definitions in `schema.prisma`.

### Testing the new implementation

With these code changes, you can now go ahead and test if the new implementation with a database works as expected. As usual, run the following command in your terminal to start the GraphQL server:

```bash(path=".../hackernews-node")
node src/index.js
```

Then, open the GraphQL Playground at `http://localhost:4000`. You can send the same `feed` query and `post` mutation as before. However, the difference is that this time the submitted links will be persisted in your SQLite database. Therefore, if you restart the server, the `feed` query will keep returning the correct links.

// TODO (robin-macpherson): Add a section here about using Prisma Studio.