---
title: Realtime Updates with GraphQL Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, React & Apollo Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with Apollo Client & React. The websockets will be handled by subscriptions-transport-ws."
videoId: R-VLZ--sTzI
duration: 6
videoAuthor: "Abhi Ayer"
question: "What transport does Apollo use to implement subscriptions?"
answers: ["WebSockets", "TCP", "UDP", "HTTP 2"]
correctAnswer: 0
---

This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. This means we're not using the _Request-Response-Cycle_ that we used for all previous interactions with the API when implementing subscriptions. Instead, the client initially opens up a steady connection to the server by specifying which event it is interested in. Every time this particular event happens, the server uses the connection to push the data that's related to the event to the client.

### Subscriptions with Apollo 

When using Apollo, you need to configure your `ApolloClient` with information about the subscriptions endpoint. This is done by adding another `ApolloLink` to the Apollo middleware chain. This time, it's the `WebSocketLink` from the [`apollo-link-ws`](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-ws) package.

Go and add this dependency to your app first. 

<Instruction>

Open a terminal and navigate to the project's root directory. Then execute the following command:

```bash(path=".../hackernews-react-apollo")
yarn add apollo-link-ws
```

</Instruction>

Next, make sure your `ApolloClient` instance knows about the subscription server.

<Instruction>

Open `index.js` and add the following import to the top of the file:

```js(path=".../hackernews-react-apollo/src/index.js")
import { ApolloLink, split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

</Instruction>

Notice that you're now also importing the `split` function from 'apollo-client-preset'. 

<Instruction>

Now create a new link that represents the WebSocket connection, use `split` for proper "routing" of the requests and update the constructor call of `ApolloClient`:

```js(path=".../hackernews-react-apollo/src/index.js")
const wsLink = new WebSocketLink({
  uri: `__SUBSCRIPTION_API_ENDPOINT__`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(GC_AUTH_TOKEN),
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLinkWithAuthToken,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})
```

</Instruction>

You're instantiating a `WebSocketLink` that knows the endpoint for the Subscriptions API. Notice that you're also authenticating the websocket connection with the user's `token` that you retrieve from `localStorage`.

[`split`](https://github.com/apollographql/apollo-link/blob/98eeb1deb0363384f291822b6c18cdc2c97e5bdb/packages/apollo-link/src/link.ts#L33) is used to "route" a request to a specific middleware link. It takes three arguments, the first one is a `test` function returning a boolean, the remaining two are again of type `ApolloLink`. If that boolean is true, the request will be forwarded to the link passed as the second argument. If false, to the third one.

In your case, the `test` function is checking whether the requested operation is a _subscription_. If this is the case, it will be forwarded to the `wsLink`, otherwise (if it's a _query_ or _mutation_), the `httpLinkWithAuthToken` will take care of it:

![](https://cdn-images-1.medium.com/max/720/1*KwnMO21k0d3UbyKWnlbeJg.png)
*Picture taken from [Apollo Link: The modular GraphQL network stack](https://dev-blog.apollodata.com/apollo-link-the-modular-graphql-network-stack-3b6d5fcf9244) by [Evans Hauser](https://twitter.com/EvansHauser)*

Now you need to replace the placeholder `__SUBSCRIPTION_API_ENDPOINT__ ` with the endpoint for the Subscriptions API.

<Instruction>

To get access to this endpoint, open up a terminal and navigate to the `server` directory. Then type the `graphcool info` command and copy the endpoint for the `Subscriptions API` and replace the placeholder with it. 

</Instruction>
 
> The endpoints for the Subscriptions API generally are of the form: `wss://subscriptions.graph.cool/v1/__SERVICE_ID__`. 
>
> Notice that if you service isn't running in the "default" Graphcool [region](https://blog.graph.cool/new-regions-and-improved-performance-7bbc0a35c880) (_EU West_), you need to add your service's region to the endpoint like so: `wss://subscriptions.ap-northeast-1.graph.cool/v1/__SERVICE_ID__` (for region _Asia Pacific_) or `wss://subscriptions.us-west-2.graph.cool/v1/__SERVICE_ID__` (for _US West_).

### Subscribing to new Links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

You'll implement the subscription in the `LinkList` component since that's where all the links are rendered.

<Instruction>

Open `LinkList.js` and add the following method inside the scope of the `LinkList` class:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
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

</Instruction>

Let's understand what's going on here! You're using the `allLinksQuery` that you have access to inside the component's props (because you wrapped it with the `graphql` container) to call [`subscribeToMore`](https://www.apollographql.com/docs/react/features/subscriptions.html#subscribe-to-more). This call opens up a websocket connection to the subscription server.

You're passing two arguments to `subscribeToMore`:

1. `document`: This represents the subscription itself. In your case, the subscription will fire for `CREATED` events on the `Link` type, i.e. every time a new link is created.
2. `updateQuery`: Similar to `update`, this function allows you to determine how the store should be updated with the information that was sent by the server after the event occurred.

Go ahead and implement `updateQuery` next. This function works slightly differently than `update`. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.js.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated data. 

Let's see what this looks like in action!

<Instruction>

Still in `LinkList.js` implement `updateQuery` like so:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
updateQuery: (previous, { subscriptionData }) => {
  const newAllLinks = [
    subscriptionData.Link.node,
    ...previous.allLinks
  ]
  const result = {
    ...previous,
    allLinks: newAllLinks
  }
  return result
}
```

</Instruction>

All you do here is retrieve the new link from the `subscriptionData`, merge it into the existing list of links and return the result of this operation.

The last thing here is to make sure that the component actually subscribes to the events by calling `subscribeToMore`. 

<Instruction>

Add the `componentDidMount` method to the `LinkList` component and implement it like so:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
componentDidMount() {
  this._subscribeToNewLinks()
}
```

</Instruction>

> **Note**: `componentDidMount` is a so-called [_lifecycle_ method](https://facebook.github.io/react/docs/react-component.html#the-component-lifecycle) of React components that will be called once right after the component was initialized.

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application running on `http://localhost:3000/`. The second window you use to open a Playground and send a `createLink` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

### Subscribing to new Votes

Next you'll subscribe to new votes that are emitted by other users as well so that the latest vote count is always visible in the app.

<Instruction>

Open `LinkList.js` and add the following method to the `LinkList` component:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
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
      const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.Vote.node.link.id)
      const link = subscriptionData.Vote.node.link
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

</Instruction>

Similar as before, you're calling `subscribeToMore` on the `allLinksQuery`. This time you're passing in a subscription that asks for newly created votes. In `updateQuery`, you're then adding the information about the new vote to the cache by first looking for the `Link` that was just voted on and and then updating its `votes` with the `Vote` element that was sent from the server.

<Instruction>

Finally, go ahead and call `_subscribeToNewVotes` inside `componentDidMount` as well:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
componentDidMount() {
  this._subscribeToNewLinks()
  this._subscribeToNewVotes()
}
```

</Instruction>

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.

