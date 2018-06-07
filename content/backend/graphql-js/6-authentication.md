---
title: Authentication
pageTitle: "Implementing Authentication in a GraphQL server with Node.js"
description: "Learn best practices for implementing authentication and authorization with Node.js, Express & Prisma."
question: Why was the 'User' type redefined in the application schema when it's already part of the Prisma database schema and could be imported from there?
answers: ["A 'User' type can never be imported because of how graphql-import works", "To hide potentially sensitive information from client applications", "This is important so users can reset their passwords", "It's a requirement from the GraphQL specification"]
correctAnswer: 1
---

In this section, you're going to implement signup and login functionality that allows your users to authenticate against your GraphQL server.

### Adding a `User` type to your data model

The first thing you need is a way to represent user data in the database. You can achieve that by adding a `User` type to the data model.

You also want to add a _relation_ between the `User` and the already existing `Link` type to express that `Link`s are _posted_ by `User`s.

<Instruction>

Open `database/datamodel.graphql` and replace its current contents with the following:

```graphql{5,8-14}(path=".../hackernews-node/database/datamodel.graphql")
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
  links: [Link!]!
}
```

</Instruction>

So, effectively the `signup` and `login` mutations behave very similarly. Both return information about the `User` who's signing up (or logging in) as well as a `token` which can be used to authenticate subsequent requests against the API. This information is bundled in the `AuthPayload` type.

But wait a minute 🤔 Why are you redefining the `User` type this time. Isn't this a type that could also be imported from the Prisma database schema? It sure is!

However, in this case you're using it to _hide_ certain information of the `User` type in the application schema. Namely, the `password` field (though you're going to store a hashed version of the password as you'll see soon - so even if it was exposed here clients wouldn't be able to directly query it).

### Implementing the resolver functions

After extending the schema definition with the new operations, you need to implement the resolver functions for them. Before doing so, let's actually refactor your code a bit to keep it a bit more modular!

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
  return context.db.query.links({}, info)
}

module.exports = {
  feed,
}
```

</Instruction>

This is pretty straighforward. You're just reimplementing the same functionality from before with a dedicated function in a different file. The `Mutation` resolvers are next.

<Instruction>

Open `Mutation.js` and add the new `login` and `signup` resolvers (you'll add the `post` resolver afterwards):

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
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
  // 1
  const user = await context.db.query.user({ where: { email: args.email } }, ` { id password } `)
  if (!user) {
    throw new Error('No such user found')
  }

  // 2
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // 3
  return {
    token,
    user,
  }
}

module.exports = {
    signup,
    login,
    post,
}
```

</Instruction>

Let's use the good ol' numbered comments again to understand what's going on here - starting with `signup`.

1. In the `signup` mutation, the first thing to do is encrypting the `User`'s password using the `bcryptjs` library which you'll install later.
1. The next step is to use the `Prisma` binding instance to store the new `User` in the database. Notice that you're hardcoding the `id` in the selection set - nothing else. We'll discuss this in more in detail soon.
1. You're then generating a JWT which is signed with an `APP_SECRET`. You still need to create this `APP_SECRET` and also install the `jwt` library that's used here.
1. Finally, you return the `token` and the `user`.

Now on the `login` mutation:

1. Instead of _creating_ a new `User` object, you're now using the `Prisma` binding instance to retrieve the existing `User` record by the `email` address that was sent along in the `login` mutation. If no `User` with that email address was found, you're returning a corresponding error. Notice that this time you're asking for the `id` and the `password` in the selection set. The `password` is needed because it needs to be compared with the one provided in the `login` mutation.
1. The next step is to compare the provided password with the one that is stored in the database. If the two don't match up, you're returning an error as well.
1. In the end, you're returning `token` and `user` again.

The implementation of both resolvers is relatively straighforward - nothing too surprising. The only thing that's not clear right now is the hardcoded selection set containing only the `id` field. What happens if the incoming mutation requests more information about the `User`?

### Adding the `AuthPayload` resolver

For example, consider this mutation that should be possible according to the GraphQL schema definition:

```graphql(nocopy)
mutation {
  login(
    email: "sarah@graph.cool"
    password: "graphql"
  ) {
    token
    user {
      id
      name
      links {
        url
        description
      }
    }
  }
}
```

This is a normal login mutation where a bit of information about the `User` that's logging in is being requested. How does the selection set for that mutation get resolved?

With the current resolver implementation, this mutation actually wouldn't return any user data because all that could be returned about the `User` is their `id` (since that's everything that is requested from Prisma). The way how to solve this is by implementing the additional `AuthPayload` resolver and retrieve the field from the mutation's selection set there.

<Instruction>

Open `AuthPayload.js` and add the following code to it:

```js(path=".../hackernews-node/src/resolvers/AuthPayload.js")
function user(root, args, context, info) {
  return context.db.query.user({ where: { id: root.user.id } }, info)
}

module.exports = { user }
```

</Instruction>

Here is where the selection set of the incoming `login` mutation is _actually_ resolved and the requested fields are retrieved from the database.

> **Note**: This is a bit tricky to understand at first. To learn more about this topic a bit more in-depth check out the explanation in [this](https://github.com/graphcool/prisma/issues/1737) GitHub issue and read [this](https://blog.graph.cool/graphql-server-basics-demystifying-the-info-argument-in-graphql-resolvers-6f26249f613a) blog article about the `info` object.

Now let's go and finish up the implementation.

<Instruction>

First, add the required dependencies to the project:

```bash(path=".../hackernews-node/")
yarn add jsonwebtoken bcryptjs
```

</Instruction>

Next, you'll create a few utilities that are being reused in a few places.

<Instruction>

Create a new file inside the `src` directory and call it `utils.js`:

```bash(path=".../hackernews-node/")
touch src/utils.js
```

</Instruction>

<Instruction>

Now, paste the following code into it:

```js(path=".../hackernews-node/src/utils.js")
const jwt = require('jsonwebtoken')
const APP_SECRET = 'GraphQL-is-aw3some'

function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}

module.exports = {
  APP_SECRET,
  getUserId,
}
```

</Instruction>

The `APP_SECRET` is used to sign the JWTs which you're issuing for your users. It is completely independent to the `secret` that's specified in `prisma.yml`. In fact, it has nothing to do with Prisma at all, i.e. if you were to swap out the implementation of your database layer, the `APP_SECRET` would continue to be used in exactly the same way.

The `getUserId` function is a helper function that you'll call in resolvers that require authentication (such as `post`). It first retrieves the `Authorization` header (which contains the `User`'s JWT) from the incoming HTTP request. It then verifies the JWT and retrieves the user's ID from it. Notice that if that process is not successful for any reason, the function will throw an _exception_. You can therefore use it to "protect" the resolvers which require authentication.

Finally, you need to import everything into `Mutation.js`.

<Instruction>

Add the following import statements to the top of `Mutation.js`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
```

</Instruction>

### Requiring authentication for the `post` mutation

Before you're going to test your authentication flow, make sure to complete your schema/resolver setup. Right now the `post` resolver is still missing.

<Instruction>

In `Mutation.js`, add the following resolver implementation for `post`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
function post(parent, args, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.createLink(
    {
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      },
    },
    info,
  )
}
```

</Instruction>

Two things have changed in the implementation compared to the previous implementation in `index.js`:

1. You're now using the `getUserId` function to retrieve the ID of the `User` that is stored in the JWT that's set at the `Authorization` header of the incoming HTTP request. Therefore, you know which `User` is creating the `Link` here. Recall that an unsuccessful retrieval of the `userId` will lead to an exception and the function scope is exited before the `createLink` mutation is invoked.
1. You're then also using that `userId` to _connect_ the `Link` to be created with the `User` who is creating it. This is happening through the [`connect`](https://www.prisma.io/docs/reference/prisma-api/mutations-ol0yuoz6go#overview)-mutation.

Awesome! The last thing you need to do now is using the new resolver implementations in `index.js`.

<Instruction>

Open `index.js` and import the modules which now contain the resolvers at the top of the file:

```js(path=".../hackernews-node/src/index.js")
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const AuthPayload = require('./resolvers/AuthPayload')
```

</Instruction>

<Instruction>

Then, update the definition of the `resolvers` object to looks as follows:

```js(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
  Mutation,
  AuthPayload
}
```

</Instruction>

That's it, you're ready to test the authentication flow! 🔓

### Testing the authentication flow

The very first thing you'll do is test the `signup` mutation and thereby create a new `User` in the database.

<Instruction>

If you haven't done so already, stop and restart the server by first killing it with **CTRL+C**, then run `node src/index.js`. Afterwards, open a new Playground with the GraphQL CLI by running `graphql playground`.

</Instruction>

Note that you can "reuse" your Playground from before if you still have it open - it's only important that you're restarting the server so the changes you made to the implementation are actually applied.

<Instruction>

Now, send the following mutation to create a new `User`:

```graphql
mutation {
  signup(
    name: "Alice"
    email: "alice@graph.cool"
    password: "graphql"
  ) {
    token
    user {
      id
    }
  }
}
```

</Instruction>

<Instruction>

From the server's response, copy the authentication `token` and open another tab in the Playground. Inside that new tab, open the **HTTP HEADERS** pane in the bottom-left corner and specify the `Authorization` header - similar to what you did with the Prisma Playground before. Again, replace the `__TOKEN__` with the actual token:

```json
{
  "Authorization": "Bearer __TOKEN__"
}
```

</Instruction>

Whenever you're now sending a query/mutation from that tab, it will carry the authentication token.

<Instruction>

With the `Authorization` header in place, send the following to your GraphQL server:

```graphql
mutation {
  post(
    url: "www.graphql-europe.org"
    description: "Europe's biggest GraphQL conference"
  ) {
    id
  }
}
```

</Instruction>

![](https://imgur.com/jEToi1S.png)

When your server receives this mutation, it invokes the `post` resolver and therefore validates the provided JWT. Additionally, the new `Link` that was created is now connected to the `User` for which you previously sent the `signup` mutation.

To verify everything worked, you can send the following `login` mutation:

```graphql
mutation {
  login(
    email: "alice@graph.cool"
    password: "graphql"
  ) {
    token
    user {
      email
      links {
        url
        description
      }
    }
  }
}
```
