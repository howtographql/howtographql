# GraphQL Basics

## Introduction

[GraphQL](http://www.graphql.org/) is a new API standard that provides a more efficient, powerful and flexible alternative to REST. It was developed and [open-sourced by Facebook](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) and is now maintained by a large community of companies and individuals from all over the world.

> APIs have become ubiquitous components of software infrastructures. In short, an **API** defines how a **client** can load data from a **server**. 

Most applications today have the need to fetch data from a backend where that data is stored in a database. It’s the responsibility of the API to provide an interface to the stored data that fits an application’s needs.

GraphQL is often confused with being a database technology. This is a misconception, GraphQL is a *query language* for APIs - not databases. In that sense it's database agnostic and effectively can be used in any context where an API is used.

[REST](https://en.wikipedia.org/wiki/Representational_state_transfer) has been a popular way to expose data from a server. When the concept of REST was developed, client applications were relatively simple and the development pace wasn’t nearly where it is today. REST thus a was a good fit for many applications. However, the API landscape has radically changed over the last couple of years. In particular, there are three factors that have been challenging the way how APIs are designed:

* increased mobile usage creates need for efficient data loading
* variety of different frontend frameworks and platforms on the client-side make for heterogeneous API access
* fast development speed and expectation to rapidly deliver features on the frontend

Increased mobile usage, low-powered devices and sloppy networks were the initial reasons why Facebook developed GraphQL. GraphQL minimizes the amount of data that needs to be transferred over the network and thus majorly improves applications operating under these conditions.

The heterogeneous landscape of frontend frameworks and platforms that run client applications makes it difficult to build and maintain one API that would fit the requirements of all. With GraphQL, each client can access precisely the data it needs.

Continuous deployment has become a standard for many companies, rapid iterations and frequent product updates are indispensable. With REST APIs, the way how data is exposed by the server often needs to be modified to account for specific requirements and design changes on the client-side. This hinders fast development practices and product iterations.

### History, Context & Adoption

Facebook started working on GraphQL already in 2012 in the context of their native mobile apps. It was developed out of the need to make data transfer more efficient, especially with respect to low-powered devices and bad network conditions. 

The first time Facebook publicly spoke about GraphQL was at [React.js Conf 2015](https://www.youtube.com/watch?v=9sc8Pyc51uU) and shortly after announced their [plans to open source](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html) it. Because Facebook always used to speak about GraphQL in the context of [React](https://facebook.github.io/react/), it took a while for non-React developers to understand that GraphQL was by no means a technology that was limited to usage with React. 

In fact, GraphQL is a technology that can be used everywhere where a client communicates with an API. Interestingly, other companies like [Netflix](https://medium.com/netflix-techblog) or [Coursera](https://building.coursera.org/) were working on comparable ideas to make API interactions more efficient. Coursera envisioned a similar technology to let a client specify its data requirements and Netflix even open-sourced their solution called [Falcor](https://github.com/Netflix/falcor). After GraphQL was open-sourced, Coursera completely cancelled their own efforts and hopped on the GraphQL train.

Today, GraphQL is used in production by [lots of different companies](http://graphql.org/users/) such as GitHub, Twitter, Yelp or Shopify - to name only a few. There are entire conferences dedicated to GraphQL such as [GraphQL Summit](https://summit.graphql.com/) or [GraphQL Europe](https://graphql-europe.org/) and more resources like the [GraphQL Radio](https://graphqlradio.com/) podcast and [GraphQL Weekly](https://graphqlweekly.com/) newsletter. 

![](http://imgur.com/J8gweUb.png)

## GraphQL is the Better REST

Over the past decade, REST has become the standard (yet a fuzzy one) for building web APIs. It offers some great ideas, such as *stateless servers* and *structured access to resources*. However, REST APIs have shown to be too inflexible to keep up with the rapidly changing requirements of the clients that access them.

GraphQL was developed to cope with the need for more flexibility and efficiency! It solves many of the shortcomings and inefficiencies that developers experience when interacting with REST APIs.

### No more Over- and Underfetching

One of the most common problems with REST is that of over- and underfetching. *Overfetching* means that a client downloads more information than is actually required in the app. Imagine for example a screen that needs to display a list of users. In a REST API, this app would usually hit the `/users` endpoint and receive JSON array with user data. This response however might contain more info about the users that are returned, e.g. their birthdays or addresses - information that is useless for the client because it only needs to display the users' names. 

![](http://imgur.com/1CiLBA0.png)

Another issue is *underfetching* and the *n+1*-requests problem. Underfetching generally means that a specific endpoint doesn’t provide enough of the required information. The client will have to make additional requests to fetch everything it needs. This can escalate to a situation where a client needs to first download a list of elements, but then needs to make one additional request per element to fetch the required data.

### Rapid Product Iterations on the Frontend

A common pattern with REST APIs is to structure the endpoints according to the views that you have inside your app. This is handy since it allows for the client to get all required information for a particular view by simply accessing the corresponding endpoint.

The major drawback of this approach is that it doesn’t allow for rapid iterations on the frontend. With every change that is made to the UI, there is a high risk that now there is more (or less) data required than before. Consequently, the backend needs to be adjusted as well to account for the new data needs. This kills productivity and notably slows down the ability to incorporate user feedback into a product. 

![](http://imgur.com/il96v1N.png)

With GraphQL, this problem is solved. Thanks to the flexible nature of GraphQL, changes on the client-side can be made without any extra work on the server. Since clients can specify their exact data requirements, no backend engineer needs to make adjustments when the design and data needs on the frontend change.

### Insightful Analytics on the Backend

GraphQL allows to have fine-grained insights about the data that’s requested on the backend. As each client specifies exactly what information it’s interested in, it is possible to gain a deep understanding of how the available data is being used. This can for example help in evolving an API and deprecating specific fields that are not requested by any clients any more.

With GraphQL, you can also do low-level performance monitoring of the requests that are processed by your server. GraphQL uses the concept of *resolver functions* to collect the data that’s requested by a client. Instrumenting and measuring performance of these resolvers provides crucial insights about bottlenecks in your system. 

### Benefits of a Schema & Type System

GraphQL uses a strong type system to define the capabilities of an API. All the types that are exposed in an API are written down in a *schema* using the GraphQL Schema Definition Language (SDL). This schema serves as the contract between the client and the server to define how a client can access the data.


## GraphQL Basics

### The Schema Definition Language (SDL)

GraphQL has its own type system that’s used to define the *schema* of an API. The syntax for writing schemas is called *Schema Definition Language* (SDL).

Here is an example how we can use the SDL to define a simple type called `User`:

```
type User {
  name: String!
  age: Int!
}
```

This type has two *fields*, they’re called `name` and `age` and are both of type `String`. The `!` following the type means that this field is *required*.

It’s also possible to express relationships between types. In the example of a *blogging* application, a `User` could be associated with a `Post`:

```
type Post {
  title: String!
  author: User!
}
```

Conversely, the other end of the relationship needs to be placed on the `User` type:

```
type User {
  name: String!
  age: Int!
  posts: [Post!]!
}
```

Note that we just created a *one-to-many*-relationship between `User` and `Post` since the `posts` field on `User` is actually an *array* of posts.

### Fetching Data with Queries

When working with REST APIs, data is loaded from specific endpoints. Each endpoint has a clearly defined structure of the information that it returns.

The approach that’s taken in GraphQL is radically different. Instead of having multiple endpoints that return fix data structures, GraphQL APIs typically only expose *a single endpoint*. This works because the structure of the data that’s returned is not fixed. Instead, it’s completely flexible and let’s the client decide what data is actually needed. 

That means that the client needs to send more *information* to the server to express its data needs - this information is called a *query*.

#### Basic Queries

Let’s take a look at an example query that a client could send to a server:

```
{
  allUsers {
    name
  }
}
```

This query would return a list of all users currently stored in the database. Here’s an example response:

```
{
  "allUsers": [
    { 
      "name": "John"
    },
    {
      "name": "Sarah"
    },
    ...
  ]
}
```

Notice that each user only has the `name` in the response, but the `age` is not returned by the server. That’s because the `name` was the only field that was specified in the query.

If the client also needed the users' `age`, all it has to do is to slightly adjust the query and include the new field in the query’s payload:

```
{
  allUsers {
    name
    age
  }
}
```

One of the major advantages of GraphQL is that it allows for naturally querying *nested* information. For example, if you wanted to load all the `posts` that a `User` has written, you could simply follow the structure of your types to request this information:

```
{
  allUsers {
    name
    age
    posts {
      title
    }
  }
}
```

#### Queries with Arguments

In GraphQL, each *field* can have zero or more arguments if that's specified in the *schema*. For example, the `allUsers` could have a `limit` parameter to only return up to a specific number of users. Here's what a corresponding query would look like:

```
{
  allUsers(limit: 20) {
    name
  }
}
```

### Writing Data with Mutations

Next to requesting information from a server, the majority of applications also need some way of making changes to the data that’s currently stored in the backend. With GraphQL, these changes are made using so-called *mutations*. There generally are three kinds of mutations:

* creating new data
* updating existing data
* deleting existing data

Mutations follow the same syntactical structure as queries, but they always need to start with the `mutation` keyword. Here’s an example for how we might create a new `User`:

```
mutation {
  createUser(name: "Alice", age: 36) {
    name
    age
  }
}
```

Notice that similar to the query we wrote before, we’re able to specify a payload where we can ask for different properties of the new `User`. In our case, we’re asking for the `name` and the `age` - though admittedly that’s not super helpful in our example since we obviously already know them. However, being able to also query information when sending mutations can be a very powerful tool that allows to retrieve new information in a single roundtrip! 

The server response for the above mutation would look as follows:

```
{
  "createUser": {
    "name": "Alice",
    "age": 36
  }
}
```

One pattern you’ll often find is that GraphQL types have unique *IDs* that are generated by the server. Extending our `User` type from the before, we could add an `id` as follows:

```
type User {
  id: ID!
  name: String!
  age: Int!
}
```

Now, when a new `User` is created, you could directly ask for the `id` since that is information that wasn’t available on the client beforehand:

```
mutation {
  createUser(name: "Alice", age: 36) {
    id
  }
}
```

### Realtime Updates with Subscriptions

Another important requirement for many applications today is to have a *realtime* connection to the server in order to get immediately informed about important events. For this use case, GraphQL offers the concept of *subscriptions*. 

When a client *subscribes* to an event, it will hold a steady connection to the server. Whenever that particular event then actually happens, the server pushes the corresponding data to the client. Unlike queries and mutations that follow a typical “*request-response*-cycle”, subscriptions represent a *stream* of data sent over to the client.

Subscriptions are written using the same syntax as queries and mutations. Here’s an example where we subscribe on events happening on the `User` type:

```
subscription {
  newUser {
    name
    age
  }
}
```

After a client sent this subscription to a server, a connection is opened between them. Then, whenever a new mutation is performed that creates a new `User`, the server sends the information about this user over to the client:

```
{
  "newUser": {
    "name": "Jane",
    "age": 23
  }
}
```

### Defining a Schema

Now that you have a rough idea of what queries, mutations and subscriptions look like, let’s put it all together with how you can write a schema that would allow to execute the examples you’ve seen so far.

The *schema* is one of the most important concepts when working with a GraphQL API. It specifies the capabilities of the API and defines how clients can request the data. It is often seen as a *contract* between the server and client.

Generally, a schema is simply a collection of GraphQL types. However, when writing the schema for an API, there are some special *root* types:

```
type Query { ... }
type Mutation { ... }
type Subscription { ... }
```

The `Query`, `Mutation` and `Subscription` types are the *entry points* for the requests sent by the client. To enable the `allUsers`-query that we save before, the `Query` type would have to be written as follows:

```
type Query {
  allUsers: [User!]!
}
```

`allUsers` is called a *root field* of the API. Considering again the example where we added the `limit` argument to the `allUsers` field, we'd have to write the `Query` as follows:

```
type Query {
  allUsers(limit: Int): [User!]!
}
```

Similarly, for the `createUser`-mutation, we’ll have to add a root field to the `Mutation` type:

```
type Mutation {
  createUser(name: String!, age: String!): User!
}
```

Notice that this root field takes two arguments as well, the `name` and the `age` of the new `User`.

Finally, for the subscriptions, we’d have to add the `newUser` root field:

```
type Subscription {
  newUser: User!
}
```

## Big Picture (Architecture)

GraphQL has been released only as a *specification*. This means that GraphQL is in fact not more than a [long document](https://facebook.github.io/graphql/) that describes in detail the behaviour of a *GraphQL server.*

If you want to use GraphQL yourself, you'll have to go and build that GraphQL server yourself. You can do that in any programming language of your choice (e.g. by using one of the [available reference implementations](http://graphql.org/code/)) or by using a service like [Graphcool](http://www.graph.cool/).

### Use Cases

In this section, we'll walk you through 3 different kinds of architectures that include a GraphQL server:

1. GraphQL server with a connected database
2. GraphQL server that is a thin layer in front of a number of third party or legacy systems and integrates them through a single GraphQL API
3. A hybrid approach of a connected database and third party or legacy systems that can all be accessed through the same GraphQL API 

All three architectures represent major use cases of GraphQL and demonstrate the flexibility in terms of the context where it can be used.

#### 1. GraphQL server with a connected database

This architecture will be the most common for *greenfield* projects. In the setup, you have a single (web) server that implements the GraphQL specification. When a query arrives at the GraphQL server, the server reads the query's payload and fetches the required information from the database. This is called *resolving* the query. It then constructs the response object [as described in the official specification](https://facebook.github.io/graphql/#sec-Response) and returns it to the client.

It's important to note that GraphQL is actually *transport-layer agnostic*. This means it can potentially be used with any available network protocol. So, it is potentially possible to implement a GraphQL server based on TCP, WebSockets, etc.   

GraphQL also doesn't care about the database or the format that is used to store the data. You could use a SQL database like AWS Aurora or a NoSQL database like MongoDB. 

![](http://imgur.com/JGfy58b.png)

#### 2. GraphQL layer that integrates existing systems

Another major use case for GraphQL is the integration of multiple existing systems behind a single, coherent GraphQL API. This is particularly compelling for companies with legacy infrastructures and many different APIs that have grown over years and now impose a high maintenance burden. One major problem with these kinds of legacy systems is that they make it practically impossible to build innovative products that need access to multiple systems.

In that context, GraphQL can be used to *unify* these existing systems and hide their complexity behind a nice GraphQL API. This way, new client applications can be developed that simply talk to the GraphQL server to fetch the data they need. The server is then responsible to make sure it fetches the data from the existing system and packages it up in GraphQL's response format.  

Just like in previous architecture where the GraphQL server didn't care about the database being used, this time it doesn't care about the data sources that it needs to access to fetch the data that's needed to *resolve* a query.

![](http://imgur.com/w1ZmNB3.png)

#### 3. Hybrid approach with connected database and integration of existing system

Finally, it's possible to combine the two approaches and build a GraphQL server that has a connected database but still talks to legacy or third—party systems.

When a query is received by the server, it will resolve it and either retrieve the required data from the connected database or some of the integrated APIs.

![](http://imgur.com/X6bjRNc.png)

### Resolver Functions

But how do we gain this flexibility with GraphQL? How is it that it's such a great fit for these very different kinds of use cases?

As you learned in the previous chapter, the payload of a GraphQL query (or mutation) consists of a set of *fields*. In the GraphQL server implementation, each of these fields actually corresponds to exactly one function that's called a *resolver*. The sole purpose of a resolver function is to fetch the data for its field. 

When the server receives a query, it will call all the functions for the fields that are specified in the query's payload. It thus *resolves* the query and is able to retrieve the correct data for each field. Once all resolvers returned, the server will package data up in the format that was described by the query and send it back to the client.

![](http://imgur.com/DZVls7h.png)

###  GraphQL Client Libraries

GraphQL is an particularly great for frontend developers since it completely eliminates many of the inconveniences and shortcomings that are experienced with REST APIs, such as over- and underfetching. Complexity is pushed to the server-side where powerful machines can take care of the heavy computation work. The client doesn't have to know where the data that it fetches is actually coming from and can use a single, coherent and flexible API.

Let's consider the major change that's introduced with GraphQL in going from a rather imperative data fetching approach to a purely declarative one. When fetching data from a REST API, most applications will have to go through the following steps:

1. construct and send HTTP request (e.g. with `fetch` in Javascript)
2. receive and parse server response
3. store data locally (either simply in memory or persistent)
4. display data in the UI

With the ideal *declarative data fetching* approach, a client shouldn't be doing more than the following two steps:

1. describe data requirements
2. display data in UI

All the lower-level networking tasks as well as storing the data should be abstracted away and the declaration of data dependencies should be the dominant part. 

This is precisely what GraphQL client libraries like Relay or Apollo will enable you to do. They provide the abstraction that you need to be able to focus on the important parts of your application rather than having to deal with the repetitive implementation of infrastructure.
