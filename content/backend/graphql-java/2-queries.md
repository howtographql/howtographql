---
title: Queries
pageTitle: "Resolving Queries with a Java GraphQL Server Tutorial"
description: "Learn how to define the GraphQL schema with graphql-java, implement query resolvers in Java and test your queries in a GraphiQL Playground."
question: Is a special client required to query a GraphQL server?
answers: ["Yes, and there is an implementation in each language", "Yes, you need GraphiQL to create and issue queries", "No, GraphQL servers are always exposed over HTTP", "No, a GraphQL server could be exposed over any transport"]
correctAnswer: 3
---

### Query resolvers

To maintain strong typing and intuitive design, it is common to represent GraphQL types with equivalent Java classes, and fields with methods. graphql-java-tools defines two types of classes: *data classes*, which model the domain and are usually simple POJOs, and *resolvers*, that model the queries and mutations and contain the resolver functions. Often, both are needed to model a single GraphQL type.

The schema so far looks like this:

```graphql(nocopy)
type Link {
  url: String!
  description: String!
}

type Query {
  allLinks: [Link]
}

schema {
  query: Query
}
```

To model it, two classes are needed: `Link` and `Query`.

<Instruction>

`Link` is a POJO (containing no behavior), so create it as follows:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Link.java")
public class Link {
    
    private final String url;
    private final String description;

    public Link(String url, String description) {
        this.url = url;
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public String getDescription() {
        return description;
    }
}
```

</Instruction>

You should also create a `LinkRepository` class that will neatly isolate the concern of saving and loading links from the storage. This also makes future extensions and refactoring a lot easier. For now, the links will only be kept in memory.

<Instruction>

Create `LinkRepository` as follows

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkRepository.java")
public class LinkRepository {
    
    private final List<Link> links;

    public LinkRepository() {
        links = new ArrayList<>();
        //add some links to start off with
        links.add(new Link("http://howtographql.com", "Your favorite GraphQL page"));
        links.add(new Link("http://graphql.org/learn/", "The official docks"));
    }

    public List<Link> getAllLinks() {
        return links;
    }
    
    public void saveLink(Link link) {
        links.add(link);
    }
}
```

</Instruction>

### Returning links

Unlike the `Link` POJO, `Query` models behavior, as it contains the resolver for the `allLinks` query.

<Instruction>

Create it as such:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Query.java")
public class Query implements GraphQLRootResolver {
    
    private final LinkRepository linkRepository;

    public Query(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    public List<Link> allLinks() {
        return linkRepository.getAllLinks();
    }
}
```

</Instruction>

<Instruction>

Finally, you can update `GraphQLEndpoint` to register the resolver properly when generating the schema:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndpoint.java")
@WebServlet(urlPatterns = "/graphql")
public class GraphQLEndpoint extends SimpleGraphQLServlet {

    public GraphQLEndpoint() {
        super(buildSchema());
    }

    private static GraphQLSchema buildSchema() {
        LinkRepository linkRepository = new LinkRepository();
        return SchemaParser.newParser()
                .file("schema.graphqls")
                .resolvers(new Query(linkRepository))
                .build()
                .makeExecutableSchema();
    }
}
```

</Instruction>

Notice how the schema-building logic got extracted into a separate method for easier future additions.

If you now open http://localhost:8080/graphql?query={allLinks{url}} you'll see your very first GraphQL query executing and giving you the result looking like this:

```json(nocopy)
{
  "data": {
    "allLinks": [
      {
        "url": "http://howtographql.com"
      },
      {
        "url": "http://graphql.org/learn/"
      }
    ]
  }
}
```

It is now appropriate to feel good about yourself 😎

### Testing with GraphiQL

[GraphiQL](https://github.com/graphql/graphiql) is an in-browser IDE allowing you to explore the schema, fire queries/mutations and see the results.

<Instruction>

To add GraphiQL, copy [the example `index.html` from GraphiQL's GitHub repo](https://github.com/graphql/graphiql/blob/master/example/index.html) and replace the paths to `graphiql.css` and `graphiql.js` from

```html(nocopy)
<link rel="stylesheet" href="./node_modules/graphiql/graphiql.css" />
<script src="./node_modules/graphiql/graphiql.js"></script>
```

to

```html(path=".../hackernews-graphql-java/src/main/webapp/index.html")
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphiql@0.11.2/graphiql.css" />
<script src="//cdn.jsdelivr.net/npm/graphiql@0.11.2/graphiql.js"></script>
```

Save the file to `src/main/webapp/index.html` (you may as well delete `index.jsp` that Maven generated), start Jetty and open http://localhost:8080/, and you should be greeted by a cool looking environment where you can test what you've build so far.

</Instruction>

![](http://i.imgur.com/KlnKaZe.png)

If you type the same query from above into the left panel (notice the auto-completion!), you should get the same result but nicely formatted this time. You can also click [this link](http://localhost:8080/graphql?query={allLinks{url}}).

![](http://i.imgur.com/jMO6hB9.png)

Keep using GraphiQL to test out queries and mutation as you follow the tutorial.

