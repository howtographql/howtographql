---
title: Realtime Updates with GraphQL Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, VueJS & Apollo Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with Apollo Client & VueJS. The websockets will be handled by subscriptions-transport-ws."
question: "What transport does Apollo use to implement subscriptions?"
answers: ["WebSockets", "TCP", "UDP", "HTTP 2"]
correctAnswer: 0
---

This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens on the backend. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. That is, the _Request-Response-Cycle_ that we used for all previous interactions with the API is not used for subscriptions. Instead, the client initially opens up a steady connection to the server by specifying which event it is interested in. Every time this particular event happens, the server uses the connection to push the data that's related to the event to the client.

### Subscriptions with Apollo

When using Apollo, you need to configure your `ApolloClient` with information about the subscriptions endpoint. This is done by using functionality from the `subscriptions-transport-ws` npm module.

Go ahead and add this dependency to your app first.

<Instruction>

Open a terminal and navigate to the project's root directory. Then execute the following command:

```bash
npm install --save subscriptions-transport-ws
```

</Instruction>


Next, make sure your `ApolloClient` instance knows about the subscription server.

<Instruction>

Open `src/main.js` and add the following import near the top of the file:

```js(path=".../hackernews-vue-apollo/src/main.js")
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

</Instruction>

<Instruction>

Now update the configuration code like so:

```js(path=".../hackernews-vue-apollo/src/main.js")
const networkInterface = createBatchingNetworkInterface({
  uri: '__SIMPLE_API_ENDPOINT__'
})

const wsClient = new SubscriptionClient('__SUBSCRIPTION_API_ENDPOINT__', {
  reconnect: true,
  connectionParams: {
    authToken: localStorage.getItem(GC_AUTH_TOKEN)
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterface.use([{
  applyBatchMiddleware (req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    const token = localStorage.getItem(GC_AUTH_TOKEN)
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])

const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true
})
```

</Instruction>


You're instantiating a `SubscriptionClient` that knows the endpoint for the Subscriptions API. Notice that you're also authenticating the websocket connection with the user's `token` that you retrieve from `localStorage`.

Now you need to replace the placeholder `__SUBSCRIPTION_API_ENDPOINT__ ` with the endpoint for the subscriptions API.

<Instruction>

To get access to this endpoint, open up a terminal and navigate to the directory where `project.graphcool` is located. Then type the `graphcool endpoints` command. Now copy the endpoint for the `Subscriptions API` and replace the placeholder with it.

</Instruction>


> The endpoints for the Subscription API generally are of the form: `wss://subscriptions.graph.cool/v1/<project-id>`.
>
> Notice that if your project is not running in the "default" Graphcool [region](https://blog.graph.cool/new-regions-and-improved-performance-7bbc0a35c880), you need to add the your project's region to the endpoint like so: `wss://subscriptions.ap-northeast-1.graph.cool/v1/<project-id>` (for regoin _Asia Pacific_) or `wss://subscriptions.us-west-2.graph.cool/v1/<project-id>` (for _US West_).


### Subscribing to new Links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

First, you need to add a subscription to `src/constants/graphql.js`:

<Instruction>

Open `src/constants/graphql.js` and add the following subscription:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    Link(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`
```

</Instruction>

You'll implement this subscription in the `LinkList` component since that's where all the links are rendered.

<Instruction>

Open `src/components/LinkList.vue` and add the following property to the `allLinks` object within the `apollo` object:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
subscribeToMore: [
  {
    document: NEW_LINKS_SUBSCRIPTION,
    updateQuery: (previous, { subscriptionData }) => {
      // ... you'll implement this in a bit
    }
  }
]
```

</Instruction>

<Instruction>

Still in `src/components/LinkList.vue` you now need to import `NEW_LINKS_SUBSCRIPTION`:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
import { ALL_LINKS_QUERY, NEW_LINKS_SUBSCRIPTION } from '../constants/graphql'
```

</Instruction>


Let's understand what's going on here! You're using the `allLinks` query that you have access to to call [`subscribeToMore`](https://github.com/Akryum/vue-apollo#subscribetomore). This call opens up a websocket connection to the subscription server.

You're passing an array to `subscribeToMore`:

1. Each object within the array contains a `document` property: This represents the subscription itself. In your case, the subscription will fire for `CREATED` events on the `Link` type, i.e. every time a new link is created.
2. The other property is `updateQuery`: Similar to `update`, this function allows you to determine how the store should be updated with the information that was sent by the server.

Go ahead and implement `updateQuery` next. This function works slightly differently than `update`. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.js.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated version.

Let's see what this looks like in action!

<Instruction>

Still in `src/components/LinkList.vue` implement `updateQuery` like so:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
updateQuery: (previous, { subscriptionData }) => {
  const newAllLinks = [
    subscriptionData.data.Link.node,
    ...previous.allLinks
  ]
  const result = {
    ...previous,
    allLinks: newAllLinks.slice(0, 5)
  }
  return result
}
```

</Instruction>


All you do here is retrieve the new link from the subscription data (` subscriptionData.data.Link.node`), merge it into the existing list of links and return the result of this operation.

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application running on `http://localhost:8080/`. The second window you use to open a Playground and send a `createLink` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

### Subscribing to new Votes

Next you'll subscribe to new votes that are emitted by other users as well so that the latest vote count is always visible in the app.

First, you need to add another subscription to `src/constants/graphql.js`:

<Instruction>

Open `src/constants/graphql.js` and add the following subscription:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    Vote(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`
```

</Instruction>

You'll also implement this subscription in the `LinkList` component since that's where all the links are rendered.

<Instruction>

Open `src/components/LinkList.vue` and add the following object to the `sunscribeToMore` array:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
{
  document: NEW_VOTES_SUBSCRIPTION,
  updateQuery: (previous, { subscriptionData }) => {
    const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
    const link = subscriptionData.data.Vote.node.link
    const newAllLinks = previous.allLinks.slice()
    newAllLinks[votedLinkIndex] = link
    const result = {
      ...previous,
      allLinks: newAllLinks
    }
    return result
  }
}
```

</Instruction>

<Instruction>

Still in `src/components/LinkList.vue` you now need to update the import to add `NEW_VOTES_SUBSCRIPTION`:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
import { ALL_LINKS_QUERY, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION } from '../constants/graphql'
```

</Instruction>

Similar to before, you're calling `subscribeToMore` on the `allLinks` query. This time you're passing in a subscription that asks for newly created votes. In `updateQuery`, you're then adding the information about the new vote to the cache by first looking for the `Link` that was just voted on and and then updating its `votes` with the `Vote` element that was sent from the server.

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.
