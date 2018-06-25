---
title: A Simple Mutation
pageTitle: "Implementing Mutations in a GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with graphql-js, Node.js & Prisma. Test your implementation in a GraphQL Playground."
question: What is the second argument that's passed into GraphQL resolvers used for?
answers: ["It carries the return value of the previous resolver execution level", "It carries the arguments for the incoming GraphQL operation", "It is an object that all resolvers can write to and read from", "It carries the AST of the incoming GraphQL operation"]
correctAnswer: 1
---

In this section, you'll learn how to add a mutation to the GraphQL API. This mutation will allow to _post_ new links to the server.

### Extending the schema definition

Like before, you need to start by adding the new operation to your GraphQL schema definition.

<Instruction>

In `index.js`, extend the `typeDefs` string as follows:

```js{7-9}(path="../hackernews-node/src/index.js")
const typeDefs = `
type Query {
  info: String!
  feed: [Link!]!
}

type Mutation {
  post(url: String!, description: String!): Link!
}

type Link {
  id: ID!
  description: String!
  url: String!
}
`
```

</Instruction>

At this point, the schema definition already has grown to be quite large. Let's refactor the app a bit and pull the schema out into its own file!

<Instruction>

Create a new file inside the `src` directory and call it `schema.graphql`:

```bash(path="../hackernews-node/src)
touch src/schema.graphql
```

</Instruction>

<Instruction>

Next, copy the entire schema definition into the new file:

```graphql(path="../hackernews-node/src/schema.graphql)
type Query {
  info: String!
  feed: [Link!]!
}

type Mutation {
  post(url: String!, description: String!): Link!
}

type Link {
  id: ID!
  description: String!
  url: String!
}
```

</Instruction>

With that new file in place, you can cleanup `index.js` a bit.

<Instruction>

First, entirely delete the definition of the `typeDefs` constant - it's not needed any more because the schema definition now lives in its own file. Then, update the way how the `GraphQLServer` is instantiated at the bottom of the file:

```js{2}(path="../hackernews-node/src/index.js)
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
})
```

</Instruction>

One convenient thing about the constructor of the `GraphQLServer` is that `typeDefs` can be provided either directly as a string (as you previously did) or by referencing a file that contains your schema definition (this is what you're doing now).

### Implementing the resolver function

The next step in the process of adding a new feature to the API is to implement the resolver function for the new field.

<Instruction>

Next, update the `resolvers` functions to look as follows:

```js{7,13-23}(path="../hackernews-node/src/index.js")
let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]
// 1
let idCount = links.length
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
  },
  Mutation: {
    // 2
    post: (root, args) => {
       const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      }
      links.push(link)
      return link
    }
  },
}
```

</Instruction>

First off, note that you're entirely removing the `Link` resolvers (as explained before). They are not needed because the GraphQL server infers what they look like.

Also, here's what's going on with the numbered comments:

1. You're adding a new integer variable that simply serves as a way to generate unique IDs for newly created `Link` elements.
1. The implementation of the `post` resolver first creates a new `link` object, then adds it to the existing `links` list and finally returns the new `link`.

Now it's a good time to discuss the second argument that's passed into all resolver functions: `args`. Any guesses what it's used for?

Correct! It carries the _arguments_ for the operation - in this case the `url` and `description` of the `Link` to be created. We didn't need it for the `feed` and `info` resolvers before, because the corresponding root fields don't specify any arguments in the schema definition.

### Testing the mutation

Go ahead and restart your server so you can test the new API operations. Here is a sample mutation you can send through the Playground:

```graphql
mutation {
  post(
    url: "www.prisma.io"
    description: "Prisma turns your database into a GraphQL API"
  ) {
    id
  }
}
```

The server response will look as follows:

```json(nocopy)
{
  "data": {
    "post": {
      "id": "link-1"
    }
  }
}
```

With every mutation you send, the `idCount` will increase and the following IDs for created links will be `link-2`, `link-3`, and so forth...

To verify that your mutation worked, you can send the `feed` query from before again - it now returns the additional post that you created with the mutation:

![](https://i.imgur.com/l5wOvFI.png)

However, once you kill and restart the server, you'll notice that the previously added links are now gone and you need to add them again. This is because the links are only stored _in-memory_, in the `links` array. In the next sections, you will learn how to add a _database layer_ to the GraphQL server in order to persists the data beyond the runtime of the server.

### Exercise

If you want to practice implementing GraphQL resolvers a bit more, here's a fun little challenge for you. Based on your current implementation, extend the GraphQL API with full CRUD functionality for the `Link` type. In particular, implement the queries and mutations that have the following definitions:

```graphql(nocopy)
type Query {
  # Fetch a single link by its `id`
  link(id: ID!): Link
}

type Mutation {
  # Update a link
  updateLink(id: ID!, url: String, description: String): Link

  # Delete a link
  deleteLink(id: ID!): Link
}
```
