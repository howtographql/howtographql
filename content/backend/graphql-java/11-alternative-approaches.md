---
title: Alternative approaches to schema development
pageTitle: "More Approaches to Schema Development with GraphQL & Java"
description: "Learn about an alternative approach to developing schemas with graphl-java with graphql-spqr"
question: Does GraphQL development always start by defining the schema?
answers: ["Yes", "No, but it is a popular approach approach", "No, the schema can only be produced at the end", "The schema can only be generated dynamically"]
correctAnswer: 1
---

The way you've been developing so far is known as schema-first, as you always start by defining the schema. This style has important benefits, discussed at the beginning of this tutorial, and it works well for new projects, where no legacy code exists. Still, you may have noticed that in strongly and statically typed languages, like Java, it leads to a lot of duplication. For example, revisit the way you developed the `Link` type.

You defined it in the schema:

```graphql(nocopy)
type Link {
    id: ID!
    url: String!
    description: String
}
```

and then you created a corresponding POJO:

```java(nocopy)
public class Link {
    
    private final String id;
    private final String url;
    private final String description;
    
    //constructors, getters and setters
    //...
}
```

Both of these blocks contain the exact same information. Worse yet, changing one requires immediate change to the other. This makes refactoring risky and cumbersome. On the other hand, if you're trying to introduce a GraphQL API into an existing project, writing the schema practically means re-describing the entire existing model. This is both expensive and error-prone, and still suffers from duplication. 

### Code-first style

A common alternative to the schema-first style, known as code-first, is generating the schema from the existing model. This keeps the schema and the model in sync, easing refactoring. It also works well in projects where GraphQL is introduced on top of an existing codebase. The downside of this approach is that the schema doesn't exist until the some server code is written, introducing a dependency between the client-side and server-side work. One workaround would be using stubs on the server to generate the schema quickly, then developing the real server code in parallel with the client.

The Java/GraphQL ecosystem spawned a few libraries that facilitate this style of development. You can find them listed [here](https://github.com/graphql-java/awesome-graphql-java#code-first). An example using [`graphql-spqr`](https://github.com/leangen/graphql-spqr), written by yours truly, follows below.

### Setting up graphql-spqr

<Instruction>

To experiment with `graphql-spqr`, you should first declare a dependency to it in `pom.xml`:

```xml(path=".../hackernews-graphql-java/pom.xml")
<dependency>
    <groupId>io.leangen.graphql</groupId>
    <artifactId>spqr</artifactId>
    <version>0.9.1</version>
</dependency>
```

</Instruction>

Additionally, it will be much more comfortable to work if the [method parameter names are preserved](https://docs.oracle.com/javase/tutorial/reflect/member/methodparameterreflection.html) (you'll understand why in a second).

<Instruction>

So enable the `-paramaters` javac option by configuring the `maven-compiler-plugin` as follows:

```xml(path=".../hackernews-graphql-java/pom.xml")
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.6.1</version>
    <configuration>
        <compilerArgs>
            <arg>-parameters</arg>
        </compilerArgs>
    </configuration>
</plugin>
```

</Instruction>

Make sure you **rebuild the project** now (e.g. run `mvn clean package`) for the new option to take effect. Then, restart Jetty.

### Generating the schema using graphql-spqr

In order to generate a schema similar to the one you've been working on so far, but this time using the code-first style you'd (unsurprisingly) start from the business logic. It is fortunate that you already have some business logic ready, in `Query`, `Mutation` and `*Resolver` classes, as it simulates introducing GraphQL into an existing project.

The easiest way to demonstrate `graphql-spqr` is by using annotations, but note that they're entirely optional.

<Instruction>

Start off by decorating the methods you want exposed over GraphQL.

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Query.java")
public class Query { //1

    private final LinkRepository linkRepository;

    public Query(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    @GraphQLQuery //2
    public List<Link> allLinks(LinkFilter filter,
                               @GraphQLArgument(name = "skip", defaultValue = "0") Number skip, //3
                               @GraphQLArgument(name = "first", defaultValue = "0") Number first) {
        return linkRepository.getAllLinks(filter, skip.intValue(), first.intValue());
    }
```

</Instruction>

A few things to note about this code:

1. Implementing `GraphQLRootResolver` is no longer needed (nor is the dependency to `graphql-java-tools`). In fact, `graphql-spqr` goes to great lengths to ensure the code needs no special classes, interfaces or any modifications in order to be exposed over GraphQL
2. As noted, the annotations are entirely optional, but the default configuration will expect them at the top-level
3. By default, the name of the method parameter will be used in the schema (this is why you want `-parameters` javac option enabled when compiling). Using `@GraphQLArgument` is a way to change the name and set the default value. All of this is doable without annotations as well.

<Instruction>

Decorate the interesting bits in `LinkResolver` too:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/LinkResolver.java")
public class LinkResolver { //1
    
    private final UserRepository userRepository;

    LinkResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GraphQLQuery
    public User postedBy(@GraphQLContext Link link) { //2
        if (link.getUserId() == null) {
            return null;
        }
        return userRepository.findById(link.getUserId());
    }
}
```

</Instruction>

The point of interest in this block:

1. No more `implements GraphQLResolver<Link>`
2. `@GraphQLContext` is used to wire external methods into types. This mapping is semantically the same as if the `Link` class contained a method `public User postedBy() {...}`. In this manner, it is possible to keep the logic separate from data, yet still produce deeply nested structures.

<Instruction>

Expose the `createLink` mutation is a similar fashion:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/Mutation.java")
@GraphQLMutation //1
public Link createLink(String url, String description, @GraphQLRootContext AuthContext context) { //2
    Link newLink = new Link(url, description, context.getUser().getId());
    linkRepository.saveLink(newLink);
    return newLink;
}
```

</Instruction>

Things to note:

1. You expose mutations via `@GraphQLMutation`
2. You can inject the `AuthContext` directly via `@GraphQLRootContext`. No more need for `DataFetchingEnvironment`. This nicely removes the dependency to `graphql-java` specific code in the logic layer.

<Instruction>

Finally, to generate the schema from the classes, update `GraphQLEndoint#buildSchema` to look as follows:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndoint.java")
private static GraphQLSchema buildSchema() {
    Query query = new Query(linkRepository); //create or inject the service beans
    LinkResolver linkResolver = new LinkResolver(userRepository);
    Mutation mutation = new Mutation(linkRepository, userRepository, voteRepository);
    
    return new GraphQLSchemaGenerator()
            .withOperationsFromSingletons(query, linkResolver, mutation) //register the beans
            .generate(); //done :)
}
```

</Instruction>

If you now fire up GraphiQL, you'd get the exact same result as before:

![](http://i.imgur.com/RQufTw6.png)
![](http://i.imgur.com/NBQFPJ9.png)

The important points to note:

* You never defined the schema explicitly (meaning you won't have to update it when the code changes either).
* You don't have to separate the logic for manipulating `Link`s into the top level queries (`allLinks` inside `Query`), embedded ones (`postedBy` inside `LinkResolver`) and mutations (`createLink` inside `Mutation`). All the queries and mutations operating on links could have been placed into a single class (e.g. `LinkService`), yet having them separate was not a hurdle either. This implies that your legacy code and best practices can stay untouched. 

This is just a glance at the alternative style of development. There are many more possibilities to explore, so take a look at what [the ecosystem](https://github.com/graphql-java/awesome-graphql-java) has to offer. For more info on `graphql-spqr` check out [the project page](https://github.com/leangen/graphql-spqr), and for a full example see [here](https://github.com/leangen/graphql-spqr-samples).

