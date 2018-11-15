---
title: The Magic
pageTitle: "Building a GraphQL Server with PHP using Laravel Framework"
description: "Learn how to build a GraphQL server with PHP using Laravel Framework. Setting up the GraphQL schema and wiring it up with the app."
---

Let's edit `routes/graphql/schema.graphql` and define our blog schema, based on the Eloquent Models we created.

First, we define the root Query type which contains two different queries for retrieving posts.

```graphql
type Query{
    posts: [Post!]! @all
    post(id: Int! @eq): Post @find
}
```

The way that Lighthouse knows how to resolve the queries is a combination of convention-based
naming - the type name `Post` is also the name of our Model - and the use of server-side directives.

- [`@all`](directives#all) just gets you a list of all `Post` models
- [`@find`](directives#find) and [`@eq`](directives#eq) are combined to retrieve a single `Post` by its ID

<br />

Then, we add additional type definitions that clearly define the shape of our data. 

```graphql
type Query{
    posts: [Post] @all
    post (id: Int! @eq): Post @find
}

type User {
    id: ID!
    name: String!
    email: String!
    created_at: DateTime!
    updated_at: DateTime!
    posts: [Post] @hasMany
}

type Post {
    id: ID!
    title: String!
    content: String!
    user: User! @belongsTo
    comments: [Comment] @hasMany
}

type Comment{
    id: ID!
    reply: String!
    post: Post! @belongsTo
}
```

Just like in Eloquent, we express the relationship between our types using the
[`@belongsTo`](directives#belongsTo) and [`@hasMany`](directives#hasMany) directives.

## The Final Test

Insert some fake data into your database, you can use [Laravel seeders](https://laravel.com/docs/seeding) for that.

Visit http://127.0.0.1:8000/graphql-playground and try the following query:

```graphql
{
  posts {
    id
    title
    user {
      id
      name
    }
    comments {
      id
      reply
    }
  }
}
```

You should get a list of all the posts in your database, together will all the comments and user information
defined upon.

I hope this example shows a taste of the power of GraphQL and how Lighthouse makes it
easy to build your own server with Laravel. 