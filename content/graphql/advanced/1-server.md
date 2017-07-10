---
title: Server
description: "An introduction to the core concepts that are required when using GraphQL on the server-side"
question: Can you choose the first answer to this question?
answers: ["That sounds too easy", "I think this question is fake", "When are the real questions ready", "No"]
correctAnswer: 0
---

GraphQL is often explained as a frontend-focused API technology, because it enables clients to get data in a much nicer way than before. But the API itself is, of course, implemented on the server side. There are a lot of benefits to be had on the server as well, because GraphQL enables the server developer to focus on describing the data available rather than implementing and optimizing specific endpoints.

## GraphQL execution

GraphQL doesn't just specify a way to describe schemas and a query language to retrieve data from those schemas, but an actual execution algorithm for how those queries are transformed into results. This algorithm is quite simple at its core: The query is traversed field by field, executing "resolvers" for each field. So, let's say we have the following schema:

```graphql(nocopy)
type Query {
  author(id: ID!): [Author]
}

type Author {
  posts: [Post]
}

type Post {
  title: String
  content: String
}
```

The following is a query we would be able to send to a server with that schema:

```graphql(nocopy)
query {
  author(id: "abc") {
    posts {
      title
      content
    }
  }
}
```

The first thing to see is that every field in the query can be associated with a type:


```graphql(nocopy)
query: Query {
  author(id: "abc"): Author {
    posts: [Post] {
      title: String
      content: String
    }
  }
}
```

Now, we can easily find the resolvers in our server to run for every field. The execution starts at the query type and goes breadth-first. This means we run the resolver for `Query.author` first. Then, we take the result of that resolver, and pass it into its child, the resolver for `Author.posts`. At the next level, the result is a list, so in that case the execution algorithm runs on one item at a time. So the execution works like this:

```(nocopy)
Query.author(root, { id: 'abc' }, context) -> author
Author.posts(author, null, context) -> posts
for each post in posts
  Post.title(post, null, context) -> title
  Post.content(post, null, context) -> content
```

At the end, the execution algorithm puts everything together into the correct shape for the result, and returns that.

One thing to note is that most GraphQL server implementations will provide "default resolvers" - so you don't have to specify a resolver function for every single field. In GraphQL.js, for example, you don't need to specify resolvers when the parent object of the resolver contains a field with the correct name.

Read more in depth about GraphQL execution in the ["GraphQL Explained" post](https://dev-blog.apollodata.com/graphql-explained-5844742f195e) on the Apollo blog.

## Batching and caching

One thing you might notice about the execution strategy above is that it's somewhat naive. For example, if you have a resolver that fetches from a backend API or database, that backend might get called many times during the execution of one query. Let's imagine we wanted to get the authors of several posts, like so:

```grapqhl(nocopy)
query {
  posts {
    title
    author {
      name
      avatar
    }
  }
}
```

If these are posts on a blog, it's likely that many of the posts will have the same authors. So if we need to make an API call to get each author object, we might accidentally make multiple requests for the same one. For example:

```javascript(nocopy)
fetch('/authors/1')
fetch('/authors/2')
fetch('/authors/1')
fetch('/authors/2')
fetch('/authors/1')
fetch('/authors/2')
```

How do we solve this? By making our fetching a bit smarter. We can wrap our fetching function in a utility that will wait for all of the resolvers to run, then make sure to only fetch each item once:

```javascript(nocopy)
authorLoader = new AuthorLoader()

// Queue up a bunch of fetches
authorLoader.load(1);
authorLoader.load(2);
authorLoader.load(1);
authorLoader.load(2);

// Then, the loader only does the minimal amount of work
fetch('/authors/1');
fetch('/authors/2');
```

Can we do even better? Yes, if our API supports batched requests, we can do only one fetch to the backend, like so:

```javascript(nocopy)
fetch('/authors?ids=1,2')
```

This can also be encapsulated in the loader above.

In JavaScript, the above strategies can be implemented using a utility called [DataLoader](https://github.com/facebook/dataloader), and there are similar utilities for other languages.