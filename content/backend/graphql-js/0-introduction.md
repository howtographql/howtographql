---
title: Introduction
pageTitle: "Building a GraphQL Server with Node.js & Prisma Backend Tutorial"
description: "Learn how to build a GraphQL server with graphql-yoga, Node.JS, Express & Prisma and best practices for filters, authentication, pagination and subscriptions."
question: Which of these is a requirement for GraphQL servers?
answers: ["Run in NodeJS", "Real time subscriptions support", "Validate incoming GraphQL requests", "Automatically generate queries and mutations from schema types"]
correctAnswer: 2
---

### Motivation

GraphQL is the rising star of backend technologies. It replaces REST as an API design paradigm and is becoming the new standard for exposing the functionality of a server.

In this tutorial, you'll learn how to build an _idiomatic_ GraphQL server using the following technologies:

* Server
  * [`graphql-yoga`](https://github.com/graphcool/graphql-yoga): Fully-featured GraphQL server with focus on easy setup, performance & great developer experience. Built on top of [Express](https://expressjs.com/), [`apollo-server`](https://github.com/apollographql/apollo-server), [`graphql-js`](https://github.com/graphql/graphql-js) and more.
  * [Prisma](https://www.prismagraphql.com/): GraphQL abstraction layer that turns your database into a GraphQL API which provides powerful, realtime CRUD operations for your data model.
  * [Node.js](https://nodejs.org/en/): Runtime environment for building servers with JavaScript. GraphQL itself is _programming language agnostic_, so check out the other tutorials in this section if you prefer to use another language.
  * [GraphQL Playground](https://github.com/graphql/graphiql): Extremely useful tool for quickly testing GraphQL APIs. There's no need to build a whole frontend app just to test use cases, but it can also be a pain to build and send GraphQL requests manually using [Postman](https://www.getpostman.com/) or other similar tools. Among other things, GraphQL Playgrounds...
    * ... auto-generate a comprehensive, multi-column documentation for all your available queries and mutations.
    * ... provide a text editor where you can write queries, mutations & subscriptions, with syntax highlighting and autocompletion.
    * ... let you specify HTTP headers for your queries and mutations.

### What is a GraphQL server?

A GraphQL server should be able to:

* Receive requests following the GraphQL format, for example:

```json
{ "query": "query { feed { url } }" }
```

* Connect to any necessary databases or services responsible for storing/fetching the actual data.
* Return a GraphQL response with the requested data, such as this:

```json
{ "data": { "feed": { "url": "http://graphql.org/" } } }
```

* Validate incoming requests against the schema definition and supported format. For example, if a query is made with an unknown field (e.g. `eifgnsdf`), the response should be something like:

```json
{
  "errors": [{
    "message": "Cannot query field \"eifgnsdf\" on type \"Link\"."
  }]
}
```

These are the basic features all GraphQL servers have, but of course they can do much more as needed. You can read in more detail about the expected behaviour of a GraphQL server in the [official specification](https://facebook.github.io/graphql/).
