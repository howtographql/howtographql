---
title: Filtering: Searching the List of Links
---


In this section, you'll implement a search feature and learn about the filtering capabilities of your GraphQL API.

> Note: If you're interested in all the filtering capabilities of Graphcool, you can check out the [documentation](https://www.graph.cool/docs/reference/simple-api/filtering-by-field-xookaexai0/) on it.


### Preparing the React Components

The search will be available under a new route and implemented in a new React component.

Start by creating a new file called `Search.js` in `src/components` and add the following code:

```js
import React, { Component } from 'react'
import { gql, withApollo } from 'react-apollo'
import Link from './Link'

class Search extends Component {

  state = {
    links: [],
    searchText: ''
  }

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={(e) => this.setState({ searchText: e.target.value })}
          />
          <button
            onClick={() => this._executeSearch()}
          >
            OK
          </button>
        </div>
        {this.state.links.map(link => <Link key={link.id} link={link}/>)}
      </div>
    )
  }

  _executeSearch = async () => {
    // ... you'll implement this in a bit
  }

}

export default withApollo(Search)
```

Again, this is a pretty standard setup. You're rendering an `input` field where the user can type a search string. 

Notice that the `links` field in the component state will hold all the links to be rendered, so this time we're not accessing query results through the component props! We'll also talk about the `withApollo` function that you're using when exporting the component in a bit!

Now add the `Search` component as a new route to the app. Open `App.js` and update render to look as follows:

```js
render() {
  return (
    <Switch>
      <Route exact path='/search' component={Search}/>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/' component={LinkList}/>
    </Switch>
  )
}
```  

Also import the component on top of the file:

```js
import Search from './Search'
```

Great, let's now go back to the `Search` component and see how we can implement the actual search.

### Filtering Links

Open `Search.js` and add the following query definition on the bottom of the file:

```js
const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
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

This query looks similar to the `allLinks` query that's used in `LinkList`. However, this time it takes in an argument called `searchTect` and specifies a `filter` object that will be used to specify conditions on the links that you want to retrieve.

In this case, you're specifying two filters that account for the following two conditions. A link is only returned if either its `url` contains the provided `searchText` _or_ its `description` contains the provided `searchText`. Both conditions can be combined using the `OR` operator.

Perfect, the query is defined! But this time we actually want to load the data every time the user hits the _OK_-button. 

That's what you're using the `withApollo` function for. All it does is injecting a new prop into the `Search` component called `client`. This `client` is precisely the `ApolloClient` instance that you're creating in `index.js` and that's now directly available inside `Search`.

The `client` has a method called `query` that you can use to send a query manually instead of using the `graphql` HOC.

Here's what the code looks like. Open `Search.js` and implement `_executeSearch` as follows:

```js
_executeSearch = async () => {
  const { searchText } = this.state
  const result = await this.props.client.query({
    query: ALL_LINKS_SEARCH_QUERY,
    variables: { searchText }
  })
  const links = result.data.allLinks
  this.setState({ links })
}
```

The implementation is almost trivial. You're executing the `ALL_LINKS_SEARCH_QUERY` manually, retrieve the `links` from the response that's returned by the server to finally put them into the component's `state` from where they can be rendered.

Go ahead and test the app by running `yarn start` in a Terminal and navigating to `http://localhost:3000/search`. Then type a search string into the text field, click the _OK_-button and make sure the links that are returned fit the filter conditions.
