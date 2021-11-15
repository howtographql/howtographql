---
title: Getting Started
pageTitle: 'Getting Started with a simple GraphQL schema'
description:
  'Learn how write a GraphQL schema and how to try and run it.'
question: 'What does `makeExecutableSchema` function do?'
answers: ['Convert GraphQL SDL to DocumentNode', 'Combine multiple SDLs into one', 'Glue GraphQL SDL with Resolvers into an executable schema we can later use', 'Run schema with query']
correctAnswer: 2
---

In this chapter, you will learn about the GraphQL schema: 

1. How it performs as an API contract between the consumer and the provider,
2. How you can use `graphql` library as a basic GraphQL execution mechanism
3. What is a GraphQL operation and how you can use it.

### Getting Started with GraphQL

To get a better understanding of how GraphQL works, you can start by [reading this tutorial about GraphQL basics](https://www.howtographql.com/basics/0-introduction/).

If you are already familiar with the basics of GraphQL, here's a quick overview:

1. The GraphQL schema is where your GraphQL types are defined.
1. GraphQL types are connected to each other using fields, and they form a graph.
1. The `Query` and `Mutation` types are special, since they act as entry point to the graph.
1. The GraphQL schema acts as the data provider, and it offers a set of capabilities the consumer can use.
1. To get data from a GraphQL schema, you need to write a GraphQL operation (a `query`) that selects the data and fields you need.
 
In this section of the tutorial, you'll write a simple GraphQL schema, and you'll consume it directly, just for the learning process.

Later, you'll replace the direct execution with a GraphQL server (based on HTTP protocol), and you'll add developer tools that will make it super simple to query and access.

### Creating your first GraphQL schema

There are many ways to create a GraphQL schema - in this tutorial, you are going to use schema-first approach, and build the schema with the `@graphql-tools/schema` library (take a look at the end of this chapter for more advanced/different solutions for creating your GraphQL schema).

<Instruction>

Start by installing `graphql` and `@graphql-tools/schema` library in your project, using the following command:

```bash
npm install --save graphql @graphql-tools/schema graphql-import-node
```

The command above will get you the following libraries installed in the project:

* `graphql` is the GraphQL engine implementation.
* `@graphql-tools/schema` is a library for creating GraphQL executable schemas.
* `graphql-import-node` is needed here in order to allow importing of `.graphql` files.

</Instruction>

A GraphQL schema can be written with GraphQL SDL (*S*chema *D*efinition *L*anguage), which is the GraphQL language for defining your API/contract. The actual code and business-logic of each field is called a GraphQL *resolvers*. 

So let's get started by creating your first, very-simple, GraphQL schema.

<Instruction>

To get started with a simple GraphQL schema, you need to create a SDL file defining our contract:

<Instruction>

Create a `src/schema.graphql` file with the following content: 

```graphql(path="hackernews-node-ts/src/schema.graphql")
type Query {
  info: String!
}
```

</Instruction>

Now, you can create your actual executable schema and implement it. 

<Instruction>

Create a new file in your project, under `src/schema.ts`, with the following:

```typescript{1-13}(path="hackernews-node-ts/src/schema.ts")
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./schema.graphql";

const resolvers = {
  Query: {
    info: () => 'Test',
  }
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
```

</Instruction>

In the code-snippet above, you've created or used the following variables:

- `typeDefs` - this is your GraphQL schema definition. You've created a `Query` type that exposes a field called `info`, of type `String`. You can import it directly from `.graphql` file thanks to `graphql-import-node`. 
- `resolvers` - the resolver functions are part of the GraphQL schema, and they are the actual implementation (code / logic) of the GraphQL schema.
- `schema` - a combination of the GraphQL SDL and the resolvers. `makeExecutableSchema` function is in charge of gluing them together into an executable schema we can later use.

Now that you have a GraphQL schema, you can use that to fetch data using a GraphQL `query`! 

### Query the GraphQL schema

As explained before, the GraphQL schema is only your contract, and it exposes the set of all types and capabilities that your API layer can do. 

To use your GraphQL scehma and consume data from it, your need to write a GraphQL `query` definition. 

Based on the schema your created before, you can use the following query:

```graphql(nocopy)
query {
  info
}
```

So you don't have to get into all the complexity of running GraphQL server - you can use this query and run it against your GraphQL schema and get an immediate result. 

To query our local schema, even without any fancy GraphQL client or even a GraphQL server, you can use GraphQL's `execute` function to just run the schema with the query.

<Instruction>

Update the code in `src/index.ts` to contain the following snippet:

```typescript{2-16}(path="hackernews-node-ts/src/index.ts")
import 'graphql-import-node';
import { execute, parse } from "graphql";
import { schema } from "./schema";

async function main() {
  const myQuery = parse(`query { info }`);

  const result = await execute({
    schema,
    document: myQuery,
  });

  console.log(result);
}

main();
```

</Instruction>

Now, try to run our project again (either with `npm run dev` or `npm run start`), you should see in the output log the following:

```(nocopy)
{ data: { info: 'Test' } }
```

**So what happened here?**

First, the GraphQL `query` was parsed it using `parse` function of `graphql` - this will create a `DocumentNode` object that can later be executed by GraphQL.

Then, the `execute` function of `graphql` was called with the following parameters:

1. `schema` - this is the GraphQL schema object you previously created.
2. `myQuery` - this is the `DocumentNode` object created based on our GraphQL query. 

The return value of `execute` is the GraphQL result (or, GraphQL response).

The GraphQL engine takes the query, and based on the fields you selected (called the *Selection-Set*), it runs the resolvers, and returns their return value.

The next chapter will teach your how to use your GraphQL schema to create a GraphQL server!

### A word on the GraphQL schema

At the core of every GraphQL API, there is a GraphQL schema. So, let's quickly talk about it.

> **Note**: In this tutorial, we'll only scratch the surface of this topic. If you want to go a bit more in-depth and
> learn more about the GraphQL schema as well as its role in a GraphQL API, be sure to check out
> [this](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) excellent article.

GraphQL schemas are usually written in the GraphQL
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
  info: String!
}
```

This schema only has a single root field, called `info`. When sending queries, mutations or subscriptions to a GraphQL
API, these always need to start with a root field! In this case, we only have one root field, so there's really only one
possible query that's accepted by the API.

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

In this case, we have three root fields: `users` and `user` on `Query` as well as `createUser` on `Mutation`. The
additional definition of the `User` type is required because otherwise the schema definition would be incomplete.

What are the API operations that can be derived from this schema definition? Well, we know that each API operation
always needs to start with a root field. However, we haven't learned yet what it looks like when the _type_ of a root
field is itself another [object type](http://graphql.org/learn/schema/#object-types-and-fields). This is the case here,
where the types of the root fields are `[User!]!`, `User` and `User!`. In the `info` example from before, the type of
the root field was a `String`, which is a [scalar type](http://graphql.org/learn/schema/#scalar-types).

When the type of a root field is an object type, you can further expand the query (or mutation/subscription) with fields
of that object type.

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

### Additional Resources

As mentioned in the begining of this chapter, there are many ways to build and create your GraphQL schema. 

Here are a few popular open-source libraries:

* [`graphql`](https://graphql.org/graphql-js/type/) - you can use raw `graphql` using object classes in order to create your schema.
* [`@graphql-tools/schema`](https://www.graphql-tools.com/docs/generate-schema) - schema-first library for creating executable schemas. 
* [`nexus-graphql`](https://nexusjs.org/) - Declarative, Code-First GraphQL Schemas for JavaScript/TypeScript
* [`typegraphql`](https://github.com/MichalLytek/type-graphql) - GraphQL schema and resolvers with TypeScript, using classes and decorators.
* [`graphql-modules`](https://www.graphql-modules.com/) - schema first library for creating strict, reusable GraphQL schema modules.
* [`giraphql`](https://github.com/hayes/giraphql/) - library for creating GraphQL schemas in typescript using a strongly typed code first approach
