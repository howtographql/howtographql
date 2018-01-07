---
title: Introduction
pageTitle: "Building a GraphQL Server with Node.js Backend Tutorial"
description: "Learn how to build a GraphQL server with graphql-yoga, Node.JS, Express & Graphcool and best practices for filters, authentication, pagination and subscriptions."
question: Which of these is a requirement for GraphQl servers?
answers: ["Run in NodeJS", "Real time subscriptions support", "Validate incoming GraphQL requests", "Automatically generate queries and mutations from schema types"]
correctAnswer: 2
description: Read about what you'll learn in the graphql.js tutorial
---

### Motivation

GraphQL is the rising star of backend technologies. It replaces REST as an API design paradigm and is becoming the new standard for exposing the functionality of a server.

In this tutorial, you'll learn how to build an _idiomatic_ GraphQL server using the following technologies:

* Server
  * [Graphcool](https://www.graph.cool/): "GraphQL database" providing a powerful, realtime CRUD API for your data model.
  * [`graphql-yoga`](https://github.com/graphcool/graphql-yoga/): Fully-featured GraphQL server with focus on easy setup, performance & great developer experience. Built on top of [Express](https://expressjs.com/), [`apollo-server`](https://github.com/apollographql/apollo-server), [`graphql-js`](https://github.com/graphql/graphql-js) and more.
  * [Node.js](https://nodejs.org/en/): Runtime environment for building servers with JavaScript. GraphQL itself is _programming language agnostic_, so check out the other tutorials in this section if you prefer to use another language.
  * [GraphQL Playgorund](https://github.com/graphql/graphiql): Extremely useful tool for quickly testing GraphQL APIs. There's no need to build a whole frontend app just to test use cases, but it can also be a pain to build and send GraphQL requests manually using [Postman](https://www.getpostman.com/) or other similar tools. Among other things, GraphQL Playgrounds:
    * Auto-generate a comprehensive, multi-column documentation for all your available queries and mutations.
    * Provide a text editor where you can write queries, mutations & subscriptions, with syntax highlighting and autocompletion.
    * Let you specify HTTP headers for your queries and mutations.

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

### Schema-driven development

An important thing to note about building a GraphQL server is the main development process will revolve around the _schema definition_. You'll see in this chapter that the main steps we'll follow will be something like this:

1. Define your types and the appropriate queries and mutations for them.
1. Implement functions called **resolvers** to handle these types and their fields.
1. As new requirements arrive, go back to step 1 to update the schema, and continue through the other steps.

The schema is a _contract_ agreed on between the frontend and backend, so keeping it at the center allows both sides of the development to evolve without going off the spec. This also makes it easier to parallelize the work, since the frontend can move on with full knowledge of the API from the start, using a simple mocking service which can later be easily replaced with the final server.