---
title: Realtime Updates with GraphQL Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, React & urql Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with urql & React. The websockets transport will be handled by subscriptions-transport-ws."
question: "What transport is typically used to implement GraphQL subscriptions?"
answers: ["WebSockets", "TCP", "UDP", "HTTP 2"]
correctAnswer: 0
videoId: ""
duration: 0		
videoAuthor: ""
---

The last topic that we’ll cover in this tutorial are GraphQL subscriptions. This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature allowing the server to send data to its clients when a specific _event_ happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. This means when working with subscriptions, you're breaking the _Request-Response-Cycle_ that was used for all previous interactions with the API. The client now initiates a steady connection with the server by specifying which event it is interested in. Every time this particular event then happens, the server uses the connection to push the expected data to the client.

### Subscriptions with urql

When using urql, you need to add another exchange to your Client to tell it how to handle GraphQL subscriptions. This is done by using the `subscriptionExchange` that `urql` exports. We'll be using it together with the `subscriptions-transport-ws` package, which exposes a `SubscriptionClient` that establishes the WebSocket connection.

Go and add this dependency to your app first.

<Instruction>

Open a terminal and navigate to the project's root directory. Then execute the following command:

```bash(path=".../hackernews-react-urql")
yarn add subscriptions-transport-ws
```

</Instruction>

Next, we'll add the `subscriptionExchange` to your `urql` Client.

<Instruction>

Open `index.js` and add the following import statements to the file, then modify the Client to include the `subscriptionExchange`:

```js{1-2,6-14,28-30}(path=".../hackernews-react-urql/src/index.js")
import { Provider, Client, dedupExchange, fetchExchange, subscriptionExchange } from 'urql'
import { SubscriptionClient } from 'subscription-transport-ws'

// ...

const subscriptionClient = new SubscriptionClient(
  "ws://localhost:4000",
  {
    reconnect: true,
    connectionParams: {
      authToken: getToken()
    }
  }
);

const client = new Client({
  url: 'http://localhost:4000',
  fetchOptions: () => {
    const token = getToken()
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' }
    }
  },
  exchanges: [
    dedupExchange,
    suspenseExchange,
    cache,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: operation => subscriptionClient.request(operation)
    })
  ],
  suspense: true
})
```

</Instruction>

You're instantiating a `SubscriptionClient` that knows the subscriptions endpoint. The subscriptions endpoint in this case is similar to the HTTP endpoint, except that it uses the `ws` instead of `http` protocol. Notice that you're also authenticating the websocket connection with the user's token from LocalStorage.

Lastly you're adding the `subscriptionExchange` and are passing it a `forwardSubscription` handler that passes the subscription operation on to your `SubscriptionClient`.

### Subscribing to new votes

For the app to update in realtime when new votes are added to links, you need to subscribe to events that are happening on the `Link` type. This means that you'll be writing a subscription definition, which is very similar to a query.

<Instruction>

Open `LinkList.js` and add the following GraphQL definition at the top. Also import `useSubscription` from `urql`:

```js(path=".../hackernews-react-urql/src/components/LinkList.js")
import gql from 'graphql-tag'
import { useQuery, useSubscription } from 'urql'

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      link {
        id
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

This looks very similar to the `VoteMutation` definition that you've written earlier. But instead of sending a mutation or query we're subscribing to any new votes and are asking for the new `votes` field on the affected link.

Now the only thing you'll need to do is add the subscription to the `LinkList` component.

<Instruction>

Still in `LinkList.js` add the `useSubscription` hook after the existing `useQuery` hook:

```js(path=".../hackernews-react-urql/src/components/LinkList.js")
useSubscription({ query: NEW_VOTES_SUBSCRIPTION })
```

</Instruction>

This is all that you need to add to subscribe to new votes! You also don't have to write a new updater function for Graphcache, like we had to for the `post` mutation, because the normalized cache can simply update the link that the subscription definition asks for.

### Subscribing to new links

Next we'll add a subscription that automatically displays new links in the `LinkList` as they're posted by other users!

We'll again write a new subscription definition and add another `useSubscription` hook.

<Instruction>

In `LinkList.js` add the following GraphQL definition at the top:

```js(path=".../hackernews-react-urql/src/components/LinkList.js")
const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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
`
```

</Instruction>

Then we just add another `useSubscription` hook.

<Instruction>

In `LinkList.js` next to the other `useSubscription` hook, add the new hook with the subscription for new links:

```js{2}(path=".../hackernews-react-urql/src/components/LinkList.js")
useSubscription({ query: NEW_VOTES_SUBSCRIPTION })
useSubscription({ query: NEW_LINKS_SUBSCRIPTION })
```

</Instruction>

Unfortunately, like with the `post` mutation, new links won't automatically be added to the currently displayed `LinkList`. But we can easily fix this by writing another updater function.

<Instruction>

Open in `index.js` and update the `cacheExchange`'s config with the following:

```js{2,5-20}(path=".../hackernews-react-urql/src/index.js")
import { cacheExchange } from '@urql/exchange-graphcache'
import { FEED_QUERY } from './components/LinkList'

const cache = cacheExchange({
  updates: {
    Mutation: {
      post: ({ post }, _args, cache) => {
        // ...
      }
    },
    Subscription: {
      newLink: ({ newLink }, _args, cache) => {
        const variables = { first: 10, skip: 0, orderBy: 'createdAt_DESC' }
        cache.updateQuery({ query: FEED_QUERY, variables }, data => {
          if (data !== null) {
            data.feed.links.unshift(newLink)
            data.feed.count++
            return data
          } else {
            return null
          }
        })
      }
    }
  }
})
```

</Instruction>

And that's it! Your app is now ready for realtime and will immediately update links and votes whenevert they're created by other users.
