# More GraphQL

## Clients

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

A powerful concept of GraphQL is that allows to have UI code and data requirements side-by-side. The tight coupling of views and their data dependencies greatly improves developer experience since all mental overhead of thinking about how the right data ends up in the right parts of the UI is eliminated.

How well colocation works depends on the platform you're developing on. For example in Javscript applications, it's possible to actually put data dependencies and UI code into the same file. In Xcode, the _Assistant Editor_ can be used to work on view controllers and graphql code at the same time. 


## Server

### Resolver Functions to Process Requests

In the first section, you learned that GraphQL types have _fields_. Each field of a GraphQL type corresponds to a so-called _resolver_ function in the GraphQL server implementation.

When a query is received on the backend, the server will gather the requested data by calling all resolver functions. If a query is _nested_, the resolvers will be called in the order that's specified in the query to obtain the right information. The execution completes once a field has a scalar type for which a concrete piece of data can be returned. GraphQL queries always end at scalar values (like a string, number or boolean value). 


### Integrating Legacy Infrastructures with GraphQL

GraphQL not only is valuable tool for _greenfield_ projects. It can also be used to unify existing APIs behind a thin GraphQL layer that will then take care of actually calling the underlying systems and collecting the data.


## Tooling and Ecosystem

### Server-side Reference Implementations & Frameworks

#### Javascript

- [GraphQL.js](https://github.com/graphql/graphql-js/)
- [express-graphql](https://github.com/graphql/express-graphql)
- [graphql-server](https://github.com/apollostack/graphql-server)

#### Ruby

- [graphql-ruby](https://github.com/rmosolgo/graphql-ruby)

#### Python

- [Graphene](https://github.com/graphql-python/graphene)

#### Scala 

- [Sangria](https://github.com/sangria-graphql/sangria) 

#### Java

- [graphql-java](https://github.com/graphql-java/graphql-java)

#### Clojure

- [alumbra](https://github.com/alumbra/alumbra)
- [graphql-clj](https://github.com/tendant/graphql-clj)

#### Go

- [graphql-go](https://github.com/graphql-go/graphql)
- [graphql-relay-go](https://github.com/graphql-go/relay)
- [neelance/graphql-go](https://github.com/neelance/graphql-go)


#### PHP

- [graphql-php](https://github.com/webonyx/graphql-php)
- [graphql-relay-php](https://github.com/ivome/graphql-relay-php)


#### C# / .NET

- [graphql-dotnet](https://github.com/graphql-dotnet/graphql-dotnet)
- [graphql-net](https://github.com/ckimes89/graphql-net)


### GraphQL Clients

#### Javascript

- [Relay](https://github.com/facebook/relay)
- [Apollo Client (JS)](https://github.com/apollostack/apollo-client)
- [graphql-request](https://github.com/graphcool/graphql-request)

#### iOS

- [Apollo Client (iOS)](https://github.com/apollostack/apollo-ios)

#### Android

- [Apollo Client (Android)](https://github.com/apollographql/apollo-android)

#### C# / .NET

- [graphql-net-client](https://github.com/bkniffler/graphql-net-client)


## More GraphQL Concepts

### Enhancing Reusability with Fragments

_Fragments_ are a handy feature to help improving the structure and and reusability of your GraphQL code. A fragment is a collection of fields on a specific type.

Let's assume we have the following type:

```graphql
type User {
  name: String!
  age: Int!
  email: String!
  street: String!
  zipcode: String!
  city: String!
}
```

Here, we could represent all the information that relates to the user's physical address into a fragment:

```graphql
fragment addressDetails on User {
  name
  street
  zipcode
  city
}
```

Now, when writing a query to access the address information of a user, we can use the following syntax to refer to the fragment and save the work to actually spell out the four fields:

```graphql
{
  allUsers {
    ... addressDetails
  }
}
```

This query is equivalent to writing:

```graphql
{
  allUsers {
    name
    street
    zipcode
    city
  }
}
```

### Parameterizing Fields with Arguments

In GraphQL type definitions, each field can take zero or more of _arguments_. Similar to arguments that are passed into functions in typed programming languages, each argument needs to have a _name_ and a _type_. In GraphQL, it's also possible to specify _default values_ for arguments.

As an example, let's consider a part of the schema that we saw in the beginning:

```graphql
type Query {
  allUsers: [User!]!
}

type User {
  name: String!
  age: Int!
}
```

We could now add an argument to the `allUsers` field that allows us to pass an argument to filter users and include only those above a certain age. We also specify a default value so that by default all users will be returned:

```graphql
type Query {
  allUsers(olderThan: Int = -1): [User!]!
}
```

This `olderThan` argument can now be passed into the query using the following syntax:

```graphql
{
  allUsers(olderThan: 30) {
    name
    age
  }
}
```

### Named Query Results with Aliases

One of GraphQL's major strengths is that it let's you send multiple queries in a single request. However, since the response data is shaped after the structure of the fields being requested, you might run into naming issues when you're sending multiple queries asking for the same fields:

```graphql
{
  User(id: "1") {
    name
  }
  User(id: "2") {
    name
  }
}
```

In fact, this will produce an error with a GraphQL server, since it's the same field but different arguments. The only way to send a query like that would be to use aliased, i.e. specifying names for the query results:

```graphql
{
  first: User(id: "1") {
    name
  }
  second: User(id: "2") {
    name
  }
}
```

In the result, the server would now name each `User` object according to the specified alias:

```js
{
  "first": {
    "name": "Alice"
  },
  "second": {
    "name": "Sarah"
  }
}
```

### Advanced SDL

The SDL offers a couple of language features that weren't discussed in the previous chapter. In the following, we'll discuss those by practical examples.

#### Object & Scalar Types

In GraphQL, there are two different kinds of types.

- _Scalar_ types represent conrete units of data. The GraphQL spec has five predefined scalars: as `String`, `Int`, `Float`, `Boolean` and `ID`. 
- _Object_ types have _fields_ that express the properties of that type and are composable. Examples for object types are the `User` or `Post` types we saw in the previous section.

In every GraphQL schema, you can define your own scalar and object types. An often cited example for a custom scalar would be a `Date` type where the implementation needs to define how that type validated, serialized and deserialized.

#### Enums

GraphQL allows you to define _enumerations_ types (short _enums_), a language feature to express the semantics of a type that has a fixed set of values. We could thus define a type called `Weekday` to represent all the days of a week:

```graphql
enum Weekday {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}
```

Note that echnically enums are special kinds of scalar types.

#### Interface

An _interface_ can be used to describe a type in an abstract way. It allows to specify a set of fields that any concrete type which _implements_ this interface needs to have. In many GraphQL schemas, every type is required to have an `id` field. Using interfaces, this requirement can be expressed by defining an interface with this field and then making sure that all custom types implement it:

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
  age: Int!
}
```

#### Union Types

_Union types_ can be used to express that a type should be _either_ of a collection of other types. They are best understood by means of an example. Let's consider the following types:

```graphql
type Adult {
  name: String!
  work: String!
}

type Child {
  name: String!
  school: String!
}
```  

Now, we could define a `Person` type to be the _union_ of `Adult` and `Child`:

```graphql
union Person = Adult | Child
```

This brings up a different problem: In a GraphQL query where we ask want to retrieve information about a `Child` but only have a `Person` type to work with, how do we know whether we can actually access this field?

The answer to this is called _conditional fragments_:

```graphql
{
  allPersons {
    name # works for `Adult` and `Child`
    ... on Child {
      school
    }
    ... on Adult {
       work
    }
  }
}
``` 


## Common Questions

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

Authentication and authorization are often confused. _Authentication_ describes the process of claiming an _idendity_. That's what you do when you log in to a service with a username and password, you authenticate yourself. _Authorization_ on the other hand describes _permission rules_ that specify which user the access rights of individual users and user groups to certain parts of the system.

Authentication in GraphQL can be implemented with common patterns such as [OAuth](https://oauth.net/).

To implement authorization, it is [recommended](http://graphql.org/learn/authorization/) to delegate any data access logic to the business logic layer and not handle it directly in the GraphQL imeplementation. If you want to have some inspiration on how to implement authorization, you can take a look [Graphcool's permission queries](https://www.graph.cool/blog/2017-04-25-graphql-permission-queries-oolooch8oh/).

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













