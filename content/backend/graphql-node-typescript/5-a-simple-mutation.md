---
title: A Simple Mutation
pageTitle: 'Implementing Mutations in a GraphQL Server Tutorial'
description:
  'Learn best practices for implementing GraphQL mutations with graphql-js, Node.js & Prisma. Test your implementation
  in a GraphiQL.'
question: 'What is a distinction between execution of queries and mutation?'
answers: ['Mutations run parallel while queries run in series', 'Mutations and queries run in parallel', 'Mutation run in series and queries run in parallel', 'Mutations and queries run in series']
correctAnswer: 2
---

In this section, you'll learn how to add a mutation to the GraphQL API. This mutation will allow you to _post_ new links
to the server.

### Extending the schema definition

Like before, you need to start by adding the new operation to your GraphQL schema definition.

<Instruction>

In `src/schema.graphql`, extend the schema definition as follows:

```graphql{6-8}(path="hackernews-node-ts/src/schema.graphql")
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

### Implementing the resolver function

The next step in the process of adding a new feature to the API is to implement the resolver function for the new field.

<Instruction>

Next, update the `resolvers` functions to look as follows:

```typescript{23-38}(path="hackernews-node-ts/src/schema.ts")
type Link = {
  id: string;
  url: string;
  description: string;
}

const links: Link[] = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
  },
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
  },
  Mutation: {
    post: (parent: unknown, args: { description: string, url: string }) => {
      // 1
      let idCount = links.length;

      // 2
      const link: Link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };

      links.push(link);

      return link;
    },
  },
};
```

</Instruction>

First off, note that you're entirely removing the `Link` resolvers (as explained at the very end of the last section).
They are not needed because the GraphQL server infers what they look like.

Also, here's what's going on with the numbered comments:

1. You're adding a new integer variable that simply serves as a very rudimentary way to generate unique IDs for newly
   created `Link` elements.
1. The implementation of the `post` resolver first creates a new `link` object, then adds it to the existing `links`
   list and finally returns the new `link`.

Now's a good time to discuss the second argument that's passed into all resolver functions: `args`. Any guesses what
it's used for?

Correct! 💡 It carries the _arguments_ for the operation – in this case the `url` and `description` of the `Link` to be
created. We didn't need it for the `feed` and `info` resolvers before, because the corresponding root fields don't
specify any arguments in the schema definition.

### Testing the mutation

Go ahead and restart your server so you can test the new API operations. Here is a sample mutation you can send through GraphiQL:

```graphql
mutation {
  post(url: "www.prisma.io", description: "Prisma replaces traditional ORMs") {
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

![Mutation response](https://i.imgur.com/MzpLiba.png)


With every mutation you send, the `idCount` will increase and the following IDs for created links will be `link-2`,
`link-3`, and so forth...

To verify that your mutation worked, you can send the `feed` query from before again – it now returns the additional
Link that you created with the mutation:

![returns the additional Link](https://i.imgur.com/EjRMMiz.png)

However, once you kill and restart the server, you'll notice that the previously added links are now gone and you need
to add them again. This is because the links are only stored _in-memory_, in the `links` array. In the next sections,
you will learn how to add a _database_ to the GraphQL server in order to persist the data beyond the runtime of the
server.
