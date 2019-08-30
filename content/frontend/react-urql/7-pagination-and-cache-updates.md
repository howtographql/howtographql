---
title: Pagination and Cache Updates
pageTitle: "Pagination and Cache Updates with GraphQL, React & urql Tutorial"
description: "Learn how to implement limit-offset pagination and cache updates with GraphQL and urql in a React app and update."
question: "How do you configure mutation updates with '@urql/exchange-graphcache'?"
answers: ["You pass an 'update' argument to the 'useMutation' hook", "You set up a new 'useUpdate' hook with the new data", "You call 'updateQuery' on the cache exchange with the new data", "You pass an 'updates' config with an updater function to the cache exchange"]
correctAnswer: 3
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section of the tutorial we'll cover pagination. You'll implement a simple pagination approach so that users are able to view the links in smaller chunks rather than all at once with a long list of `Link` elements.

We also haven't implemented any cache updates yet, which we'll also cover. With cache updates we can update the cache when a new post is created, which will cause our app to automagically render the new data.

## Preparing the React Components

Like in every section, let's first prepare the React components for this new functionality. In fact, we'll just slightly adjust the current routing setup. We'll use the `LinkList` component for two slightly different use cases and routes.

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

Open `Header.js` add the following lines _between_ the `/` and the `/search` routes:

```js(path=".../hackernews-react-urql/src/components/Header.js")
<Link to="/top" className="ml1 no-underline black">
  top
</Link>
<div className="ml1">|</div>
```

</Instruction>

Next, we'll update the `LinkList` component to actually account for the two different responsibilities it now has.

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

The query now accepts arguments that we'll use to implement pagination and ordering. Notice that we're also adding `export` to `FEED_QUERY`, which we'll use in a later step to implement updating.

- `skip` defines the _offset_ where the query will start. If you for instance passed a value of `10` for this argument, it means that the first 10 items of the list will not be included in the response.
- `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.
- `orderBy` defines how the returned list should be sorted.

But to actually pass the variables when using the `useQuery` hook we'll now need to provide it the `variables` argument.

<Instruction>

Still in `LinkList.js`, add the following code before the `useQuery` hook inside the `LinkList` component:

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

You're now passing `first`, `skip`, and `orderedBy` as `variables` to the `useQuery` hook, depending on the current page.

We're checking what page we're on by looking at some props that `react-router` passes to our component. The `location` prop tells us more about what route we're on. In this case we're checking the `pathname` for `new`, which tells us that we're on the `/new/:page` route. Then we're parsing the current page from `react-router`'s `match.params` prop.

We're also including the `'createdAt_DESC'` mode for the `/new` route to make sure that the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes on each link.

Lastly, let's update what we pass as the `index` prop to the `Link` components so that the numbers keep changing as we switch between pages.

<Instruction>

In `LinkList.js` replace the `index` prop that you're passing to the `Link` elements:

```js{1-3,5-9,11}(path=".../hackernews-react-urql/src/components/LinkList.js")
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

Now you can manually navigate to `/new/1` and `/new/2` and so on, provided you've created enough links on your GraphQL API and the index of the links will correctly change per page!

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

Lastly we need to ensure that when we're on the `/top` route, the list of links is sorted by the number of links. The only thing we need to do to make this work is to replace the `linksToRender` variable.

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

For the `/new` route we just return the links that we received from the query, as before. That's because we're already passing `orderBy` to the query so we get ordered data back. Our server doesn't support sorting by votes however, so on the `/top` route we manually sort links by how many votes they have.

### Updates when creating links

Back when we've created the `CreateLink` page we noted how we didn't get any feedback in the UI apart from the redirect we've implemented. The actual link would however not be added to the links list.

This is because a normalized cache cannot relate the newly created link that your GraphQL API sends back with the queries in `LinkList`. However, there's an easy fix! We can pass an updater to our Graphcache exchange that updates the normalized cache manually.

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

You can add any number of update functions to the `updates` config. Here we add a handler for the `post` mutation. The function receives the data of the mutation, any arguments that have been passed to the mutation field, and an instance of the cache. The cache itself has a method called `updateQuery` that can be used to update the data for a given query in the cache.

Go ahead and test this by running `yarn start` in a terminal and navigating to `http://localhost:3000/create`. Then submit a new link and verify that your newly created link shows up on the `/new/1` page.
