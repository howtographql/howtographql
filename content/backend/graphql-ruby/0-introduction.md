---
title: Introduction
pageTitle: "Building a GraphQL Server with Ruby Backend Tutorial"
description: "Learn how to build a GraphQL server with graphql-ruby and best practices for filters, authentication, pagination and subscriptions. Compatible with Apollo."
---

### Motivation

[Ruby](https://www.ruby-lang.org/en/) is general purpose programming language optimized for programmer happiness. One of its most popular frameworks for building web applications is called [Ruby On Rails](http://rubyonrails.org/).

The Ruby ecosystem was one of the first to adopt [GraphQL](http://graphql.org/). A couple of popular Ruby on Rails applications like [Github](https://github.com/) and [Shopify](https://www.shopify.com/) are using it production already.

In this chapter you'll learn how to build your very own [GraphQL](http://graphql.org/) server using the following technologies:

* [Ruby On Rails](http://rubyonrails.org/): the most popular library for building applications in [Ruby](https://www.ruby-lang.org/en/)
* [GraphQL Gem](http://graphql-ruby.org/): the most popular library for building [GraphQL](http://graphql.org/) applications
* [GraphiQL](https://github.com/graphql/graphiql): An in-browser IDE for exploring [GraphQL](http://graphql.org/), which comes bundled with [GraphQL Gem](http://graphql-ruby.org/)

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

* Validate incoming requests against the schema definition and the supported format. For example, if a query is made with an unknown field, the response should be something like:

```graphql(nocopy)
{
  "errors": [{
    "message": "Cannot query field \"unknown\" on type \"Link\"."
  }]
}
```

These are the basic features all GraphQL servers have, but of course, they can do much more as needed. You can read in more detail about the expected behavior of a GraphQL server in the [official specification](https://facebook.github.io/graphql/).

### Schema-Driven Development

An important thing to note about building a GraphQL server is that the main development process will revolve around the schema definition. You'll see in this chapter that the main steps we'll follow will be something like this:

1. Define your types and the appropriate queries and mutations for them.
2. Implement functions called **resolvers** to handle these types and their fields.
3. As new requirements arrive, go back to step 1 to update the schema and continue through the other steps.

The schema is a *contract* agreed on between the frontend and backend, so keeping it at the center allows both sides of the development to evolve without going off the spec. This also makes it easier to parallelize the work, since the frontend can move on with full knowledge of the API from the start, using a simple mocking service (or even a full backend such as [Graphcool](https://www.graph.cool/)) which can later be easily replaced with the final server.

