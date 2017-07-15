---
title: Clients
description: In this chapter, you'll learn about the core concepts of GraphQL clients and the abstractions and functionalities they provide
question: What does a GraphQL client usually do before caching the results of a query?
answers: ["Validating the query results against the schema", "Normalizing the data", "Calling a resolver function", "Making the data available in the props of a React component"]
correctAnswer: 1
draft: false
---


Working with a GraphQL API on the frontend is a great opportunity to develop new abstractions and help implement common functionality on the client-side. Let's consider some "infrastructure" features that you probably want to have in your app:

- directly sending queries and mutations without constructing HTTP requests
- view-layer integration
- caching
- validating and optimizing queries based on the schema

Of course, nothing stops you from using plain HTTP to fetch your data and then shifting all the bits yourself until the right information ends up in your UI. But GraphQL provides the ability to abstract away a lot of the manual work you'd usually have to do during that process and lets you focus on the real important parts of your app! In the following, we'll discuss in a bit more detail what these tasks are.

> There are two major GraphQL clients available at the moment. The first one is [Apollo Client](http://dev.apollodata.com/), which is a community-driven effort to build a powerful and flexible GraphQL client for all major development platforms. The second one is called [Relay](https://facebook.github.io/relay/) and Facebook's homegrown GraphQL client that heavily optimizes for performance and is only available on the web.  

### Directly Sending Queries and Mutations

A major benefit of GraphQL is that it allows to fetch and update data in a _declarative_ manner. Put differently, we climb up one step higher on the API abstraction ladder and don't have to deal with low-level networking tasks ourselves any more.

When you previously used plain HTTP (like `fetch` in Javascript or `NSURLSession` on iOS) to load data from an API, all you need to do with GraphQL is write a query where you declare your data requirements and let the system take care of sending the request and handling the response for you. This is precisely what a GraphQL client will do.


### View Layer Integrations & UI updates

Once the server response was received and handled by the GraphQL client, the requested data somehow needs to end up in your UI. Depending on the platforms and frameworks you're developing with, there will be different approaches how UI updates are handled in general.

Taking React as an example, GraphQL clients use the concept of [higher-order components](https://facebook.github.io/react/docs/higher-order-components.html) to fetch the needed data under the hood and make it available in the `props` of your components. In general, the declarative nature of GraphQL ties in particularly well with [functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming) techniques. The two can form a powerful combination where a view simply declares its data dependencies and the UI is wired up with an FRP layer of your choice. 


### Caching Query Results: Concepts and Strategies

In the majority of applications, you'll want to maintain a cache of the data that was previously fetched from the server. Having information cached locally is essential to provide a fluent user experience and takes load off your users' data plans.

Generally when caching data, the intuition is to put information that's fetched remotely into a local _store_ from where it can be retrieved later on. With GraphQL, the naive approach would be to simply put the results of GraphQL queries into the store and whenever that exact same query is executed again, just return the previously stored data. It turns out that this approach is very inefficient for most applications. 

A more beneficial approach is to _normalize_ the data beforehand. That means that the (potentially nested) query result gets flattened and the store will only contain individual records that can be referenced with a globally unique ID. If you want to learn more about this, the [Apollo blog](http://dev.apollodata.com/core/how-it-works.html) has a great write-up on the topic.


### Build-time Schema Validation & Optimizations

Since the schema contains _all_ information about what a client can potentially do with a GraphQL API, there is a great opportunity to validate and potentially optimize the queries that a client wants to send already at build-time.

When the build environment has access to the schema, it can essentially parse all the GraphQL code that's located in the project and compare it against the information from the schema. This catches typos and other errors before an application gets into the hands of actual users where the consequences of an error would be a lot more drastic. 


### Colocating Views and Data Dependencies

A powerful concept of GraphQL is that it allows you to have UI code and data requirements side-by-side. The tight coupling of views and their data dependencies greatly improves developer experience. The mental overhead of thinking about how the right data ends up in the right parts of the UI is eliminated.

How well colocation works depends on the platform you're developing on. For example in Javascript applications, it's possible to actually put data dependencies and UI code into the same file. In Xcode, the _Assistant Editor_ can be used to work on view controllers and graphql code at the same time. 

