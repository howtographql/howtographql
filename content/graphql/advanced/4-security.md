---
title: Security
pageTitle: "Security and GraphQL Tutorial"
description: "Learn about different security aspects and strategies for GraphQL, such as timeouts, maximum query depth, query complexity and throttling."
question: Which one of these strategies is not a valid way to defend against abusive or large queries?
answers: ["Calculating query complexity", "Maximum query depth", "Adding more servers", "Timeout"]
correctAnswer: 2
---

GraphQL gives enormous power to clients. But with great power come great responsibilities 🕷.

Since clients have the possibility to craft very complex queries, our servers must be ready to handle them properly. These queries may be abusive queries from evil clients, or may simply be very large queries used by legitimate clients. In both of these cases, the client can potentially take your GraphQL server down.

There are a few strategies to mitigate these risks. We will cover them in this chapter in order from the simplest to the most complex, and look at their pros and cons.

## Timeout

The first strategy and the simplest one is using a timeout to defend against large queries. This strategy is the simplest since it does not require the server to know anything about the incoming queries. All the server knows is the maximum time allowed for a query.

For example, a server configured with a 5 seconds timeout would stop the execution of any query that is taking more than 5 seconds to execute.

### Timeout Pros

  - Simple to implement.
  - Most strategies will still use a timeout as a final protection.

### Timeout Cons

  - Damage can already be done even when the timeout kicks in.
  - Sometimes hard to implement. Cutting connections after a certain time may result in strange behaviours.

## Maximum Query Depth

As we covered earlier, clients using GraphQL may craft any complex query they want. Since GraphQL schemas are often cyclic graphs, this means a client could craft a query like this one:

```graphql
query IAmEvil {
  author(id: "abc") {
    posts {
      author {
        posts {
          author {
            posts {
              author {
                # that could go on as deep as the client wants!
              }
            }
          }
        }
      }
    }
  }
}
```

What if we could prevent clients from abusing query depth like this? Knowing your schema might give you an idea of how deep a legitimate query can go. This is actually possible to implement and is often called Maximum Query Depth.

By analyzing the query document's abstract syntax tree (AST), a GraphQL server is able to reject or accept a request based on its depth.

Take for example a server configured with a Maximum Query Depth of `3`, and the following query document. Everything within the red marker is considered too deep and the query is invalid.

![Query Depth Example](http://i.imgur.com/6RqfhK8.png)

Using `graphql-ruby` with the max query depth setting, we get the following result:

```json
{
  "errors": [
    {
      "message": "Query has depth of 6, which exceeds max depth of 3"
    }
  ]
}
```

### Maximum Query Depth Pros

  - Since the AST of the document is analyzed statically, the query does not even execute, which adds no load on your GraphQL server.

### Maximum Query Depth Cons

  - Depth alone is often not enough to cover all abusive queries. For example, a query requesting an enormous amount of nodes on the root will be very expensive but unlikely to be blocked by a query depth analyzer.

## Query Complexity

Sometimes, the depth of a query is not enough to truly know how large or expensive a GraphQL query will be. In a lot of cases, certain fields in our schema are known to be more complex to compute than others.

Query complexity allows you to define how complex these fields are, and to restrict queries with a maximum complexity. The idea is to define how complex each field is by using a simple number. A common default is to give each field a complexity of `1`. Take this query for example:


```graphql
query {
  author(id: "abc") { # complexity: 1
    posts {           # complexity: 1
      title           # complexity: 1
    }
  }
}
```

A simple addition gives us a total of `3` for the complexity of this query. If we were to set a max complexity of `2` on our schema, this query would fail.

What if the `posts` field is actually much more complex than the `author` field? We can set a different complexity to the field. We can even set a different complexity depending on arguments! Let's take a look at a similar query,
where `posts` has a variable complexity depending on its arguments:


```graphql
query {
  author(id: "abc") {    # complexity: 1
    posts(first: 5) {    # complexity: 5
      title              # complexity: 1
    }
  }
}
```

### Query Complexity Pros

  - Covers more cases than a simple query depth.
  - Reject queries before executing them by statically analyzing the complexity.

### Query Complexity Cons

  - Hard to implement perfectly.
  - If complexity is estimated by developers, how do we keep it up to date? How do we find the costs in the first place?
  - Mutations are hard to estimate. What if they have a side effect that is hard to measure, like queuing a background job?

## Throttling

The solutions we've seen so far are great to stop abusive queries from taking your servers down. The problem with using them alone like this is that they will stop large queries, but won't stop clients that are making a lot of medium sized queries!

In most APIs, a simple throttle is used to stop clients from requesting resources too often. GraphQL is a bit special because throttling on the number of requests does not really help us. Even a few queries might be too much if they are very large.

In fact, we have no idea what amount of requests is acceptable
since they are defined by the clients. So what can we use to throttle clients?

### Throttling Based on Server Time

A good estimate of how expensive a query is the server time it needs to complete. We can use this heuristic to throttle queries. With a good knowledge of your system, you can come up with a maximum server time a client can use over a certain time frame.

We also decide on how much server time is added to a client over time. This is a classic [leaky bucket algorithm](https://en.wikipedia.org/wiki/Leaky_bucket). Note that there are other throttling algorithms out there, but they are out of scope for this chapter. We will use a leaky bucket throttle in the next examples.

Let's imagine our maximum server time (Bucket Size) allowed is set to `1000ms`, that clients gain `100ms` of server time per second (Leak Rate) and this mutation:

```graphql
mutation {
  createPost(input: { title: "GraphQL Security" }) {
    post {
      title
    }
  }
}
```

takes on average `200ms` to complete. In reality, the time may vary but we'll assume it always takes `200ms` to complete for the sake of this example.

It means that a client calling this operation more than 5 times within 1 second would be blocked until more available server time is added to the client.

After two seconds (`100ms` is added by second), our client could call the `createPost` a single time.

As you can see, throttling based on time is a great way to throttle GraphQL queries since complex queries will end up consuming more time meaning you can call them less often, and smaller queries may be called more often since they will be very fast to compute.

It can be good to express these throttling constraints to clients if your GraphQL API is public. In that case, server time is not always the easiest thing to express to clients, and clients cannot really estimate what time their queries will take without trying them first.

Remember the Max Complexity we talked about earlier? What if we throttled based on that instead?

### Throttling Based on Query Complexity

Throttling based on Query Complexity is a great way to work with clients and help them respect the limits of your schema.

Let's use the same complexity example we used in the Query Complexity section:

```graphql
query {
  author(id: "abc") {    # complexity: 1
    posts {              # complexity: 1
      title              # complexity: 1
    }
  }
}
```

We know that this query has a cost `3` based on complexity. Just like a time throttle, we can come up with a maximum cost (Bucket Size) per time a client can use.

With a maximum cost of `9`, our clients could run this query only three times, before the leak rate forbids them to query more.

The principles are the same as our time throttle, but now communicating these limits to clients is much nicer. Clients can even calculate the costs of their queries themselves without needing to estimate server time!

The GitHub public API actually uses this approach to throttle their clients. Take a look at how they express these limits to users: https://developer.github.com/v4/guides/resource-limitations/.

## Summary

GraphQL is great to use for clients because it gives them so much more power. But that power also gives them the possibility to abuse your GraphQL server with very expensive queries.

There are many approaches to secure your GraphQL server against these queries, but none of them is bullet proof. It's important to know what options are available and know their limits so we take the best decisions!
