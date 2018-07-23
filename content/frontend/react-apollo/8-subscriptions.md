---
title: Realtime Updates with GraphQL Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, React & Apollo Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with Apollo Client & React. The websockets will be handled by subscriptions-transport-ws."
question: "What transport does Apollo use to implement subscriptions?"
answers: ["WebSockets", "TCP", "UDP", "HTTP 2"]
correctAnswer: 0
videoId: ""
duration: 0		
videoAuthor: ""
---

This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature allowing the server to send data to its clients when a specific _event_ happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. This means when working with subscriptions, you're breaking the _Request-Response-Cycle_ that was used for all previous interactions with the API. The client now initiates a steady connection with the server by specifying which event it is interested in. Every time this particular event then happens, the server uses the connection to push the expected data to the client.

### Subscriptions with Apollo

When using Apollo, you need to configure your `ApolloClient` with information about the subscriptions endpoint. This is done by adding another `ApolloLink` to the Apollo middleware chain. This time, it's the `WebSocketLink` from the [`apollo-link-ws`](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-ws) package.

Go and add this dependency to your app first.

<Instruction>

Open a terminal and navigate to the project's root directory. Then execute the following command:

```bash(path=".../hackernews-react-apollo")
yarn add apollo-link-ws
```

> **Note**: For apollo-link-ws to work you also need to install subscriptions-transport-ws

```
yarn add subscriptions-transport-ws
```

</Instruction>

Next, make sure your `ApolloClient` instance knows about the subscription server.

<Instruction>

Open `index.js` and add the following import to the top of the file:

```js(path=".../hackernews-react-apollo/src/index.js")
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

</Instruction>

Notice that you're now also importing the `split` function from 'apollo-link'.

<Instruction>

Now create a new `WebSocketLink` that represents the WebSocket connection. Use `split` for proper "routing" of the requests and update the constructor call of `ApolloClient` like so:

```js(path=".../hackernews-react-apollo/src/index.js")
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})
```

</Instruction>

You're instantiating a `WebSocketLink` that knows the subscriptions endpoint. The subscriptions endpoint in this case is similar to the HTTP endpoint, except that it uses the `ws` instead of `http` protocol.  Notice that you're also authenticating the websocket connection with the user's `token` that you retrieve from `localStorage`.

[`split`](https://github.com/apollographql/apollo-link/blob/98eeb1deb0363384f291822b6c18cdc2c97e5bdb/packages/apollo-link/src/link.ts#L33) is used to "route" a request to a specific middleware link. It takes three arguments, the first one is a `test` function which returns a boolean. The remaining two arguments are again of type `ApolloLink`. If `test` returns `true`, the request will be forwarded to the link passed as the second argument. If `false`, to the third one.

In your case, the `test` function is checking whether the requested operation is a _subscription_. If this is the case, it will be forwarded to the `wsLink`, otherwise (if it's a _query_ or _mutation_), the `authLink.concat(httpLink)` will take care of it:

![](https://cdn-images-1.medium.com/max/720/1*KwnMO21k0d3UbyKWnlbeJg.png)
*Picture taken from [Apollo Link: The modular GraphQL network stack](https://dev-blog.apollodata.com/apollo-link-the-modular-graphql-network-stack-3b6d5fcf9244) by [Evans Hauser](https://twitter.com/EvansHauser)*

### Subscribing to new links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to when using Prisma:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

You'll implement the subscription in the `LinkList` component since that's where all the links are rendered.

<Instruction>

Open `LinkList.js` and update current component as follow:

```js{11-13,18,22}(path=".../hackernews-react-apollo/src/components/LinkList.js")
class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY })
  
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
  
    store.writeQuery({ query: FEED_QUERY, data })
  }

  _subscribeToNewLinks = async () => {
    // ... you'll implement this 🔜
  }

  render() {
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          this._subscribeToNewLinks(subscribeToMore)
    
          const linksToRender = data.feed.links
    
          return (
            <div>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
            </div>
          )
        }}
      </Query>
    )
  }
}
```

</Instruction>

Let's understand what's going on here! You're using the `<Query />` component as always but now you're using [`subscribeToMore`](https://www.apollographql.com/docs/react/features/subscriptions.html#subscribe-to-more) received as prop into the component’s render prop function. Calling `_subscribeToNewLinks` with it respective `subscribeToMore` function you make sure that the component actually subscribes to the events. This call opens up a websocket connection to the subscription server.

<Instruction>

Still in `LinkList.js` implement `_subscribeToNewLinks` like so:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_subscribeToNewLinks = subscribeToMore => {
  subscribeToMore({
    document: NEW_LINKS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const newLink = subscriptionData.data.newLink.node

      return Object.assign({}, prev, {
        feed: {
          links: [newLink, ...prev.feed.links],
          count: prev.feed.links.length + 1,
          __typename: prev.feed.__typename
        }
      })
    }
  })
}
```

</Instruction>

You're passing two arguments to `subscribeToMore`:

1. `document`: This represents the subscription query itself. In your case, the subscription will fire every time a new link is created.
1. `updateQuery`: Similar to cache `update` prop, this function allows you to determine how the store should be updated with the information that was sent by the server after the event occurred. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.js.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated data. All you're doing inside `updateQuery` is retrieve the new link from the received `subscriptionData`, merge it into the existing list of links and return the result of this operation.

<Instruction>

The last thing you need to do for this to work is add the `NEW_LINKS_SUBSCRIPTION` to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application running on `http://localhost:3000/`. The second window you use to open a Playground and send a `post` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

> **ATTENTION**: There's a currently a [bug](https://github.com/apollographql/apollo-link/issues/428) in the `apollo-link-ws` package that will prevent your app from running due to the following error: `Module not found: Can't resolve 'subscriptions-transport-ws' in '/.../hackernews-react-apollo/node_modules/apollo-link-ws/lib'`
The workaround until it's fixed is to manually install the `subscriptions-transport-ws` package with `yarn add subscriptions-transport-ws`.
There's also another [bug](https://github.com/graphcool/graphql-yoga/issues/101) in `graphql-yoga` which causes the subscription to fire multiple times (while the link is in fact only created once). After reloading the site, you'll see the correct number of links.



### Subscribing to new votes

Next you'll subscribe to new votes that are submitted by other users so that the latest vote count is always visible in the app.

<Instruction>

Open `LinkList.js` and add the following method to the `LinkList` component:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_subscribeToNewVotes = subscribeToMore => {
  subscribeToMore({
    document: NEW_VOTES_SUBSCRIPTION
  })
}
```

</Instruction>

Similar as before, you're calling `subscribeToMore` but now using `NEW_VOTES_SUBSCRIPTION` as document. This time you're passing in a subscription that asks for newly created votes. When the subscription fires, Apollo Client automatically updates the link that was voted on.

<Instruction>

Still in `LinkList.js` add the `NEW_VOTES_SUBSCRIPTION` to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
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

<Instruction>

Finally, go ahead and call `_subscribeToNewVotes` inside `render` as well you did with `_subscribeToNewLinks`:

```js{2}(path=".../hackernews-react-apollo/src/components/LinkList.js")
this._subscribeToNewLinks(subscribeToMore)
this._subscribeToNewVotes(subscribeToMore)
```

</Instruction>

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.
