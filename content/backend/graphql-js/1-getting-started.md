---
title: Getting Started
pageTitle: "Getting Started with GraphQL, Node.js and Prisma Tutorial"
description: "Learn how to setup a GraphQL server with Node.js & Express as well as best practices for defining the GraphQL schema."
question: "What role do the root fields play for a GraphQL API?"
answers: ["The three root fields are: Query, Mutation and Subscription", "Root fields implement the available API operations", "Root fields define the available API operations", "Root field is another term for resolver"]
correctAnswer: 2
---

In this section, you will setup the project for your GraphQL server and implement your first GraphQL query. In the end, we'll talk theory for a bit and learn about the [GraphQL schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e).

### Creating the project

This tutorial teaches you how to build a GraphQL server from scratch, so the first thing you need to do is create the directory that'll hold the files for your GraphQL server!

<Instruction>

Open your terminal, navigate to a location of your choice and run the following commands:

```bash
mkdir hackernews-node
cd hackernews-node
yarn init -y
```

</Instruction>

> **Note** This tutorial uses [Yarn](https://yarnpkg.com/en/) to manage your project. If you prefer using [npm](https://www.npmjs.com/), you can simply run the equivalent commands using `npm`.

This creates a new directory called `hackernews-node` and initializes it with a `package.json` file. `package.json` is the configuration file for the Node app you're building. It lists all dependencies and other configuration options (such as _scripts_) needed for the app.

### Creating a raw GraphQL server

With the project directory in place, you can go ahead and create the entry point for your GraphQL server. This will be a file called `index.js`, located inside a directory called `src`.

<Instruction>

In your terminal, first create the `src` directory and then the empty `index.js` file:

```bash(path=".../hackernews-node/")
mkdir src
touch src/index.js
```

</Instruction>

> **Note**: The above code block is annotated with a directory name. It indicates _where_ you need to execute the terminal command.

To start the app, you can now execute `node src/index.js` inside the `hackernews-node` directory. At the moment, this won't do anything because `index.js` is still empty  ¯\\\_(ツ)_/¯

Let's go and start building the GraphQL server! The first thing you need to is - surprise - add a dependency to the project.

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node/")
yarn add graphql-yoga
```

</Instruction>

[`graphql-yoga`](https://github.com/graphcool/graphql-yoga) is a fully-featured GraphQL server. It is based on [Express.js](https://expressjs.com/) and a few other libraries to help you build production-ready GraphQL servers.

Here's a list of its features:

- GraphQL spec-compliant
- Supports file upload
- Realtime functionality with GraphQL subscriptions
- Works with TypeScript typings
- Out-of-the-box support for GraphQL Playground
- Extensible via Express middlewares
- Resolves custom directives in your GraphQL schema
- Query performance tracing
- Accepts both `application/json` and `application/graphql` content-types
- Runs everywhere: Can be deployed via `now`, `up`, AWS Lambda, Heroku etc.

Perfect, it's time to write some code 🙌

<Instruction>

Open `src/index.js` and type the following:

```js(path="../hackernews-node/src/index.js")
const { GraphQLServer } = require('graphql-yoga')

// 1
const typeDefs = `
type Query {
  info: String!
}
`

// 2
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`
  }
}

// 3
const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))
```

</Instruction>

> **Note**: This code block is annotated with a file name. It indicates into which file you need to put the code that's shown. The annotation also links to the corresponding file on GitHub to help you figure out _where_ in the file you need to put it in case you are not sure about that.
> Also, while the code block has a button for copying the code, we encourage you to type everything out yourself since that drastically improves your learning experience.

All right, let's understand what's going on here by walking through the numbered comments:

1. The `typeDefs` constant defines your _GraphQL schema_ (more about this in a bit). Here, it defines a simple `Query` type with one _field_ called `info`. This field has the type `String!`. The exclamation mark in the type definition means that this field can never be `null`..
1. The `resolvers` object is the actual _implementation_ of the GraphQL schema. Notice how its structure  is identical to the structure of the type definition inside `typeDefs`: `Query.info`.
1. Finally, the schema and resolvers are bundled and passed to the `GraphQLServer` which is imported from `graphql-yoga`. This tells the server what API operations are accepted and how they should be resolved.

Go ahead and test your GraphQL server!

### Testing the GraphQL server

<Instruction>

In the root directory of your project, run the following command:

```bash(path=".../hackernews-node/")
node src/index.js
```

</Instruction>

As indicated by the terminal output, the server is now running on `http://localhost:4000`. To test the API of your server, open a browser and navigate to that URL.

What you'll then see is a [GraphQL Playground](https://github.com/graphcool/graphql-playground), a powerful "GraphQL IDE" that lets you explore the capabilities of your API in an interactive manner.

![](https://imgur.com/9RC6x9S.png)

By clicking the green **SCHEMA**-button on the right, you can open the API documentation. This documentation is auto-generated based on your schema definition and displays all API operations and data types of your schema.

![](https://imgur.com/81Ho6YM.png)

Let's go and send your very first GraphQL query. Type the following into the editor pane on the left side:

```graphql
query {
  info
}
```

Now send the query to the server by clicking the **Play**-button in the center (or use the keyboard shortcut **CMD+ENTER**).

![](https://imgur.com/EnW3HE5.png)

Congratulations, you just implemented and successfully tested your first GraphQL query 🎉

Now, remember when we talked about the definition of the `info: String!` field and said the exclamation mark means this field could never be `null`. Well, since you're implementing the resolver, you are in control of what the value for that field is, right? So, what happens if you return `null` instead of the actual informative string in the resolver implementation? Feel free to try that out!

In `index.js`, update the the definition of `resolvers` as follows:

```js{3}(path=".../hackernews-node/src/index.js")
const resolvers = {
  Query: {
    info: () => null,
  }
}
```

To test the results of this, you need to restart the server: First, stop it using **CTRL+C** on your keyboard, then restart it by running `node src/index.js` again.

Now, send the query from before again. This time, it returns an error: `Error: Cannot return null for non-nullable field Query.info.`

![](https://imgur.com/VLVE5Vv.png)

What happens here is that the underlying [`graphql-js`](https://github.com/graphql/graphql-js/) reference implementation ensures that the return types of your resolvers adhere to the type definitions from your GraphQL schema. Put differently, it protects you from making stupid mistakes!

This is in fact one of the core benefits of GraphQL in general: It enforces that the API actually behaves in the way that is promised by the schema definition! This way, everyone who has access to the GraphQL schema can always be 100% sure about the API operations and data structures that are returned by the API.

### A word on the GraphQL schema

At the core of every GraphQL API, there is a GraphQL schema. So, let's quickly talk about it.

> **Note**: In this tutorial, we'll only scratch the surface of this topic. If you want to go a bit more in-depth and learn more about the GraphQL schema as well as its role in a GraphQL API, be sure to check out [this](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) excellent article.

GraphQL schemas are usually written in the GraphQL [Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). The SDL has a type system that allows to define data structures (just like other strongly typed programming languages such as Java, TypeScript, Swift, Go, ...).

But how does that help in defining the API for a GraphQL server? Every GraphQL schema has three special _root types_, these are called `Query`, `Mutation` and `Subscription`. The root types correspond to the three operation types offered by GraphQL: queries, mutations and subscriptions. The fields on these root types are called _root field_ and define the available API operations.

As an example, consider the simple GraphQL schema we used above:

```graphql(nocopy)
type Query {
  info: String!
}
```

This schema only has a single root field, called `info`. When sending queries, mutations or subscriptions to a GraphQL API, these always need to start with a root field! In this case, we only have one root field, so there's really only one possible query that's accepted by the API.

Let's now consider a slightly more advanced example:

```(nocopy)
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

In this case, we have three root fields: `users` and `user` on `Query` as well as `createUser` on `Mutation`. The additional definition of the `User` type is required because otherwise the schema definition would be incomplete.

What are the API operations that can be derived from this schema definition? Well, we know that each API operation always needs to start with a root field. However, we haven't learned yet what it looks like when the _type_ of a root field is itself another [object type](http://graphql.org/learn/schema/#object-types-and-fields). This is the case here, where the types of the root fields are `[User!]!`, `User` and `User!`. In the `info` example from before, the type of the root field was a `String`, which is a [scalar type](http://graphql.org/learn/schema/#scalar-types).

- `typeDefs`: These are the type definitions from your application schema imported from `src/schema.graphql`.
- `resolvers`: This is a JavaScript object that mirrors the `Query`, `Mutation` and `Subscription` types and their fields from your application schema. Each field in the application schema is represented by a function with the same name in that object.
- `context`: This is an object that gets passed through the resolver chain and every resolver can read from or write to.

When the type of a root field is an object type, you can further expand the query (or mutation/subscription) with fields of that object type. The expanded part is called _selection set_.


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

- In these examples, we always query `id` and `name` of the returned `User` objects. We could potentially omit either of them. Note however when querying an object type, it is required that you query at least one of its field in a selection set.
- For the fields in the selection set, it doesn't matter whether the type of the root field is _required_ or a _list_. In the examples schema above, the three root fields all have different [type modifiers](http://graphql.org/learn/schema/#lists-and-non-null) (i.e. different combinations of being a list and/or required) for the `User` type:
  - For the `users` field, the return type `[User!]!` means it returns a _list_ (which itself can not be `null`) of `User` elements. The list can also not contain elements that are `null`. So, you're always guaranteed to either receive an empty list or a list that only contains non-null `User` objects.
  - For the `user(id: ID!)` field, the return type `User` means the returned value could be `null` _or_ a `User` object.
  - For the `createUser(name: String!)` field, the return type `User!` means this operation always returns a `User` object.

As you provide this information, the `Prisma` instance will get full access to your database service and can be used to resolve incoming request later on.

Phew, enough theory 😠 Let's go and write some code again!

