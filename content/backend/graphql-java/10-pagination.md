---
title: Pagination
pageTitle: "Implementing Server-side Pagination with GraphQL & Java"
description: "Learn best practices for implementing limit-offset pagination in a GraphQL API using query arguments with a Node.js & Express GraphQL server."
question: Is pagination supported by GraphQL?
answers: ["Yes, out of the box, via dedicated query arguments", "The implementer can provide their own pagination scheme", "Yes, but only if the Connection specification (part of the Relay spec) is supported", "No"]
correctAnswer: 1
---

As the number of links grow, listing all of them becomes less feasible. It stands to reason you should introduce the ability to only request a number of links and paginate through the result.

Like filtering, pagination can be achieved in any way that makes sense for the underlying storage.

> In this tutorial, you'll implement a simple pagination approach called limit-offset pagination (similar to what you may know from SQL). This approach does not work with Relay on the frontend, since Relay requires cursor-based pagination via the concept of connections. You can read more about pagination in the [GraphQL docs](http://graphql.org/learn/pagination/). Connections, and the rest of the Relay specification, can be found in the [Relay docs](https://facebook.github.io/relay/docs/graphql-connections.html).

Predictably, you start off from the schema.

<Instruction>

Add two new arguments to enable the client to specify the number of links they require and what index to start from.

```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
type Query {
  allLinks(filter: LinkFilter, skip: Int = 0, first: Int = 0): [Link]
}
```

</Instruction>

<Instruction>

Update the repository method (`LinkRepository#getAllLinks`) to take and use these new arguments:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkRepository.java")
public List<Link> getAllLinks(LinkFilter filter, int skip, int first) {
    Optional<Bson> mongoFilter = Optional.ofNullable(filter).map(this::buildFilter);
    
    List<Link> allLinks = new ArrayList<>();
    FindIterable<Document> documents = mongoFilter.map(links::find).orElseGet(links::find);
    for (Document doc : documents.skip(skip).limit(first)) {
        allLinks.add(link(doc));
    }
    return allLinks;
}
```

</Instruction>

<Instruction>

And, of course, update the top-level method in the `Query` class:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Query.java")
public List<Link> allLinks(LinkFilter filter, Number skip, Number first) {
    return linkRepository.getAllLinks(filter, skip.intValue(), first.intValue());
}
```

</Instruction>

Note that the parameter type for both *must* be `Number` because `graphql-java-tools` will sometimes try to stuff an `Integer` and sometimes a `BigInteger` into it, depending on the context.

Wasn't that easy? Jump back to GraphiQL and paginate away!

![](http://i.imgur.com/ln7Ltgv.png)
![](http://i.imgur.com/Vm4TZQd.png)

You can still, of course, get all links:

![](http://i.imgur.com/pCd1e4j.png)
