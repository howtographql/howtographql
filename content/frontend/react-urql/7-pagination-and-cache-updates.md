---
title: Pagination and Cache Updates
pageTitle: "Pagination and Cache Updates with GraphQL, React & urql Tutorial"
description: "Learn how to implement limit-offset pagination and cache updates with GraphQL and urql in a React app and update."
question: "How do you configure mutation updates with '@urql/exchange-graphcache'?"
answers: ["You pass an 'update' argument to the 'useMutation' hook", "You set up a new 'useUpdate' hook with the new data", "You call 'updateQuery' on the cache instance with the new data", "You pass an 'updates' config with an updater function that uses 'updateQuery' to the cache exchange"]
correctAnswer: 3
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section of the tutorial we'll cover pagination. You'll implement a simple pagination approach so that users are able to view the links in smaller chunks rather than all at once with a long list of `Link` elements.

You also haven't implemented any cache updates yet, which we'll also cover. With cache updates you can update the cache when a new post is created, which will cause your app to automagically render the new data.

## Preparing the React Components

Like in every other section, let's first prepare the React components for the new pagination feature. In fact, we'll just slightly adjust the current routing setup. We'll reuse the existing `LinkList` component for two slightly different use-cases and routes.

The first one is to display the 10 top voted links. The second one is to display new links in a list separated into multiple pages that the user can navigate through.

<Instruction>

Open `App.js` and adjust the routes like so:

```js{2,17-19}(path=".../hackernews-react-urql/src/components/App.js")
import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import LoadingBoundary from './LoadingBoundary'
import Header from './Header'
import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Login from './Login'
import Search from './Search'

const App = () => (
  <div className="center w85">
    <Header />
    <div className="ph3 pv1 background-gray">
      <LoadingBoundary>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/new/1" />} />
          <Route exact path="/top" component={LinkList} />
          <Route exact path="/new/:page" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/search" component={Search} />
        </Switch>
      </LoadingBoundary>
    </div>
  </div>
)

export default App
```

</Instruction>

You've set up a redirect that sends the user from the homepage to the `/new/1` route, which will show any newly added routes. Furthermore the `LinkList` component is now rendered on two routes, `/top` for the top links, and `/new/:page` which is the paginated list of new links.

Before moving on, quickly add a new navigation item to the `Header` component that brings the user to the `/top` route.

<Instruction>

Open `Header.js` add the new link to `/top` _between_ the `/` and the `/search` links:

```js{5-8}(path=".../hackernews-react-urql/src/components/Header.js")
<div className="fw7 mr1">Hacker News</div>
<Link to="/" className="ml1 no-underline black">
  new
</Link>
<div className="ml1">|</div>
<Link to="/top" className="ml1 no-underline black">
  top
</Link>
<div className="ml1">|</div>
<Link to="/search" className="ml1 no-underline black">
  search
</Link>
```

</Instruction>

Next, you'll update the `LinkList` component to actually account for the two different responsibilities it now has.

<Instruction>

Open `LinkList.js` and add three arguments to the `FeedQuery` by replacing the `FEED_QUERY` definition with the following:

```js{2-4}(path=".../hackernews-react-urql/src/components/LinkList.js")
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description
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

The query now accepts arguments that you'll use to implement pagination and ordering. The file is also now exporting `FEED_QUERY` because you'll be needing it in a later step to implement some cache updates.

- `skip` defines the _offset_ where the query will start. If you for instance passed a value of `10` for this argument, it means that the first 10 items of the list will not be included in the response.
- `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.
- `orderBy` defines how the returned list should be sorted.

To actually pass the variables into the `useQuery` hook's variables argument you'll now create a small memo hook that returns the `variables` object.

<Instruction>

Still in `LinkList.js`, add the following code before the `useQuery` hook inside the `LinkList` component and pass `variables` into `useQuery`:

```js{1-3,5-9,11}(path=".../hackernews-react-urql/src/components/LinkList.js")
const LinkList = props => {
  const isNewPage = props.location.pathname.includes('new')
  const page = parseInt(props.match.params.page, 10)
  
  const variables = React.useMemo(() => ({
    skip: isNewPage ? (page - 1) * 10 : 0,
    first: isNewPage ? 10 : 100,
    orderBy: isNewPage ? 'createdAt_DESC' : null
  }), [isNewPage, page])

  const [result] = useQuery({ query: FEED_QUERY, variables })
  const { data, fetching, error } = result
  
  // ...
}
```

</Instruction>

Here, you're checking what page the user is on by looking at some props that `react-router` passes to the `LinkList` component. The `location` prop tells you more about the current route. In this case you're checking the `pathname` for `new`, which indicates that the user is on the `/new/:page` route. Then you're also parsing the current page from `react-router`'s `match.params` prop.

The variables are now also including the `'createdAt_DESC'` mode for the `/new` route to make sure that the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes on each link, which you'll be implementing in just a bit.

Lastly, let's update the `Link` component's `index` prop so that the numbers change correctly when the page is switched, for instance to `/new/2`.

<Instruction>

In `LinkList.js` replace the `index` prop that you're passing to the `Link` elements:

```js{1-3,6,11}(path=".../hackernews-react-urql/src/components/LinkList.js")
const LinkList = props => {
  const isNewPage = props.location.pathname.includes('new')
  const page = parseInt(props.match.params.page, 10)
  // ...
  
  const pageIndex = isNewPage ? (page - 1) * 10 : 0
  
  return (
    <div>
      {linksToRender.map((link, index) => (
        <Link key={link.id} link={link} index={pageIndex + index} />
      ))}
    </div>
  )
}
```

</Instruction>

Now you can manually navigate to `/new/1`, `/new/2`, and so on, provided you've created enough links on your GraphQL API. The index number of the links will correctly change per page!

### Implementing navigation

Next, let's add some buttons for the user to switch between pages.

<Instruction>

Once again in `LinkList.js` modify the `LinkList` component:

```js{6-10,12-16,19,25-35}(path=".../hackernews-react-urql/src/components/LinkList.js")
const LinkList = props => {
  const isNewPage = props.location.pathname.includes('new')
  const page = parseInt(props.match.params.page, 10)
  // ...
  
  const nextPage = React.useCallback(() => {
    if (page <= data.feed.count / 10) {
      props.history.push(`/new/${page + 1}`);
    }
  }, [props.history, data.feed.count, page]);

  const previousPage = React.useCallback(() => {
    if (page > 1) {
      props.history.push(`/new/${page - 1}`);
    }
  }, [props.history, page]);
  
  return (
    <React.Fragment>
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} link={link} index={pageIndex + index} />
        ))}
      </div>
      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={this._previousPage}>
            Previous
          </div>
          <div className="pointer" onClick={() => this._nextPage(data)}>
            Next
          </div>
        </div>
      )}
    </React.Fragment>
  )
}
```

</Instruction>

Lastly you'll need to ensure that when the `/top` route is opened, the list of links is sorted by the number of links. You'll only need to replace the `linksToRender` variable with some more logic to make this work.

<Instruction>

Still in `LinkList.js`, replace the `linksToRender` variable:

```js(path=".../hackernews-react-urql/src/components/LinkList.js")
const linksToRender = React.useMemo(() => {
  if (isNewPage) {
    return data.feed.links;
  } else {
    const rankedLinks = data.feed.links
      .slice()
      .sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  }
}, [data, isNewPage]);
```

</Instruction>

Here, for the `/new` route the memo hook is returning the links from the query without changes, as before. That's because the `orderBy` argument on the query already asks for ordered data for this route. The server doesn't support sorting by votes however, so on the `/top` route the links are manually sorted by how many votes they have.

### What are urql's request policies about?

Back when you've created the `CreateLink` page, you saw how the UI doesn't give any feedback when creating a new link, apart from redirecting to the homepage. Any links that are created in the app aren't immediately shown on the `/new/1` route.

This is because a normalized cache cannot relate the newly created link that your GraphQL API sends back with the queries in `LinkList`. Instead it only shows the stale, outdated data it knows about.

One simple way to fix this is to pass a different "request policy" to `useQuery`. We can use different policies to tell urql how to treat cached data. By default, it will always be using `cache-first`, which means that if a query exists in the cache, urql won't make another network request.

There are several request policies that tell the `cacheExchange` in your urql Client how to treat cached data:

- `cache-first` prevents a network request, when the query's result has already been cached.
- `cache-only` prevents a network request, even when the query's result has never been cached.
- `network-only` always sends a network request to get a query's result and ignores the cache.
- `cache-and-network` returns a query's cached result but then also makes a network request.

As you can see, you could use the last request policy, `cache-and-network`, to update the `/new/1` page automatically from your GraphQL API, when you're redirected to it from `/create`, like so:

```js(nocopy)
const [result] = useQuery({
  query: FEED_QUERY,
  variables,
  requestPolicy: 'cache-and-network'
})
```

However, **this is not what we'll be doing to solve this problem in this tutorial**.

### Cache Updates when creating links

With `@urql/exchange-graphcache` there's an easy fix to update the cache after a mutation completes. You can pass an updater to the Graphcache exchange that tells it how to update the normalized cache data manually!

<Instruction>

In `index.js` replace the `cacheExchange`'s config with the following and import `FEED_QUERY` from `LinkList.js`:

```js{2,5-20}(path=".../hackernews-react-urql/src/index.js")
import { cacheExchange } from '@urql/exchange-graphcache'
import { FEED_QUERY } from './components/LinkList'

const cache = cacheExchange({
  updates: {
    Mutation: {
      post: ({ post }, _args, cache) => {
        const variables = { first: 10, skip: 0, orderBy: 'createdAt_DESC' }
        cache.updateQuery({ query: FEED_QUERY, variables }, data => {
          if (data !== null) {
            data.feed.links.unshift(post)
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

This is all it takes to update some cache data after a mutation is performed! ✨

This has the added advantage that you'll only be using the data that comes back from the mutation. With this approach you'll never make additional network requests, when the normalized cache already has enough information, which is great!

You can add any number of update functions to the `updates` config. In this example, we've only added a handler for the `post` mutation. The function receives the data of the mutation, any arguments that have been passed to the mutation field, and an instance of the cache. The cache itself has a method called `updateQuery` that can be used to update the data for a given query in the cache.

Go ahead and test this by running `yarn start` in a terminal and navigating to `http://localhost:3000/create`. Then submit a new link and verify that your newly created link shows up on the `/new/1` page.
