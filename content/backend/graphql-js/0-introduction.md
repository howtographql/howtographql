---
title: Introduction
description: Read about what you'll learn in the graphql.js tutorial
---

### Motivation

Nowadays, serverless backends are getting more and more popular.  [Graphcool](https://www.graph.cool/), for example, lets you dive straight into your app's own logic, without worrying about this whole other layer of code as well. It's the perfect way to get started with GraphQL, and can even be used all the way to production for many use cases.

Sometimes you may need to get your hands dirty and write server code as well though. For example: if your project requires a different set of features, or maybe you just like having full control over the backend. Whatever the reason, if you're interested in learning how it all works, this is the section for you!

In this chapter you'll learn how to build your very own GraphQL server using the following technologies:

* Server

    * [Node.js](https://nodejs.org/en/): Runtime environment for building servers with JavaScript. GraphQL itself is language agnostic though, so check out the other tutorials in this section if you'd like to use a different one.
    * [Express](https://expressjs.com/): One of the most popular web server frameworks for Node.js. Again, GraphQL doesn't require it, so you can use others like [Koa](http://koajs.com/), [Hapi](https://hapijs.com/) or even no framework at all instead.
* Testing
    * [GraphiQL](https://github.com/graphql/graphiql): Extremely useful tool for quickly testing GraphQL APIs. There's no need to build a whole frontend app just to test use cases, but it can also be a pain to build and send GraphQL requests manually using [Postman](https://www.getpostman.com/) or other similar tools. Among other things, GraphiQL:
        * Generates a comprehensive documentation of all your available queries and mutations.
        * Provides a text editor where you can build requests, with syntax highlighting and autocomplete.
        * Displays the server's responses.
        * Is really simple to setup!

### What is a GraphQL Server?

A GraphQL server should be able to:

* Receive requests following the GraphQL format, for example:

```json
{ "query": "query { allLinks { url } }" }
```

* Connect to any necessary databases or services responsible for storing/fetching the actual data.
* Return a GraphQL response with the requested data, such as this:

```json
{ "data": { "allLinks": { "url": "http://graphql.org/" } } }
```

* Validate incoming requests against the schema definition and supported format. For example, if a query is made with an unknown field, the response should be something like:

```json
{
  "errors": [{
    "message": "Cannot query field \"unknown\" on type \"Link\"."
  }]
}
```

These are the basic features all GraphQL servers have, but of course they can do much more as needed. You can read in more detail about the expected behaviour of a GraphQL server in the [official specification](https://facebook.github.io/graphql/).

### Schema-Driven Development

An important thing to note about building a GraphQL server is the main development process will revolve around the schema definition. You'll see in this chapter that the main steps we'll follow will be something like this:

1. Define your types and the appropriate queries and mutations for them.
2. Implement functions called **resolvers** to handle these types and their fields.
3. As new requirements arrive, go back to step 1 to update the schema, and continue through the other steps.

The schema is a *contract* agreed on between the frontend and backend, so keeping it at the center allows both sides of the development to evolve without going off the spec. This also makes it easier to parallelize the work, since the frontend can move on with full knowledge of the API from the start, using a simple mocking service (or even a full backend such as Graphcool) which can later be easily replaced with the final server.
