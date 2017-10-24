---
title: Introduction
pageTitle: "Building a GraphQL Server with Scala Backend Tutorial"
description: "Learn how to build a GraphQL server with Scala & Sangria and best practices for filters, authentication, pagination and subscriptions. "

---

### Motivation

Scala is very popular language nowadays and it's often chosen to deliver efficient and distributed systems. It leverages the Java VM, known mostly for its efficiency. Support of Functional Programming and power of Java make able to deliver applications fast in either development or runtime.

In the next chapters you'll learn how to build your own GraphQL server using Scala and the following technologies:
  * [Scala](https://www.scala-lang.org/) Scala language
  * [Akka HTTP](http://doc.akka.io/docs/akka-http/current/scala/http) Web server to handle HTTP requests.
  * [Sangria](http://sangria-graphql.org/) A library for GraphQL execution
  * [Slick](http://slick.lightbend.com/) A Database query and access library.
  * [H2 Database](http://www.h2database.com/html/main.html) In-memory database.
  * [Graphiql](https://github.com/graphql/graphiql) A simple GraphQL console to play with.

I assume you're familiar with GraphQL concepts, but if not, you can visit [GraphQL site](http://graphql.org/) to learn more about that.

### What is a GraphQL Server?

A GraphQL server should be able to:

* Receive requests following the GraphQL format, for example:

```graphql(nocopy)
{  "query": "query { allLinks { url } }" }
```

* Connect to any necessary databases or other data management services.
* Return a GraphQL response with the requested data, such this one:

```graphql(nocopy)
{ "data": { "allLinks": { "url": "http://graphql.org/" } } }
```

* Validate incoming requests against the schema definition and supported formats. For example, if a query is made with an unknown field, the response should be something like:

```graphql(nocopy)
{
  "errors": [{
    "message": "Cannot query field \"unknown\" on type \"Link\"."
  }]
}
```

These are the basic features all GraphQL servers have for sure, but some of the implementation can do much more than this. In this tutorial I'll rather focus only on features which are part of GraphQL specifications.


### Schema-Driven Development

The secret sauce of a GraphQL server is its schema. The schema gives you an unified type system for your specific domain and the tools to hook up code to those types to make things happen when people mutate or request them.

Sensibly then, the experience of building a GraphQL server starts with working on its schema. You'll see in this chapter that the main steps you'll follow will be something like this:

1. Define your types and the appropriate queries and mutations for them.
2. Implement functions called **resolvers** to handle these types and their fields.
3. As new requirements arrive, go back to step 1 to update the schema, and continue through the other steps.

The schema is a contract agreed on between the frontend and backend, so keeping it at the center allows both sides of the development to evolve without going off the spec. This also makes it easier to parallelize the work, since the frontend can move on with full knowledge of the API from the start, using a simple mocking service (or even a full backend such as Graphcool) which can later be easily replaced with the final server.


### Goal of the turorial

The goal of this tutorial is to make server able to run the following schema, :


```graphql(nocopy)(https://github.com/howtographql/howtographql/blob/master/meta/structure.graphql)
type Query {
  allLinks(filter: LinkFilter, orderBy: LinkOrderBy, skip: Int, first: Int): [Link!]!
  _allLinksMeta: _QueryMeta!
}

type Mutation {
  signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  createUser(name: String!, authProvider: AuthProviderSignupData!): User
  createLink(description: String!, url: String!, postedById: ID): Link
  createVote(linkId: ID, userId: ID): Vote
}

type Subscription {
  Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
  Vote(filter: VoteSubscriptionFilter): VoteSubscriptionPayload
}

interface Node {
  id: ID!
}

type User implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
  email: String @isUnique
  password: String
}

type Link implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  url: String!
  description: String!
  postedBy: User! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Vote implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}

input AuthProviderSignupData {
  email: AUTH_PROVIDER_EMAIL
}

input AUTH_PROVIDER_EMAIL {
  email: String!
  password: String!
}

input LinkSubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}

input VoteSubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}

input LinkFilter {
  OR: [LinkFilter!]
  description_contains: String
  url_contains: String
}

type SigninPayload {
  token: String
  user: User
}

type LinkSubscriptionPayload {
  mutation: _ModelMutationType!
  node: Link
  updatedFields: [String!]
}

type VoteSubscriptionPayload {
  mutation: _ModelMutationType!
  node: Vote
  updatedFields: [String!]
}

enum LinkOrderBy {
  createdAt_ASC
  createdAt_DESC
}

enum _ModelMutationType {
  CREATED
  UPDATED
  DELETED
}

type _QueryMeta {
  count: Int!
}

scalar DateTime
```
