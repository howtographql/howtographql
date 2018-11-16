---
title: Introduction
pageTitle: "Building a GraphQL Server with PHP using Laravel Framework"
description: "Learn how to build a GraphQL server with PHP using Laravel Framework."
---

This is an introductory tutorial for building a GraphQL server with PHP using [Laravel](https://www.laravel.com) framework and [Lighthouse](https://github.com/nuwave/lighthouse) package.
While we try to keep it beginner friendly, we recommend familiarizing yourself
with [GraphQL](https://graphql.org/) and [Laravel](https://laravel.com/) first.

## What is GraphQL?

GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.
GraphQL provides a complete and understandable description of the data in your API,
gives clients the power to ask for exactly what they need and nothing more,
makes it easier to evolve APIs over time, and enables powerful developer tools.

<img src="https://raw.githubusercontent.com/nuwave/lighthouse-docs/master/docs/assets/tutorial/playground.png">  

GraphQL has been released only as a [*specification*](https://facebook.github.io/graphql/).
This means that GraphQL is in fact not more than a long document that describes in detail
the behaviour of a GraphQL server. 

So, GraphQL has its own type system that’s used to define the schema of an API.
The syntax for writing schemas is called [Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/) or short **SDL**.

Here is an example how we can use the SDL to define a type called `Person` and its
relation to another type `Post`.

```graphql
type Person {
  name: String!
  age: Int!
  posts: [Post]
}

type Post {
  title: String!
  author: Person!
}
```

Note that we just created a one-to-many relationship between `Person` and `Post`.
The type `Person` has a field `posts` that returns a list of `Post` types.

We also defined the inverse relationship from `Post` to `Person` through the `author` field.


> This short intro is a compilation from many sources, all credits goes to the original authors.
> - https://graphql.org
> - https://howtographql.com

## What is Lighthouse?

Lighthouse is a PHP package that allows you to serve a GraphQL endpoint from your Laravel application. It is built on top of very solid package [webonyx/graphql-php](https://github.com/webonyx/graphql-php)


It greatly reduces the boilerplate required to create a schema, integrates well with any Laravel project,
and is highly customizable giving you full control over your data. 

The whole process of building your own GraphQL server can be described in 3 steps:

1. Define the shape of your data using the Schema Definition Language
1. Use pre-built directives to bring your schema to life
1. Extend Lighthouse with custom functionality where you need it

<b>... and you are done!</b>

<img src="https://raw.githubusercontent.com/nuwave/lighthouse-docs/master/docs/assets/tutorial/flow.png">  

On the next chapter we will setup our project and start building our GraphQL API.