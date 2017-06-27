---
title: Introduction
---

GraphQL is a new API standard that provides a more efficient, powerful and flexible alternative to REST. It was developed and open-sourced by Facebook and is now maintained by a large community of companies and individuals from all over the world.

> APIs have become ubiquitous components of software infrastructures. In short, an **API** defines how a _client_ can load data from a _server_. 

Most applications today have the need to fetch data from a backend where that data is stored in a database. It's the responsibility of the API to provide an interface to the stored data that fits the applications' needs.

When the concept of REST was developed, client applications were relatively simple and the development pace wasn't nearly where it is today. REST thus a was a good fit for many applications. However, the API landscape has notably changed over the last couple of years. In particular, there are three factors that have been challenging the way how APIs are designed:

- increased mobile usage creates need for efficient data loading
- variety of different frontend frameworks and platforms on the client-side make for heterogeneous API access
- fast development speed and expectation to rapdily deliver features on the frontend

Increased mobile usage, low-powered devices and sloppy networks were the initial reasons why Facebook developed GraphQL. GraphQL minimizes the amount of data that needs to be transferred over the network and thus majorly improves applications operating under these conditions.

The heterogeneous landscape of frontend frameworks and platforms that run client applications makes it difficult to build and maintain one API that would fit the requirements of all. With GraphQL, each client can access precisely the data it needs.

Continuous deployment has become a standard for many companies, rapid iterations and frequent product updates are indispensable. With REST APIs, the way how data is exposed by the server often needs to be modified to account for specific requirements and design changes on the client-side.  


### GraphQL is the Better REST

Over the past decade, REST has become the standard (yet a fuzzy one) for building APIs. It offers some great ideas, such as _stateless servers_ and _structured access to resources_. However, REST APIs have shown to be too inflexible to keep up with the rapidly changing requirements of the clients that access them.

GraphQL was developed to cope with the need for more flexibility and efficiency! It solves many of the shortcomings and ineffiencies that developers experience when interacting with REST APIs.

#### No more Over- and Underfetching

One of the most common problems with REST is that of over- and underfetching. _Overfetching_ means that a client downloads more information than is actually required in the app. Imagine for example a screen that needs to display a list of users. In a REST API, this app would usually hit the `/users` endpoint and receive JSON array with user data. This response however might contain more info about the users that are returned, e.g. their birthdays or addresses - information that is useless for the client because it only needs to display the users' names. 

Another issue is _underfetching_ and the _n+1_-requests problem. Underfetching generally means that a specific endpoint doesn't provide enough of the required information. The client will have to make additional requests to fetch everything it needs. This can escalate to a situation where a client needs to first download a list of elements, but then needs to make one additional request per element to fetch the required data.

#### Rapid Product Iterations on the Frontend

A common pattern with REST APIs is to structure the endpoints according to the views that you have inside your app. This is handy since it allows for the client to get all required information for a particular view by simply accessing the corresponding endpoint.

The major drawback of this approach is that it doesn't allow for rapid iterations on the frontend. With every change that is made to the UI, there is a high risk that now there is more (or less) data required than before. Consequently, the backend needs to be adjusted as well to account for the new data needs. This kills productivy and notably slows down the ability to incorporate user feedback into a product. 

With GraphQL, this problem is solved. Thanks to the flexible nature of GraphQL, changes on the client-side can be made without any extra work on the server. Since clients can specify their exact data requirements, no backend engineer needs to make adjustments when the design and data needs on the frontend change.

#### Insightful Analytics on the Backend

GraphQL allows to have fine-grained insights about the data that's requested on the backend. As each client specifies exactly what information it's interested in, it is possible to gain a deep understanding of how the available data is being used. This can for example help in evolving an API and deprecating specific fields that are not requested by any clients any more.

With GraphQL, you can also do low-level performance monitoring of the requests that processed by your server. GraphQL uses the concept of _resolver functions_ to collect the data that's requested by a client. Instrumenting and measuring performance of these resolvers provides crucial insights about bottlenecks in your system. 

#### Benefits of a Schema & Type System

GraphQL uses a strong type system to define the capabilities of an API. All the types that are exposed in a GraphQL API are written down in a _schema_ using the GraphQL Schema Definition Language (SDL). This schema serves as the contract between the client and the server to define how a client can access the data. 

Having this contract is beneficial in many ways. One of them is a new development process called _schema-first development_ where frontend and backend teams agree on a strict set of API features that are written down in the schema upfront. Since the schema contains all knowledge about potential API requests, features like code generation are popular in many (espcially strongly typed) languages when working with GraphQL APIs. The schema can also be leveraged for validating GraphQL queries already at build time of an application to catch all potential API issues.


### History, Context & Adoption

Facebook started working on GraphQL already in 2012 in the context of their native mobile apps. It was developed out of the need to make data transfer more efficient, especially with respect to low-powered devices and bad network conditions. 

The first time Facebook publicly spoke about GraphQL was at [React.js Conf 2015](https://www.youtube.com/watch?v=9sc8Pyc51uU) and shortly after announced their [plans to open source](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html) it.

Because Facebook always used to speak about GraphQL in the context of [React](https://facebook.github.io/react/), it took a while for non-React developers to understand that GraphQL was by no means a technology that was limited to usage with React. In fact, GraphQL is a technology that can be used everywhere where a client communicates with an API!

Interestingly, other companies like Netflix or Coursera were working on comparable ideas to make API interactions more efficient. Coursera envisioned a similar technology to let a client specify its data requirements and Netflix even open-sourced their solution called [Falcor](https://github.com/Netflix/falcor). After GraphQL was open-sourced, Coursera completely cancelled their own efforts and hopped on the GraphQL train.

Today, GraphQL is used in production by [lots of different companies](http://graphql.org/users/) such as GitHub, Twitter, Yelp or Shopify - to name only a few. There are entire conferences dedicated to GraphQL such as [GraphQL Summit](https://summit.graphql.com/) (San Francisco) or [GraphQL Europe](https://graphql-europe.org/) and more resources like the [GraphQL Radio](https://graphqlradio.com/) podcast and [GraphQL Weekly](https://graphqlweekly.com/) newsletter. 


