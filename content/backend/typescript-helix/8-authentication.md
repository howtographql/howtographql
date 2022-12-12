---
title: Authentication 
pageTitle: 'Implementing Authentication in a GraphQL server with Node.js'
description: 'Learn best practices for implementing authentication and authorization with Node.js, TypeScript, Fastify & Prisma.'
question: 'Which is JWT?'
answers: ["Standard for creating web tokens", "Standard for creating GraphQL servers", "Standard for connecting with database", "Standard to execute queries"]
correctAnswer: 0
---

In this section, you're going to implement signup and login functionality that allows your users to authenticate against your GraphQL server.

### Adding a `User` model

The first thing you need is a way to represent user data in the database. To do so, you can add a `User` type to your Prisma data model.

You'll also want to add a _relation_ between the `User` and the existing `Link` type to express that `Link`s are _posted_ by `User`s.

<Instruction>

Open `prisma/schema.prisma` and add the following code, making sure to also update your existing `Link` model accordingly:

```graphql{6-7,10-16}(path="hackernews-node-ts/prisma/schema.prisma)
model Link {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String
  url         String
  postedBy    User?    @relation(fields: [postedById], references: [id])
  postedById  Int?
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  links     Link[]
}
```

</Instruction>

Now you see even more how Prisma helps you to reason about your data in a way that is more aligned with how it is represented in the underlying database.

### Understanding relation fields

Notice how you're adding a new _relation field_ called `postedBy` to the `Link` model that points to a `User` instance. The `User` model then has a `links` field that's a list of
`Link`s.

To do this, you need to also define the relation by annotating the `postedBy` field with
[the `@relation` attribute](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#the-relation-attribute). This is required for every relation field in
your Prisma schema, and all you're doing is defining what the foreign key of the related table will be. So in this case, we're adding an extra field to store the `id` of the `User` who posts a `Link`, and then telling Prisma that `postedById` will be equal to the `id` field in the `User` table (if you are familiar with SQL, this kind of relation is being represented as one-to-many).

If this is quite new to you, don't worry! We're going to be adding a few of these relational fields and you'll get the hang of it as you go! For a deeper dive on relations with Prisma, check out these [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations).

### Updating Prisma Client

This is a great time to refresh your memory on the workflow we described for your project at the end of chapter 4!

After every change you make to the data model, you need to migrate your database and then re-generate Prisma Client.

<Instruction>

In the root directory of the project, run the following command:

```bash
npx prisma migrate dev --name "add-user-model"
```

</Instruction>

This command has now generated your second migration inside of `prisma/migrations`, and you can start to see how this becomes a historical record of how your database evolves over
time. This script also run the Prisma migration, so your new models and types are ready-to-use.

</Instruction>

That might feel like a lot of steps, but the workflow will become automatic by the end of this tutorial!

Your database is ready and Prisma Client is now updated to expose all the CRUD queries for the newly added `User` model – woohoo! 🎉

### Extending the GraphQL schema

Remember back when we were setting up your GraphQL server and discussed the process of schema-driven development? It all starts with extending your schema definition with the new
operations that you want to add to the API - in this case a `signup` and `login` mutation.

<Instruction>

Open the application schema in `src/schema.graphql` and update schema types as follows:

```graphql{8-9,18-28}(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed: [Link!]!
}

type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}

type Link {
  id: ID!
  description: String!
  url: String!
}

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

The `signup` and `login` mutations behave very similarly: both return information about the `User` who's signing up (or logging in) as well as a `token` which can be used to
authenticate subsequent requests against your GraphQL API. This information is bundled in the `AuthPayload` type.

<Instruction>

Finally, you need to reflect that the relation between `User` and `Link` should be bi-directional by adding the `postedBy` field to the existing `Link` model definition in
`schema.ts`:

```graphql{5}(path="hackernews-node-ts/src/schema.graphql)
type Link {
  id: ID!
  description: String!
  url: String!
  postedBy: User
}
```

</Instruction>

### Implementing the resolver functions

After extending the schema definition with the new operations, you need to implement resolver functions for them. 


#### Setup for authentication

In this tutorial, you will implement simple, naive implementation of a JWT (Json Web Token) implementation. This is a simple solution for creating token-based authentication.

You'll also use `bcryptjs` for simple encryption for the user's password.

<Instruction>

Start by installing `jsonwebtoken` library from NPM:

```bash
npm install --save jsonwebtoken bcryptjs
```

</Instruction>

<Instruction>

And to get better integration with TypeScript, you need to install the typings library:

```bash
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

</Instruction>

<Instruction>

Create a new file called `src/auth.ts`, and for now just app a simple variable to hold our signing secret (you'll later use that as the base for our encryption):

```typescript{1}(path="hackernews-node-ts/src/auth.ts)
export const APP_SECRET = 'this is my secret';
```

</Instruction>

#### Implementing signup resolvers

<Instruction>

Open `src/schema.ts` and add the new `signup` resolver, under `Mutation`:

```typescript{2-4,9-29}(path="hackernews-node-ts/src/schema.ts)
// ... other imports ...
import { APP_SECRET } from "./auth";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

const resolvers = {
  // ... other resolvers ...
  Mutation: {
    signup: async (
      parent: unknown,
      args: { email: string; password: string; name: string },
      context: GraphQLContext
    ) => {
      // 1
      const password = await hash(args.password, 10);

      // 2
      const user = await context.prisma.user.create({
        data: { ...args, password },
      });

      // 3
      const token = sign({ userId: user.id }, APP_SECRET);

      // 4
      return {
        token,
        user,
      };
    },
  }
}
```

</Instruction>

Let's use the good ol' numbered comments again to understand what's going on here – starting with `signup`.

1. In the `signup` mutation, the first thing to do is encrypt the `User`'s password using the `bcryptjs` library which you'll install soon.
1. The next step is to use your `PrismaClient` instance (via `prisma` as we covered in the steps about `context`) to store the new `User` record in the database.
1. You're then generating a JSON Web Token which is signed with an `APP_SECRET`. You still need to create this `APP_SECRET` and also install the `jwt` library that's used here.
1. Finally, you return the `token` and the `user` in an object that adheres to the shape of an `AuthPayload` object from your GraphQL schema.

You can now open GraphiQL and play around with your new schema and resolvers, try to run the following mutations:

```graphql
mutation {
  signup(email: "test@mail.com", name: "Dotan Simha", password: "123456") {
    token
    user {
      id
      name
      email
    }
  }
}
```

![signup mutation](https://i.imgur.com/MjSZyM4.png)

#### Implementing login resolvers

Now, the `login` mutation, add it under the `signup` resolvers. 

<Instruction>

Add the following right under the `signup` mutation:

```typescript{2,7-33}(path="hackernews-node-ts/src/schema.ts)
// ... other imports ...
import { hash, compare } from "bcryptjs";

const resolvers = {
  // ... other resolvers ...
  Mutation: {
    login: async (
      parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) => {
      // 1
      const user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });
      if (!user) {
        throw new Error("No such user found");
      }

      // 2
      const valid = await compare(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = sign({ userId: user.id }, APP_SECRET);

      // 3
      return {
        token,
        user,
      };
    },
  }
}

```

</Instruction>

And if you'll open Playground, you should be able to login with the user you previously created:

```graphql
mutation {
  login(email: "test@mail.com", password: "123456") {
    token
    user {
      id
      name
      email
    }
  }
}
```

![login mutation](https://i.imgur.com/mEy6vqY.png)

> You should be able to get the information of the user. **Please save the authentication token you get, we'll need that on the next step!**

Now on the `login` mutation!

1. Instead of _creating_ a new `User` object, you're now using your `PrismaClient` instance to retrieve an existing `User` record by the `email` address that was sent along as an
   argument in the `login` mutation. If no `User` with that email address was found, you're returning a corresponding error.
1. The next step is to compare the provided password with the one that is stored in the database. If the two don't match, you're returning an error as well.
1. In the end, you're returning `token` and `user` again.

### Detecting the current user

Now, you have our users database ready to use, and our next step is to be able to detect who's the current user that queries the server.

To do that, you'll need to add the option to pass the authentication token along with our GraphQL operation.

You are not going to use the GraphQL schema in this case, since you don't want to mix the authentication flow with the GraphQL contract that you have. So you'll use HTTP headers.

The authentication token will be passed as a HTTP header, in the following form:

```
Authorization: "Bearer MY_TOKEN_HERE"
```

To add support for this kind of authentication in our server, you'll need to be able to access the raw incoming HTTP request, then verify the token and identify the current user.

You also want to be able to tell who's the current authenticated user during our resolvers, so you'll inject the current user into the GraphQL `context`.

So let's do that: 

<Instruction>

You'll now modify the context building phase of your GraphQL server, by detecting the current authenticated user. Use the following code in `src/auth.ts` and add a function for that:

```typescript{1,2,3,7-20}(path="hackernews-node-ts/src/auth.ts)
import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { JwtPayload, verify } from "jsonwebtoken";

export const APP_SECRET = "this is my secret";

export async function authenticateUser(prisma: PrismaClient, request: FastifyRequest): Promise<User | null> {
  if (request?.headers?.authorization) {
    // 1
    const token = request.headers.authorization.split(" ")[1];
    // 2
    const tokenPayload = verify(token, APP_SECRET) as JwtPayload;
    // 3
    const userId = tokenPayload.userId;
    // 4
    return await prisma.user.findUnique({ where: { id: userId } });
  }

  return null;
}
```

</Instruction>

So what happened here?

1. Take the `Authorization` for the incoming HTTP request headers.
2. Use `verify` of `jsonwebtoken` to check that the token is valid, and extract the `userId` from the token payload. 
3. Use Prisma API to fetch the user from the database.
4. Return the current user, or `null` in case of missing/invalid token.

<Instruction>

Now, modify your `contextFactory` in `src/context.ts` function to call this function:

```typescript{1,2,3,9,12-19}(path="hackernews-node-ts/src/context.ts)
import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { authenticateUser } from "./auth";

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  currentUser: User | null;
};

export async function contextFactory(
  request: FastifyRequest
): Promise<GraphQLContext> {
  return {
    prisma,
    currentUser: await authenticateUser(prisma, request),
  };
}
```

</Instruction>

<Instruction>

And to make sure that your `contextFactory` has access to the incoming HTTP request, make sure to pass it in `src/index.ts` while building the context:

```typescript{5}(path="hackernews-node-ts/src/index.ts)
const result = await processRequest({
  request,
  schema,
  operationName,
  contextFactory: () => contextFactory(req),
  query,
  variables,
});
```

</Instruction>

Now, every incoming GraphQL request that has a valid token and a user, will also have the `context.currentUser` available with the authenticated user details. If an incoming request doesn't have that, the `context.currentUser` will be set to `null`. 

So that's really cool, and to test that, you can add a new GraphQL field under `type Query` called `me` that just exposes the current user information.

<Instruction>

Start by adding the `me` field to the GraphQL schema under `Query`:

```graphql{4}(path="hackernews-node-ts/src/schema.graphql)
type Query {
  info: String!
  feed: [Link!]!
  me: User!
}
```

And then implement the resolver for this new field:

```typescript{3-9}(path="hackernews-node-ts/src/schema.ts)
const resolvers = {
  Query: {
    me: (parent: unknown, args: {}, context: GraphQLContext) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }

      return context.currentUser;
    },
  }
}
```

</Instruction>

You can now try it in GraphiQL with the following query:

```graphql
query {
  me {
    id
    name
  }
}
```

And under the `HEADERS` section of GraphiQL, add your authentication token in the following structure:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

And if you'll run it, you'll see that the GraphQL server now being able to authenticate you based on the token!

![me query](https://i.imgur.com/FPsbGsr.png)

### Connecting other resolvers

If you remember, you added more new fields to the GraphQL schema (such as `Link.postedBy`), so let's implement the missing resolvers!

To make sure our server knows how to identify the creator of each `Link`, let's modify the resolver of `Mutation.post` to ensure that only authenticated users can use it, and also add the current authenticated user id to the object created on our database.

#### Protecting resolvers

Let's go and finish up the implementation, and connect everything together with the rest of the resolvers.

<Instruction>

Modify `src/schema.ts` and change the resolver of `post` field to the following:

```typescript{3-6,12}(path="hackernews-node-ts/src/schema.ts)
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

      return newLink;
    },
  }
}
```

</Instruction>

You can now try it from GraphiQL: 

```graphql
mutation {
  post(url: "www.graphqlconf.org", description: "An awesome GraphQL conference") {
    id
  }
}
```

![carrying the authentication token](https://i.imgur.com/euuurSz.png)

#### Resolving relations

There's one more thing you need to do before you can launch the GraphQL server again and test the new functionality: ensuring the relation between `User` and `Link` gets properly
resolved.

<Instruction>

To resolve the `postedBy` relation, open `src/schema.ts` and add the following code to your resolvers:

```typescript{6-14}(path="hackernews-node-ts/src/schema.ts)
const resolvers = {
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
    postedBy: async (parent: Link, args: {}, context: GraphQLContext) => {
      if (!parent.postedById) {
        return null;
      }

      return context.prisma.link
        .findUnique({ where: { id: parent.id } })
        .postedBy();
    },
  },
}
```

</Instruction>

In the `postedBy` resolver, you're first fetching the `Link` from the database using the `prisma` instance and then invoke `postedBy` on it. Notice that the resolver needs to be
called `postedBy` because it resolves the `postedBy` field from the `Link` type in our type-definitions.

You can resolve the `links` relation in a similar way.

<Instruction>

In `src/schema.ts`, add a field resolvers for `User.links` to your `resolvers` variable:

```typescript{6-14}(path="hackernews-node-ts/src/schema.ts)
// ... other imports ...
import { Link, User } from "@prisma/client";

// ... other resolvers ...
const resolvers = {
  User: {
    links: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).links(),
  },
}
```

</Instruction>

That's all! Now you have resolvers for all fields, and you can signup, login, identify the user as part of our GraphQL server!

You should be able to run complex GraphQL queries, for example:

```graphql
query {
  feed {
    id
    description
    url
    postedBy {
      id
      name
    }
  }
}
```

![linked types example](https://i.imgur.com/gjm7nxj.png)