---
title: "Filtering: Searching the List of Links"
pageTitle: "Filtering with GraphQL, React & Apollo Tutorial"
description: "Learn how to use filters with GraphQL and Apollo Client. Graphcool provides a powerful filter and ordering API that you'll explore in this example."
question: "What's the purpose of the 'withApollo' function?"
answers: ["You use it to send queries and mutations to a GraphQL server", "When wrapped around a component, it injects the 'ApolloClient' instance into the component's props", "You have to use it everywhere where you want to use Apollo functionality", "It parses GraphQL code"]
correctAnswer: 1
videoId: sycCQujmWzg
duration: 3
videoAuthor: "Abhi Aiyer"
---

In this section, you'll implement a search feature and learn about the filtering capabilities of your GraphQL API.

> Note: If you're interested in all the filtering capabilities of Graphcool, you can check out the [documentation](https://www.graph.cool/docs/reference/simple-api/filtering-by-field-xookaexai0/) on it.


### Preparing the React Components

The search will be available under a new route and implemented in a new React component.

<Instruction>

Start by creating a new file called `Search.js` in `src/components` and add the following code:

```js(path=".../hackernews-react-apollo/src/components/Search.js")
import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
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
        {this.state.links.map((link, index) => <Link key={link.id} link={link} index={index}/>)}
      </div>
    )
  }

  _executeSearch = async () => {
    // ... you'll implement this in a bit
  }

}

export default withApollo(Search)
```

</Instruction>

Again, this is a pretty standard setup. You're rendering an `input` field where the user can type a search string. 

Notice that the `links` field in the component state will hold all the links to be rendered, so this time we're not accessing query results through the component props! We'll also talk about the `withApollo` function that you're using when exporting the component in a bit!

<Instruction>

Now add the `Search` component as a new route to the app. Open `App.js` and update render to look as follows:

```js{10}(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <div className='center w85'>
      <Header />
      <div className='ph3 pv1 background-gray'>
        <Switch>
          <Route exact path='/' component={LinkList}/>
          <Route exact path='/create' component={CreateLink}/>
          <Route exact path='/login' component={Login}/>
          <Route exact path='/search' component={Search}/>
        </Switch>
      </div>
    </div>
  )
}
```  

</Instruction>

<Instruction>

Also import the `Search` component at the top of the file:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import Search from './Search'
```

</Instruction>

For the user to be able to comfortably navigate to the search functionality, you should also add a new navigation item to the `Header`.

<Instruction>

Open `Header.js` and put a new `Link` between `new` and `submit`:

```js{4-5}(path=".../hackernews-react-apollo/src/components/Header.js")
<div className='flex flex-fixed black'>
  <div className='fw7 mr1'>Hacker News</div>
  <Link to='/' className='ml1 no-underline black'>new</Link>
  <div className='ml1'>|</div>
  <Link to='/search' className='ml1 no-underline black'>search</Link>
  {userId &&
  <div className='flex'>
    <div className='ml1'>|</div>
    <Link to='/create' className='ml1 no-underline black'>submit</Link>
  </div>
  }
</div>
```

</Instruction>

You can now navigate to the search functionality using the new button in the `Header`:

![](http://imgur.com/XxPdUvo.png)

Great, let's now go back to the `Search` component and see how we can implement the actual search.

### Filtering Links

<Instruction>

Open `Search.js` and add the following query definition at the bottom of the file:

```js(path=".../hackernews-react-apollo/src/components/Search.js")
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

</Instruction>

This query looks similar to the `allLinks` query that's used in `LinkList`. However, this time it takes in an argument called `searchText` and specifies a `filter` object that will be used to specify conditions on the links that you want to retrieve.

In this case, you're specifying two filters that account for the following two conditions: A link is only returned if either its `url` contains the provided `searchText` _or_ its `description` contains the provided `searchText`. Both conditions can be combined using Graphcool's `OR` operator.

Perfect, the query is defined! But this time we actually want to load the data every time the user hits the _search_-button. 

That's the purpose of the [`withApollo`](http://dev.apollodata.com/react/higher-order-components.html#withApollo) function. This function injects the `ApolloClient` instance that you created in `index.js` into the `Search` component as a new prop called `client`.

This `client` has a method called `query` which you can use to send a query manually instead of using the `graphql` higher-order component.

<Instruction>

Here's what the code looks like. Open `Search.js` and implement `_executeSearch` as follows:

```js(path=".../hackernews-react-apollo/src/components/Search.js")
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

</Instruction>

The implementation is almost trivial. You're executing the `ALL_LINKS_SEARCH_QUERY` manually and retrieving the `links` from the response that's returned by the server. Then these links are put into the component's `state` so that they can be rendered.

Go ahead and test the app by running `yarn start` in a terminal and navigating to `http://localhost:3000/search`. Then type a search string into the text field, click the _search_-button and verify the links that are returned fit the filter conditions.
