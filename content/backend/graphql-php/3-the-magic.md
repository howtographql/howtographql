---
title: The Magic
pageTitle: "Building a GraphQL Server with PHP using Laravel Framework"
description: "Learn how to build a GraphQL server with PHP using Laravel Framework. Setting up the GraphQL schema and wiring it up with the app."
---

On the previous chapter we have setted up our classes. Now it is time to see our GraphQL API in action.

Let's edit `routes/graphql/schema.graphql` and define our blog schema, based on the Eloquent Models we created. Clear all content from `routes/graphql/schema.graphql` and move on.

<Instruction>

First, define the root Query type which contains two different queries for retrieving posts.

```graphql
type Query{
    posts: [Post!]! @all
    post(id: Int! @eq): Post @find
}
```

</Instruction>

The way that Lighthouse knows how to resolve the queries is a combination of convention-based
naming - the type name `Post` is also the name of our Model - and the use of server-side directives.

- [`@all`](directives#all) just gets you a list of all `Post` models
- [`@find`](directives#find) and [`@eq`](directives#eq) are combined to retrieve a single `Post` by its ID


<Instruction>

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

</Instruction>

Just like in Eloquent, we express the relationship between our types using the
[`@belongsTo`](directives#belongsTo) and [`@hasMany`](directives#hasMany) directives. Note this content is very similar to the default GraphQL SDL, we just annotated it with some Lighthouse directives.

## The Final Test

At this point we have a fully working GraphQL API. Insert some fake data into your database, you can use [Laravel seeders](https://laravel.com/docs/seeding) for that, or just do it manually straight into the database.

<Instruction>

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

</Instruction>

You should get a list of all the posts in your database, together will all the comments and user information
defined upon.