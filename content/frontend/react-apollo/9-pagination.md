---
title: Pagination
pageTitle: "Pagination with GraphQL, React & Apollo Tutorial"
description: "Learn how to implement limit-offset pagination with GraphQL and Apollo Client in a React app. The Prisma API exposes the required arguments for lists."
question: "What's the difference between the 'query' and 'readQuery' methods on the 'ApolloClient'?"
answers: ["'readQuery' always fetches data over the network while 'query' can retrieve data either from the cache or remotely", "'readQuery' can only be used to reading data while 'query' can also be used to write data", "'readQuery' was formerly called 'query' and the functionality of both is identical", "'readQuery' always reads data from the local cache while 'query' might retrieve data either from the cache or remotely"]
correctAnswer: 3
videoId: ""
duration: 0		
videoAuthor: ""
---

The last topic that we'll cover in this tutorial is pagination. You'll implement a simple pagination approach so that users are able to view the links in smaller chunks rather than having an extremely long list of `Link` elements.

## Preparing the React Components

Once more, you first need to prepare the React components for this new functionality. In fact, we'll slightly adjust the current routing setup. Here's the idea: The `LinkList` component will be used for two different use cases (and routes). The first one is to display the 10 top voted links. Its second use case is to display new links in a list separated into multiple pages that the user can navigate through.

<Instruction>

Open `App.js` and adjust the render method like so:

```js{4,8,9}(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <div className='center w85'>
      <Header />
      <div className='ph3 pv1 background-gray'>
        <Switch>
          <Route exact path='/' render={() => <Redirect to='/new/1' />} />
          <Route exact path='/create' component={CreateLink} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/search' component={Search} />
          <Route exact path='/top' component={LinkList} />
          <Route exact path='/new/:page' component={LinkList} />
        </Switch>
      </div>
    </div>
  )
}
```

</Instruction>

Make sure to import the `Redirect` component, so you don't get any errors.

<Instruction>

Update the router import on the top of the file:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import { Switch, Route, Redirect } from 'react-router-dom'
```

</Instruction>

You now added two new routes: `/top` and `/new/:page`. The latter reads the value for `page` from the url so that this information is available inside the component that's rendered, here that's `LinkList`.

The root route `/` now redirects to the first page of the route where new posts are displayed.

Before moving on, quickly add a new navigation item to the `Header` component that brings the user to the `/top` route.

<Instruction>

Open `Header.js` add the following lines _between_ the `/` and the `/search` routes:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
<Link to="/top" className="ml1 no-underline black">
  top
</Link>
<div className="ml1">|</div>
```

</Instruction>

You also need to add quite some logic to the `LinkList` component to account for the two different responsibilities it now has.

<Instruction>

Open `LinkList.js` and add three arguments to the `FeedQuery` by replacing the `FEED_QUERY` definition with the following:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
      count
    }
  }
`
```

</Instruction>

The query now accepts arguments that we'll use to implement pagination and ordering. `skip` defines the _offset_ where the query will start. If you passed a value of e.g. `10` for this argument, it means that the first 10 items of the list will not be included in the response. `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list. `orderBy` defines how the returned list should be sorted.

But how can we pass the variables when using the `<Query />` component which is fetching the data under the hood? You need to provide the arguments into `variables` prop right where you're declaring the component.

<Instruction>

Still in `LinkList.js`, add the following method inside the scope of the LinkList component:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_getQueryVariables = () => {
  const isNewPage = this.props.location.pathname.includes('new')
  const page = parseInt(this.props.match.params.page, 10)

  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? 'createdAt_DESC' : null
  return { first, skip, orderBy }
}
```

</Instruction>

<Instruction>

And update the `<Query />` component definition like so:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
<Query query={FEED_QUERY} variables={this._getQueryVariables()}>
```

</Instruction>

You're now passing `first, skip, orderBy` values as `variables` based on the current page (`this.props.match.params.page`) which it's used to calculate the chunk of links that you retrieve.

Also note that you're including the ordering attribute `createdAt_DESC` for the `new` page to make sure the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes for each link.

You also need to define the `LINKS_PER_PAGE` constant and then import it into the `LinkList` component.

<Instruction>

Open `src/constants.js` and add the following definition:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const LINKS_PER_PAGE = 5
```

</Instruction>

### Implementing navigation

Next, you need functionality for the user to switch between the pages. First add two `button` elements to the bottom of the `LinkList` component that can be used to navigate back and forth.

<Instruction>

Open `LinkList.js` and update `render` to look as follows:

```js{11-15,27-36}(path=".../hackernews-react-apollo/src/components/LinkList.js")
render() {
  return (
    <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
      {({ loading, error, data, subscribeToMore }) => {
        if (loading) return <div>Fetching</div>
        if (error) return <div>Error</div>

        this._subscribeToNewLinks(subscribeToMore)
        this._subscribeToNewVotes(subscribeToMore)

        const linksToRender = this._getLinksToRender(data)
        const isNewPage = this.props.location.pathname.includes('new')
        const pageIndex = this.props.match.params.page
          ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
          : 0

        return (
          <Fragment>
            {linksToRender.map((link, index) => (
              <Link
                key={link.id}
                link={link}
                index={index + pageIndex}
                updateStoreAfterVote={this._updateCacheAfterVote}
              />
            ))}
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
          </Fragment>
        )
      }}
    </Query>
  )
}
```

</Instruction>

<Instruction>

Now adjust the import statement from `../constants` in `LinkList.js` to also include the new constant: 

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { LINKS_PER_PAGE } from '../constants'
```

</Instruction>

Before continue, discover [React Fragments](https://reactjs.org/docs/fragments.html) a common pattern for a component to return multiple elements without adding extra nodes to the DOM ✨

<Instruction>

Don't forget to add `Fragment` to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import React, { Component, Fragment } from 'react'
```

</Instruction>


Since the setup is slightly more complicated now, you are going to calculate the list of links to be rendered in a separate method.

<Instruction>

Still in `LinkList.js`, add the following method implementation:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_getLinksToRender = data => {
  const isNewPage = this.props.location.pathname.includes('new')
  if (isNewPage) {
    return data.feed.links
  }
  const rankedLinks = data.feed.links.slice()
  rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
  return rankedLinks
}
```

</Instruction>

For the `newPage`, you'll simply return all the links returned by the query. That's logical since here you don't have to make any manual modifications to the list that is to be rendered. If the user loaded the component from the `/top` route, you'll sort the list according to the number of votes and return the top 10 links.

Next, you'll implement the functionality for the _Previous_ and _Next_ buttons.

<Instruction>

In `LinkList.js`, add the following two methods that will be called when the buttons are pressed:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_nextPage = data => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page <= data.feed.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    this.props.history.push(`/new/${nextPage}`)
  }
}

_previousPage = () => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page > 1) {
    const previousPage = page - 1
    this.props.history.push(`/new/${previousPage}`)
  }
}
```

</Instruction>

The implementation of these is very simple. You're retrieving the current page from the url and implement a sanity check to make sure that it makes sense to paginate back or forth. Then you simply calculate the next page and tell the router where to navigate next. The router will then reload the component with a new `page` in the url that will be used to calculate the right chunk of links to load. Run the app by typing `yarn start` in a terminal and use the new buttons to paginate through your list of links!

### Final adjustments

Through the changes that we made to the `FEED_QUERY`, you'll notice that the `update` functions of your mutations don't work any more. That's because `readQuery` now also expects to get passed the same variables that we defined before.

> **Note**: `readQuery` essentially works in the same way as the `query` method on the `ApolloClient` that you used to implement the search. However, instead of making a call to the server, it will simply resolve the query against the local store! If a query was fetched from the server with variables, `readQuery` also needs to know the variables to make sure it can deliver the right information from the cache.

<Instruction>

With that information, open `LinkList.js` and update the `_updateCacheAfterVote` method to look as follows:

```js{2-11}(path=".../hackernews-react-apollo/src/components/LinkList.js")
_updateCacheAfterVote = (store, createVote, linkId) => {
  const isNewPage = this.props.location.pathname.includes('new')
  const page = parseInt(this.props.match.params.page, 10)

  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? 'createdAt_DESC' : null
  const data = store.readQuery({
    query: FEED_QUERY,
    variables: { first, skip, orderBy }
  })

  const votedLink = data.feed.links.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes
  store.writeQuery({ query: FEED_QUERY, data })
}
```

</Instruction>

All that's happening here is the computation of the variables depending on whether the user currently is on the `/top` or `/new` route.

Finally, you also need to adjust the implementation of `update` when new links are created.

<Instruction>

Open `CreateLink.js` and replace the current `<Mutation />` component like so:

```js{4-19}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
<Mutation
  mutation={POST_MUTATION}
  variables={{ description, url }}
  onCompleted={() => this.props.history.push('/new/1')}
  update={(store, { data: { post } }) => {
    const first = LINKS_PER_PAGE
    const skip = 0
    const orderBy = 'createdAt_DESC'
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    })
    data.feed.links.unshift(post)
    store.writeQuery({
      query: FEED_QUERY,
      data,
      variables: { first, skip, orderBy }
    })
  }}
>
  {postMutation => <button onClick={postMutation}>Submit</button>}
</Mutation>
```

</Instruction>

<Instruction>

Since you don't have the `LINKS_PER_PAGE` constant available in this component yet, make sure to import it on top of the file:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { LINKS_PER_PAGE } from '../constants'
```

</Instruction>

You have now added a simple pagination system to the app, allowing users to load links in small chunks instead of loading them all up front.
