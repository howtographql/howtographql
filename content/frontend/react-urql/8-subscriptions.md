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

The last topic that we’ll cover in this tutorial are GraphQL subscriptions. This section is all about bringing realtime functionality to your app using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature allowing the server to send data to its clients when a specific _event_ happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. When working with subscriptions, you're breaking the _Request-Response-Cycle_ that was used for all previous interactions with the API.

With subscriptions, the client initiates a steady connection with the server by specifying which event it is interested in. Every time this particular event occurs, the server uses the connection to push the expected data to the client.

This method is really interesting to keep your app up-to-date without refreshing it! We'll be using subscriptions to display new links and upvotes that other users are making (or that you're making in another tab or window) while the app is running.

### Subscriptions with urql

When using urql, you need to add another exchange to your Client to tell it how to handle GraphQL subscriptions. This is done by using the `subscriptionExchange` that `urql` exports. We'll be using it together with the `subscriptions-transport-ws` package, which exposes a `SubscriptionClient` that establishes the WebSocket connection.

Go and add this dependency to your app first.

<Instruction>

Open a terminal and navigate to your project's root directory. Then execute the following command:

```bash(path=".../hackernews-react-urql")
yarn add subscriptions-transport-ws
```

</Instruction>

Next, we'll add the `subscriptionExchange` to your urql Client, which is part of the `urql` package itself.

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

You're instantiating a `SubscriptionClient` that knows where to find the subscriptions endpoint. The subscriptions endpoint in this case is similar to the HTTP endpoint, except that it uses the `ws` instead of the `http` protocol. Notice that you're also authenticating the websocket connection with the user's token.

Lastly you're adding the `subscriptionExchange` to the Client's config and are passing it a `forwardSubscription` handler that passes the subscription operation on to your `SubscriptionClient`.

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

This looks very similar to the `VoteMutation` definition that you've written earlier. But instead of sending a mutation or query we're subscribing to any new votes and are asking for the updated `votes` field on the event's link.

Now the only thing you'll need to do is add the subscription to the `LinkList` component.

<Instruction>

Still in `LinkList.js` add the `useSubscription` hook after the existing `useQuery` hook:

```js(path=".../hackernews-react-urql/src/components/LinkList.js")
useSubscription({ query: NEW_VOTES_SUBSCRIPTION })
```

</Instruction>

This is all that you need to add to subscribe to new votes! You also don't have to write a new updater function for Graphcache, like we had to for the `post` mutation, because the normalized cache can simply update the link that the subscription definition asks for.

The `useSubscription` hook is actually very similar to `useQuery` and `useMutation`. If you'd be using a non-normalized document cache, you could look at each event's result and manually reconcile it with a query's result. In this case however, the normalized cache can take care of all updates for us! So you only have to add the hook and don't have to worry about anything else! 😍

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

Unfortunately in this case, like with the `post` mutation, new links won't automatically be added to the currently displayed `LinkList`. But we can easily fix this by writing another updater function.

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

This function is essentially identical to our `updates.Mutation.post` updater function. The only difference is the naming of the data (in this case `newLink`) that we're adding to the `FEED_QUERY`.

**And that's it!** Your app is now ready for realtime and will immediately update links and votes whenevert they're created by other users.

### What if subscriptions aren't an option?

In several cases, it may not be possible for you to add subscriptions to your app. Maybe your GraphQL API doesn't support them, or maybe you don't have the infrastructure in place to host WebSocket servers.

We'd like to demonstrate a couple of methods that you can use to work around _not_ having GraphQL subscriptions in this section.

> **Note**: We won't be changing any code in the tutorial's app here, since we do have subscriptions for this tutorial, but feel free to try these tips and tricks out, if you'd like!

#### Programmatic Refetches

When you have a query you may want to **programmatically refetch** its content to update the cache. Your user may have an update button for this, or a pull-to-refresh gesture, or any number of ways.

Admittedly this isn't the most elegant option, but in some cases it is just necessary to tell `useQuery` to run another network request. You can do this by using the `useQuery` hook's `executeQuery` function.

In the last section of this tutorial ("Pagination and Cache Updates") we've mentioned the `requestPolicy` option that `useQuery` accepts. When you pass `requestPolicy: 'cache-and-network'` to `useQuery`, you can force it to send a network request, while also displaying cached data first.

As it turns out, `executeQuery` also accepts the `requestPolicy` option programmatically! You can use this to trigger a programmatic refetch:

```js(nocopy)
const [result, executeQuery] = useQuery({
  query: FEED_QUERY,
  variables
})

const refetch = () => {
  // refetch from network:
  executeQuery({ requestPolicy: 'network-only' })
  // refetch from network but keep displaying cached data:
  executeQuery({ requestPolicy: 'cache-and-network' })
}
```

This will cause `useQuery` to send another network request, which will also update all data in your normalized cache.

#### Polling

Another option for keeping your app's data up-to-date is **polling**. With this method you're refetching queries regularly within an interval.

You can add polling to any `useQuery` hook by passing it the `pollInterval` option. By doing this, every `pollInterval` milliseconds `useQuery` will refetch your query.

```js(nocopy)
const [result, executeQuery] = useQuery({
  query: FEED_QUERY,
  variables,
  // refetch ever 5seconds:
  pollInterval: 5000,
  // necessary so it updates from network:
  requestPolicy: 'cache-and-network',
})
```

I hope you've enjoyed this last section of the tutorial, where you've learned how to add subscriptions to your app!
