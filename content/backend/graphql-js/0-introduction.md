---
title: Introduction
pageTitle: "Building a GraphQL Server with Node.js & Prisma Tutorial"
description: "Learn how to build a GraphQL server with graphql-yoga, Node.js & Prisma and best practices for authentication, filtering, pagination and subscriptions."
question: What is a GraphQL Playground?
answers: ["A GraphQL IDE to work with a GraphQL API", "A tool to generate GraphQL operations", "A REST client", "The successor of Postman"]
correctAnswer: 0
---

> **Note**: The final project for this tutorial can be found on [GitHub](https://github.com/howtographql/graphql-js). You can always use it as a reference whenever you get lost throughout the course of the following chapters.
> Also note that each code block is annotated with a filename. These annotations directly link to the corresponding file on GitHub so you can clearly see where to put the code and what the end result will look like.

### Overview

GraphQL is the rising star of backend technologies. It replaces REST as an API design paradigm and is becoming the new standard for exposing the data and functionality of a server.

In this tutorial, you'll learn how to build an _idiomatic_ GraphQL server entirely from scratch. You are going to use the following technologies:

* [`graphql-yoga`](https://github.com/graphcool/graphql-yoga): Fully-featured GraphQL server with focus on easy setup, performance & great developer experience. It is built on top of [Express](https://expressjs.com/), [`apollo-server`](https://github.com/apollographql/apollo-server), [`graphql-js`](https://github.com/graphql/graphql-js) and more.
* [Prisma](https://www.prisma.io/): GraphQL database proxy that turns your database into a GraphQL API. This API provides powerful, realtime CRUD operations for your data model.
* [`graphql-config`](https://github.com/graphcool/graphql-config) & [GraphQL CLI](https://github.com/graphql-cli/graphql-cli): Tooling to improve various GraphQL-related worfklows.
* [GraphQL bindings](https://blog.graph.cool/reusing-composing-graphql-apis-with-graphql-bindings-80a4aa37cff5): A convenient way of working with a GraphQL API. The binding generates dedicated JavaScript functions for each API operation.
* [GraphQL Playground](https://github.com/graphcool/graphql-playground): "GraphQL IDE" that allows to interactively explore the functionality of a GraphQL API by sending queries and mutations to it. It's somewhat similar to [Postman](https://www.getpostman.com/) which offers comparable functionality for REST APIs. Among other things, a GraphQL Playground...
  * ... auto-generates a comprehensive documentation for all available API operations.
  * ... provides an editor where you can write queries, mutations & subscriptions, with auto-completion(!) and syntax highlighting.
  * ... lets you easily share your API operations.

### What to expect

The goal of this tutorial is to build an API for a [Hacker News](https://news.ycombinator.com/) clone. Here is a quick rundown of what to expect in this tutorial.

You'll start by learning the basics of how a GraphQL server works, simply by defining a [_GraphQL schema_](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) for the server and writing corresponding _resolver functions_. In the beginning, these resolvers will only work with data that's stored in-memory - so nothing will be persisted beyond the runtime of the server.

Because nobody wants a server that's not able to store and persist data, you're going to add a database layer to it. The database layer is powered by [Prisma](https://www.prisma.io/) and will be connected to your GraphQL server via [Prisma bindings](https://github.com/graphcool/prisma-binding). You can think of these bindings as a "GraphQL ORM" that helps you properly resolve incoming queries.

Once you have the database connected, you are going to add more advanced features to the API.

You'll start by implementing signup/login functionality that enables users to authenticate against the API. This will also allow you to check the permissions of your users for certain API operations.

The next part of the tutorial is about adding realtime functionality to your API using GraphQL subscriptions.

Lastly, you'll allow the consumers of the API to constrain the list of items they retrieve from the API by adding filtering and pagination capabalities to it.

Let's get started 🚀