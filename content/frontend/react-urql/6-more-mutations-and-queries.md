---
title: More Mutations and Queries
pageTitle: "More Mutations & Caching with GraphQL, React & urql Tutorial"
description: "Learn more about mutations and queries with React & urql.."
question: "What does the 'pause' argument of urql's useQuery hook do?"
answers: ["It allows you to pause all ongoing queries", "It allows you to update the query result manually", "It pauses the query but it can still be triggered using 'executeQuery'", "It pauses the query indefinitely"]
correctAnswer: 2
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section of the tutorial you'll implement the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the Link component

Once more, let's first prepare the app's components before implementing the actual upvote mutation. There's several things that the `Link` component isn't currently displaying, compared to the real Hackernews site.

- a link should display its number in the list of the current page (`1.`, `2.`, ...)
- it should display an upvote button and the number of upvotes it received
- it should display who posted the link
- and it should display when it was posted

Before you'll modify the `Link` component, let's write a function that takes a timestamp and converts it to a string that's more user friendly, e.g. `"3 hours ago"`.

<Instruction>

Create a new file called `dates.js` in the `src` directory and paste the following code into it:

```js(path=".../hackernews-react-urql/src/dates.js")
const timeDifference = (current, previous) => {
  const milliSecondsPerMinute = 60 * 1000
  const milliSecondsPerHour = milliSecondsPerMinute * 60
  const milliSecondsPerDay = milliSecondsPerHour * 24
  const milliSecondsPerMonth = milliSecondsPerDay * 30
  const milliSecondsPerYear = milliSecondsPerDay * 365

  const elapsed = current - previous

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'just now'
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago'
  } else if (elapsed < milliSecondsPerHour) {
    return Math.round(elapsed / milliSecondsPerMinute) + ' min ago'
  } else if (elapsed < milliSecondsPerDay) {
    return Math.round(elapsed / milliSecondsPerHour) + ' h ago'
  } else if (elapsed < milliSecondsPerMonth) {
    return Math.round(elapsed / milliSecondsPerDay) + ' days ago'
  } else if (elapsed < milliSecondsPerYear) {
    return Math.round(elapsed / milliSecondsPerMonth) + ' mo ago'
  } else {
    return Math.round(elapsed / milliSecondsPerYear) + ' years ago'
  }
}

export const timeDifferenceForDate = date => {
  const now = new Date().getTime()
  const updated = new Date(date).getTime()
  return timeDifference(now, updated)
}
```

</Instruction>

Now, let's update the `Link` component with everything that is has previously been missing!

<Instruction>

Open `Link.js` and update it to look as follows:

```js{2-3,5-6,8,12-19,24-30}(path=".../hackernews-react-urql/src/components/Link.js")
import React from 'react'
import { getToken } from '../token'
import { timeDifferenceForDate } from '../dates'

const Link = ({ index, link }) => {
  const isLoggedIn = !!getToken()
  
  const upvote = React.useCallback(() => {}, [])
  
  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{index + 1}.</span>
        {isLoggedIn && (
          <div className="ml1 gray f11" onClick={upvote}>
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        <div className="f6 lh-copy gray">
          {link.votes.length} votes | by{' '}
          {link.postedBy
            ? link.postedBy.name
            : 'Unknown'}{' '}
          {timeDifferenceForDate(link.createdAt)}
        </div>
      </div>
    </div>
  )
}

export default Link
```

</Instruction>

As you can see, we've also added a new prop. Each `Link` element will also render its position inside the list, so you have to now pass it the `index` prop from the `LinkList` component.

<Instruction>

Open `LinkList.js` and update the rendering of the `Link` components inside its returned elements:

```js{6-8}(path=".../hackernews-react-urql/src/components/LinkList.js")
// const linksToRender = data.feed.links
// ...

return (
  <div>
    {linksToRender.map((link, index) => (
      <Link key={link.id} link={link} index={index} />
    ))}
  </div>
)
```

</Instruction>

Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

<Instruction>

Still in `LinkList.js`, update the definition of `FEED_QUERY` to look as follows:

```js{9-18}(path=".../hackernews-react-urql/src/components/LinkList.js")
const FEED_QUERY = gql`
  {
    feed {
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

All you do here is include information about the user who posted a link as well as information about each link's votes in the query's payload. You can now run the app again and the links will be ddisplayed properly.

![Include info on the user](https://imgur.com/tKzj3b5.png)

> **Note**: If you're not able to fetch the links, restart the server and reload the browser. You could also check if everything is working as expected on `GraphQL Playground`!

### The Upvote Mutation

Let's now move on and implement the `vote` mutation!

<Instruction>

Open `Link.js` and add the following import statements and GraphQL mutation at the top:

```js{2-3,8}(path=".../hackernews-react-urql/src/components/Link.js")
import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'urql'

import { getToken } from '../token'
import { timeDifferenceForDate } from '../dates

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      link {
        id
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

// ...
```

</Instruction>

When you've updated the `Link` component you also added an empty `upvote` handler. Let's now add the mutation and populate that handler with the usual logic, like you did back for the `Login` component in a previous step.

<Instruction>

Still in `Link.js`, implement the `useMutation` hook and update the `upvote` handler:

```js{4,6-10}(path=".../hackernews-react-urql/src/components/Link.js")
const Link = ({ index, link }) => {
  // ...

  const [state, executeMutation] = useMutation(VOTE_MUTATION);

  const upvote = React.useCallback(() => {
    if (!state.fetching) {
      executeMutation({ linkId: link.id });
    }
  }, [state.fetching, executeMutation, link.id]);
    
  // ...
};
```

</Instruction>

This step should feel pretty familiar by now. You're adding the new mutation inside of your component by adding the `useMutation` hook. You're also passing the `linkId` variable to `executeMutation`, since it's required by the `VoteMutation`'s definition.

You can now go ahead and test this! Run `yarn start` in `hackernews-react-urql`, make sure that you're logged in, then click the upvote button on a link. You should then see the link's upvote number update automatically!

> **Remember**: We haven't set up any configuration for `@urql/exchange-graphcache` yet, but since it's a normalized cache, it knows that the link it receives back from the mutation needs to also be updated on the feed query!

### Creating the Search page

Next up, you'll add a search page to your app!

The search will be available under a new route and allow you to filter all links that have been submitted to your GraphQL API.

<Instruction>

Start by creating a new file called `Search.js` in `src/components` and add the following code:

```js(path=".../hackernews-react-urql/src/components/Search.js")
import React from 'react'
import { useQuery } from 'urql'
import gql from 'graphql-tag'
import Link from './Link'

const Search = () => {
  const [filter, setFilter] = React.useState('')

  const search = React.useCallback(() => {}, []);
  const links = []
  
  return (
    <div>
      <div>
        Search
        <input
          type='text'
          onChange={e => setFilter(e.target.value)}
        />
        <button onClick={search}>search</button>
      </div>
      {links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  )
}

export default Search
```

</Instruction>

Again, this is a pretty standard setup. You're rendering an `input` field where the user can type a search string.

It's worth noting that this time we'd like to start the search imperatively. Instead of the `useQuery` hook starting the search immediately while the user is typing, we'd like to only start searching once the user clicks the "search" button.

For now the `search` handler and `links` array are also empty stubs, but we'll be replacing them in a later step.

<Instruction>

Add a new `/search` route to the app. Open `App.js` and update the routes to include the `Search` component:

```js{9,20}(path=".../hackernews-react-urql/src/components/App.js")
import React from 'react'
import { Switch, Route } from 'react-router-dom'

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
          <Route exact path="/" component={LinkList} />
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

Let's also add a button to the header so users can comfortably navigate to the search page.

<Instruction>

Open `Header.js` and put a new `Link` between `new` and `submit`:

```js{9-12}(path=".../hackernews-react-urql/src/components/Header.js")
// ...

<div className="flex pa1 justify-between nowrap orange">
  <div className="flex flex-fixed black">
    <div className="fw7 mr1">Hacker News</div>
    <Link to="/" className="ml1 no-underline black">
      new
    </Link>
    <div className="ml1">|</div>
    <Link to="/search" className="ml1 no-underline black">
      search
    </Link>
    {isLoggedIn && (
      <div className="flex">
        <div className="ml1">|</div>
        <Link to="/create" className="ml1 no-underline black">
          submit
        </Link>
      </div>
    )}
  </div>
```

</Instruction>

You can now navigate to the search feature using the "search" button in the `Header`:

![See the search functionality in the Header component](http://imgur.com/XxPdUvo.png)

### The Search Query

Great, let's now go back to the `Search` component and implement the actual search!

<Instruction>

Open `Search.js` and add the following import statements and query definition at the top of the file:

```js(path=".../hackernews-react-urql/src/components/Search.js")
import gql from 'graphql-tag'
import { useQuery } from 'urql'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
`
```

</Instruction>

This query looks similar to the feed query that's used in `LinkList`. However, this time it takes in an argument called `filter` that will be used to constrain the list of links you want to retrieve.

Previously you've always just passed `useQuery` a query and some variables. But in the case of the new `Search` component, the query is meant to run programmatically, when the "search" button is clicked. You can utilise the `executeQuery` method and the `pause` argument to achieve this.

<Instruction>

Still in `Search.js`, add the `useQuery` hook to the `Search` component and replace the `search` handler and empty `links` array:

```js{4-8,10-12,14}(path=".../hackernews-react-urql/src/components/Search.js")
const Search = () => {
  const [filter, setFilter] = React.useState('')

  const [result, executeQuery] = useQuery({
    query: FEED_SEARCH_QUERY,
    variables: { filter },
    pause: true,
  })

  const search = React.useCallback(() => {
    executeQuery();
  }, [executeQuery]);
  
  const links = result.data ? result.data.feed.links : [];
    
  // ...
};
```

</Instruction>

Like in `LinkList` you're passing the query and variables arguments to `useQuery`. But instead of immediately running the query, the `pause` option is now set to `true`. This flag will cause `useQuery` to wait until `executeQuery` is programmatically called.

This is a very powerful option as you could also flip `pause` to `false` at any time to let the hook start the query automatically. This is essentially one of the use-cases of having `executeQuery`! You can call it programmatically to ask for new results or use it in combination with `pause: true` to make it behave like the `useMutation` hook's `executeMutation`.

Go ahead and test the app by running `yarn start` in a terminal and navigating to `http://localhost:3000/search`. Then type a search string into the text field, submit the search, and verify that the links that are being displayed were filtered by your search string.
