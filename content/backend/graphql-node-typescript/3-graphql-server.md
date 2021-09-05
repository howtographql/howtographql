---
title: Creating a GraphQL Server
pageTitle: 'Getting Started with a GraphQL server'
description:
  'Getting Started with a GraphQL server based on Fastify GraphQL-Helix'
---

Now that we have a GraphQL schema, and we understand the concept of GraphQL schema and a GraphQL query, it's time to create a real GraphQL server.

We will use the HTTP protocol to server our GraphQL schema and server, but note that there are other options for serving GraphQL - you can use WebSocket, SSE (Server-Sent Events) and basically any transport protocol that you wish! (You can find a list of transport implementations at the end of this page). 

### Creating a raw HTTP server

In this tutorial, we will use Fastify to create the HTTP server, and GraphQL-Helix to add GraphQL capabilities to our HTTP server.

So let's start with the basic HTTP first.

<Instruction>

You'll need Fastify package available in your server, so install it using the following command:

```bash
npm install --save fastify
```

Now, update `src/index.ts` to create a simple Fastify HTTP server on port `3000`: 

```ts
import fastify from "fastify";

async function main() {
  const server = fastify();

  server.get("/", (req, reply) => {
    reply.send({ test: true });
  });

  server.listen(3000, "0.0.0.0");
}

main();
```

And try to run your server again with `npm run dev` (or, `npm run start`). You shouldn't see any special output in the log, but you can now open your browser and navigate to `http://localhost:3000/`. 

You'll see that the server replys with the `{ test: true }` response - this is great, because in the next steps we'll learn how to replace that with the GraphQL response!

</Instruction>

### Adding GraphQL to our server

Now that we have an HTTP server running, we will add support for GraphQL. 

In the previous chapter we learned that we need a GraphQL operation and a GraphQL schema in order to execute, and now it's time to implement a complete GraphQL execution pipeline, based on HTTP. 

> When dealing with network-based GraphQL implementations, we need to do more than `parse` + `execute` and that's exactly what GraphQL-Helix does for you. The next section explains how a GraphQL pipeline works.

To do that, we'll add to our project GraphQL-Helix - a tool for simplifying the GraphQL execution flow based on incoming requests.

<Instruction>

Start by adding `graphql-helix` to your project:

```bash
npm install --save graphql-helix
```

</Instruction>

Now, in order to accept incoming GraphQL requests and handle them, we can use GraphQL-Helix. We'll start by adding an endpoint for `POST /graphql` for our server, and then use `graphql-helix` to normalize the incoming request, and then execute it: 

<Instruction>

Change `src/index.ts` and replace the dummy request handler we had with the following:

```ts
import fastify from "fastify";
import { getGraphQLParameters, processRequest, Request } from "graphql-helix";
import { schema } from "./schema";

async function main() {
  const server = fastify();

  server.post("/graphql", async (req, reply) => {
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

    if (result.type === "RESPONSE") {
      reply.send(result.payload);
    } else {
      reply.send({ error: "Stream not supported at the moment" });
    }
  });

  server.listen(3000, "0.0.0.0");
}

main();
```

You can now try to run your server, and you should be able to run our query in a HTTP-based GraphQL request. 

If you have `curl` installed on your machine, you should be able to run and see the GraphQL response:

```bash
curl -X POST http://localhost:3000/graphql -H "Content-type: application/json" --data-raw '{"query": "query { info }"}'
```

You can also use any kind of HTTP requests tools, like Postman. 

</Instruction>

So let's break down the code snippet for our server:

1. We created an new HTTP request handler, of type `POST`, based on the `/graphql` path. 
1. The handler takes the incoming raw HTTP request and builds a `Request` object out of it.
1. Then, the `getGraphQLParameters` method of `graphql-helix` extracts all the neccesary information from the raw request. 
1. The `processRequest` gets all the input parameters, and runs the GraphQL request pipeline for us.
1. The result of the GraphQL operation is being returned and sent to the client.  

> GraphQL-Helix supports real-time GraphQL and stream-based responses, that's why we need to check it's result before sending it. At the moment, our server only supports regular responses (`type="RESPONSE"`). We'll later add support for more transports.  

### The complete GraphQL execution pipeline

A complete GraphQL flow is consists of the following steps:

1. Schema building - first, we need to make sure that we have a GraphQL schema ready-to-use. 
1. `parse` - we take the GraphQL operation and parse it into a `DocuemntNode`.
1. `validate` - we use the parsed GraphQL operation with the GraphQL schema, and we validate it to make sure it matches the schema.
1. Variables - GraphQL operations allow you to pass variables, which are just JSON object. 
1. Context building - GraphQL allow you to pass a custom object, called `context`, and this object will be available for your resolvers. 
1. `execute` - takes the operation and runs the resovlers based on the selection-set.

With `graphql-helix`, this flow becomes simpler because we can just use `processRequest`.

### Adding GraphQL Playground

[GraphQL Playground](https://github.com/prisma-labs/graphql-playground), a powerful "GraphQL IDE" that runs in your browser, as part of your server, and lets you explore the capabilities of your API in an interactive manner. You can also use it to experiment and test your GraphQL API.

![GraphQL Playground](https://imgur.com/9RC6x9S.png)

<Instruction>

To add GraphQL-Playground to our project, run:

```bash
npm install --save graphql-playground-html
```

And to add Playground to your server, create a new `GET /playground` request handler, and just import `graphql-playground-html` in `src/index.ts`:

```ts
import { renderPlaygroundPage } from "graphql-playground-html";
```

And add the request handler:

```ts
  server.get("/playground", (req, reply) => {
    reply.header("Content-Type", "text/html");
    reply.send(
      renderPlaygroundPage({
        endpoint: "/graphql",
      })
    );
  });
```

Now, run the server, and try to access `http://localhost:3000/playground` in your browser. You should see GraphQL Playground UI, and from there you can explore the schema, the documentation, and even try to run queries! 

</Instruction>

In the next steps we'll change our schema, and we'll add more capabilities to the GraphQL schema and server!

### Additional Resources

* If you wish to use a different network transport, you can check [`graphql-ws`](https://github.com/enisdenjo/graphql-ws) for WebSocket, or [`graphql-sse`](https://github.com/enisdenjo/graphql-sse) for Server-Sent Events transport.


