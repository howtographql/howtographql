---
title: Filtering
pageTitle: "Server-side Filtering with GraphQL & Java Tutorial"
description: "Learn best practices for implementing filters in a GraphQL API using query arguments with a Java GraphQL server."
question: Is result filtering supported by GraphQL?
answers: ["Yes, out of the box, via dedicated query arguments", "Arguments have no built-in semantics, the implementer can provide arguments used for filtering (like Graph.cool does)", "Yes, but only if extensions are installed", "No"]
correctAnswer: 1
---

## Filtering

As you have seen in earlier chapters, queries and mutations can take input via arguments. Since arguments have no inherent semantics attached, and mean whatever you define them to mean, you can easily implement common features like filtering by simply designating arguments to be used for this purpose.

You'll now apply this idea to add filtering to the already defined `allLinks` query.

1. Start by add a new argument to its schema definition

	<Instruction>
	
	Introduce the `LinkFilter` argument to `allLinks`
	
	```graphql(path=".../hackernews-graphql-java/src/main/resources/schema.graphqls")
	type Query {
	  allLinks(filter: LinkFilter): [Link]
	}
	
	input LinkFilter {
	  description_contains: String
	  url_contains: String
	}
	```
	
	</Instruction>

Remember that this exact approach is just an example. You might as well implement filtering using any other format.

2. Create the corresponding data-class

	<Instruction>
	
	The `LinkFilter` POJO should look something like the following:
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkFilter.java")
	import com.fasterxml.jackson.annotation.JsonProperty;
	
	public class LinkFilter {
	
	    private String descriptionContains;
	    private String urlContains;
	
	    @JsonProperty("description_contains") //the name must match the schema
	    public String getDescriptionContains() {
	        return descriptionContains;
	    }
	
	    public void setDescriptionContains(String descriptionContains) {
	        this.descriptionContains = descriptionContains;
	    }
	
	    @JsonProperty("url_contains")
	    public String getUrlContains() {
	        return urlContains;
	    }
	
	    public void setUrlContains(String urlContains) {
	        this.urlContains = urlContains;
	    }
	}
	```
	
	</Instruction>

3. The logic needs to allow filtering

	<Instruction>
	
	Update `LinkRespository#getAllLinks` to accept an optional filter:
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkRespository.java")
	public List<Link> getAllLinks(LinkFilter filter) {
	    Optional<Bson> mongoFilter = Optional.ofNullable(filter).map(this::buildFilter);
	    
	    List<Link> allLinks = new ArrayList<>();
	    for (Document doc : mongoFilter.map(links::find).orElseGet(links::find)) {
	        allLinks.add(link(doc));
	    }
	    return allLinks;
	}
	
	//builds a Bson from a LinkFilter
	private Bson buildFilter(LinkFilter filter) {
	    String descriptionPattern = filter.getDescriptionContains();
	    String urlPattern = filter.getUrlContains();
	    Bson descriptionCondition = null;
	    Bson urlCondition = null;
	    if (descriptionPattern != null && !descriptionPattern.isEmpty()) {
	        descriptionCondition = regex("description", ".*" + descriptionPattern + ".*", "i");
	    }
	    if (urlPattern != null && !urlPattern.isEmpty()) {
	        urlCondition = regex("url", ".*" + urlPattern + ".*", "i");
	    }
	    if (descriptionCondition != null && urlCondition != null) {
	        return and(descriptionCondition, urlCondition);
	    }
	    return descriptionCondition != null ? descriptionCondition : urlCondition;
	}
	```
	
	</Instruction>

4. Finally, update `Query` to add the new argument to the top-level method:

	<Instruction>
	
	Add the `filter` parameter to `Query#allLinks`:
	
	```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Query.java")
	public List<Link> allLinks(LinkFilter filter) {
	    return linkRepository.getAllLinks(filter);
	}
	```
	
	</Instruction>

Cool! Check it out in GraphiQL!

![](http://i.imgur.com/tL8owju.png)
