---
title: Mutations
pageTitle: "Mutations with a Javascript & Node.js GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with graphql-js, Javascript, Node.js & Express. Test your implementation in a GraphiQL Playground."
question: Which of these is false about GraphQL field arguments?
answers: ["They are how clients pass data to the server", "They must be included in the field schema definition", "They can be accessed inside resolvers", "Only mutation fields can have them"]
correctAnswer: 3
---

In this section, you'll learn how to implement a mutation to create new `Link` elements through your application schema.

### Mutation for posting new links

A nice thing about GraphQL is that despite the semantic difference between queries and mutations, on a technical level these two concepts are actually almost identical. When adding a mutation to your API, you need to add a corresponding field to the `Mutation` type of your GraphQL schema and then implement the resolver for that field. Just like with queries!

<Instruction>

Open your application schema in `src/schema.graphql` and the following code to it:

```graphql(path=".../hackernews-node/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link!
}
```

</Instruction>

This mutation allows to create (_post_) a new `Link` item. The next step is to implement the resolver for the new `post` field.

<Instruction>

In the `src/resolvers` directory, create a new file called `Mutation.js` and add the following code to it:

```js(path=".../hackernews-node/src/resolvers/Mutation.js")
function post(parent, args, context, info) {
  const { url, description } = args
  return context.db.mutation.createLink({ data: { url, description } }, info)
}

module.exports = {
  post,
}
```

</Instruction>

This implementation follows the same approach as the `feed` query from the previous chapter. You're retrieving the `url` and `description` input arguments and passing them on to the `createLink` mutation from the Prisma API. Easy as pie! 🍰

The last step is to also add the `Mutation` resolvers to the constructor of `GraphQLServer` in `index.js`.

<Instruction>

In `index.js`, add a new import statement and adjust the definition of the `resolvers` object like so:

```js(path=".../hackernews-node/src/index.js")
const Mutation = require('./resolvers/Mutation')

const resolvers = {
  Query,
  Mutation,
}
```

</Instruction>

This is it. To test this mutation, you can run `yarn start` again and send the following mutation in the `default` Playground in the `app` section:

```graphql
mutation {
  post(url: "https://www.howtographql.com", description: "Fullstack tutorial website for GraphQL") {
    id
  }
}
```
