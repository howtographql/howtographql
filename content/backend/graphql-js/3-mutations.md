---
title: Mutations
question: Which of these is false about GraphQL field arguments?
answers: ["They are how clients pass data to the server", "They must be included in the field schema definition", "They can be accessed inside resolvers", "Only mutation fields can have them"]
correctAnswer: 3
description: Learn to implement mutations by using resolvers again, but this time with arguments
---

### Mutation for creating links

Setting up mutations is as easy as queries, following the same process.

<Instruction>

First, add the `createLink` mutation to that `typeDefs` variable in `src/schema/index.js`:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type Mutation {
  createLink(url: String!, description: String!): Link
}
```

</Instruction>

### Resolvers with arguments

<Instruction>

Now add a resolver for `createLink` inside `src/schema/resolvers.js:`

```js{5-11}(path=".../hackernews-graphql-js/src/schema/resolvers.js")
module.exports = {
  Query: {
    allLinks: () => links,
  },
  Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({id: links.length + 1}, data);
      links.push(newLink);
      return newLink;
    }
  },
};
```

</Instruction>

Note that in this case you need to access the arguments that were passed with the mutation. The second resolver parameter is exactly what you need for this, not only for mutations but for any other time you want to access this data (such as for queries with arguments, which you'll also build later).

Since you're just using that local array for now, all that's needed is to add the new link to it with some generated id, and return it as the response.

### Testing with playground

To test, just restart the server again and use the new mutation with GraphiQL:
![](http://i.imgur.com/4pKJ9ji.png)