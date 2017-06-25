---
title: Subscriptions
---

This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens on the backend. Subscriptions are usually implemented with WebSockets, where the server holds a steady connection to the client. That is, the _Request-Response-Cycle_ that we used for all previous interactions with the API is not used for subscriptions. Instead, the client initially opens up a steady connection to the server by specifying which events it is interested in. Once this event happens, the server uses the connection to push the data that's related to the event to the client.

### Subscriptions with Apollo 

When using Apollo, you need to configure your `ApolloClient` with information about the subscriptions endpoint. This is done by using functionality from the `subscriptions-transport-ws` npm module.

Go and add this dependency to your app first. Open a Terminal and navigate to the project's root directory. Then execute the following command:

```sh
yarn add subscriptions-transport-ws
```

Next, make sure your `ApolloClient` instance knows about the subscription server.

Open `index.js` and add the following import to the top of the file:

```
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

Now update the configuration code like so:

```js
const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/<project-id>'
})

const wsClient = new SubscriptionClient('__SUBSCRIPTION_API_ENDPOINT__', {
  reconnect: true,
  connectionParams: {
     authToken: localStorage.getItem(GC_AUTH_TOKEN),
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    const token = localStorage.getItem(GC_AUTH_TOKEN)
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})
```

You're instantiating a `SubscriptionClient` that knows the endpoint for the Subscriptions API. Notice that you're also authenticating the websocket connection with the user's token that you retrieve from `localStorage`.

Now you need to replace the placeholder `__SUBSCRIPTION_API_ENDPOINT__ ` with the endpoint for the subscriptions API.

To get access to this endpoint, open up a Terminal and navigate to the directory where `project.graphcool` is located. Then type the `graphcool endpoints` command. Now copy the endpoint for the `Subscriptions API` and replace the placeholder with it. 

> Note: The endpoints for the Subscription API generally are of the form: `wss://subscriptions.graph.cool/v1/<project-id>`


### Subscribing to new Links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

You'll implement the subscription in the `LinkList` component since that's where all the links are rendered.

Open `LinkList.js` and add the following method inside the scope of the `LinkList` component:

```js
_subscribeToNewLinks = () => {
  this.props.allLinksQuery.subscribeToMore({
    document: gql`
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
    `,
    updateQuery: (previous, { subscriptionData }) => {
      // ... you'll implement this in a bit
    }
  })
}
```

Let's understand what's going on here! You're using the `allLinksQuery` that you have access to inside the component's props (because you wrapped it with the `graphql` container) to call [`subscribeToMore`](http://dev.apollodata.com/react/subscriptions.html#subscribe-to-more). This call opens up a websocket connection to the subscription server.

You're passing two arguments to `subscribeToMore`:

1. `document`: This represents the subscription itself. In your case, the subscription will fire for `CREATED` events on the `Link` type, i.e. every time a new link is created.
2. `updateQuery`: Similar to `update`, this function allows you to determine how the store should be updated with the information that was sent by the server.

Go ahead and implement `updateQuery` next. This function works slightly differently than `update`. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.js.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated version. Let's see what this looks like in action!

Still in `LinkList.js` implement `updateQuery` like so:

```js
updateQuery: (previous, { subscriptionData }) => {
  const newAllLinks = [
    subscriptionData.data.Link.node,
    ...previous.allLinks
  ]
  const result = {
    ...previous,
    allLinks: newAllLinks
  }
  return result
}
```

All you do here is retrieve the new link from the subscription data (` subscriptionData.data.Link.node`), merge it into the existing list of links and return the result of this operation.

The last thing here is to make sure that the component actually subscribes to the events by calling `subscribeToMore`. 

In `LinkList.js`, add a new method inside the scope of the `LinkList` component and implement it like so:

```js
componentDidMount() {
  this._subscribeToNewLinks()
}
```
> **Note**: `componentDidMount` is a so-called [_lifecycle_ method](https://facebook.github.io/react/docs/react-component.html#the-component-lifecycle) of React components that will be called once right after the component was initialized.

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application runnning on `http://localhost:3000/`. The second window you use to open a Playground and send a `createLink` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

### Susbcribing to new Votes

Next you'll subscribe to new votes that are emitted by other users as well so that the latest vote count is always visible in the app.

Open `LinkList.js` and add the following method to the `LinkList` component:

```js
_subscribeToNewVotes = () => {
  this.props.allLinksQuery.subscribeToMore({
    document: gql`
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
    `,
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
  })
}
```

Similar as before, you're calling `subscribeToMore` on the `allLinksQuery`. This time you're passing in a subscription that asks for newly created votes. In `updateQuery`, you're then adding the information about the new vote to the cache by first looking for the `Link` that was just voted and and then updating its `votes` with the `Vote` element that was sent from the server.

Finally, go ahead and call `_subscribeToNewVotes` inside `componentDidMount` as well:

```js
componentDidMount() {
  this._subscribeToNewLinks()
  this. _subscribeToNewVotes()
}
```

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.

