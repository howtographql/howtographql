---
title: Introduction
pageTitle: 'Building a GraphQL Server with Node.js & TypeScript'
description:
  'Learn how to build a GraphQL server with Node.js, Fastify, TypeScript, GraphQL-Helix & Prisma 3 and best practices for authentication,
  filtering, pagination and subscriptions.'
question: 'What database are you using in this tutorial?'
answers: ['PostgreSQL', 'MySQL', 'SQLite', 'Oracle']
correctAnswer: 2
---

### Overview

GraphQL is the rising star of backend technologies. It's a popular alternative for REST as an API design paradigm and is becoming the new
standard for exposing the data and functionality of a web server.

In this tutorial, you'll learn how to build an _idiomatic_ GraphQL server entirely from scratch. 

You are going to use the following technologies: 

- [Node.js](https://nodejs.org/) - as an engine and runtime for our server.
- [TypeScript](https://www.typescriptlang.org/) - a strongly typed programming language which builds on JavaScript giving you better tooling at any scale.
- [`fastify`](https://www.fastify.io/) - a rising star in the HTTP servers ecosystem, very fast and efficient.
- [`graphql-js`](https://github.com/graphql/graphql-js) - we will use the core `graphql` library as execution engine for our server. 
- [`graphql-helix`](https://github.com/contrawork/graphql-helix) - a collection of utility functions for building your own GraphQL HTTP server. 
- [Prisma](https://www.prisma.io/): Replaces traditional ORMs. Use Prisma Client to access your database inside of
  GraphQL resolvers.
- [GraphiQL](https://github.com/graphql/graphiql): A "GraphQL IDE" that allows you to interactively
  explore the functionality of a GraphQL API by sending queries and mutations to it. It's somewhat similar to
  [Postman](https://www.getpostman.com/) which offers comparable functionality for REST APIs. Among other things,
  GraphiQL:
  - Auto-generates comprehensive documentation for all available API operations.
  - Provides an editor where you can write queries, mutations & subscriptions, with auto-completion(!) and syntax
    highlighting.

You can find the [code of the tutorial in this repository](https://github.com/dotansimha/graphql-typescript-node-tutorial).

### What to expect

The goal of this tutorial is to build an API for a [HackerNews](https://news.ycombinator.com/) clone. Here is a quick
rundown of what to expect.

You'll start by learning the basics of how a GraphQL server works, simply by defining a
[_GraphQL schema_](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) for the server and writing
corresponding _resolver functions_. In the beginning, these resolvers will only work with data that's stored in-memory -
so nothing will persist beyond the runtime of the server.

Nobody wants a server that's not able to store and persist data, right? Not to worry! Next, you're going to add a
[SQLite](http://sqlite.org/) database to the project which will be accessed using [Prisma 3](https://www.prisma.io/).

Once you have the database connected, you are going to add more advanced features to the API.

You'll start by implementing signup/login functionality that enables users to authenticate against the API. This will
also allow you to check the permissions of your users for certain API operations.

Next, you'll allow the consumers of the API to constrain the list of items they retrieve from the API by adding
filtering and pagination capabilities to it.

Let's get started 🚀
