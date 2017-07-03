---
title: Mutations
---

### Mutation for creating links

Setting up mutations is as easy as queries, following the same process. First, add the `createLink` mutation to that `typeDefs` variable in `src/schema/index.js`:


```
type Mutation {
  createLink(url: String!, description: String!): Link
}
```

### Resolvers with arguments

Now add a resolver for `createLink` inside `src/schema/resolvers.js:`

```
module.exports = {
  Query: {
    allLinks: () => links,
  },
  Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({id: links.length}, data);
      links.push(newLink);
      return newLink;
    }
  },
};
```

Note that in this case you need to access the arguments that were passed with the mutation. The second resolver parameter is exactly what you need for this, not only for mutations but for any other time you want to access this data (such as for queries with arguments, which you'll also build later).

Since you're just using that local array for now, all that's needed is to add the new link to it with some generated id, and return it as the response.

### Testing with playground

To test, just restart the server again and use the new mutation with GraphiQL:
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/6b0SQMfg1Wf5gNP6W0IyBQ]