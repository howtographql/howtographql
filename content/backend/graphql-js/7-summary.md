---
title: Summary
pageTitle: "Building a GraphQL Server with Javascript & Node.js Tutorial"
description: "You learned how to build a GraphQL server with graphql-js, Node.js & MongoDB and best practices for filters, authentication, pagination and subscriptions."
---

In this tutorial you learned how to build your very own GraphQL server from scratch, using Node.js, Express and Graphcool as a "GraphQL database" service.

The main process you went through for each feature you implemented consisted of these steps:

1. Adjust the Graphcool data model to account for the data the new feature requires (e.g. adding a `User` type for implementing authentication)
1. Deploy the the Graphcool database service to apply the changes from the previous step, this will update your auto-generated **Graphcool schema** which contains all the CRUD operations for the types in your data model 
1. Add a new root field to the **application schema** that represents the feature (e.g. `post(url: String!, description: String!): Link!` for posting new links)
1. Implement the resolver for the root field by delegating the exeuction to the Graphcool database service

Now that you already know all the basics, make sure to look deeper into anything that you're interested in learning more about. GraphQL is getting more and more popular, so there's tons of extra content out there for you to dive into.