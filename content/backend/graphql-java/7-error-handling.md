---
title: Error Handling
pageTitle: "Error Handling with GraphQL & Javascript Tutorial"
description: "Learn best practices for validation of input arguments and implementing error handling in GraphQL with Javascript, Node.js & Express."
question: How does a GraphQL server signal an error to the client?
answers: ["It sends errors together with the partial result", "It sends errors instead of the result", "It sends an HTTP error code", "It sends null as the result"]
correctAnswer: 0
---

At this point, it is likely you've already seen an error showing up GraphiQL, so you probably have some intuition as to what happens when something goes wrong on the server. In the simplest case, if you just mistype a query you'll see an error popping up in the dedicated `errors` field in the response.

GraphQL puts an accent on consistency and predictability and, in that tone, the response from a GraphQL server always has a predictable structure, consisting the 3 fields:

* The `data` field, where the result of the operation is stored
* The `errors` field, where all the errors accumulated during the execution of the operation are kept
* An optional `extensions` field with arbitrary contents, usually meta-data about the response

Any GraphQL server will automatically handle syntactical and validation errors and inform the client appropriately, but the exceptions encountered in the resolver functions usually require application-specific handling. With your current stack, error handling can be customized on a few different levels.

At the highest level, `graphql-java-servlet` exposes a method (called `isClientError`) that decides whether an error's message is to be sent to the client verbatim or if it is to be obscured by a generic *server error* message. By default, only syntactical and validation errors will be sent as they are. This is a reasonable default, as exception messages and stack traces can potentially reveal a lot of information best kept hidden from public view. Yet, non-informative error messages (or even too numerous messages) can have severe negative impact on the API's usability.

Check out the default behavior in GraphiQL by first asking for an non-existent `address` field of a link:

![](http://i.imgur.com/ov6c4eQ.png)

Then check out the behavior for application-specific errors by, for example, providing a wrong password to `signinUser`:

![](http://i.imgur.com/fskuAah.png)

To allow the user to properly sanitize outgoing messages, while keeping them relevant and specific, `graphql-java-servlet` exposes another extension point: the `GraphQLServlet#filterGraphQLErrors` method. By overriding this method it is possible to sanitize, filter, wrap or otherwise transform the collected errors before they're sent to the client.

One good use-case is enriching the messages with extra information useful to the client.

<Instruction>

To forward the data-fetching exception messages, while still hiding the corresponding stack traces, you should start by creating a simple wrapper class:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/SanitizedError.java")
import com.fasterxml.jackson.annotation.JsonIgnore;
import graphql.ExceptionWhileDataFetching;

public class SanitizedError extends ExceptionWhileDataFetching {
    
    public SanitizedError(ExceptionWhileDataFetching inner) {
        super(inner.getException());
    }

    @Override
    @JsonIgnore
    public Throwable getException() {
        return super.getException();
    }
}
```

</Instruction>

This wrapper doesn't do much - it just instructs [Jackson](https://github.com/FasterXML/jackson) (the JSON (de)serialization library) to ignore the linked exception during serialization. This way, the stack trace won't reach the client.

<Instruction>

Then, wrap all data-fetching exceptions by overriding `filterGraphQLErrors` in `GraphQLEndpoint`:

```java(path=".../hackernews-graphql-java/src/main/java/com/howtographql/hackernews/GraphQLEndpoint.java")
@Override
protected List<GraphQLError> filterGraphQLErrors(List<GraphQLError> errors) {
    return errors.stream()
            .filter(e -> e instanceof ExceptionWhileDataFetching || super.isClientError(e))
            .map(e -> e instanceof ExceptionWhileDataFetching ? new SanitizedError((ExceptionWhileDataFetching) e) : e)
            .collect(Collectors.toList());
}
```

</Instruction>

This way, in addition to the syntactical and validation errors, data-fetching errors will have precise messages sent to the client, but without the gritty details. All other error types will still be hidden behind a generic message.

As always, verify your work in GraphiQL:

![](http://i.imgur.com/aiH4DcK.png)

For even lower-level control, it is possible to customize the execution strategy (the way the operations are executed, modeled by the `ExecutionStrategy` interface), and  override `ExecutionStrategy#handleDataFetchingException` method which translates Java exceptions into GraphQL errors.

To use a custom execution strategy, change `GraphQLEndpoint`'s constructor to some like:

```java(nocopy)
public GraphQLEndpoint() {
    super(buildSchema(), new CustomExecutionStrategy());
} 
```
