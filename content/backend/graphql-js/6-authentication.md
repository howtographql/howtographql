---
title: Authentication
pageTitle: "Implementing Authentication in a GraphQL server with Node.js"
description: "Learn best practices for implementing authentication and authorization with Node.js, Express & Prisma."
question: Why was the 'User' type redefined in the application schema when it's already part of the Prisma database schema and could be imported from there?
answers: ["A 'User' type can never be imported because of how graphql-import works", "To hide potentially sensitive information from client applications", "This is important so users can reset their passwords", "It's a requirement from the GraphQL specification"]
correctAnswer: 1
---

In this section, you're going to implement signup and login functionality that allows your users to authenticate against your GraphQL server.

### Adding a `User` model

The first thing you need is a way to represent user data in the database. You can achieve that by adding a `User` type to your Prisma datamodel.

You also want to add a _relation_ between the `User` and the already existing `Link` type to express that `Link`s are _posted_ by `User`s.

<Instruction>

Open `prisma/datamodel.prisma` and replace its current contents with the following:

```graphql{5,8-14}(path=".../hackernews-node/prisma/datamodel.prisma")
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

After every change you're making to the datamodel file, you need to redeploy the Prisma API to apply your changes and migrate the underleying database schema.

<Instruction>

In the root directory of the project, run the following command:

```bash(path=".../hackernews-node")
prisma deploy
```

</Instruction>

This now updated the Prisma API. You also need to update the auto-generated Prisma client so that it can expose CRUD methods for the newly added `User` model.

<Instruction>

In the same directory, run the following command:

```bash(path=".../hackernews-node")
prisma generate
```

</Instruction>

Right now, it is a bit annoying that you need to explicitly run `prisma generate` every time you're migrating your database with `prisma deploy`. To make that easier in the future, you can configure a [post-deployment hook](https://www.prisma.io/docs/prisma-cli-and-configuration/prisma-yml-5cy7/#hooks-optional) that gets invoked every time after you ran `prisma deploy`.

<Instruction>

Add the following lines to the end of your `prisma.yml`:

```yml(path=".../hackernews-node/prisma/prisma.yml")
hooks:
  post-deploy:
    - prisma generate
```

</Instruction>

The Prisma client will now automatically be regenerated upon a datamodel change. 

### Extending the GraphQL schema

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

The `signup` and `login` mutations behave very similar. Both return information about the `User` who's signing up (or logging in) as well as a `token` which can be used to authenticate subsequent requests against your GraphQL API. This information is bundled in the `AuthPayload` type.

<Instruction>

Finally, you need to reflect that the relation between `User` and `Link` should be bi-directional by adding the `postedBy` field to the existing `Link` model definition in `schema.graphql`:

```graphql{5}(path=".../hackernews-node/src/schema.graphql")
type Link {
  id: ID!
  description: String!
  url: String!
  postedBy: User
}
```

</Instruction>

### Implementing the resolver functions

After extending the schema definition with the new operations, you need to implement resolver functions for them. Before doing so, let's actually refactor your code a bit to keep it more modular!

You'll pull out the resolvers for each type into their own files.

<Instruction>

First, create a new directory called `resolvers` and add three files to it: `Query.js`, `Mutation.js`, `User.js` and `Link.js`. You can do so with the following commands:

```bash(path=".../hackernews-node")
mkdir src/resolvers
touch src/resolvers/Query.js
touch src/resolvers/Mutation.js
touch src/resolvers/User.js
touch src/resolvers/Link.js
```

</Instruction>

Next, move the implementation of the `feed` resolver into `Query.js`.

<Instruction>

In `Query.js`, add the following function definition:

```js(path=".../hackernews-node/src/resolvers/Query.js")
function feed(parent, args, context, info) {
  return context.prisma.links()
}

module.exports = {
  feed,
}
```

</Instruction>

This is pretty straighforward. You're just reimplementing the same functionality from before with a dedicated function in a different file. The `Mutation` resolvers are next.

#### Adding authentication resolvers

<Instruction>

Open `Mutation.js` and add the new `login` and `signup` resolvers (you'll add the `post` resolver in a bit):

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
async function signup(parent, args, context, info) {
  // 1
  const password = await bcrypt.hash(args.password, 10)
  // 2
  const user = await context.prisma.createUser({ ...args, password })

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
  const user = await context.prisma.user({ email: args.email })
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

1. In the `signup` mutation, the first thing to do is encrypting the `User`'s password using the `bcryptjs` library which you'll install soon.
1. The next step is to use the `prisma` client instance to store the new `User` in the database.
1. You're then generating a JWT which is signed with an `APP_SECRET`. You still need to create this `APP_SECRET` and also install the `jwt` library that's used here.
1. Finally, you return the `token` and the `user` in an object that adheres to the shape of an `AuthPayload` object from your GraphQL schema.

Now on the `login` mutation:

1. Instead of _creating_ a new `User` object, you're now using the `prisma` client instance to retrieve the existing `User` record by the `email` address that was sent along as an argument in the `login` mutation. If no `User` with that email address was found, you're returning a corresponding error.
1. The next step is to compare the provided password with the one that is stored in the database. If the two don't match, you're returning an error as well.
1. In the end, you're returning `token` and `user` again.

Let's go and finish up the implementation.

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

Now, add the following code to it:

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

The `APP_SECRET` is used to sign the JWTs which you're issuing for your users.

The `getUserId` function is a helper function that you'll call in resolvers which require authentication (such as `post`). It first retrieves the `Authorization` header (which contains the `User`'s JWT) from the `context`. It then verifies the JWT and retrieves the `User`'s ID from it. Notice that if that process is not successful for any reason, the function will throw an _exception_. You can therefore use it to "protect" the resolvers which require authentication.

<Instruction>

To make everything work, be sure to add the following import statements to the top of `Mutation.js`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
```

</Instruction>

Right now, there's one more minor issue. You're accessing a `request` object on the `context`. However, when initializing the `context`, you're really only attaching the `prisma` client instance to it - there's no `request` object yet that could be accessed.

<Instruction>

To change this, open `index.js` and adjust the instantiation of the `GraphQLServer` as follows:

```js{4-9}(path=".../hackernews-node/src/index.js")
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
})
```

</Instruction>

Instead of attaching an object directly, you're now creating the `context` as a function which _returns_ the `context`. The advantage of this approach is that you can attach the HTTP request that carries the incoming GraphQL query (or mutation) to the `context` as well. This will allow your resolvers to read the `Authorization` header and validate if the user who submitted the request is eligible to perform the requested operation.

### Requiring authentication for the `post` mutation

Before you're going to test your authentication flow, make sure to complete your schema/resolver setup. Right now the `post` resolver is still missing.

<Instruction>

In `Mutation.js`, add the following resolver implementation for `post`:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
function post(parent, args, context, info) {
  const userId = getUserId(context)
  return context.prisma.createLink({
    url: args.url,
    description: args.description,
    postedBy: { connect: { id: userId } },
  })
}
```

</Instruction>

Two things have changed in the implementation compared to the previous implementation in `index.js`:

1. You're now using the `getUserId` function to retrieve the ID of the `User`. This ID is stored in the JWT that's set at the `Authorization` header of the incoming HTTP request. Therefore, you know which `User` is creating the `Link` here. Recall that an unsuccessful retrieval of the `userId` will lead to an exception and the function scope is exited before the `createLink` mutation is invoked. In that case, the GraphQL response will just contain an error indicating that the user was not authenticated.
1. You're then also using that `userId` to _connect_ the `Link` to be created with the `User` who is creating it. This is happening through a [nested object write](https://www.prisma.io/docs/-rsc6#nested-object-writes).

#### Resolving relations

There's one more thing you need to do before you can launch the GraphQL server again and test the new functionality: Ensuring the relation between `User` and `Link` getrs properly resolved.

Notice how we've omitted all resolvers for _scalar_ values from the `User` and `Link` types? These are following the simple pattern that we saw at the beginning of the tutorial:

```(nocopy)
Link: {
  id: parent => parent.id,
  url: parent => parent.url,
  description: parent => parent.description,
}
```

However, we've now added two fields to our GraphQL schema that can _not_ be resolved in the same way: `postedBy` on `Link` and `links` on `User`. These fields need to be explicitly implemented because our GraphQL server can not infer where to get that data from.

<Instruction>

To resolve the `postedBy` relation, open `Link.js` and add the following code to it:

```js(path=".../hackernews-node/src/resolvers/Link.js")
function postedBy(parent, args, context) {
  return context.prisma.link({ id: parent.id }).postedBy()
}

module.exports = {
  postedBy,
}
```

</Instruction>

In the `postedBy` resolver, you're first fetching the `Link` using the `prisma` client instance and then invoke `postedBy` on it. Notice that the resolver needs to be called `postedBy` because it resolves the `postedBy` field from the `Link` type in `schema.graphql`. 

You can resolver the `links` relation in a similar way.

<Instruction>

Open `User.js` and add the following code to it:

```js(path=".../hackernews-node/src/resolvers/User.js")
function links(parent, args, context) {
  return context.prisma.user({ id: parent.id }).links()
}

module.exports = {
  links,
}
```

</Instruction>

#### Putting it all together

Awesome! The last thing you need to do now is use the new resolver implementations in `index.js`.

<Instruction>

Open `index.js` and import the modules which now contain the resolvers at the top of the file:

```js(path=".../hackernews-node/src/index.js")
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
```

</Instruction>

<Instruction>

Then, update the definition of the `resolvers` object to looks as follows:

```js(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query,
  Mutation,
  User,
  Link
}
```

</Instruction>

That's it, you're ready to test the authentication flow! 🔓

### Testing the authentication flow

The very first thing you'll do is test the `signup` mutation and thereby create a new `User` in the database.

<Instruction>

If you haven't done so already, stop and restart the server by first killing it with **CTRL+C**, then run `node src/index.js`. Afterwards, navigate to `http://localhost:4000` where the GraphQL Playground is running.

</Instruction>

Note that you can "reuse" your Playground from before if you still have it open - it's only important that you're restarting the server so the changes you made to the implementation are actually applied.

<Instruction>

Now, send the following mutation to create a new `User`:

```graphql
mutation {
  signup(
    name: "Alice"
    email: "alice@prisma.io"
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

From the server's response, copy the authentication `token` and open another tab in the Playground. Inside that new tab, open the **HTTP HEADERS** pane in the bottom-left corner and specify the `Authorization` header - similar to what you did with the Prisma Playground before. Replace the `__TOKEN__` placeholder in the following snippet with the copied token:

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
    url: "www.graphqlconf.org"
    description: "An awesome GraphQL conference"
  ) {
    id
  }
}
```

</Instruction>

![](https://imgur.com/V1hp4ID.png)

When your server receives this mutation, it invokes the `post` resolver and therefore validates the provided JWT. Additionally, the new `Link` that was created is now connected to the `User` for which you previously sent the `signup` mutation.

To verify everything worked, you can send the following `login` mutation:

```graphql
mutation {
  login(
    email: "alice@prisma.io"
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

This will return a response similar to this:

```json(nocopy)
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjanBzaHVsazJoM3lqMDk0NzZzd2JrOHVnIiwiaWF0IjoxNTQ1MDYyNTQyfQ.KjGZTxr1jyJH7HcT_0glRInBef37OKCTDl0tZzogekw",
      "user": {
        "email": "alice@prisma.io",
        "links": [
          {
            "url": "www.graphqlconf.org",
            "description": "An awesome GraphQL conference"
          }
        ]
      }
    }
  }
}
```