---
title: Common Questions
description: In this chapter, we answer common questions people have about GraphQL
question: How does a GraphQL server deal with failures?
answers: ["A GraphQL server never fails", "It uses HTTP status codes to indicate what went wrong", "It returns a dedicated errors object in the server response", "It starts crying and hides under the bed"]
correctAnswer: 2
---


### Is GraphQL a Database Technology?

No. GraphQL is often confused with being a database technology. This is a misconception, GraphQL is a _query language_ for APIs - not databases. In that sense it's database agnostic and can be used with any kind of database or even no database at all.

### Is GraphQL only for React / Javascript Developers?

No. GraphQL is an API technology so it can be used in any context where an API is required. 

On the _backend_, a GraphQL server can be implemented in any programming language that can be used to build a web server. Next to Javascript, there are popular reference implementations for Ruby, Python, Scala, Java, Clojure, Go and .NET.

Since a GraphQL API is usually operated over HTTP, any client that can speak HTTP is able to query data from a GraphQL server. 

> Note: GraphQL is actually transport layer agnostic, so you could choose other protocols than HTTP to implement your server.

### How to do Server-side Caching?

One common concern with GraphQL, especially when comparing it to REST, are the difficulties to maintain server-side cache. With REST, it's easy to cache the data for each endpoint, since it's sure that the _structure_ of the data will not change.

With GraphQL on the other hand, it's not clear what a client will request next, so putting a caching layer right behind the API doesn't make a lot of sense. 

Server-side caching still is a challenge with GraphQL. More info about caching can be found on the [GraphQL website](http://graphql.org/learn/caching/). 

### How to do Authentication and Authorization?

Authentication and authorization are often confused. _Authentication_ describes the process of claiming an _identity_. That's what you do when you log in to a service with a username and password, you authenticate yourself. _Authorization_ on the other hand describes _permission rules_ that specify the access rights of individual users and user groups to certain parts of the system.

Authentication in GraphQL can be implemented with common patterns such as [OAuth](https://oauth.net/).

To implement authorization, it is [recommended](http://graphql.org/learn/authorization/) to delegate any data access logic to the business logic layer and not handle it directly in the GraphQL implementation. If you want to have some inspiration on how to implement authorization, you can take a look [Graphcool's permission queries](https://www.graph.cool/blog/2017-04-25-graphql-permission-queries-oolooch8oh/).

### How to do Error Handling?

A successful GraphQL query is supposed to return a JSON object with a root field called `"data"`. If the request fails or partially fails (e.g. because the user requesting the data doesn't have the right access permissions), a second root field called `"errors"` is added to the response:

```js
{
  "data": { ... },
  "errors": [ ... ]
}
```

For more details, you can refer to the [GraphQL specification](http://facebook.github.io/graphql/#sec-Errors). 

### Does GraphQL Support Offline Usage?

GraphQL is a query language for (web) APIs, and in that sense by definition only works online. However, offline support on the client-side is a valid concern. The caching abilities of Relay and Apollo might already be enough for some use cases, but there isn't a popular solution for actually persisting stored data yet. You can gain some more insights in the GitHub issues of [Relay](https://github.com/facebook/relay/issues/676) and [Apollo](https://github.com/apollographql/apollo-client/issues/424) where offline support is discussed.


