---
title: Connecting The Server and Database with Prisma Client
pageTitle:
  'Connecting a Database to a GraphQL Server with Prisma
  Tutorial'
description:
  'Learn how to add a database to your GraphQL server. The
  database is accessed using Prisma Client.'
question:
  'What is the purpose of the context argument in GraphQL
  resolvers?'
answers:
  [
    'It always provides access to a database',
    'It carries the query arguments',
    'It is used for authentication',
    'It lets resolvers communicate with each other'
  ]
correctAnswer: 3
---

In this section, you're going to learn how to connect your
GraphQL server to your database using
[Prisma](https://www.prisma.io), which provides the
interface to your database. This connection is implemented
via
[Prisma Client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).

### Wiring up your GraphQL schema with Prisma Client

The first thing you need to do is import your generated
Prisma Client library and wire up the GraphQL server so that
you can access the database queries that your new Prisma
Client exposes.

#### The GraphQL `context` resolver argument

Remember how we said earlier that all GraphQL resolver
functions _always_ receive four arguments? To accomplish
this step, you'll need to get to know another one – the
`context` argument!

The `context` argument is a plain JavaScript object that
every resolver in the resolver chain can read from and write
to. Thus, it is basically a means for resolvers to
communicate. A really helpful feature is that you can
already write to the `context` at the moment when the
GraphQL server itself is being initialized.

This means that we can attach an instance of Prisma Client
to the `context` when initializing the server and then
access is from inside our resolvers via the `context`
argument!

That's all a bit theoretical, so let's see how it looks in
action 💻

### Updating the resolver functions to use Prisma Client

<Instruction>

First, import `PrismaClient` into `index.js` at the top of
the file:

```js(path=".../hackernews-node/src/index.js")
const { PrismaClient } = require('@prisma/client')
```

</Instruction>

Now you can attach an instance of PrismaClient to the
`context` when the `GraphQLServer` is being initialized.

<Instruction>

In `index.js`, save an instance of PrismaClient to a
variable and update the instantiation of the `GraphQLServer`
to add is to the context as follows:

```js{1,9-11}(path=".../hackernews-node/src/index.js")
const prisma = new PrismaClient()

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: {
    prisma,
  }
})
```

</Instruction>

Awesome! Now, the `context` object that's passed into all
your GraphQL resolvers is being initialized right here and
because you're attaching an instance of `PrismaClient` (as
`prisma`) to it when the `GraphQLServer` is instantiated,
you'll now be able to access `context.prisma` in all of your
resolvers.

Finally, it's time to refactor your resolvers. Again, we
encourage you to type these changes yourself so that you can
get used to Prisma's autocompletion and how to leverage that
to intuitively figure out what resolvers should be on your
own.

<Instruction>

Open `index.js` and remove the `links` array entirely, as
well as the `idCount` variable – you don't need those any
more since the data will now be stored in an actual
database.

</Instruction>

Next, you need to update the implementation of the resolver
functions because they're still accessing the variables that
were just deleted. Plus, you now want to return actual data
from the database instead of local dummy data.

<Instruction>

Still in `index.js`, update the `resolvers` object to look
as follows:

```js{4-6,8-17}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context) => {
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

It accesses the `prisma` object via the `context` argument
we discussed a moment ago. As a reminder, this is actually
an entire `PrismaClient` instance that's imported from the
generated `@prisma/client` library, effectively allowing you
to access your database through the Prisma Client API you
set up in chapter 4.

Now, you should be able to imagine the complete system and
workflow of a Prisma/GraphQL project, where our Prisma
Client API exposes a number of database queries that let you
read and write data in the database.

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

Similar to the `feed` resolver, you're simply invoking a
function on the `PrismaClient` instance which is attached to
the `context`.

You're calling the `create` method on a `link` from your
Prisma Client API. As arguments, you're passing the data
that the resolvers receive via the `args` parameter.

So, to summarize, Prisma Client exposes a CRUD API for the
models in your datamodel for you to read and write in your
database. These methods are auto-generated based on your
model definitions in `schema.prisma`.

### Testing the new implementation

With these code changes, you can now go ahead and test if
the new implementation with a database works as expected. As
usual, run the following command in your terminal to start
the GraphQL server:

```bash(path=".../hackernews-node")
node src/index.js
```

Then, open the GraphQL Playground at
`http://localhost:4000`. You can send the same `feed` query
and `post` mutation as before. However, the difference is
that this time the submitted links will be persisted in your
SQLite database. Therefore, if you restart the server, the
`feed` query will keep returning the same links.

### Exploring your data in Prisma Studio

Prisma ships with a powerful database GUI where you can
interact with your data:
[Prisma Studio](https://github.com/prisma/studio).

Prisma Studio is different from a typical database GUI (such
as [TablePlus](https://tableplus.com/)) in that it provides
a layer of abstraction which allows you to see your data
represented as it is in your Prisma data model.

This is one of the several ways that Prisma bridges the gap
between how you structure and interact with your data in
your application and how it is actually structured and
represented in the underlying database. One major benefit of
this is that it helps you to build intuition and
understanding of these two linked but separate layers over
time.

Let's run Prisma Studio and see it in action!

<Instruction>

Run the following command in your terminal

```js(path=".../hackernews-node")
npx prisma studio
```

</Instruction>

Running the command should open a tab in your browser
automatically (running on `http://localhost:5555`) where you
will see the following interface. Notice that you see a tab
for your `Link` model and can also explore all models by
hovering on the far left menu:

![](https://i.imgur.com/SRIzETY.png)

![](https://i.imgur.com/JSHElJ2.png)
