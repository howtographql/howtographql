---
title: Realtime Updates with GraphQL Subscriptions
pageTitle:
  'Realtime with GraphQL Subscriptions, React & Apollo
  Tutorial'
description:
  'Learn how to implement realtime functionality using
  GraphQL subscriptions with Apollo Client & React. The
  websockets will be handled by subscriptions-transport-ws.'
question:
  'What transport does Apollo use to implement
  subscriptions?'
answers: ['WebSockets', 'TCP', 'UDP', 'HTTP 2']
correctAnswer: 0
videoId: ''
duration: 0
videoAuthor: ''
---

This section is all about bringing realtime functionality
into the app by using GraphQL subscriptions.

### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature allowing the server to
send data to its clients when a specific _event_ happens.
Subscriptions are usually implemented with
[WebSockets](https://en.wikipedia.org/wiki/WebSocket), where
the server holds a steady connection to the client. This
means when working with subscriptions, we're breaking the
_Request-Response_ cycle that is typically used for
interactions with the API. Instead, the client now initiates
a steady connection with the server by specifying which
event it is interested in. Every time this particular event
then happens, the server uses the connection to push the
expected data to the client.

### Subscriptions with Apollo

When using Apollo, we need to configure our `ApolloClient`
with information about the subscriptions endpoint. This is
done by adding another `ApolloLink` to the Apollo middleware
chain. This time, it's the `WebSocketLink` from the
[`@apollo/client/link/ws`](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-ws)
package.

To get started, add `subscriptions-transport-ws` as a
dependency to the app.

<Instruction>

Open a terminal and navigate to the project's root
directory. Then execute the following command:

```bash(path=".../hackernews-react-apollo")
yarn add subscriptions-transport-ws
```

</Instruction>

Next, let's make sure our `ApolloClient` instance knows
about the subscription server.

<Instruction>

Open `index.js` and add the following imports to the top of
the file:

```js(path=".../hackernews-react-apollo/src/index.js")
import { split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
```

Let's now create a new `WebSocketLink` that represents the
WebSocket connection. We'll use `split` for proper "routing"
of the requests and update the constructor call of
`ApolloClient` like so:

```js(path=".../hackernews-react-apollo/src/index.js")
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' &&
      operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});
```

</Instruction>

We're instantiating a `WebSocketLink` that knows about the
**subscriptions** endpoint. The **subscriptions** endpoint
in this case is similar to the HTTP endpoint, except that it
uses the `ws` (WebSocket) protocol instead of `http`. Notice
that we're also authenticating the WebSocket connection with
the user's `token` that we retrieve from `localStorage`.

[`split`](https://github.com/apollographql/apollo-link/blob/98eeb1deb0363384f291822b6c18cdc2c97e5bdb/packages/apollo-link/src/link.ts#L33)
is used to "route" a request to a specific middleware link.
It takes three arguments, the first one is a `test` function
which returns a boolean. The remaining two arguments are
again of type `ApolloLink`. If `test` returns `true`, the
request will be forwarded to the link passed as the second
argument. If `false`, to the third one.

In our case, the `test` function is checking whether the
requested operation is a _subscription_. If it is, it will
be forwarded to the `wsLink`, otherwise (if it's a _query_
or _mutation_), the `authLink.concat(httpLink)` will take
care of it:

![](https://cdn-images-1.medium.com/max/720/1*KwnMO21k0d3UbyKWnlbeJg.png)
_Picture taken from
[Apollo Link: The modular GraphQL network stack](https://dev-blog.apollodata.com/apollo-link-the-modular-graphql-network-stack-3b6d5fcf9244)
by [Evans Hauser](https://twitter.com/EvansHauser)_

### Subscribing to New links

For the app to update in realtime when new links are
created, we need to subscribe to events that are happening
on the `Link` type. We'll implement the subscription in the
`LinkList` component since that's where all the links are
rendered.

<Instruction>

The `useQuery` hook provided by Apollo gives us access to a
function called `subscribeToMore`. We can destructure this
function out and use it to act on new data that comes in
over a subscription. This will give us the effect of making
our app "realtime".

Open `LinkList.js` and update current component as follow:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
const LinkList = () => {
  // ...

  const {
    data,
    loading,
    error,
    subscribeToMore
  } = useQuery(FEED_QUERY, {
    variables: getQueryVariables(isNewPage, page)
  });

  subscribeToMore({
    // ...
  });

  // ...
};
```

</Instruction>

The `subscribeToMore` function takes a single object as an
argument. This object requires configuration for how to
listen for and respond to a subscription.

At the very least, we need to pass a subscription document
to the `document` key in this object. This is a GraphQL
document where we define our subscription.

We can also pass a field called `updateQuery` which can be
used to update the cache, much like we would do in a
mutation.

Let's get started by providing the complete configuration we
need for `subscribeToMore` to function properly.

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
// ...

subscribeToMore({
  document: NEW_LINKS_SUBSCRIPTION,
  updateQuery: (prev, { subscriptionData }) => {
    if (!subscriptionData.data) return prev;
    const newLink = subscriptionData.data.newLink;
    const exists = prev.feed.links.find(
      ({ id }) => id === newLink.id
    );
    if (exists) return prev;

    return Object.assign({}, prev, {
      feed: {
        links: [newLink, ...prev.feed.links],
        count: prev.feed.links.length + 1,
        __typename: prev.feed.__typename
      }
    });
  }
});
```

<Instruction>

The last thing we need to do for this to work is add the
`NEW_LINKS_SUBSCRIPTION` to the top of the file:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
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
`;
```

</Instruction>

Awesome, that's it! We can test our implementation by
opening two browser windows. In the first window, we have
our application running on `http://localhost:3000/`. In the
second window, we can open the GraphQL Playground and send a
`post` mutation. When we send the mutation, we see the app
update in realtime! ⚡️

### Subscribing to New Votes

We can also subscribe to new votes that are submitted by
other users so that the latest vote count is always visible
in the app.

<Instruction>

Open `LinkList.js` and add the following method to the
`LinkList` component:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
subscribeToMore({
  document: NEW_VOTES_SUBSCRIPTION
});
```

</Instruction>

Similar to what we did before, we're calling
`subscribeToMore` but now using `NEW_VOTES_SUBSCRIPTION` as
the document. This time, we're passing in a subscription
that asks for newly created votes. When the subscription
fires, Apollo Client automatically updates the link that was
voted on.

<Instruction>

Still in `LinkList.js` add the `NEW_VOTES_SUBSCRIPTION` to
the top of the file:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
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
`;
```

</Instruction>

Fantastic! Our app is now ready for realtime and will
immediately update links and votes whenever they're created
by other users.
