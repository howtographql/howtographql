---
title: "Queries: Loading Links"
pageTitle: "Fetching Data using GraphQL Queries with React & Apollo Tutorial"
description: "Learn how you can use GraphQL queries with Apollo Client to load data from a server and display it in your React components."
question: What's the idiomatic way for loading data with React & Apollo?
answers: ["Using a higher-order component called 'graphql'", "Using the 'query' method on ApolloClient", "Using 'fetch' and putting the query in the body of the request", "Using XMLHTTPRequest and putting the query in the body of the request"]
correctAnswer: 0
videoId: ""
duration: 0		
videoAuthor: ""
---

### Preparing the React components

The first piece of functionality you'll implement in the app is loading and displaying a list of `Link` elements. You'll walk up our way in the React component hierarchy and start with the component that'll render a single link.

<Instruction>

Create a new file called `Link.js` in the `components` directory and add the following code:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import React, { Component } from 'react'

class Link extends Component {

  render() {
    return (
      <div>
        <div>{this.props.link.description} ({this.props.link.url})</div>
      </div>
    )
  }

  _voteForLink = async () => {
    // ... you'll implement this in chapter 6
  }

}

export default Link
```

</Instruction>

This is a simple React component that expects a `link` in its `props` and renders the link's `description` and `url`. Easy as pie! 🍰

Next, you'll implement the component that renders a list of links.

<Instruction>

Again, in the `components` directory, go ahead and create a new file called `LinkList.js`. Then add the following code:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import React, { Component } from 'react'
import Link from './Link'

class LinkList extends Component {

  render() {

    const linksToRender = [{
      id: '1',
      description: 'The coolest GraphQL backend 😎',
      url: 'https://www.graph.cool'
    }, {
      id: '2',
      description: 'The best GraphQL Client',
      url: 'http://dev.apollodata.com/'
    }]

    return (
      <div>
        {linksToRender.map(link => (
          <Link key={link.id} link={link}/>
        ))}
      </div>
    )
  }

}

export default LinkList
```

</Instruction>

Here, you're using local mock data for now to make sure the component setup works. You'll soon replace this with some actual data loaded from the server - patience, young Padawan!

<Instruction>

To complete the setup, open `App.js` and replace the current contents with the following:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import React, { Component } from 'react'
import LinkList from './LinkList'

class App extends Component {
  render() {
    return (
      <LinkList />
    )
  }
}

export default App
```

</Instruction>

Run the app to check if everything works so far! The app should now display the two links from the `linksToRender` array:

![](http://imgur.com/FlMveso.png)

### Writing the GraphQL query

You'll now load the actual links that are stored on the server. The first thing you need to do for that is define the GraphQL query you want to send to the API.

Here is what it looks like:

```graphql
query FeedQuery {
  feed {
    links {
      id
      createdAt
      description
      url
    }
  }
}
```

You could now simply execute this query in a Playground (against the _application schema_) and retrieve the results from your GraphQL server. But how can you use it inside your JavaScript code?

### Queries with Apollo Client

When using Apollo, you've got two ways of sending queries to the server.

The first one is to directly use the [`query`](https://www.apollographql.com/docs/react/reference/index.html#ApolloClient\.query) method on the `ApolloClient` directly. This is a very direct way of fetching data and will allow you to process the response as a _promise_.

A practical example would look as follows:

```js(nocopy)
client.query({
  query: gql`
    query FeedQuery {
      feed {
        links {
          id
        }
      }
    }
  `
}).then(response => console.log(response.data.allLinks))
```

A more idiomatic way when using React however is to use Apollo's higher-order component [`graphql`](https://www.apollographql.com/docs/react/basics/setup.html#graphql) to wrap your React component with a query.

With this approach, all you need to do when it comes to data fetching is write the GraphQL query and `graphql` will fetch the data for you under the hood and then make it available in your component's props.

In general, the process for you to add some data fetching logic will be very similar every time:

1. write the query as a JavaScript constant using the `gql` parser function
1. use the `graphql` container to wrap your component with the query
1. access the query results in the component's `props`

<Instruction>

Open up `LinkList.js` and add the query to the bottom of the file, also replacing the current `export LinkList` statement:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
// 1
const FEED_QUERY = gql`
  # 2
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`

// 3
export default graphql(FEED_QUERY, { name: 'feedQuery' }) (LinkList)
```

</Instruction>

What's going on here?

1. First, you create the JavaScript constant called `FEED_QUERY` that stores the query. The `gql` function is used to parse the plain string that contains the GraphQL code (if you're unfamililar with the backtick-syntax, you can read up on JavaScript's [tagged template literals](http://wesbos.com/tagged-template-literals/)).
1. Now you define the actual GraphQL query. `FeedQuery` is the _operation name_ and will be used by Apollo to refer to this query under the hood. (Notice the `#` which denotes a GraphQL comment).
1. Finally, you're using the `graphql` container to "wrap" the `LinkList` component with the `FEED_QUERY`. Note that you're also passing an options object to the function call where you specify the `name` to be `feedQuery`. This is the name of the prop that Apollo injects into the `LinkList` component. If you didn't specify it here, the injected prop would be called `data` by default.

<Instruction>

For this code to work, you also need to import the corresponding dependencies. Add the following two lines to the top of the file, right below the other import statements:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

Awesome, that's all your data fetching code, can you believe that?

You can now finally remove the mock data and render actual links that are fetched from the server.

<Instruction>

Still in `LinkList.js`, update `render` as follows:

```js{3-6,8-11,13-14}(path=".../hackernews-react-apollo/src/components/LinkList.js")
render() {

  // 1
  if (this.props.feedQuery && this.props.feedQuery.loading) {
    return <div>Loading</div>
  }

  // 2
  if (this.props.feedQuery && this.props.feedQuery.error) {
    return <div>Error</div>
  }

  // 3
  const linksToRender = this.props.feedQuery.feed.links

  return (
    <div>
      {linksToRender.map(link => (
        <Link key={link.id} link={link}/>
      ))}
    </div>
  )
}
```

</Instruction>

Let's walk through what's happening in this code. As expected, Apollo injected a new prop into the component called `feedQuery`. This prop itself has 3 fields that provide information about the _state_ of the network request:

1. `loading`: Is `true` as long as the request is still ongoing and the response hasn't been received.
1. `error`: In case the request fails, this field will contain information about what exactly went wrong.
1. `feed`: This is the actual data that was received from the server. It has the `links` property which represents a list of `Link` elements.

> In fact, the injected prop contains even more functionality. You can read more in the [documentation](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data).

That's it! Go ahead and run `yarn start` again. You should see the exact same screen as before.
