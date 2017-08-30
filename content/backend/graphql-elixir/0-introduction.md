---
title: Introduction
pageTitle: "Building a GraphQL Server with Elixir Backend Tutorial"
description: "Learn how to build a GraphQL server with Elixir & Absinthe and best practices for filters, authentication, pagination and subscriptions. Compatible with Apollo."
---

### Motivation

Elixir is a functional programming language designed for building scalable and maintainable applications. Elixir leverages the Erlang VM, known for running low-latency, distributed and fault-tolerant systems, while also being successfully used in web development and the embedded software domain. Erlang is perhaps best known for its role in the telecommunications backbone, and for powering WhatsApp.

GraphQL and Elixir go really well together, and this part of the tutorial will help get you on your way if you want to explore this combination. Elixir's functional style fits very naturally with GraphQL, and its concurrency makes working with stuff like subscriptions a breeze.

In this chapter you'll learn how to build your very own GraphQL server using the following technologies:

* Server
    * Elixir: The programming language https://elixir-lang.org/
    * Phoenix: Web framework in Elixir http://www.phoenixframework.org/
    * Absinthe: GraphQL implementation for Elixir that will handle running GraphQL queries submitted via Phoenix. http://absinthe-graphql.org/
* Testing
    * [GraphiQL](https://github.com/graphql/graphiql): Extremely useful tool for quickly testing GraphQL apis. By the end of this tutorial you should be able to update your previous frontend code to replace the Graphcool endpoint and point to your new server instead, but until then it'll be easier for us to test the api through GraphiQL. Among other things, it:
        * Generates a comprehensive documentation of all your available queries and mutations.
        * Provides a text editor where you can build requests, with syntax highlighting and autocomplete.
        * Displays the server's responses.

If you have any questions along the way feel free to reach out via http://absinthe-graphql.org/community/

### What is a GraphQL Server?

A GraphQL server should be able to:

* Receive requests following the GraphQL format, for example:

```graphql(nocopy)
{ "query": "query { allLinks { url } }" }
```

* Connect to any necessary databases or services responsible for storing/fetching the actual data.
* Return a GraphQL response with the requested data, such as this:

```graphql(nocopy)
{ "data": { "allLinks": { "url": "http://graphql.org/" } } }
```

* Validate incoming requests against the schema definition and supported format. For example, if a query is made with an unknown field, the response should be something like:

```graphql(nocopy)
{
  "errors": [{
    "message": "Cannot query field \"unknown\" on type \"Link\"."
  }]
}
```

These are the basic features all GraphQL servers have, but of course they can do much more as needed.


### Schema-Driven Development

The secret sauce of a GraphQL server is its schema. The schema gives you a unified type system for your specific domain, and the tools to hook up code to those types to make things happen when people mutate or request them.

Sensibly then, the experience of building a GraphQL server starts with working on its schema. You'll see in this chapter that the main steps you'll follow will be something like this:

1. Define your types and the appropriate queries and mutations for them.
2. Implement functions called **resolvers** to handle these types and their fields.
3. As new requirements arrive, go back to step 1 to update the schema, and continue through the other steps.

The schema is a contract agreed on between the frontend and backend, so keeping it at the center allows both sides of the development to evolve without going off the spec. This also makes it easier to parallelize the work, since the frontend can move on with full knowledge of the API from the start, using a simple mocking service (or even a full backend such as Graphcool) which can later be easily replaced with the final server.
