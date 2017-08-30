---
title: Mutations
pageTitle: "Implementing Mutations with a Java GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with graphql-java & Java. You can test your implementation in a GraphiQL Playground."
question: How are mutations different from queries?
answers: ["Only semantically, the syntax is the same for both", "Mutation must be send via HTTP POST", "Mutations start with a different key-word", "Mutation is just another name for a query"]
correctAnswer: 2
---

Defining a mutation is similarly straight forward.

<Instruction>

Start off by describing a mutation for creating links in SDL:

```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
type Mutation {
  createLink(url: String!, description: String!): Link
}
```
Add this definition with the rest in `schema.graphqls`. 

</Instruction>

<Instruction>

Also, update the schema entry to contain the mutation root:


```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
schema {
    query: Query
    mutation: Mutation
}
```

</Instruction>

### Resolvers with arguments

<Instruction>

Next off, create the root mutation resolver class (similar to the `Query` class you already have):

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Mutation.java")
public class Mutation implements GraphQLRootResolver {
    
    private final LinkRepository linkRepository;

    public Mutation(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }
    
    public Link createLink(String url, String description) {
        Link newLink = new Link(url, description);
        linkRepository.saveLink(newLink);
        return newLink;
    }
}
```

</Instruction>

Notice how the `createLink` method, that will act as the resolver function for the `createLink` mutation, takes arguments of the name and type analogous to those defined in the mutation itself.

<Instruction>

Finally, register this new resolver the same way you registered `Query` inside `GraphQLEndpoint#buildSchema`:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndpoint.java")
private static GraphQLSchema buildSchema(LinkRepository linkRepository) {
    return SchemaParser.*newParser*()
        .file("schema.graphqls")
        .resolvers(new Query(linkRepository), new Mutation(linkRepository))
        .build()
        .makeExecutableSchema();
}
```

</Instruction>

### Creating links

Restart Jetty and test out your spiffy new mutation using GraphiQL:

![](http://i.imgur.com/6l8HrQq.png)

Re-run `allLinks` to verify your new link has indeed been persisted:

![](http://i.imgur.com/X6pD0t0.png)

