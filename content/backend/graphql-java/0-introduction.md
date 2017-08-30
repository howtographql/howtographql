---
title: Introduction
pageTitle: "Building a GraphQL Server with Java Backend Tutorial"
description: "Learn how to build a GraphQL server with graphql-java and best practices for filters, authentication, pagination and subscriptions. Compatible with Apollo."
question: Can a GraphQL server be implemented in any language?
answers: ["Yes", "No, GraphQL is a JavaScript-only thing", "Yes, but only the Node.js implementation exists", "No, only statically typed languages are suitable"]
correctAnswer: 0
---

### Motivation

Hovering around the top of most popularity indexes, Java holds a tight grip over vast segments of the market, and is frequently employed in scenarios well within GraphQL's sweet spot. This is especially true when taking into account the type systems of the two technologies, in majority of cases, fit rather neatly together.

### What is a GraphQL server?

The software component that parses, validates and executes GraphQL queries/mutations is commonly referred to as the GraphQL server. In this regard, it is similar to a database server that parses, validates and executes SQL queries. Implementations of GraphQL servers exist in a multitude of languages, implying easy introduction of GraphQL into virtually any technology stack.

In this chapter, you'll dive into the development of a custom GraphQL backend with Java.

### Schema-driven development

While contract-first design has been touted in various contexts, it has rarely been easy to employ.


> Developing the contract (be it in the form of WSDL or Swagger or anything else) often assumes a deep and precise understanding of the client's data requirements upfront, and this type of understanding is usually only developed *over time*.


GraphQL conveniently does away with this hurdle by making the decision of what data gets fetched the exclusive domain of the client, opening in turn a path to a much smoother API evolution. This is further complemented by GraphQL's self-describing nature (via [introspection queries](http://graphql.org/learn/introspection/)), making contract-first (or rather *schema-first*, in GraphQL lingo) approach both natural and easy.

The schema in GraphQL is the central contract between the client and the server, describing all the types of data and all the operations (queries and mutations) upon those types the server offers. Beyond the usual promise of client-server independence and easy mocking, developing in the schema-first style helps enforce the good practice of structuring the logic into smaller and simpler functions (the *[single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle)*) that can conveniently be used as resolvers.

With that said, the statically typed nature of Java also lends itself well to an alternative style, where the schema is generated dynamically, based on the typing information already present in the code. We will explore this approach briefly at the end of the track.

