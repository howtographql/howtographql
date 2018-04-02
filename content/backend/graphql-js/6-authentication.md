---
title: Connecting server and database
pageTitle: "Mutations with a Javascript & Node.js GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with graphql-js, Javascript, Node.js & Express. Test your implementation in a GraphiQL Playground."
question: Which of these is false about GraphQL field arguments?
answers: ["They are how clients pass data to the server", "They must be included in the field schema definition", "They can be accessed inside resolvers", "Only mutation fields can have them"]
correctAnswer: 3
---

In this section, you're going to implement signup and login functionality that allows your users to authenticate against your application server.

### Adding a `User` type to your data model

The first thing you need is a way to represent user data in the database. You can achieve that by adding a `User` type to the data model.

You also want to add a _relation_ between the `User` and the already existing `Link` type to express that `Link`s are _posted_ by `User`s.

<Instruction>

Open `database/datamodel.graphql` and replace its current contents with the following:

```{5,8-14}(path=".../hackernews-node/database/datamodel.graphql")
type Link {
  id: ID! @unique
  description: String!
  url: String!
  postedBy: User
}

type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
}
```

</Instruction>

You're adding a new _relation field_ called `postedBy` to the `Link` type that points to a `User` instance. The `User` type then has a `links` field that's a list of `Link`s. This is how you express a one-to-many relationship using SDL.

After every change you're making to the data model, you need to redeploy the Prisma service to apply your changes.

<Instruction>

In the root directory of the project, run the following command:

```bash(path=".../hackernews-node")
prisma deploy
```

</Instruction>

The Prisma database schema in `src/generated/prisma.graphql` and along with it the API of the Prisma service have been updated. The API now also exposes CRUD operations for the `User` type as well operations to connect and disconnect `User` and `Link` elements according to the specified relation.

### Extending the application schema

Remember the process of schema-driven development? It all starts with extending your schema definition with the new operations that you want to add to the API - in this case a `signup` and `login` mutation.

<Instruction>

Open the application schema in `src/schema.graphql` and update the `Mutation` type as follows:

```graphql{3,4}(path=".../hackernews-node/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}
```

</Instruction>

Next, go ahead and add the `AuthPayload` along with a `User` type definition to the file.

<Instruction>

Still in `src/schema.graphql`, add the following type definitions:

```graphql(path=".../hackernews-node/src/schema.graphql")
type AuthPayload {
  token: String
  user: User
}

type User {
  id: ID!
  name: String!
  email: String!
}
```

</Instruction>

So, effectively the `signup` and `login` mutations behave very similarly. Both return information about the `User` who's signing up (or logging in) as well as a `token` which can be used to authenticate subsequent requests against the API. This information is bundled in the `AuthPayload` type.

But wait a minute 🤔 Why are you redefining the `User` type this time. Isn't this a type that could also be imported from the Prisma database schema? It sure is!

However, in this case you're using it to _hide_ certain information of the `User` type in the application schema. Namely, the `password` field (though you're going to store a hashed version of the password as you'll see soon - so even if it was exposed here clients wouldn't be able to directly query it).

### Implementing the resolver functions

After extending the schema definition with the new operations, you need to implement the resolver functions for them. Before doing so, let's actually refactor our code a bit to keep it a bit more modular!

You'll pull out the resolvers for each type into their own files.

<Instruction>

First, create a new directory called `resolvers` and add three files to it: `Query.js`, `Mutation.js` and `AuthPayload.js`. You can do so with the following commands:

```bash(path=".../hackernews-node")
mkdir src/resolvers
touch src/resolvers/Query.js
touch src/resolvers/Mutation.js
touch src/resolvers/AuthPayload.js
```

</Instruction>

Next, move the implementation of the `feed` resolver into `Query.js`.

<Instruction>

In `Query.js`, add the following function definition:

```js(path=".../hackernews-node/src/resolvers/Query.js")
function feed(parent, args, context, info) {
  return context.db.links({}, info)
}

module.exports = {
  feed,
}
```

</Instruction>

This is pretty straighforward. You're just reimplementing the same functionality from before with a dedicated function in a different file. The `Mutation` resolvers are next.

<Instruction>

Open `Mutation.js` and add the new `login` and `signup` resolvers (you'll add the `post` resolver afterwards):

```js(path=".../hackernews-node/src/resolvers/Muation.js")
async function signup(parent, args, context, info) {
  // 1
  const password = await bcrypt.hash(args.password, 10)
  // 2
  const user = await context.db.mutation.createUser({
    data: { ...args, password },
  }, `{ id }`)

  // 3
  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // 4
  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  // 5
  const user = await context.db.query.user({ where: { email: args.email } })
  if (!user) {
    throw new Error('No such user found')
  }

  // 6
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  // 7
  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
  }
}
```

</Instruction>

Let's use the good ol' numbered comments again to understand what's going on here.

1. In the `signup` mutation, the first thing to do is encrypting the `User`'s password using the `bcryptjs` library which you'll install later.
1. The next step is to use the `Prisma` binding instance to store that `User` in the database. Notice that you're hardcoding the `id` in the selection set.
1. You're then generating a JWT which is signed with an `APP_SECRET`. You still need to create this `APP_SECRET` and also install the `jwt` library that' used here.
1. Finally, you return the `token` and the `user`.
