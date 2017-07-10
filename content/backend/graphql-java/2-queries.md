---
title: Queries
---

### Query resolvers

To maintain strong typing and intuitive design, it is common to represent GraphQL types with equivalent Java classes, and fields with methods. graphql-java-tools defines two types of classes: *data classes*, which model the domain and are usually simple POJOs, and *resolvers*, that model the queries and mutations and contain the resolver functions. Often, both are needed to model a single GraphQL type.

The schema so far looks like this:

```
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

To model it, two classes are needed: `Link` and `Query`. `Link` is a POJO (containing no behavior), so create it as follows:

```
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

You should also create a `LinkRepository` class that will neatly isolate the concern of saving and loading links from the storage. This also makes future extensions and refactoring a lot easier. For now, the links will only be kept in memory.


```
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



### Returning links

Unlike the `Link` POJO, `Query` models behavior, as it contains the resolver for the `allLinks` query.


```
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


Finally, you can update `GraphQLEndpoint` to register the resolver properly when generating the schema:

```
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

Notice how the schema-building logic got extracted into a separate method for easier future additions.

If you now open http://localhost:8080/graphql?query={allLinks{url}} you'll see your very first GraphQL query executing and giving you the result looking like this:
`{"data":{"allLinks":[{"url":"http://howtographql.com"},{"url":"http://graphql.org/learn/"}]}}`

It is now appropriate to feel good about yourself 😎

### Testing with Graph*i*ql

[Graph*i*QL](https://github.com/graphql/graphiql) is an in-browser IDE allowing you to explore the schema, fire queries/mutations and see the results. To add it, copy [the example `index.html` from Graph*i*QL's GitHub repo](https://github.com/graphql/graphiql/blob/master/example/index.html) and replace the paths to `graphiql.css` and `graphiql.js` from

```
<link rel="stylesheet" href="./node_modules/graphiql/graphiql.css" />
<script src="./node_modules/graphiql/graphiql.js"></script>
```

to

```
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphiql@0.11.2/graphiql.css" />
<script src="//cdn.jsdelivr.net/npm/graphiql@0.11.2/graphiql.js"></script>
```

Save the file to `src/main/webapp/index.html` (you may as well delete `index.jsp` that Maven generated), start Jetty and open http://localhost:8080/, and you should be greeted by a cool looking environment where you can test what you've build so far.

[Image: https://quip.com/-/blob/MFcAAALibcr/KGkirzr9TDAx74BdDuQq7g]If you type the same query from above [{allLinks{url}}](http://localhost:8080/graphql?query={allLinks{url}}) into the left panel (notice the auto-completion!), you should get the same result but nicely formatted this time:
[Image: https://quip.com/-/blob/MFcAAALibcr/6ZMH1GYYp4MNJf96MiBkwQ]Keep using Graph*i*QL to test out queries and mutation as you follow the tutorial.

