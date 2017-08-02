---
title: Realtime with GraphQL subscriptions
pageTitle: "GraphQL Realtime Subscriptions with Graphcool Tutorial"
description: "Learn how to setup server-side GraphQL subscriptions with Graphcool to add realtime functionality to an app. Subscriptions can be tested in a Playground too."
---

This will be a short chapter where we want to provide some tips on how you can test the realtime abilities of GraphQL subscriptions live in a Playground.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens on the backend. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. That is, the _Request-Response-Cycle_ that we used for all previous interactions with the API is not used for subscriptions. Instead, the client initially opens up a steady connection to the server by specifying which event it is interested in. Every time this particular event happens, the server uses the connection to push the data that's related to the event to the client.

### Using Subscriptions in a Playground

You'll now write and send a subscription in a Playground. Then, in a different _tab_ in the same Playground, you can send a mutation and observe what's happening to the subscription in the initial tab.

<Instruction>

In a terminal, navigate to the directory where `project.graphcool` is located and perform the following command:

```bash
graphcool playground
```

</Instruction>

<Instruction>

In the Playground that opens up, paste the following code into the _editor_, then click the **Play**-button:

```graphql
subscription {
  Link {
    mutation # contains CREATED, UPDATED or DELETED
    node {
      id
      description
      url
    }
  }
}
```

</Instruction>

This time, instead of directly seeing the results of the operation on the right, the **Play**-button turns into a stop button and a _loading indicator_ appears in the right pane. 

The subscription is now _active_, meaning that every time a mutation is performed on the `Link` type, the server will push the data that you specified in the subscription payload to you.

Notice that in the payload, the `mutation` field represents the _kind_ of mutation that's happening, so that's either of three values: `CREATED`, `UPDATE` or `DELETED`.

The `node` will hold the information about the `Link` that was created or modified. If the `DELETED` operation occurs, you'd have to include the `previousValues` in the payload to retrieve information about the deleted node. This could look as follows:

```graphql(nocopy)
subscription {
  Link {
    mutation # contains CREATED, UPDATED or DELETED
    previousValues {
      id
      description
      url
    }
  }
}
```

<Instruction>

Now, go ahead and test if the subscription works by opening a second tab in the same Playground and paste the following mutation into it:

```graphql
mutation {
  createLink(
    description: "Flexible GraphQL client",
    url: "http://dev.apollodata.com/") {
    id
  }
}
```

</Instruction>

Now switch back to the previous tab where the subscription is still running.

You should see the following data in the right pane: 

```js(nocopy)
{
  "data": {
    "Link": {
      "mutation": "CREATED",
      "node": {
        "id": "cj4nbwmxwc2bp0194tgnf8krl",
        "description": "Flexible GraphQL client",
        "url": "http://dev.apollodata.com/"
      }
    }
  }
}
```

Exactly as with a query, the structure of the data that's received on the client matches the structure of the payload that you defined in the subscription.

Another tip: Often times you'll only be interested in specific mutations, e.g. when new items are being _created_. However, this current subscription actually also fires for _updated_ and _deleted_ mutations. To prevent that, you can include a filter in the subscription to make sure you only receive data when new links are _created_:

```graphql
subscription {
  Link(filter: {
    mutation_in: [CREATED]
  }) {
    mutation # contains CREATED, UPDATED or DELETED
    node {
      id
      description
      url
    }
  }
}
```


 
