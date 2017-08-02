---
title: More Mutations
pageTitle: "Advanced Server-side Mutations with GraphQL and Java Tutorial"
description: "Learn best practices for implementing advanced GraphQL mutations with Java and graphql-java. You can test your implementation in a GraphiQL Playground."
question: What kind of input arguments can mutations take?
answers: ["All types (scalars, objects, lists, interfaces and unions) can be used as inputs", "Only scalars, objects and lists can be used as inputs", "Only scalars can be input types, nested structures are not allowed", "Mutations can not take input arguments"]
correctAnswer: 1
---

## Voting for links

With the authentication part done, it's time to introduce a new feature into the system - voting!
The user is supposed to be able to vote for the links they like, so that later the links can be ordered by popularity. Almost like the real Hackernews!

This one will require quite a few steps, so buckle up!

1. Schema needs changes first. (Surprised? ... I didn't expect so)

	<Instruction>
	
	Describe the new mutation and the related type
	
	```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
	type Mutation {
	  #the others stay the same
	  createVote(linkId: ID, userId: ID): Vote
	}
	
	type Vote {
	    id: ID!
	    createdAt: DateTime!
	    user: User!
	    link: Link!
	}
	
	scalar DateTime
	```
	
	</Instruction>

2. Create the analogous data and resolver classes.

	<Instruction>
	
	Create `Vote` and `VoteResolver`
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Vote.java")
	public class Vote {
	    private final String id;
	    private final ZonedDateTime createdAt;
	    private final String userId;
	    private final String linkId;
	
	    public Vote(ZonedDateTime createdAt, String userId, String linkId) {
	        this(null, createdAt, userId, linkId);
	    }
	
	    public Vote(String id, ZonedDateTime createdAt, String userId, String linkId) {
	        this.id = id;
	        this.createdAt = createdAt;
	        this.userId = userId;
	        this.linkId = linkId;
	    }
	
	    public String getId() {
	        return id;
	    }
	
	    public ZonedDateTime getCreatedAt() {
	        return createdAt;
	    }
	
	    public String getUserId() {
	        return userId;
	    }
	
	    public String getLinkId() {
	        return linkId;
	    }
	}
	```
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/VoteResolver.java")
	public class VoteResolver implements GraphQLResolver<Vote> {
	        
	    private final LinkRepository linkRepository;
	    private final UserRepository userRepository;
	
	    public VoteResolver(LinkRepository linkRepository, UserRepository userRepository) {
	        this.linkRepository = linkRepository;
	        this.userRepository = userRepository;
	    }
	
	    public User user(Vote vote) {
	        return userRepository.findById(vote.getUserId());
	    }
	    
	    public Link link(Vote vote) {
	        return linkRepository.findById(vote.getLinkId());
	    }
	}
	```
	
	<Instruction>

3. Persistence gets its own class.

	<Instruction>
	
	Create `VoteRepository` to handle the boring database stuff, as usual
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/VoteRepository.java")
	public class VoteRepository {
	    
	    private final MongoCollection<Document> votes;
	
	    public VoteRepository(MongoCollection<Document> votes) {
	        this.votes = votes;
	    }
	
	    public List<Vote> findByUserId(String userId) {
	        List<Vote> list = new ArrayList<>();
	        for (Document doc : votes.find(eq("userId", userId))) {
	            list.add(vote(doc));
	        }
	        return list;
	    }
	
	    public List<Vote> findByLinkId(String linkId) {
	        List<Vote> list = new ArrayList<>();
	        for (Document doc : votes.find(eq("linkId", linkId))) {
	            list.add(vote(doc));
	        }
	        return list;
	    }
	
	    public Vote saveVote(Vote vote) {
	        Document doc = new Document();
	        doc.append("userId", vote.getUserId());
	        doc.append("linkId", vote.getLinkId());
	        doc.append("createdAt", Scalars.dateTime.getCoercing().serialize(vote.getCreatedAt()));
	        votes.insertOne(doc);
	        return new Vote(
	                doc.get("_id").toString(),
	                vote.getCreatedAt(),
	                vote.getUserId(),
	                vote.getLinkId());
	    }
	    
	    private Vote vote(Document doc) {
	        return new Vote(
	                doc.get("_id").toString(),
	                ZonedDateTime.parse(doc.getString("createdAt")),
	                doc.getString("userId"),
	                doc.getString("linkId")
	        );
	    }
	}
	```
	
	</Instruction>

4. This is an interesting step. You need to create a new scalar type to represent an instant in time. For this, you need an instance of `GraphQLScalarType`. For reference on how to create these, you can check out the build-in types in [`graphql-java`](https://github.com/graphql-java/graphql-java/blob/master/src/main/java/graphql/Scalars.java#L34).

	<Instruction>
	
	Create a custom date/time scalar
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Scalars.java")
	public class Scalars {
	    
	    public static GraphQLScalarType dateTime = new GraphQLScalarType("DateTime", "DataTime scalar", new Coercing() {
	        @Override
	        public String serialize(Object input) {
	            //serialize the ZonedDateTime into string on the way out
	            return ((ZonedDateTime)input).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
	        }
	
	        @Override
	        public Object parseValue(Object input) {
	            return serialize(input);
	        }
	
	        @Override
	        public ZonedDateTime parseLiteral(Object input) {
	            //parse the string values coming in
	            if (input instanceof StringValue) {
	                return ZonedDateTime.parse(((StringValue) input).getValue());
	            } else {
	                return null;
	            }
	        }
	    });
	}
	```
	
	</Instruction>

5. `GraphQLEndpoint` needs to be aware of the new repository, resolver and scalar

	<Instruction>
	
	Update the schema-building logic
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndpoint.java")
	private static final VoteRepository voteRepository;
	
	static {
	    // the rest stays
	    voteRepository = new VoteRepository(mongo.getCollection("votes"));
	}
	
	private static GraphQLSchema buildSchema() {
	    return SchemaParser.newParser()
	        .file("schema.graphqls")
	        .resolvers(
	            new Query(linkRepository),
	            new Mutation(linkRepository, userRepository, voteRepository),
	            new SigninResolver(),
	            new LinkResolver(userRepository),
	            new VoteResolver(linkRepository, userRepository)) //new resolver
	        .scalars(Scalars.dateTime) //register the new scalar
	        .build()
	        .makeExecutableSchema();
	}
	```
	
	</Instruction>

6. And finally, create the new mutation resolver  

	<Instruction>
	
	Implement the logic for the new mutation
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Mutation.java")
	public Vote createVote(String linkId, String userId) {
	    ZonedDateTime now = Instant.now().atZone(ZoneOffset.UTC);
	    return voteRepository.saveVote(new Vote(now, userId, linkId));
	}
	```
	
	</Instruction>

Phew! That was a handful! 😩 Jump back into GraphiQL to see what has changed.

![](http://i.imgur.com/yOGAMop.png)

