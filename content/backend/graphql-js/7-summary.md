---
title: Summary
pageTitle: "Building a GraphQL Server with Javascript & Node.js Tutorial"
description: "You learned how to build a GraphQL server with Node.js and best practices for filters, authentication, pagination and subscriptions."
---

In this tutorial you learned how to build your very own GraphQL server from scratch, using [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/) and [Prisma](https://www.prismagraphql.com) as a "GraphQL database" service.

The main process you went through for each feature you implemented consisted of these steps:

1. Adjust the Prisma data model to account for the data the new feature requires (e.g. adding a `User` type for implementing authentication).
1. Deploy the Prisma database service to apply the changes from the previous step, this will update your auto-generated **Prisma schema** which contains all the CRUD operations for the types in your data model.
1. Add a new root field to the **application schema** that represents the feature (e.g. `post(url: String!, description: String!): Link!` for posting new links).
1. Implement the resolver for the root field by [delegating](https://blog.graph.cool/graphql-schema-stitching-explained-schema-delegation-4c6caf468405) the execution to the Prisma database service using the [`prisma-binding`](https://github.com/prisma/prisma-binding) package.

Now that you already know all the basics, make sure to look deeper into anything that you're interested in learning more about. GraphQL is getting more and more popular, so there's tons of extra content out there for you to dive into.

Here's a few recommendations for you to stay up to date about everything that's happening in the GraphQL community and ecosystem:

- [GraphQL Weekly](https://graphqlweekly.com): A weekly GraphQL newsletter with news from the GraphQL ecosystem
- [GraphQL Radio](https://graphqlradio.com/): A podcast where active members from the GraphQL community are interviewed about their work
- [Prisma Blog](https://blog.graph.cool/) & [Apollo Blog](https://dev-blog.apollodata.com/): Both blogs regularly feature new and interesting content about GraphQL, from community news to technical deep dives.
