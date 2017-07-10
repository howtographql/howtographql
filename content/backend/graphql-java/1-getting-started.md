---
title: Getting Started
description: Learn how to setup a graphql-java project and define the GraphQL schema
---

### Initialize the project

Since you'll be using [Maven](https://maven.apache.org/) (still the most widely used build tool for Java) in this tutorial, make sure you have a reasonably fresh version installed.

To bootstrap a simple web application project execute

```sh
mvn archetype:generate -DarchetypeArtifactId=maven-archetype-webapp -DgroupId=com.howtographql.sample -DartifactId=hackernews -Dversion=1.0-SNAPSHOT
```

in a directory of choice and confirm with `Y` when prompted.


### Defining the schema

It is important to note that the resolver functions are an integral part of the field definitions, and thus a part of the schema. This means the schema isn't just a document, but a runtime object instance (for the purposes of this track, that would mean a Java object).

The schema can be defined in two ways:

*  programmatically - where type definitions are assembled manually in code
* using the [Schema Definition Language](http://graphql.org/learn/schema/#type-language) (SDL) - where the schema is generated from a textual language-independent description you've seen in the previous chapters with the resolver functions then wired dynamically

Both approaches have merit, and come down to a matter of preference. The former collocates the fields and their associated resolves, while the latter makes a clear cut between data and behavior. We'll use SDL for the most part of this track as it allows for succinct examples.

The SDL definition for a simple type representing a link might look like this:

```graphql
type Link {
  url: String!
  description: String!
}
```

And a query to fetch all links could be defined as:

```graphql
type Query {
  allLinks: [Link]
}
```

Finally, the schema containing this query would be defined as:

```graphql
schema {
  query: Query
}
```

Save these definitions in a file called `schema.graphqls` inside `src/main/resources`.


### Install dependencies

To build a GraphQL-enabled application, only `graphql-java` (the GraphQL implementation itself) is strictly required. Still, to make dynamic resolver wiring easy, you'll also want to use `graphql-java-tools`, the library inspired by Apollo's `graphql-tools`. Additionally, because the goal is to expose the API over the web, you'll also make use of `graphql-java-servlet` (a simple helper library containing a ready-made servlet for accepting GraphQL queries) and `javax.servlet-api` (the servlet specification implementation).

Add all the dependencies to your `pom.xml`:


```xml
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java</artifactId>
    <version>3.0.0</version>
</dependency>
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java-tools</artifactId>
    <version>3.1.3</version>
</dependency>
<dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java-servlet</artifactId>
    <version>4.0.0</version>
</dependency>
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.0.1</version>
    <scope>provided</scope>
</dependency>
```

The versions listed above were the latest at the time of writing, but they change quickly as bugs are fixed and features are added. Make sure you always check for updates before going further.

### Setup server

Any servlet container will do here, and the simplest way to use one during development is via a Maven plugin. For Jetty, add the plugin to the `build` section as follows:

```xml
<build>
    <finalName>hackernews</finalName>
    <plugins>
        <plugin>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-maven-plugin</artifactId>
            <version>9.4.6.v20170531</version>
        </plugin>
    </plugins>
</build>
```

This also a good opportunity to configure some basics. Add the following plugin configuration (just below the Jetty plugin) to set Java version to 8 and servlet spec version to 3.1:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.5.1</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
    </configuration>
</plugin>

<plugin>
    <artifactId>maven-war-plugin</artifactId>
    <version>3.1.0</version>
</plugin>
```



> You can run the app just by executing `mvn jetty:run` in the directory where `pom.xml` is located, and Jetty will start on port 8080.


But opening it at this moment won't bring you much joy, as the server still isn't configured to *do* anything.

To remedy this, start by creating a class called `GraphQLEndpoint`, this will be the servlet exposing the API. The contents should look as follows:


```java
import com.coxautodev.graphql.tools.SchemaParser;
import javax.servlet.annotation.WebServlet;
import graphql.servlet.SimpleGraphQLServlet;


@WebServlet(urlPatterns = "/graphql")
public class GraphQLEndpoint extends SimpleGraphQLServlet {

    public GraphQLEndpoint() {
        super(SchemaParser.newParser()
                .file("schema.graphqls") //parse the schema file created earlier
                .build()
                .makeExecutableSchema());
    }
}
```

Starting the server now and accessing http://localhost:8080/graphql will still result in an error because no resolver functions have been wired in (so the defined `allLinks` query has no way to execute).

