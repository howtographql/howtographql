---
title: More GraphQL Concepts
pageTitle" "Advanced GraphQL Language Concepts"
description: Learn about advanced concepts of the GraphQL language like fragments, query arguments and more SDL features 
question: Which of these statements is false?
answers: ["Aliases can be used to name the result objects for multiple queries", "Fragments are useful for the structure and reusability of your GraphQL code", "Every field in a GraphQL type can be associated with zero or more arguments", "GraphQL has a built-in Date type"]
correctAnswer: 3
---


### Enhancing Reusability with Fragments

_Fragments_ are a handy feature to help improving the structure and reusability of your GraphQL code. A fragment is a collection of fields on a specific type.

Let's assume we have the following type:

```graphql(nocopy)
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

```graphql(nocopy)
fragment addressDetails on User {
  name
  street
  zipcode
  city
}
```

Now, when writing a query to access the address information of a user, we can use the following syntax to refer to the fragment and save the work to actually spell out the four fields:

```graphql(nocopy)
{
  allUsers {
    ... addressDetails
  }
}
```

This query is equivalent to writing:

```graphql(nocopy)
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

In GraphQL type definitions, each field can take zero or more _arguments_. Similar to arguments that are passed into functions in typed programming languages, each argument needs to have a _name_ and a _type_. In GraphQL, it's also possible to specify _default values_ for arguments.

As an example, let's consider a part of the schema that we saw in the beginning:

```graphql(nocopy)
type Query {
  allUsers: [User!]!
}

type User {
  name: String!
  age: Int!
}
```

We could now add an argument to the `allUsers` field that allows us to pass an argument to filter users and include only those above a certain age. We also specify a default value so that by default all users will be returned:

```graphql(nocopy)
type Query {
  allUsers(olderThan: Int = -1): [User!]!
}
```

This `olderThan` argument can now be passed into the query using the following syntax:

```graphql(nocopy)
{
  allUsers(olderThan: 30) {
    name
    age
  }
}
```

### Named Query Results with Aliases

One of GraphQL's major strengths is that it lets you send multiple queries in a single request. However, since the response data is shaped after the structure of the fields being requested, you might run into naming issues when you're sending multiple queries asking for the same fields:

```graphql(nocopy)
{
  User(id: "1") {
    name
  }
  User(id: "2") {
    name
  }
}
```

In fact, this will produce an error with a GraphQL server, since it's the same field but different arguments. The only way to send a query like that would be to use aliases, i.e. specifying names for the query results:

```graphql(nocopy)
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

```graphql(nocopy)
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

- _Scalar_ types represent concrete units of data. The GraphQL spec has five predefined scalars: as `String`, `Int`, `Float`, `Boolean`, and `ID`. 
- _Object_ types have _fields_ that express the properties of that type and are composable. Examples for object types are the `User` or `Post` types we saw in the previous section.

In every GraphQL schema, you can define your own scalar and object types. An often cited example for a custom scalar would be a `Date` type where the implementation needs to define how that type validated, serialized, and deserialized.

#### Enums

GraphQL allows you to define _enumerations_ types (short _enums_), a language feature to express the semantics of a type that has a fixed set of values. We could thus define a type called `Weekday` to represent all the days of a week:

```graphql(nocopy)
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

Note that technically enums are special kinds of scalar types.

#### Interface

An _interface_ can be used to describe a type in an abstract way. It allows you to specify a set of fields that any concrete type, which _implements_ this interface, needs to have. In many GraphQL schemas, every type is required to have an `id` field. Using interfaces, this requirement can be expressed by defining an interface with this field and then making sure that all custom types implement it:

```graphql(nocopy)
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

```graphql(nocopy)
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

```graphql(nocopy)
union Person = Adult | Child
```

This brings up a different problem: In a GraphQL query where we ask to retrieve information about a `Child` but only have a `Person` type to work with, how do we know whether we can actually access this field?

The answer to this is called _conditional fragments_:

```graphql(nocopy)
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

