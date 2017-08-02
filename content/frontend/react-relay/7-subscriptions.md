---
title: Realtime Updates with Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, React & Relay Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with Relay Modern & React. The websockets will be handled by subscriptions-transport-ws."
question: "What's the name of the function that Relay provides to initiate a subscription with the server?"
answers: ["subscribe", "createSubscription", "requestSubscription", "createRealtimeConnection"]
correctAnswer: 2
videoId: 2wkILJLcoDs
duration: 18 
---

The goal of this chapter is to add realtime functionality to the app using [GraphQL subscriptions](http://graphql.org/blog/subscriptions-in-graphql-and-relay/). In particular, you're going to make sure that when other users vote on a link, the link's vote count updates immediately in the app for all other users without the need to refresh the page.

### What are GraphQL Subscriptions?

GraphQL subscriptions allow you to add event-based realtime functionality to your app. A client can _subscribe_ to specific events that are happening on the server-side. Then, whenenever that event actually happens, the server will send the corresponding data over to the client.

Events usually refer to mutations, so typically we're talking about events where data was created, updated or deleted.

Subscriptions are somewhat different from queries and mutations, since they don't follow a _request-response-cycle_ but instead represent a _stream_ of data. The most common way to implement subscriptions is by using WebSockets, where the server maintains a steady connection to the subscribed clients that it uses to send over the data upon each event.

To get a feeling for how subscriptions work, you can also directly try them out in a [Playground](https://www.graph.cool/blog/2017-02-28-introducing-graphql-subscriptions-in4ohtae4e/#subscriptions-workflow-using-the-playground)!


### Subscriptions with Relay Modern

#### Subscription API

Subscription support was only added to Relay with the release of Relay Modern. Client can now use the [`requestSubscription`](https://facebook.github.io/relay/docs/subscriptions.html) function to initiate a subscription.

`requestSubscription` works very similar to the `commitMutation` function as it also allows you to implement an `updater` functions to specify how you want the cache to update based on the new data that was received from the server.

However, in order to get `requestSubscription` to work, you also need to configure your Relay `Environment` accordingly and provide the URL for your subscription endpoint. If subscriptions are implemented with WebSockets, the subscriptions URL will contain the `wss` protocol instead of `http`.

#### Using Subscriptions with Graphcool and Relay Modern

Graphcool generally exposes two different GraphQL APIs whose type definitions slitghly vary:

- Simple API: Intuitive API to provide CRUD-style capabilities for all model types
- Relay API: Adheres to the requirements that Relay has for a GraphQL schema

Currently, subscriptions are only supported for the Simple API. However, you can still use subscriptions with the Relay API by making some manual adjustments to the `schema.graphql` which you feed into the `relay-compiler`. 

Notice that we already did these manual adjustments for you and you already have them in your project as you imported the project from [this URL](https://graphqlbin.com/hn-relay-full.graphql) in chapter 3. If you're interested in what these changes actually look like, take a look at the `Subscription` type in `schema.grahpql`. 

### Configuring the Relay Environment

The first thing you need to do to get subscriptions to work is add websocket support to your project.

<Instruction>

In a terminal, navigate to the root directory of your project and execute the following command

```bash(path=".../hackernews-react-relay")
yarn add subscriptions-transport-ws
```

</Instruction>

This package contains the `SubscriptionClient` that you need to setup subscriptions on the frontend. The `SubscriptionClient` is a good fit in this case as it implements the same [protocol](https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md) as the subscriptions API from Graphcool.

Next you'll have to configure your Relay `Environment` and tell it about the additional endpoint that you want to use for subscriptions. The way how this works is actually by adding a second function to the creation of the `Network`. This function knows about the subscription endpoint and is able to initiate and maintain a connection to it.

<Instruction>

Open `Environment.js` and replace the current created of `network` with the following code:

```js(path=".../hackernews-reat-relay/src/Environment.js")
//1
const fetchQuery = (operation, variables) => {
  return fetch('https://api.graph.cool/relay/v1/__PROJECT_ID__', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem(GC_AUTH_TOKEN)}`
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json()
  })
}

// 2
const setupSubscription = (config, variables, cacheConfig, observer) => {
  const query = config.text

  const subscriptionClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/__PROJECT_ID__', {reconnect: true})
  subscriptionClient.subscribe({query, variables}, (error, result) => {
    observer.onNext({data: result})
  })
}

// 3
const network = Network.create(fetchQuery, setupSubscription)
```

</Instruction>

Let's quickly understand what's going on there:

1. Instead of passing a closure directly into `Network.create()`, you just pull out the code of that closure and store it in a variable called `fetchQuery`. Note that you'll have to replace `__PROJECT_ID__` again with your actual project ID.  
2. Here you define the second function called `setupSubscription` that the `Network` needs in order to be able to talk to the subscriptions endpoint. You're using the `SubscriptionClient` in that function to initiate and maintain a connection to the given endpoint. The `config` that's passed into the function carrys the subscription query which determines what event the client wants to subscribe to and what data it wants to receive. Note that again you need to replace the placeholder for `__PROJECT_ID__` with the actual ID of your Graphcool project.
3. Finally, we take `fetchQuery` (which is the same code as before but stored in a variable) and `setupSubscription` and use them to create the `Network`, which then will be used to instantiate the Relay `Environment`.

> If you're not sure what your Graphcool project ID is that you need to replace the `__PROJECT_ID__`, you can open `project.graphcool` and check its frontmatter or execute `graphcool endpoints` in a terminal to see the endpoints for the Relay API and Subscriptions API.

<Instruction>

For this code to work, you of course also need to import the `SubscriptionClient`. Add the following statement to the top of the file:

```js(path=".../hackernews-reat-relay/src/Environment.js")
import { SubscriptionClient } from 'subscriptions-transport-ws'
```

</Instruction>

Awesome, your app is now capable of using subscriptions! ⚡️


### Creating the Subscription

Similar to what you did with the mutations before, you'll implement each subscription in a dedicated file to provide a more convenient wrapper around the `requestSubscription` function that's provided by Relay.

<Instruction>

First, create a new directory inside `src` and call it `subscriptions`. Then create a new file, called `NewVoteSubscription.js`, inside that directory and add the following code to it:

```js(path=".../hackernews-reat-relay/src/subscriptions/NewVoteSubscription.js")
import {
  graphql,
  requestSubscription
} from 'react-relay'
import environment from '../Environment'

const newVoteSubscription = graphql`
  subscription NewVoteSubscription {
    # 1
    Vote {
      # 2
      node {
        id
        user {
          id
        }    
        link {
          id
          _votesMeta {
            count
          }
        }    
      }
    }
  }
`

// 3
export default () => {

  const subscriptionConfig = {
    subscription: newVoteSubscription,
    variables: {},
    updater: proxyStore => {
      const createVoteField = proxyStore.getRootField('Vote')
      const newVote = createVoteField.getLinkedRecord('node')
      const updatedLink = newVote.getLinkedRecord('link')
      const linkId = updatedLink.getValue('id')
      const newVotes = updatedLink.getLinkedRecord('_votesMeta')
      const newVoteCount = newVotes.getValue('count')

      const link = proxyStore.get(linkId)
      link.getLinkedRecord('votes').setValue(newVoteCount, 'count')
    },
    onError: error => console.log(`An error occured:`, error)
  }

  requestSubscription(
    environment,
    subscriptionConfig
  )

}
```

</Instruction>

Let's take a closer look at the subscription query that you're storing in `newVoteSubscription` first:

1. The root field of the subscription and the belonging filter express the event that you're interested in. Here, you specify that you are interested all events that are happening on the `Vote` type.
2. In the payload of the subscription query, you're then including information about the new `Vote` that was created, this information is represented by the `node` field. Every time a vote is submitted by another user, the server will send information about that new vote, including the `id` of the `user` who created it and the total number of votes on the corresponding link (`link._votesMeta`).
3. Finally, this part is similar to what you already did for the mutations: You're exporting a function that can be called from anywhere in the application and which actually submits the subscription to the server by wrapping the `requestSubscription` function. Notice that you're using the `updater` to increase the number of votes for the link that was voted on. 

### Initiating the Subscription

Now that you have all required infrastructure setup, you can go ahead and actually iniate a subscription! For our project, it's not too important where exactly the subscription is invoked as there are no context-dependent arguments that the subscription needs. However, it is important that the subscription only gets invoked once, so you don't want to put it into the `Link` component where it would be invoked as many times as `Link` elements are rendered. You'll therefore put it into the `LinkList` component.

<Instruction>

Open `LinkList.js` and add an implementation of `componentDidMount` as follows:

```js(path=".../hackernews-reat-relay/src/components/LinkList.js")
componentDidMount() {
  NewVoteSubscription()
}
```

</Instruction>

Then of course you also need to add the corresponding import.

<Instruction>

Still in `LinkList.js`, add the required import statement to the top:

```js(path=".../hackernews-reat-relay/src/components/LinkList.js")
import NewVoteSubscription from '../subscriptions/NewVoteSubscription'
```

</Instruction>

Before you're running the app, you'll need to invoke the Relay Compiler again so it can compile the `graphql`-tagged code inside `NewVoteSubscription.js`.

<Instruction>

In a terminal, navigate to the root directory of the project and run the Relay Compiler:

```bash(path=".../hackernews-reat-relay")
relay-compiler --src ./src --schema schema.graphql
```

</Instruction>

All right, you can now run the app with `yarn start` to test your subscription. The best way to test subscriptions is to use two different windows (or simply tabs) that are both running the app. If you then submit a vote in one window, the app should automatically update in the second window as well. 🎉

![](http://imgur.com/Rp4lYBS.gif)



