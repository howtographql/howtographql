---
title: Authentication (Part I)
pageTitle: "Server-side Authentication with GraphQL, Javascript & Node.js Tutorial"
description: "Learn best practices for implementing email-password authentication on a GraphQL Server with Javascript, Node.js & Express."
question: What kind of authentication must a GraphQL server implement?
answers: ["Username/password authentication", "Token authentication", "Any kind that uses the 'Authorization' header", "Any kind, there are no requirements regarding authentication"]
correctAnswer: 3
---

In this section, you'll learn how to implement authentication functionality for your backend.

### Securing data access

Before diving into the implementation, you have to understand how and where authentication plays a role in your server-side setup. Most notably, there are two areas where authentication and data protection are important:

- Securing access to your Graphcool database service
- Offering login functionality to your application's users

#### Securing access to your Graphcool database service

When accessing a Graphcool database service (over HTTP), you need to authenticate by attaching an authentication token to the `Authorization` field of your HTTP header. Otherwise, the request is going to fail.

> Note that you can temporarily disable the service's requirement for authentication by setting the `disableAuth` property in your `graphcool.yml` to `true`. Only then you can send requests to the service without providing the `Authorization` header field.

But where do you get this authentication token from? Well, you can actually generate it yourself, it's a [JSON web token](https://jwt.io) (JWT) that needs to be signed with the Graphcool **service secret** which is specified as the `secret` property in your `graphcool.yml`.

In most cases however (when using `graphcool-binding` or the Graphcool CLI) the JWT token is actually generated for you so you don't have to worry about that at all and all you need to do is initally provide the `secret`. This is also why the `Graphcool` instance in `index.js` receives the `secret` as a constructor argument, so it can generate JWTs under the hood. Another example is the `graphcool playground` command from the CLI. This will generate a token and set it as the `Authorization` header when the Playground is opened, so you can start sending queries and mutations right away.

#### Offering login functionality to your application's users

All right! So now you understand what the `secret` in `graphcool.yml` is actually used for and why it's passed as an argument when to the `Graphcool` constructor. This however only protects your database from unauthorized access, but it doesn't help in offering authentication functionality to the users of your application. This you need to implement yourself!

> Note that you can also try the [`node-advanced`](https://github.com/graphql-boilerplates/node-graphql-server/tree/master/advanced) GraphQL boilerplate project which comes with predefined authentication functionality.

In general, GraphQL does not require a specific authentication method! It's completely up to the developer to decide how they want to implement the authentication flow for their GraphQL server.

You'll also use JWT for user authentication in your app. This means you need to come up with another secret which will be your **application secret**. This secret is used to issue authentication tokens to your users and validate them.

For simplicity, you'll define your application secret as a global constant in this tutorial. In real-world applications, you should always make sure your secrets are properly protected, e.g. by setting them as environment variables rather than hardcoding them in your source files!

##### Signup

To signup (i.e. create a new `User` node), the following steps need to be performed:

1. The server receives a `signup` mutation with the `email` and `password` (and `name`) of a new user
1. The server creates a new user in the database and stores the `name` and `email` as well as a hashed version of the `password`
1. The server generates an authentication token (JWT) by signing the token's payload (which is the user's `id`) with the application secret
1. The server returns the authentication token and user info to the client who made the request

##### Login

1. The server receives a `login` mutation with the `email` and `password` of an existing user
1. The server compares the hashed version of the `password` that's stored with the `password` that was received in the `login` mutation
1. If the passwords match, the server generates an authentication token (JWT) by signing the token's payload (which is user's `id`) with the application secret
1. The server returns the authentication token and user info to the client who made the request

### Implementing the `signup` mutation

You'll start by implementing the `signup` mutation. But before you start doing that, go ahead and define your application secret.

<Instruction>

Create a new file in `src` and call it `utils.js`. Then add the following definition to it:

```js(path=".../hackernews-node/src/utils.js")
const APP_SECRET = 'GraphQL-is-aw3some'

module.exports = {
  APP_SECRET
}
```

</Instruction>

Next you need to add dependencies to your project which you can use to generate and validate JWTs. You'll use the [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) library for that. The second library you need is [`bcryptjs`](https://github.com/kelektiv/node.bcrypt.js/) to hash and compare passwords.

<Instruction>

In the root directory of your project, install the `jsonwebtoken` and `bcrpytjs` dependencies using npm (or yarn):

```sh(path=".../hackernews-node")
yarn add jsonwebtoken bcryptjs
```

</Instruction>

With these dependencies in place, you can start with the first step of adding new functionality to your GraphQL API: Updating the application schema!

<Instruction>

Open `src/schema.graphql` and add the `signup` mutation by adjusting the `Mutation` type like so:

```js(path=".../hackernews-node/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
}
```

</Instruction>

The `AuthPayload` type is missing in the schema, so go ahead and add it next.

<Instruction>

Still in `src/schema.graphql`, add the following type definition:

```js(path=".../hackernews-node/src/schema.graphql")
type AuthPayload {
  token: String
  user: User
}
```

</Instruction>

Now, you're in trouble again because the `User` type doesn't exist yet - neither in your data model nor in the application shema.

Let's change that and add it to the data model first!

<Instruction>

Open `database/datamodel.graphql` and add the following type definition to it:

```graphql(path=".../hackernews-node/database/datamodel.graphql")
type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
}
```

</Instruction>

This new `User` type represents the users of your application. The `password` field stores the hashed, not the original version of the user's password!

<Instruction>

To apply the changes, you need to deploy your database again. In the root directory of your project, run the following command:

```bash(path=".../hackernews-node/")
yarn graphcool deploy
```

</Instruction>

The Graphcool API now also exposes CRUD operations for the `User` type, similar to the `Link` before. Here's again a simplified version of the generated operations (check `graphcool.graphql` to see all generated operations):

```graphql(path=".../hackernews-node/src/generated/graphcool.graphql&nocopy)
type Query {
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  user(where: UserWhereUniqueInput!): User
}

type Mutation {
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteUser(where: UserWhereUniqueInput!): User
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  updateManyUsers(data: UserUpdateInput!, where: UserWhereInput!): BatchPayload!
  deleteManyUsers(where: UserWhereInput!): BatchPayload!
}
```

Great job! So now the `User` is part of our data model and of the Graphcool schema! However, it still needs to be part of the application schema as it's only referenced there but the application schema doesn't yet have access to the actual definition. So, there will be a `Couldn't find type User in any of the schemas.`-error when you're trying to start the server now.

You could now take the same approach as with the `Link` type from before and use the `import` syntax from `graphql-import`. However, this time you're actually going to _redefine_ the `User` type in the application schema. This is because you don't want to expose the `password` field through the application schema. If you were to import the `User` type like the `Link` type before, you wouldn't be able to control which fields should be exposed in your API.

<Instruction>

Open the application schema in `src/schema.graphql` and add the following type definition:

```graphql(path=".../hackernews-node/src/schema.graphql)
type User {
  id: ID!
  name: String!
  email: String!
}
```

</Instruction>

This definition of the `User` type is identical to the `User` definition in your generated Graphcool schema, except that it misses the `password` field so clients are not able to query it. Exactly what you wanted!

Now you can go and implement the resolver for the `signup` mutation.

<Instruction>

Open `Mutation.js` and add the following function to it:

```js(path=".../hackernews-node/src/resolvers/Mutation.js)
async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.db.mutation.createUser({
    data: { ...args, password },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}
```

</Instruction>

In the `signup` resolver, you're first creating the hash of the password using `bcryptjs`. Next, you're using the `Graphcool` instance from `context` to create a new `User` node in the database. Finally, you're returning the `AuthPayload` which contains a `token` and the newly created `user` object.

> **Note**: In case you wondered whether you should include a check for duplicate email addresses before invoking the `createUser` mutation in the `signup` resolver, this is not necessary. This requirement is already taken care of since the `email` field in your data model is annotated with the `@unique` directive. For fields that are annotated with this directive, Graphcool ensures that no two nodes with the same values for these fields exist.

For this function to work, you still need to import the corresponding dependencies.

<Instruction>

Still in `Mutation.js`, add the following import statements to the top of the file:

```js(path=".../hackernews-node/src/resolvers/Mutation.js)
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('../utils')
```

</Instruction>

Finally, you also need to make sure the `signup` function gets exported from this file.

<Instruction>

Adjust the export statement of `Mutation.js` like so:

```js{3}(path=".../hackernews-node/src/resolvers/Mutation.js)
module.exports = {
  post,
  signup
}
```

</Instruction>

At this point, the `signup` mutation works and you can go ahead and test it inside a Playground. For example like this:

```graphql
mutation {
  signup(email: "johndoe@graph.cool" password: "graphql" name: "John") {
    token
    user {
      id
    }
  }
}
```

### Implementing the `login` mutation

Next, you're going to implement the `login` mutation. This is going to be a lot faster since the bulk of work has already been done by implementing `signup`.

Start by adding the `login` mutation to your application schema.

<Instruction>

Open `src/schema.graphql` and adjust the `Mutation` type so it looks as follows:

```graphql{4}(path=".../hackernews-node/src/schema.graphql)
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}
```

</Instruction>

Next, you need to implement the resolver for this field.

<Instruction>

Open `src/resolvers/Mutation.js` and add the following function to it:

```js(path=".../hackernews-node/src/resolvers/Mutation.js)
async function login(parent, args, context, info) {
  const user = await context.db.query.user({ where: { email: args.email } })
  if (!user) {
    throw new Error(`Could not find user with email: ${args.email}`)
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}
```

</Instruction>

Here's what's happening in this function: You first use the `email` that was provided as an input argument to the `login` mutation to try and retrieve a `User` node from the Graphcool database service. If this is not successful, you return an error indicating that a `User` with the provided `email` does not exist. If it does exist and was succesfully retrieved from the database, you're using `bcryptjs` to compare the password hashes. If the comparison fails, you're again returning an error. This time indicating that the provided password is invalid. Finally, if the password check succeeds, you're again generating an authentication `token` and return it along with the `user` object (as required by the `AuthPayload` type in your application schema).

The last thing you need to do is export the `login` function from `Mutation.js`.

<Instruction>

Open `src/resolvers/Mutation.js` and adjust the export statement so it looks as follows:

```js{4}(path=".../hackernews-node/src/resolvers/Mutation.js)
module.exports = {
  post,
  signup,
  login
}
```

</Instruction>

This is it, you can now test the login functionality. If you've used the sample `signup` mutation from above, you can now login again and generate a new authentication token with the following mutation:

```graphql
mutation {
  login(email: "johndoe@graph.cool" password: "graphql") {
    token
  }
}
```

Note that you'll learn in the next section how you can use the received `token` to authenticate subsequent requests against your API.
