---
title: Mutations
description: Add your first mutation to the GraphQL schema
---

Defining a mutation is similarly straight forward. Start off by describing a mutation for creating links in SDL:

```graphql
type Mutation {
  createLink(url: String!, description: String!): Link
}
```

Add this definition with the rest in `schema.graphqls`. Also, update the schema entry to contain the mutation root:


```graphql
schema {
    query: Query
    mutation: Mutation
}
```

### Resolvers with arguments

Next off, create the root mutation resolver class (similar to the `Query` class you already have):

```java
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

Notice how the `createLink` method, that will act as the resolver function for the `createLink` mutation, takes arguments of the name and type analogous to those defined in the mutation itself.

Finally, register this new resolver the same way you registered `Query` inside `GraphQLEndpoint#buildSchema`:

```java
private static GraphQLSchema buildSchema(LinkRepository linkRepository) {
    return SchemaParser.*newParser*()
        .file("schema.graphqls")
        .resolvers(new Query(linkRepository), new Mutation(linkRepository))
        .build()
        .makeExecutableSchema();
}
```

### Creating links

Restart Jetty and test out your spiffy new mutation using Graph*i*QL:

![](http://i.imgur.com/6l8HrQq.png)

Re-run `allLinks` to verify your new link has indeed been persisted:

![](http://i.imgur.com/X6pD0t0.png)

