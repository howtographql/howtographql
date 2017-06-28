---
title: "Queries: Loading Links"
---

### Preparing the React components

The first piece of functionality that you'll implement in the app is loading and displaying a list of `Link` elements.

You'll walk up our way in the React component hierarchy and start with the component that'll render a single link. 

Create a new file called `Link.js` in the `components` directory and add the following code:
<Instruction text="Hali Halo Hilli">
```js
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

Next, you'll implement the component that renders a list of linksLink.

Again, in the `components` directory, go ahead and create a new file called `LinkList.js` and add the following code:

```js
import React, { Component } from 'react'
import Link from './Link'

class LinkList extends Component {

  render() {

    const linksToRender = [{
      id: '1',
      description: 'The Coolest GraphQL Backend 😎',
      url: 'https://www.graph.cool'
    }, {
      id: '2',
      description: 'The Best GraphQL Client',
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

Here, you're using mock data for now to make sure the component setup works. You'll soon replace this with some actual data loaded from the server - patience, young Padawan!

To complete the setup, open `App.js` and replace the current contents with the following:

```js
import React, { Component } from 'react'

class App extends Component {
  render() {
    return (
      <LinkList />
    )
  }
}

export default App
```

Run the app to check if everything works so far! The app should now display the two links from the `linksToRender` array:

![](http://imgur.com/FlMveso.png)


### Writing the GraphQL Query

You'll now load the actual links that are stored on the server. The first thing you need to do for that is define the GraphQL query that you want to send to the API. 

Here is what it looks like:

```graphql
query AllLinks {
  allLinks {
    id
    createdAt
    description
    url
  }
}
```

You could now simply execute this query in a Playground and retrieve the results from your GraphQL server. But how can you use inside your Javascript code?


### Queries with Apollo Client

When using Apollo, you've got two ways of sending queries to the server.

The first one is to use the [`query`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.query) method on the `ApolloClient` directly. This is a more _imperative_ way of fetching data and will allow you to process the response as a _promise_.

A practical example would look as follows:

```js
client.query({
  query: gql`
    query AllLinks {
      allLinks {
        id
      }
    }
  `
}).then(response => console.log(response.data.allLinks))
```

A more idiomatic way when using React however is to use Apollo's higher-order component [`graphql`](http://dev.apollodata.com/react/api-graphql.html) to wrap your React component with a query.

With this approach, all you need to do when it comes to data fetching is write the GraphQL query and `graphql` will fetch the data for you under the hood and then make it available in your component's props. 

In general, the process for you to add some data fetching logic will be very similar every time:

1. write the query as a JS constant using the `gql` parser function
2. use the `graphql` container to wrap your component with the query
3. access the query results in the component's `props`

Open up `LinkList.js` and add the query to the bottom of the file, also replacing the current `export LinkList` statement:

```js
// 1
const ALL_LINKS_QUERY = gql`
  # 2
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`

// 3
export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' }) (LinkList)
```

What's going on there?

1. Here you create the Javascript constant called `ALL_LINKS_QUERY` that stores the query. The `gql` function is used to parse the plain GraphQL code.
2. Now you define the plain GraphQL query. The name `AllLinksQuery` is the _operation name_ and will be used by Apollo to refer to this query in its internals.  (Notice we're using a GraphQL comment here.) 
3. Finally, you're using the `graphql` container to combine the `LinkList` component with the `ALL_LINKS_QUERY`. Note that you're also passing an option to the function call where you specify a `name` to be `allLinksQuery`. This is the name of the `prop` that Apollo injects into the `LinkList`component. If you didn't specify it here, the injected prop would be called `data`.

For this code to work, you also need to import the corresponding dependencies. Add the following line to the top of the file below the other import statements:

```js
import { graphql, gql } from 'react-apollo'
```

Awesome, that's all your data fetching code, can you believe that?

You can now finally remove the mock data and render actual links that are fetched from the server.

Still in `LinkList.js`, update `render` as follows:

```js
render() {

  // 1
  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  // 2
  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }

  // 3
  const linksToRender = this.props.allLinksQuery.allLinks

  return (
    <div>
      {linksToRender.map(link => (
        <Link key={link.id} link={link}/>
      ))}
    </div>
  )
}
```

Let's walk through what's happening in this code. As expected, Apollo injected a new prop into the component called `allLinksQuery`. This prop itself has 3 fields that provide information about the _state_ of the network request:

1. `loading`: Is `true` as long as the request is still ongoing and the response hasn't been received.
2. `error`: In case the request fails, this field will contain information about what exactly went wrong.
3. `allLinks`: This is the actual data that was received from the server. It's an array of `Link` elements.

That's it! Go ahead and run `yarn start` again. You should see the exact same screen as before.
