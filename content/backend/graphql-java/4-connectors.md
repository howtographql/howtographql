---
title: Connectors
pageTitle: "GraphQL Connectors with Java & MongoDB Tutorial"
description: "Learn how to write connectors in Java to load data from MongoDB with graphql-java and a Java GraphQL server."
question: Where can a GraphQL server store data to and load data from?
answers: ["Graph databases, like Neo4j, OrientDB, Arango etc", "GraphQL servers do not store or load data", "Any persistent storage, e.g. MongoDB", "Anywhere"]
correctAnswer: 3
---

As fun as it may be, your GraphQL API is unlikely to be of much use if it doesn't connect to other systems, be it databases, third-party APIs or alike.


> One of the beauties of the architecture imposed by GraphQL (remember all that *single responsibility* stuff?) is that introducing third-party connectors is both trivial for the developer (you) and completely transparent for the client.


Since resolvers are responsible for fetching the value of a single field, it is easy to imagine that, within a single query response, values could be coming from multiple storages and third-party APIs at the same time, without the client ever being affected.


### Refactor the link type

<Instruction>

Take this opportunity to add the `id` field to the `Link` type as you'll need it for the features coming later.

```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
type Link {
    id: ID!
    url: String!
    description: String
}
```

</Instruction>

<Instruction>

Analogously, refactor the `Link` class to add the new field:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Link.java")
public class Link {
    
    private final String id; //the new field
    private final String url;
    private final String description;

    public Link(String url, String description) {
        this(null, url, description);
    }

    public Link(String id, String url, String description) {
        this.id = id;
        this.url = url;
        this.description = description;
    }

    public String getId() {
        return id;
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

### Connecting Mongo DB

For this project, you'll use MongoDB as the persistent storage, but by following the exact same approach you can integrate any other third-party system as the underlying provider for your resolvers.

1. First off, install MongoDB on your computer

	<Instruction>
	
	Following [the installation instructions](https://docs.mongodb.com/manual/administration/install-community/) for your platform, and start it up.
	
	</Instruction>

2. Having that done, add MongoDB Java driver

	<Instruction>
	
	Declare a dependency to MongoDB Java driver to `pom.xml`:
	
	```xml(path=".../hackernews-graphql-java/pom.xml")
	<dependency>
	    <groupId>org.mongodb</groupId>
	    <artifactId>mongodb-driver</artifactId>
	    <version>3.4.2</version>
	</dependency>
	```
	
	</Instruction>

3. Thanks to the decision to extract the logic for saving and loading links into the `LinkRepository` class, introduction of MongoDB now has a very localized impact.

	<Instruction>
	
	Refactor `LinkRepository` so that it persists and loads links from MongoDB and not from an in-memory list.
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkRepository.java")
	public class LinkRepository {
	    
	    private final MongoCollection<Document> links;
	
	    public LinkRepository(MongoCollection<Document> links) {
	        this.links = links;
	    }
	
	    public Link findById(String id) {
	        Document doc = links.find(eq("_id", new ObjectId(id))).first();
	        return link(doc);
	    }
	    
	    public List<Link> getAllLinks() {
	        List<Link> allLinks = new ArrayList<>();
	        for (Document doc : links.find()) {
	            allLinks.add(link(doc));
	        }
	        return allLinks;
	    }
	    
	    public void saveLink(Link link) {
	        Document doc = new Document();
	        doc.append("url", link.getUrl());
	        doc.append("description", link.getDescription());
	        links.insertOne(doc);
	    }
	    
	    private Link link(Document doc) {
	        return new Link(
	                doc.get("_id").toString(),
	                doc.getString("url"),
	                doc.getString("description"));
	    }
	}
	```
	
	</Instruction>

4. Update the allLinks method in the Query class to now call `linkRepository.getAllLinks()` instead of `linkRepository.allLinks()`.

5. You'll also have to update `GraphQLEndpoint` to connect to MongoDB.

	<Instruction>
	
	Get the `links` collection from MongoDB and provide it to `LinkRepository`.
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndpoint.java")
	@WebServlet(urlPatterns = "/graphql")
	public class GraphQLEndpoint extends SimpleGraphQLServlet {
	
	    private static final LinkRepository linkRepository;
	
	    static {
	        //Change to `new MongoClient("mongodb://<host>:<port>/hackernews")`
	        //if you don't have Mongo running locally on port 27017
	        MongoDatabase mongo = new MongoClient().getDatabase("hackernews");
	        linkRepository = new LinkRepository(mongo.getCollection("links"));
	    }
	    
	    public GraphQLEndpoint() {
	        super(buildSchema());
	    }
	
	    private static GraphQLSchema buildSchema() {
	        return SchemaParser.newParser()
	                .file("schema.graphqls")
	                .resolvers(new Query(linkRepository), new Mutation(linkRepository))
	                .build()
	                .makeExecutableSchema();
	    }
	}
	```
	
	</Instruction>

That's all! Restart Jetty, fire up GraphiQL and give it a spin! Just make sure you create some links before querying them. Everything should still work the same except you won't lose the saved links if the power goes out.

### Performance

You may have noticed that the execution strategy seen so far is somewhat naive. Imagine the link descriptions are stored in a different database. That would mean for a query like this

```graphql(nocopy)
query links {
  allLinks {
    description
  }
}
```

the resolver for the `description` field (invoked once for each link in the result)  would query that other database as many times are there were links. This a classic example of the N+1 problem. The solution for this is to batch multiple requests and resolve them in one go. In case of a SQL database, the desired resolver would look like:

```sql(nocopy)
SELECT * FROM Descriptions WHERE link_id IN (1,2,3) // fetch descriptions for 3 links at once
```

**DataLoader**

In JavaScript and a few other languages, a popular way to implement this strategy is the [DataLoader](https://github.com/facebook/dataloader) utility. [The Java implementation of DataLoader](https://github.com/bbakerman/java-dataloader) is unfortunately still in the making.

As an alternative, `graphql-java` offers `BatchedExecutionStrategy`, which looks for resolvers (`DataFetcher`s in `graphql-java` lingo) annotated by `@Batched`. Such resolvers are expected to take a list of source objects and return a list of results. For the example above, that would mean taking a list of links (`List<Link>`) and returning a list of descriptions (`List<String>`). Again unfortunately, `graphql-java-tools` does not yet support batched data fetchers, but it hopefully [soon will](https://github.com/graphql-java/graphql-java-tools/issues/12).

