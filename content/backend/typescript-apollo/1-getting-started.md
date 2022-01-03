---
title: Getting Started
pageTitle: 'Getting Started with GraphQL, TypeScript and Apollo'
description:
  'Learn how to setup a GraphQL server with TypeScript & Apollo as well as best practices for defining the GraphQL schema.'
question: 'What role do the root fields play for a GraphQL API?'
answers:
  [
    'The three root fields are: Query, Mutation and Subscription',
    'Root fields implement the available API operations',
    'Root fields define the available API operations',
    'Root field is another term for selection set'
  ]
correctAnswer: 2
---

In this section, you will set up the project for your GraphQL server, create your first GraphQL schema and run your first query. In the end,
you will understand some theory behind GraphQL and concepts related to the
[GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e).

### Checking your node version

Before you begin, make sure that you are using a suitable version of Node.js. For this tutorial, your Node.js version should be `v12` or above. 

<Instruction>

Use the following command to check the version of `node` you are using:
```bash
node --version
```

</Instruction>

If you need to upgrade your Node.js version, you can do so directly from the [Node.js website](https://nodejs.org/en/) or using a version manager such as [nvm](https://github.com/nvm-sh/nvm). 

### Creating the project

This tutorial teaches you how to build a GraphQL server from scratch, so the first thing you need to do is create the
directory that'll hold the files for your GraphQL server!

<Instruction>

Open your terminal, navigate to a location of your choice, and run the following commands:

```bash
mkdir hackernews-typescript
cd hackernews-typescript
npm init -y
```

</Instruction>

This creates a new directory called `hackernews-typescript` and initializes it with a `package.json` file. `package.json` is
the configuration file for the Node.js app you're building. It lists all dependencies and other configuration options
(such as _scripts_) needed for the app.


### Installing and configuring TypeScript

Since this is a TypeScript tutorial, you will need to install `typescript`. You will also install `ts-node-dev`, which will enable you to transpile your TS files on the fly and restart your API on changes. You will soon see that this functionality will come in very handy during development. You will also need a `tsconfig.json` file to specify various TypeScript compiler options. 

<Instruction>

In your terminal, go to the directory you created previously and install `typescript` and `ts-node-dev` as dev dependencies. You will also create a `tsconfig.json` file:

```bash(path=".../hackernews-typescript/")
npm install --save-dev typescript@^4.3.5 ts-node-dev@^1.1.8
touch tsconfig.json              
```

</Instruction>

> **Note**: The above code block is annotated with a directory name. It indicates where you need to execute the terminal command.

Great! Now that you have an empty `tsconfig` file, you need to specify the configuration options. For this project, you will use fairly standard options.

<Instruction> 

Copy paste the configuration to your `tsconfig.json`:

```json(path=".../hackernews-typescript/tsconfig.json")
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "lib": [
      "esnext"
    ],
    "strict": true,
    "rootDir": ".",
    "outDir": "dist",
    "sourceMap": true,
    "esModuleInterop": true
  }
}
```
</Instruction>

> **Note:** Setting `"strict": true` enables a wide range of type checking behavior that results in more type-safe programs. However it can also lead to some type errors that are actually rather benign. If you get stuck with a type error that you know isn't a bug, but you are having difficulty satisfying the TypeScript compiler, you could consider turning this to `false` or using the `// @ts-ignore` comment to turn off that specific error/warning. 


To learn more about the options used here, you can check out the [tsconfig reference](https://www.typescriptlang.org/tsconfig) in the TypeScript documentation. 

### Creating your server layout


Before writing any code, you will need to install some dependencies. You will need `nexus` for generating the GraphQL schema. You will also need to install `graphql` and `apollo-server` for creating an HTTP web server with GraphQL capabilities. 

<Instruction>

Install the necessary packages along with their type definitions:

```bash
npm install apollo-server@^3.1.1 graphql@^15.5.1 nexus@^1.1.0
```

</Instruction>

[`apollo-server`](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server) is a fully-featured
GraphQL server. It is based on [Express.js](https://expressjs.com/) and a few other libraries to help you build
production-ready GraphQL servers.

Here's a list of some cool features it has:

- GraphQL spec-compliant
- Out-of-the-box support for two GraphQL clients: Apollo Explorer and GraphQL Playground 
- Can be configured for use with an [Express](https://expressjs.com/) server
- Query performance tracing
- Runs everywhere: Can be deployed via Vercel, Standard VMs, AWS Lambda, Heroku etc.

[ Nexus](https://github.com/graphql-nexus/nexus) is a library to create type-safe GraphQL schemas with a [code-first](https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3) approach (since you write standard JavaScript/TypeScript code to define what your schema will look like, hence "code-first"). 

It has a number of great features:   

- Expressive, declarative API for building schemas
- Full type-safety for free
- Auto-generated GraphQL SDL (`schema.graphql` file)
- Works out of the box with existing GraphQL frameworks and middleware (`apollo-server`, `graphql-middleware`, etc.) 

With the project directory in place and dependencies installed, you will now set up a rudimentary GraphQL server. To start off, you will need two files: 
- `schema.ts` for generating the schema with Nexus
- `index.ts` for creating a GraphQL web server with Apollo

<Instruction>

Create a `src` folder, create the necessary TypeScript files:

```bash(path=".../hackernews-typescript/")
mkdir src
touch src/schema.ts src/index.ts
```

</Instruction>


### Setting up Nexus

Finally it's time to write some code 🙌. You will now setup Nexus in your project to create a very basic GraphQL schema. 

<Instruction>

Open `src/schema.ts` and type the following code:

```typescript(path="../hackernews-typescript/src/schema.ts")
import { makeSchema } from 'nexus'
import { join } from 'path'

export const schema = makeSchema({
  types: [], // 1
  outputs: {
    schema: join(__dirname, '..', 'schema.graphql'), // 2
    typegen: join(__dirname, '..', 'nexus-typegen.ts'), // 3
  },
})
```
</Instruction>

All right, let’s understand what’s going on here by walking through the numbered comments:

1. Your GraphQL schema will consist of many types that you will pass as an array to the `types` object. For now, it is intentionally kept empty.  
2. The first output file that Nexus will generate for you is a GraphQL `schema` file of type `.graphql`. This is the GraphQL _Schema Definition Language_ (SDL) for defining the structure of your API. You will learn more about this later in the chapter!
3. The second output file is a TypeScript file known as `typegen`, which will contain TypeScript type definitions for all types in your GraphQL schema. These generated types will help ensure typesafety in your application code and keep your GraphQL schema _definition_ in sync with your schema _implementation_. Again, more on this later. 

Let's see what happens when we run this code. 

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-typescript/")
npx ts-node --transpile-only src/schema
```

</Instruction>

After running the script you should see two new files inside your root folder, `schema.graphql` and `nexus-typegen.ts`; these were generated by Nexus. 

The `schema.graphql` file contains a type called `Query` with a single field `ok`. This was created as a default schema, as you did not give Nexus any further information about what types you want in the schema.

```graphql(path=".../hackernews-typescript/schema.graphql"&nocopy)
type Query {
  ok: Boolean!
}
```

The `nexus-typegen.ts` contains a lot of auto-generated TypeScript `interface` and `type` definitions. You won't have to dig too deep into these, as these will be added automatically to your Nexus function signatures. Though at certain times, you might look up a type from here and use it manually in your code. 

Before you move on to the next section, you will add a `generate` script to your `package.json` so you can quickly regenerate your schema at any time. You will also add another `dev` script, which will come in handy in the next section to start our web server. 

<Instruction>

Add the `generate` and `dev` script to your `package.json`:

```json{3-4}(path=".../hackernews-typescript/package.json")
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "ts-node-dev --transpile-only --no-notify --exit-child src/index.ts",
    "generate": "ts-node --transpile-only src/schema.ts"
  },
```
</Instruction>

1. You can run `npm run generate` to update your `schema.graphql` and `nexus-typegen.ts` file when there are any changes in your Nexus code.
2. You can use `npm run dev` to start the web server and watch for any changes. 

### Creating a GraphQL server

Now that you have a schema, you can finally create your GraphQL server inside `index.ts`. 

<Instruction>

Write up the following code to start the server in `src/index.ts`:

```typescript(path=".../hackernews-typescript/src/index.ts")
import { ApolloServer } from "apollo-server";

// 1
import { schema } from "./schema";
export const server = new ApolloServer({
    schema,
});

const port = 3000;
// 2
server.listen({port}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

```

</Instruction>

Let's understand what's going on here by walking through the numbered comments: 

1. The `schema` object you created using Nexus defines your [GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e). You need to provide this when instantiating your server since that's how Apollo Server knows which API operations to support in the GraphQL API.

2. You start the server and specify the port. After the server starts, it returns a `url` string inside a promise. 

Now that your server is ready let's give it a run and see what happens!

<Instruction> 

Open up your terminal and run the following command:

```bash(path=".../hackernews-typescript/")
npm run dev
```

</Instruction>

If everything goes well, you should see the following output inside the terminal:


```(nocopy)
🚀  Server ready at http://localhost:3000/
```

Now if you navigate to `http://localhost:3000/` you should see the following page: 

![Apollo Server Landing Page](https://i.imgur.com/2bOq8c1.png)

If you click on the **Query your server** button, you will be redirected to the Apollo Studio Explorer. This is an _online web-based GraphQL IDE_ for running queries and exploring your schema (along with many other advanced features). 

> **Note:** If you'd prefer an _offline_ IDE that does not need access to the internet, there's a section covering this at the bottom of this chapter. 

![Apollo Studio Explorer](https://i.imgur.com/jsDqCAi.png)

In the **Schema** tab placed on the left (the first icon under the Apollo logo), you can see the entire GraphQL schema. There's not much there right now, but in the future it will come in handy to explore the details of your schema. 

![Schema Apollo Studio](https://i.imgur.com/fJK6FGq.gif)

Now, you will run the `ok` query.

<Instruction> 

Go back to the **Explorer** tab (below the **Schema** tab) and type the following query in the **Operations** window. Then press the **Query** button:

```graphql
query Query {
  ok
}
```

</Instruction> 

You should see a response like this: 

```js(nocopy)
{
  "data": {
    "ok": true
  }
}
```

![Run Ok Query](https://i.imgur.com/UVQVOTu.gif)

Congratulations, you just implemented and successfully tested your first GraphQL query 🎉


> **Note:** Quickly try something, make a quick change *anywhere* in your code. You will see the server restart again with a  message in your logging output saying `"Restarting: ..."`. This is because `ts-node-dev` will constantly check your code for any changes and update the server to reflect those changes. **From now on, you will always keep `ts-node-dev` running.** This will ensure that your server is always running and that Nexus generates the most updated representation of your GraphQL SDL and types. 

### A word on the GraphQL schema

Now it's time to understand the basics of a GraphQL schema. At the core of every GraphQL API, there is a GraphQL schema. So, let's quickly talk about it.

> **Note**: In this tutorial, we'll only scratch the surface of this topic. If you want to go a bit more in-depth and
> learn more about the GraphQL schema as well as its role in a GraphQL API, be sure to check out
> [this](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) excellent article.

GraphQL schemas are defined in the GraphQL
[Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). SDL
has a type system that allows you to define data structures (just like other strongly typed programming languages such
as Java, TypeScript, Swift, Go, etc.).

How does that help in defining the API for a GraphQL server, though? Every GraphQL schema has three special _root
types_: `Query`, `Mutation`, and `Subscription`. The root types correspond to the three operation types offered by
GraphQL: queries, mutations, and subscriptions. The fields on these root types are called _root fields_ and define the
available API operations.

As an example, consider the simple GraphQL schema we used above:

```graphql(nocopy)
type Query {
  ok: Boolean!
}
```

This schema only has a single root field, called `ok`. When sending queries, mutations or subscriptions to a GraphQL
API, these always need to start with a root field! In this case, we only have one root field, so there's really only one
possible query that's accepted by the API.

Here the type of the `ok` root field is annotated as `Boolean!` meaning, it can return a value of `true` or `false`. The `!` at the end means that this field is `non-nullable`. Your server will raise an error if you try to return `null` in this field. 

Let's now consider a slightly more advanced example:

```graphql(nocopy)
type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createUser(name: String!): User!
}

type User {
  id: ID!
  name: String!
}
```

In this case, we have three root fields: `users` and `user` on `Query` as well as `createUser` on `Mutation`. The
additional definition of the `User` type is required because otherwise the schema definition would be incomplete.

What are the API operations that can be derived from this schema definition? Well, we know that each API operation
always needs to start with a root field. However, we haven't learned yet what it looks like when the _type_ of a root
field is itself another [object type](http://graphql.org/learn/schema/#object-types-and-fields). This is the case here,
where the types of the root fields are `[User!]!`, `User` and `User!`. In the `info` example from before, the type of
the root field was a `String`, which is a scalar type. 

[Scalar types](http://graphql.org/learn/schema/#scalar-types) are the most basic types in a GraphQL schema, with no sub-fields of their own. They are similar to the primitive types in programming languages. GraphQL comes with a 5 default scalar types out of the box: `Int`, `Float`, `String`, `Boolean` and `ID`. It's also possible to define or import new custom scalar types, based on your application needs. This is something you will learn more about later in the tutorial. 

When the type of a root field is an object type, you can further expand the query (or mutation/subscription) with fields
of that object type. The expanded part is called the _selection set_.

Here are the operations that are accepted by a GraphQL API that implements the above schema:

```graphql(nocopy)
# Query for all users
query {
  users {
    id
    name
  }
}

# Query a single user by their id
query {
  user(id: "user-1") {
    id
    name
  }
}

# Create a new user
mutation {
  createUser(name: "Bob") {
    id
    name
  }
}
```

There are a few things to note:

- In these examples, we always query `id` and `name` of the returned `User` objects. We could potentially omit either of
  them. Note, however, when querying an object type, it is required that you query at least one of its fields in a
  selection set.
- For the fields in the selection set, it doesn't matter whether the type of the root field is _required_ or a _list_.
  In the example schema above, the three root fields all have different
  [type modifiers](http://graphql.org/learn/schema/#lists-and-non-null) (i.e. different combinations of being a list
  and/or required) for the `User` type:
  - For the `users` field, the return type `[User!]!` means it returns a _list_ (which itself cannot be `null`) of
    `User` elements. The list can also not contain elements that are `null`. So, you're always guaranteed to either
    receive an empty list or a list that only contains non-null `User` objects.
  - For the `user(id: ID!)` field, the return type `User` means the returned value could be `null` _or_ a `User` object.
  - For the `createUser(name: String!)` field, the return type `User!` means this operation always returns a `User`
    object.

Phew, enough theory 😠 Let's go and write some more code!


### **Optional:** GraphQL Playground, an offline alternative to Apollo Studio Explorer

By default, Apollo Server version 3 (the one we are using) comes with Apollo Studio. However if you're following this tutorial series without an internet connection or simply would prefer an IDE that does not need an internet connection, then read  on. 

**If you're okay using Apollo Studio, there is no need to follow the instructions in this section. For most people, we recommend using Apollo Studio as it is the most convenient when following along with this tutorial.**



<Instruction>

Make the following change in `index.ts` to enable [GraphQL Playground](https://github.com/graphql/graphql-playground) instead of Apollo Studio. 

```typescript{2,7}(path=".../hackernews-typescript/src/index.ts")
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { schema } from "./schema";
export const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],

});

const port = 3000;
server.listen({port}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

```

</Instruction>

Now you should be served GraphQL Playground at http://localhost:3000/. 

*Note that* you can always use any other GraphQL API Client as well for testing your server, such as [insomnia](https://insomnia.rest/), [postman](https://www.postman.com/) or [Altair](https://altair.sirmuel.design/). 
