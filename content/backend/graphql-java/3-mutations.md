---
title: Mutations
---

Defining a mutation is similarly straight forward. Start off by describing a mutation for creating links in SDL:


```
type Mutation {
  createLink(url: String!, description: String!): Link
}
```

Add this definition with the rest in `schema.graphqls`. Also, update the schema entry to contain the mutation root:


```
schema {
    query: Query
    mutation: Mutation
}
```



### Resolvers with arguments

Next off, create the root mutation resolver class (similar to the `Query` class you already have):


```
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


```
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

[Image: https://quip.com/-/blob/MFcAAALibcr/2p7igowpQIO7zAGBUKbHlg]Re-run `allLinks` to verify your new link has indeed been persisted:
[Image: https://quip.com/-/blob/MFcAAALibcr/tATiNmOn6cwSrT5cLf-SUg]

