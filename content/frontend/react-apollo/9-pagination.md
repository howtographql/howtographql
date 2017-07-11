---
title: Pagination
question: "What's the difference between the 'query' and 'readQuery' methods on the 'ApolloClient'?"
answers: ["'readQuery' always fetches data over the network while 'query' can retrieve data either from the cache or remotely", "'readQuery' can only be used to reading data while 'query' can also be used to write data", "'readQuery' was formerly called 'query' and the functionality of both is identical", "'readQuery' always reads data from the local cache while 'query' might retrieve data either from the cache or remotely"]
correctAnswer: 3
---

The last topic that we'll cover in this tutorial is pagination. You'll implement a simple pagination approach so that user's are able to view the links in smaller chunks rather than having an extremely list of `Link` elements.


## Preparing the React Components

Once more, you first need to prepare the React components for this new functionality. In fact, we'll slightly adjust the current routing setup. Here's the idea: The `LinkList` component will be used for two different use cases (and routes). The first one is to display the 10 top voted links. And its second use case is to display a _new_ links in a list where the user can paginate.

<Instruction>

Open `App.js` and adjust the render method like so:


```js{4,8,9}(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <Switch>
      <Route exact path='/' render={() => <Redirect to='/new/1' />} />
      <Route exact path='/login' component={Login}/>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/search' component={Search}/>
      <Route exact path='/top' component={LinkList}/>
      <Route exact path='/new/:page' component={LinkList}/>
    </Switch>
  )
}
```

</Instruction>


You now added two new routes: `/top` and `/new/:page`. The second one reads the value for `page` from the url so that this information is available inside the component that's rendered, here that's `LinkList`.

The root route `/` now redirects to the first page of the route where new posts are displayed.

We need to add quite some logic to the `LinkList` component to account for the two different responsibilities that it now has. 

<Instruction>

Open `LinkList.js` and add three arguments to the `AllLinksQuery` by replacing the `ALL_LINKS_QUERY` definition with the following:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
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
    _allLinksMeta {
      count
    }
  }
`
```  

</Instruction>


The query now accepts arguments that we'll use to implement pagination and ordering. `skip` defines the _offset_ where the query will start. If you passed a value of e.g. `10` to this argument, it means that the first 10 items of the list will not be included in the response. `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.   

 But how can we pass the variables when using the `graphql` container which is fetching the data under the hood? You need to provide the arguments right where you're wrapping your component with the query.

<Instruction>

Still in `LinkList.js`, replace the current `export` statement with the following:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
export default graphql(ALL_LINKS_QUERY, {
  name: 'allLinksQuery',
  options: (ownProps) => {
    const page = parseInt(ownProps.match.params.page, 10)
    const isNewPage = ownProps.location.pathname.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy }
    }
  }
}) (LinkList)
```

</Instruction>

You're now passing a function to `graphql` that takes in the props of the component (`ownProps`) before the query is executed. This allows you to retrieve the information about the current page from the router (`ownProps.match.params.page`) and use it to calculate the chunk of links that you retrieve with `first` and `skip`.

Also note that you're including the ordering attribute `createdAt_DESC` for the `new` page to make sure the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes for each link.

You also need to define the `LINKS_PER_PAGE` constant and then import it into the `ListList` component.

<Instruction>

Open `src/constants.js` and add the following definition:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const LINKS_PER_PAGE = 5
```

</Instruction>


<Instruction>

Now adjust the import statement from `../constants` in `LinkList.js` to also include the new constant: 

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { GC_USER_ID, GC_AUTH_TOKEN, LINKS_PER_PAGE } from '../constants'
```

</Instruction>

### Implementing Navigation

Next, you need functionality for the user to switch between the pages. First add two `button` elements to the bottom of the `LinkList` component that can be used to navigate back and forth.

<Instruction>

Open `LinkList.js` and update `render` to look as follows:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
render() {

  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }

  const isNewPage = this.props.location.pathname.includes('new')
  const linksToRender = this._getLinksToRender(isNewPage)
  const userId = localStorage.getItem(GC_USER_ID)

  return (
    <div>
      {!userId ?
        <button onClick={() => {
          this.props.history.push('/login')
        }}>Login</button> :
        <div>
          <button onClick={() => {
            this.props.history.push('/create')
          }}>New Post</button>
          <button onClick={() => {
            localStorage.removeItem(GC_USER_ID)
            localStorage.removeItem(GC_AUTH_TOKEN)
            this.forceUpdate() // doesn't work as it should :(
          }}>Logout</button>
        </div>
      }
      <div>
        {linksToRender.map(link => (
          <Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} link={link}/>
        ))}
      </div>
      {isNewPage &&
      <div>
        <button onClick={() => this._previousPage()}>Previous</button>
        <button onClick={() => this._nextPage()}>Next</button>
      </div>
      }
    </div>
  )

}
```

</Instruction>


Since the setup is slightly more complicated now, you are going to calculate the list of links to be rendered in a separate method.


<Instruction>

Still in `LinkList.js`, add the following method implementation:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_getLinksToRender = (isNewPage) => {
  if (isNewPage) {
    return this.props.allLinksQuery.allLinks
  }
  const rankedLinks = this.props.allLinksQuery.allLinks.slice()
  rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
  return rankedLinks
}
```

</Instruction>


For the `newPage`, you'll simply return all the links returned by the query. That's logical since here you don't have to make any manual modifications to the list that is to be rendered. If the user loaded the component from the `/top` route, you'll sort the list according to the number of votes and return the top 10 links.

Next, you'll implement the functionality for the _Previous_- and _Next_-buttons.

<Instruction>

In `LinkList.js`, add the following two methods that will be called when the buttons are pressed:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_nextPage = () => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    this.props.history.push(`/new/${nextPage}`)
  }
}

_previousPage = () => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page > 1) {
    const nextPage = page - 1
    this.props.history.push(`/new/${nextPage}`)
  }
}
```

</Instruction>


The implementation of these is very simple. You're retrieving the current page from the url and implement a sanity check to make sure that it makes sense to paginate back or forth. Then you simply calculate the next page and tell the router where to navigate next. The router will then reload the component with a new `page` in the url that will be used to calculate the right chunk of links to load. Run the app by typing `yarn start` in a Terminal and use the new buttons to paginate through your list of links!

### Final Adjustments

Through the changes that we made to the `ALL_LINKS_QUERY`, you'll notice that the `update` functions of your mutations don't work any more. That's because `readQuery` now also expects to get passed the same variables that we defined before.

> **Note**: `readyQuery` essentially works in the same way as the `query` method on the `ApolloClient` that you used to implement the search. However, instead of making a call to the server, it will simply resolve the query against the local store! If a query was fetched from the server with variables, `readQuery` also needs to know the variables to make sure it can deliver the right information from the cache.

<Instruction>

With that information, open `LinkList.js` and update the `_updateCacheAfterVote` method to look as follows:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_updateCacheAfterVote = (store, createVote, linkId) => {
  const isNewPage = this.props.location.pathname.includes('new')
  const page = parseInt(this.props.match.params.page, 10)
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? "createdAt_DESC" : null
  const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: { first, skip, orderBy } })

  const votedLink = data.allLinks.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes
  store.writeQuery({ query: ALL_LINKS_QUERY, data })
}
```

</Instruction>
 
All that's happening here is the computation of the variables depending on whether the user currently is on the `/top` or `/new` route.  

Finally, you also need to adjust the implementation of `update` when new links are created. 

<Instruction>

Open `CreateLink.js` and replace the current contents of `_createLink` like so:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
_createLink = async () => {
  const postedById = localStorage.getItem(GC_USER_ID)
  if (!postedById) {
    console.error('No user logged in')
    return
  }
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url,
      postedById
    },
    update: (store, { data: { createLink } }) => {
      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC'
      const data = store.readQuery({
        query: ALL_LINKS_QUERY,
        variables: { first, skip, orderBy }
      })
      data.allLinks.splice(0,0,createLink)
      data.allLinks.pop()
      store.writeQuery({
        query: ALL_LINKS_QUERY,
        data,
        variables: { first, skip, orderBy }
      })
    }
  })
  this.props.history.push(`/new/1`)
}
``` 

</Instruction>

<Instruction>

Since you don't have the `LINKS_PER_PAGE` constant available in this component yet, make sure to import it on top of the file:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { GC_USER_ID, LINKS_PER_PAGE } from '../constants'
```

</Instruction>
