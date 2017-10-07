---
title: Realtime Updates with GraphQL Subscriptions
pageTitle: "Realtime with GraphQL Subscriptions, Angular & Apollo Tutorial"
description: "Learn how to implement realtime functionality using GraphQL subscriptions with Apollo Client & Angular. The websockets will be handled by subscriptions-transport-ws."
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

```bash(path=".../hackernews-angular-apollo/")
npm install --save subscriptions-transport-ws@0.8.0
# or
# yarn add subscriptions-transport-ws@0.8.0

```

</Instruction>


Next, make sure your `ApolloClient` instance knows about the subscription server.

<Instruction>

Open `src/app/apollo.config.ts` and add the following import near the top of the file:

```ts(path=".../hackernews-angular-apollo/src/app/apollo.config.ts")
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';
```

</Instruction>

<Instruction>

Now update the configuration code like so:

```ts(path=".../hackernews-angular-apollo/src/app/apollo.config.ts")
const networkInterface = createBatchingNetworkInterface({
  uri: '__SIMPLE_API_ENDPOINT__'
});

const wsClient = new SubscriptionClient('__SUBSCRIPTION_API_ENDPOINT__', {
  reconnect: true,
  connectionParams: {
    authToken: localStorage.getItem(GC_AUTH_TOKEN)
  }
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

networkInterface.use([{
  applyBatchMiddleware (req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    const token = localStorage.getItem(GC_AUTH_TOKEN);
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}]);

const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true
});
```

</Instruction>


You're instantiating a `SubscriptionClient` that knows the endpoint for the Subscriptions API. Notice that you're also authenticating the websocket connection with the user's `token` that you retrieve from `localStorage`.

Now you need to replace the placeholder `__SUBSCRIPTION_API_ENDPOINT__ ` with the endpoint for the subscriptions API.

<Instruction>

To get access to this endpoint, open up a terminal and navigate to the directory where `types.graphql` is located. Then type the `graphcool endpoints` command. Now copy the endpoint for the `Subscriptions API` and replace the placeholder with it.

</Instruction>


> The endpoints for the Subscription API generally are of the form: `wss://subscriptions.graph.cool/v1/<project-id>`.
>
> Notice that if your project is not running in the "default" Graphcool [region](https://blog.graph.cool/new-regions-and-improved-performance-7bbc0a35c880), you need to add the your project's region to the endpoint like so: `wss://subscriptions.ap-northeast-1.graph.cool/v1/<project-id>` (for regoin _Asia Pacific_) or `wss://subscriptions.us-west-2.graph.cool/v1/<project-id>` (for _US West_).


### Subscribing to new Links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

First, you need to add a subscription to `src/app/graphql.ts`:

<Instruction>

Open `src/app/graphql.ts` and add the following subscription:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
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
`;

export interface NewLinkSubcriptionResponse {
  node: Link;
}
```

</Instruction>

You'll implement this subscription in the `LinkListComponent` since that's where all the links are rendered.

<Instruction>

Open `src/app/list-link/list-link.component.ts` and update the `watchQuery` implementation with the following code:

```ts(path=".../hackernews-angular-apollo/src/app/list-link/list-link.component.")
    const allLinkQuery: ApolloQueryObservable<AllLinkQueryResponse> = this.apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    });

    allLinkQuery
      .subscribeToMore({
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (previous, { subscriptionData }) => {
          const newAllLinks = [
            subscriptionData.data.Link.node,
            ...previous.allLinks
          ];
          return {
            ...previous,
            allLinks: newAllLinks
          }
        }
      });

    const querySubscription = allLinkQuery.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      this.loading = response.data.loading;
    });

    this.subscriptions = [...this.subscriptions, querySubscription];
```

</Instruction>

<Instruction>

Still in `src/app/list-link/list-link.component.ts` you now need to import `NEW_LINKS_SUBSCRIPTION`:

```ts(path=".../hackernews-angular-apollo/src/app/list-link/list-link.component.ts")
import { ALL_LINKS_QUERY, NEW_LINKS_SUBSCRIPTION } from '../app/graphql'
```

</Instruction>


Let's understand what's going on here! You're using the `subscribeToMore` function in ` ApolloQueryObservable` returned by the `watchQuery`that will open up a websocket connection to the subscription server.

You're passing an array to `SubscribeToMoreOptions`:

1. Each object within the array contains a `document` property: This represents the subscription itself. In your case, the subscription will fire for `CREATED` events on the `Link` type, i.e. every time a new link is created.
2. The other property is `updateQuery`: Similar to `update`, this function allows you to determine how the store should be updated with the information that was sent by the server.

Go ahead and implement `updateQuery` next. This function works slightly differently than `update`. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.ts.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated version.

Let's see what this looks like in action!

<Instruction>

Still in `src/app/list-link/list-link.component.ts` implement `updateQuery` like so:

```ts(path=".../hackernews-angular-apollo/src/app/list-link/list-link.component.ts")
          const newAllLinks = [
            subscriptionData.data.Link.node,
            ...previous.allLinks
          ];
          return {
            ...previous,
            allLinks: newAllLinks
          }
```

</Instruction>


All you do here is retrieve the new link from the subscription data (` subscriptionData.data.Link.node`), merge it into the existing list of links and return the result of this operation.

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application running on `http://localhost:4200/`. The second window you use to open a Playground and send a `createLink` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

**/!\ Actually, there are a bug that blocks the UI update. Indeed, if a subscription event comes, the store is updated, the observable emits, but the change detection is not run. The issue is tracked [here](https://github.com/apollographql/apollo-angular/issues/320) /!\**


### Subscribing to new Votes

Next you'll subscribe to new votes that are emitted by other users as well so that the latest vote count is always visible in the app.

First, you need to add another subscription to `src/app/graphql.ts`:

<Instruction>

Open `src/app/graphql.ts` and add the following subscription:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
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
`;

export interface NewVoteSubcriptionResponse {
  node: Vote;
}

```

</Instruction>

You'll also implement this subscription in the `LinkList` component since that's where all the links are rendered.

<Instruction>

Open `src/app/list-link/list-link.component.ts` and call again the `sunscribeToMore` function with  the following object option:

```ts(path=".../hackernews-angular-apollo/src/app/list-link/list-link.component.ts")
{
        document: NEW_VOTES_SUBSCRIPTION,
        updateQuery: (previous, { subscriptionData }) => {
          const votedLinkIndex = previous.allLinks.findIndex(link =>
            link.id === subscriptionData.data.Vote.node.link.id);
          const link = subscriptionData.data.Vote.node.link;
          const newAllLinks = previous.allLinks.slice();
          newAllLinks[votedLinkIndex] = link;
          return {
            ...previous,
            allLinks: newAllLinks
          }
        }
      }
```

</Instruction>

<Instruction>

Still in `src/app/list-link/list-link.component.ts` you now need to update the import to add `NEW_VOTES_SUBSCRIPTION`:

```ts(path=".../hackernews-angular-apollo/src/app/list-link/list-link.component.ts")
import { ALL_LINKS_QUERY, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION } from '../app/graphql'
```

</Instruction>

Similar to before, you're calling `subscribeToMore` on the `allLinks` query. This time you're passing in a subscription that asks for newly created votes. In `updateQuery`, you're then adding the information about the new vote to the cache by first looking for the `Link` that was just voted on and and then updating its `votes` with the `Vote` element that was sent from the server.

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.

**/!\ Actually, there are a bug that blocks the UI update. Indeed, if a subscription event comes, the store is updated, the observable emits, but the change detection is not run. The issue is tracked [here](https://github.com/apollographql/apollo-angular/issues/320) and another that blocks the [`subscribeToMore`](https://github.com/kamilkisiela/apollo-client-rxjs/issues/37) /!\**

