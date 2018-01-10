---
title: Getting Started
pageTitle: "Getting Started with GraphQL, JavaScript and Node.js Tutorial"
description: "Learn how to setup a GraphQL server with JavaScript, Node.js & Express as well as best practices for defining the GraphQL schema."
question: Which of the following files does not define a "proper" GraphQL schema.
answers: ["src/schema.graphql", "database/datamodel.graphql", "src/generated/graphcool.grahpql", "Trick question: All of them do"]
correctAnswer: 1
---

### Defining the application's GraphQL API

You'll start by defining the GraphQL schema for your application. We'll also refer to this as your **application schema**. Schemas are written in the GraphQL [Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL).

> If you want to learn more about the GraphQL schema and its role in GraphQL servers, make sure to check out  this excellent [blog post](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) which provides a comprehensive overview of everything you need to know regarding GraphQL schemas!

#### API requirements

Here you're going to build the backend for a [Hackernews](https://news.ycombinator.com/) clone, so let's think about the requirements your API should provide:

- Retrieve a list (_feed_) of link elements
- Allow users to _signup_ up with their name, email and password
- Users who signed up should be able to _login_ again with their email and password
- Allow authenticated users to _post_ new link elements
- Allow authenticated users to _upvote_ an existing link element
- Send realtime updates to subscribed clients when a new link element is _created_
- Send realtime updates to subscribed clients when an existing link element is _upvoted_

> **Bonus**: There's a super useful [GraphQL Cheat Sheet](https://github.com/sogko/graphql-schema-language-cheat-sheet) for building schemas. Check it out!

#### Defining the application schema

It's now the responsility of the application schema to define an API that allows for client applications to perform the operations defined above. So, you need to translate the requirements into corresponding GraphQL queries, mutations and subscriptions.

As you learned in the [Core Concepts](https://www.howtographql.com/basics/2-core-concepts/) chapter, you can do so by writing the `Query`, `Mutation` and `Subscription` types (which are also called _root types_) in your schema.

Here is an application schema that caters the requirements defined above. For now, we don't care where the `User`, `Link` and `Vote` types are coming from and how exactly they're defined.

```graphql(nocopy)
type Query {
  # Retrieve a list ("feed") of link elements
  feed(filter: String, skip: Int, first: Int): [Link!]!
}

type Mutation {
  # Allow users to signup up with their name, email and password
  signup(name: String!, email: String!, password: String!): AuthPayload!
  # Users who signed up should be able to login again with their email and password
  login(email: String!, password: String!): AuthPayload!
  # Allow authenticated users to post new link elements
  post(url: String!, description: String!): Link
  # Allow authenticated users to upvote an existing link element
  vote(linkId: ID!): Vote
}

type Subscription {
  # Send realtime updates to subscribed clients when a new link element is created
  newLink: LinkSubscriptionPayload
  # Send realtime updates to subscribed clients when an existing link element is upvoted
  newVote: VoteSubscriptionPayload
}

type AuthPayload {
  token: String
  user: User
}
```

Great! So this is the final application schema you want to have implemented in the end. Notice that the `feed` query allows to send `filter` and pagination (`skip` and `first`) arguments to constrain the list of link elements to be returned by the server.

In the following, you'll gradually implement the defined queries, mutations and subscriptions one by one. The implementation process will look somewhat similar every time - this is also referred to as **schema-driven development**:

1. Adjust the data model of your Graphcool database service
1. Deploy the Graphcool database service to apply your changes
1. Extend your application schema with a new root field
1. Implement the resolver for the root field by [_delegating_](https://blog.graph.cool/graphql-schema-stitching-explained-schema-delegation-4c6caf468405) the execution to the corresponding Graphcool resolver

### Bootstrap your GraphQL server

It's time to start creating your GraphQL server. You could do so by starting from scratch, use `npm init -y` to setup your `package.json` and manually add the required dependencies (such as `graphql-yoga`). However, in this tutorial you'll use `graphql create`, a feature of the [`graphql-cli`](https://github.com/graphql-cli/graphql-cli) which will bootstrap your GraphQL server and give you a head start (think of it like [`create-react-app`](https://github.com/facebookincubator/create-react-app) but for GraphQL servers instead of React applications).

The first step for you is to install the `graphql-cli` so you can make use of the `graphql create` command.

<Instruction>

Open a terminal window and install the `graphql-cli` using NPM:

```sh
npm install -g graphql-cli
```

</Instruction>

With the CLI installed, you can now use the `graphql create` command to setup your GraphQL server. Note that this command is based on several [GraphQL boilerplate](https://github.com/graphql-boilerplates/) projects that provide an initial set of features for various languages and technologies.

<Instruction>

In your terminal, navigate into a directory of your choice (where you want to work on this tutorial project) and use the following command to get started with your GraphQL server:

```sh
graphql create hackernews-node --boilerplate node-basic
```

</Instruction>

This now created a new directory called `hackernews-node` based on the [`node-basic`](https://github.com/graphql-boilerplates/node-graphql-server/tree/master/basic) GraphQL boilerplate project. The relevant contents of this directory are as follows:

```sh(nocopy)
.
├── package.json
├── src
│   ├── index.js
│   ├── schema.graphql
│   └── generated
│       └── graphcool.graphql
└── database
    ├── graphcool.yml
    └── datamodel.graphql
```

Here's an overview of what the directories and files are used for:

- `src`: This directory generally contains the JavaScript code for your application. It also holds the **application schema** (which is defined in `src/schema.graphql`) as well as the auto-generated **Graphcool schema** (in `src/generated/graphcool.graphql`) which we'll discuss in a bit.
- `database`: This directory stores everything related to your Graphcool database service. This includes the root configuration file `graphcool.yml` and the definitions of your application's _data model_ (in one or split across multiple files).
  - `graphcool.yml`: This is the root configuration file for your "Graphcool database" service. In here, you specify a _name_ for your service, _deployment information_ and your _data model_ which will be used to generate the Graphcool CRUD API.
  - `datamodel.graphql`: The data model is written in GraphQL SDL and provides the foundation for your database: The Graphcool API defined in `src/generated/graphcool.graphql` provides CRUD functionality which allows to easily **c**reate, **r**ead, **u**pdate and **d**elete instances of the types in your data model (e.g. a `Link` or a `User` type).

### Background: Application schema vs Graphcool schema (CRUD)

As you might have noticed, there are three different `.graphql`-files with certain SDL type definitions in your project. Let's take a moment to understand where they're coming from and what they're used for in your setup:

- `src/schema.graphql` (**Application schema**): Defines the GraphQL API that will be exposed to your client applications. For example, we'll use it later on to expose the `feed` query our client apps can access to retrieve a list of Hackernews links from our server.
- `src/generated/graphcool.graphql` (**Graphcool schema**): Defines the Graphcool API with CRUD functionality for your database. This file is _auto-generated_ based on your data model and should never be manually altered. This also means that whenever you make changes to your data model, this file is (automatically) updated as well.
- `database/datamodel.graphql`: The data model contains the type definitions for the entities in our application domain. For each type in the data model, Graphcool will generate queries and mutations allowing you to read and write database records (also called _nodes_) for that type.

Notice that `datamodel.graphql` is not actually a GraphQL schema in the actual sense, as its missing the _root types_. The data model is only used as the foundation to generate the actual schema for the Graphcool API!

Why do you need two GraphQL schemas at all? The reason for that is simple, the Graphcool schema alone would give clients read/write-access to _all_ the data in your database. For the vast majority of applications however, you'll rather want to expose an API that's more tailored to the requirements of your clients. Plus, if you were to use only the Graphcool schema, you wouldn't be able to implement any authentication workflows or other business logic.

### Understanding the initial setup

Before we continue with the implementation, let's go and understand the initial setup of your GraphQL server.

If you check your `package.json`, you'll notice that the boilerplate comes with two dependencies:

- [`graphql-yoga`](https://github.com/graphcool/graphql-yoga/): The package that contains everything you need for your GraphQL server (basically a thin convenience wrapper on top of Express.js, `apollo-server`, `graphql-tools` and more)
- [`graphcool-binding`](https://github.com/graphcool/graphcool-binding): This package allows to _bind_ the resolvers of your application schema to the auto-generated resolvers of your Graphcool database service. To learn more about schema bindings, you can read [this](https://blog.graph.cool/graphql-schema-stitching-explained-schema-delegation-4c6caf468405#ec32) article.

Both dependencies are used in `index.js`. The important part of that file is this:

```js(path=".../hackernews-node/src/index.js&nocopy)
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Graphcool({
      typeDefs: 'src/generated/database.graphql',
      endpoint: 'http://localhost:60000/hackernews-node/dev',
      secret: 'mysecret123',
    }),
  }),
})
```

Here you instantiate your `GraphQLServer` with the following arguments:

- `typeDefs`: These are the type definitions from your application schema imported from `src/schema.graphql`.
- `resolvers`: This is a JavaScript object that mirrors the `Query`, `Mutation` and `Subscription` types and their fields from your application schema. Each field in the application schema is represented by a function with the same name in that object.
- `context`: This is an object that get's passed through the resolver chain and every resolvers can read from or write to.

Notice that the `context` object has the `db` field which contains an instance of `Graphcool` from the `graphcool-binding` package. This instance will allow your resolvers to simply _delegate_ the execution of an incoming request to an appropriate resolver from the Graphcool API.

When instantiating `Graphcool`, you need to provide information about your Graphcool database service:

- `typeDefs`: The type definition from your Graphcool schema
- `endpoint`: The HTTP endpoint of your Graphcool database service
- `secret`: The secret which allows to access the Graphcool database service (this is defined in `graphcool.yml`)

Because you provide this information, the `Graphcool` instance will get full access to your database service and can be used to resolve incoming request later on.