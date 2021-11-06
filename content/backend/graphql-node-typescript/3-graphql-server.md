---
title: Creating a GraphQL Server
pageTitle: 'Getting Started with a basic GraphQL server'
description:
  'Getting Started with a GraphQL server based on Fastify and GraphQL-Helix'
question: 'What is SSE used for?'
answers: ['Push data to client from server over HTTP', 'Push data to client from server over WebSockets', 'Push data to server from client over HTTP', 'Push data to server from client over WebSockets']
correctAnswer: 0
---

Now that you have a GraphQL schema, and you understand the concept of GraphQL schema and a GraphQL query, it's time to create a real GraphQL server.

You are going to use the HTTP protocol to serve the GraphQL server, but note that there are other options for serving GraphQL - you can use WebSocket, SSE (Server-Sent Events) and basically any network transport protocol that you wish! (You can find a list of transport implementations at the end of this page)

### Creating a raw HTTP server

In this tutorial, you'll use Fastify to create the HTTP server, and GraphQL-Helix to add GraphQL capabilities to the HTTP server.

<Instruction>

You'll need `fastify` package available in your project, so install it using the following command:

```bash
npm install --save fastify
```

</Instruction>

<Instruction>

Now, update `src/index.ts` to create a simple Fastify HTTP server on port `3000`: 

```typescript{2,5-13}(path="hackernews-node-ts/src/index.ts")
import "graphql-import-node";
import fastify from "fastify";

async function main() {
  const server = fastify();

  server.get("/", (req, reply) => {
    reply.send({ test: true });
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:3000/`);
  });
}

main();
```

</Instruction>

> You've removed the basic GraphQL setup from this file, but don't worry - in a few minutes you'll add it with more capabilities and a real server!

Now, try to run your server again with `npm run dev` (or, `npm run start`). You shouldn't see any special output in the log, but you can now open your browser and navigate to `http://localhost:3000/`. 

You'll see that the server replys with the `{ test: true }` response - this is great, because in the next steps you'll learn how to replace that with the GraphQL response!

### Adding GraphQL to the server

Now that you have an HTTP server running, you'll add support for GraphQL. 

In the previous chapter you've learned that you need a GraphQL operation and a GraphQL schema in order to execute, and now it's time to implement a complete GraphQL execution pipeline, based on HTTP. 

> When dealing with network-based GraphQL implementations, the GraphQL server needs to do more than `parse` + `execute` and that's exactly what GraphQL-Helix does for you. The next section explains how a GraphQL pipeline works.

To do that, you'll add to the project GraphQL-Helix - a tool for simplifying the GraphQL execution flow based on incoming requests.

<Instruction>

Start by adding `graphql-helix` to your project:

```bash
npm install --save graphql-helix
```

</Instruction>

Now, in order to accept incoming GraphQL requests and handle them, you can use GraphQL-Helix. You'll start by adding an endpoint for `POST /graphql` for our server, and then use `graphql-helix` to normalize the incoming request, and then execute it against the GraphQL schema:

<Instruction>

Change `src/index.ts` and replace the dummy request handler with the following:

```typescript{3,4,9-32}(path="hackernews-node-ts/src/index.ts")
import 'graphql-import-node';
import fastify from "fastify";
import { getGraphQLParameters, processRequest, Request, sendResult } from "graphql-helix";
import { schema } from "./schema";

async function main() {
  const server = fastify();

  server.route({
    method: "POST",
    url: "/graphql",
    handler: async (req, reply) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query,
        variables,
      });

      sendResult(result, reply.raw);
    }
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:3000/`);
  });
}

main();
```

</Instruction>

You can now try to run your server, and you should be able to run our query in a HTTP-based GraphQL request. 

<Instruction>

If you have `curl` installed on your machine, you should be able to run and see the GraphQL response (you can also use any kind of HTTP requests tools, like [Postman](https://www.postman.com/)):

```bash
curl -X POST http://localhost:3000/graphql -H "Content-type: application/json" --data-raw '{"query": "query { info }"}'
```

And you should see in return: 

```(nocopy)
{ data: { info: 'Test' } }
```

</Instruction>

So let's break down the code snippet for the server:

1. You created a new HTTP request handler, of type `POST`, based on the `/graphql` path. 
1. The handler takes the incoming raw HTTP request and builds a `Request` object out of it.
1. Then, the `getGraphQLParameters` method of `graphql-helix` extracts all the neccesary information from the raw request. 
1. The `processRequest` gets all the input parameters, and runs the GraphQL request pipeline for us.
1. The result of the GraphQL operation is being returned and sent as response.

### The complete GraphQL execution pipeline

A complete GraphQL flow is consists of the following steps:

1. Schema building - a GraphQL schema is built as executable schema (by combining the SDL and the resolvers) 
1. `parse` - takes the GraphQL operation and parse it into a `DocuemntNode`.
1. `validate` - uses the parsed GraphQL operation with the GraphQL schema, and validate it to make sure it matches the schema.
1. Variables - GraphQL operations allow you to pass variables, which are just JSON object. 
1. Context - GraphQL allow you to pass a custom object, called `context`, and this object will be available for your resolvers. This is a useful technique you'll learn more about in next chapters.
1. `execute` - takes the operation and runs the resovlers based on the selection-set.

With `graphql-helix`, this flow becomes simpler because you can just use `processRequest`, and `graphql-helix` runs for you `parse`, `validate`, variables parsing, context-building, and `execute` - all in a single function. 

### Adding GraphiQL

[GraphiQL](https://github.com/graphql/graphiql), a powerful "GraphQL IDE" that runs in your browser, as part of your server, and lets you explore the capabilities of your API in an interactive manner. You can also use it to experiment and test your GraphQL API.

![GraphiQL](https://i.imgur.com/x0WbzF8.png)

`graphql-helix` comes with a ready-to-use GraphiQL configuration that works with any project.

<Instruction>

To add GraphiQL to your server, create a new `GET /graphql` request handler, and just import and use in in a route:

```typescript{3,9-17}(path="hackernews-node-ts/src/index.ts")
import 'graphql-import-node';
import fastify from "fastify";
import { getGraphQLParameters, processRequest, Request, renderGraphiQL, shouldRenderGraphiQL, sendResult } from "graphql-helix";
import { schema } from "./schema";

async function main() {
  const server = fastify();

  server.route({
    method: ["POST", "GET"],
    url: "/graphql",
    handler: async (req, reply) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header("Content-Type", "text/html");
        reply.send(
          renderGraphiQL({
            endpoint: "/graphql",
          })
        );

        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query,
        variables,
      });

      sendResult(result, reply.raw);
    }
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log(`GraphQL API is running on http://localhost:3000/graphql`);
  });
}

main();
```

</Instruction>

Now, run the server, and try to access `http://localhost:3000/graphql` in your browser. You should see GraphiQL UI, and from there you can explore the schema, the documentation, and even try to run queries! 

![GraphiQL](https://i.imgur.com/fbfgo43.png)

In the next steps you'll extend your schema, and add more capabilities to the GraphQL schema and server!

### Additional Resources

* If you wish to use a different network transport, you can check [`graphql-ws`](https://github.com/enisdenjo/graphql-ws) for WebSocket, or [`graphql-sse`](https://github.com/enisdenjo/graphql-sse) for Server-Sent Events transport.


