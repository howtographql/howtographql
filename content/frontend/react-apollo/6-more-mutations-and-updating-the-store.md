---
title: More Mutations and Updating the Store
pageTitle: "Mutations & Caching with GraphQL, React & Apollo Tutorial"
description: "Learn how to use Apollo's imperative store API to update the cache after a GraphQL mutation. The updates will automatically end up in your React components."
question: "What does the 'update' function of Apollo Client do?"
answers: ["It allows to update your Apollo Client dependency locally", "It allows to update the local Apollo store in a declarative fashion", "It allows to update the local Apollo store in an imperative fashion", "It updates the GraphQL schema locally so Apollo Client can verify your queries and mutations before they're sent to the server"]
correctAnswer: 0
videoId: ""
duration: 0		
videoAuthor: ""
---

The next piece of functionality you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the React Components

Once more, the first step to implement this new feature is to make your React components ready for the expected functionality.

</Instruction>

Open `Link.js` and update `render` to look as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <div className="ml1 gray f11" onClick={() => this._voteForLink()}>
              ▲
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    )
  }
```

</Instruction>

You're already preparing the `Link` component to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in - that's what you're using the `authToken` for. If the `Link` is not associated with a `User`, the user's name will be displayed as `Unknown`.

Notice that you're also using a function called `timeDifferenceForDate` that gets passed the `createdAt` information for each link. The function will take the timestamp and convert it to a string that's more user friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function next so you can import and use it in the `Link` component.

<Instruction>

Create a new file called `utils.js` in the `src` directory and paste the following code into it:

```js(path=".../hackernews-react-apollo/src/utils.js")
function timeDifference(current, previous) {

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
  }

  else if (elapsed < milliSecondsPerHour) {
    return Math.round(elapsed/milliSecondsPerMinute) + ' min ago'
  }

  else if (elapsed < milliSecondsPerDay ) {
    return Math.round(elapsed/milliSecondsPerHour ) + ' h ago'
  }

  else if (elapsed < milliSecondsPerMonth) {
    return Math.round(elapsed/milliSecondsPerDay) + ' days ago'
  }

  else if (elapsed < milliSecondsPerYear) {
    return Math.round(elapsed/milliSecondsPerMonth) + ' mo ago'
  }

  else {
    return Math.round(elapsed/milliSecondsPerYear ) + ' years ago'
  }
}

export function timeDifferenceForDate(date) {
  const now = new Date().getTime()
  const updated = new Date(date).getTime()
  return timeDifference(now, updated)
}
```

</Instruction>

<Instruction>

Back in `Link.js`, import `AUTH_TOKEN` and `timeDifferenceForDate`  on top the file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'
```

</Instruction>

Finally, each `Link` element will also render its position inside the list, so you have to pass down an `index` from the `LinkList` component.

<Instruction>

Open `LinkList.js` and update the rendering of the `Link` components inside `render` to also include the link's position:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
return (
  <div>
    {linksToRender.map((link, index) => (
      <Link key={link.id} index={index} link={link} />
    ))}
  </div>
)
```

</Instruction>

Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

<Instruction>

Open `LinkList.js` and update the definition of `FEED_QUERY` to look as follows:

```js{9-18}(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const FEED_QUERY = gql`
  query FeedQuery {
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

All you do here is include information about the user who posted a link as well as information about the links' votes in the query's payload. You can now run the app again and the links will be properly displayed.

![](https://imgur.com/tKzj3b5.png)

Let's now move on and implement the `vote` mutation!

### Calling the Mutation

<Instruction>

Open `Link.js` and add the following mutation definition to the bottom of the file. Once more, also replacing the current `export Link` statement:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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
`

export default graphql(VOTE_MUTATION, {
  name: 'voteMutation',
})(Link)
```

</Instruction>

This step should feel pretty familiar by now. You're adding the ability to call the `voteMutation` to the `Link` component by wrapping it with `VOTE_MUTATION`.

<Instruction>

As before, you also need to import the `gql` and `graphql` functions on top of the `Link.js` file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

<Instruction>

Finally, you need to implement `_voteForLink` as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
_voteForLink = async () => {
  const linkId = this.props.link.id
  await this.props.voteMutation({
    variables: {
      linkId,
    },
  })
}
```

</Instruction>

You can now go and test the implementation! Run `yarn start` in `hackernews-react-apollo` and click the upvote button on a link. You're not getting any UI feedback yet, but after refreshing the page you'll see the added votes.

In the next section, you'll learn how to automatically update the UI after each mutation!

### Updating the cache

One cool thing about Apollo is that you can manually control the contents of the cache. This is really handy, especially after a mutation was performed. It allows to precisely determine how you want the cache to be updated. Here, you'll use it to make sure the UI displays the correct number of votes right after the `vote` mutation was performed.

You will implement this functionality by using Apollo's [imperative store API](https://dev-blog.apollodata.com/apollo-clients-new-imperative-store-api-6cb69318a1e3).

<Instruction>

Open `Link` and update the call to `voteMutation` inside the `_voteForLink` method as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
_voteForLink = async () => {
  const linkId = this.props.link.id
  await this.props.voteMutation({
    variables: {
      linkId,
    },
    update: (store, { data: { vote } }) => {
      this.props.updateStoreAfterVote(store, vote, linkId)
    },
  })
}
```

</Instruction>

The `update` function that you're adding as an argument to the mutation invocation will be called directly after the server returned the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state for the cache.

Notice that you're already _destructuring_ the server response and retrieving the `vote` field from it.

All right, so now you know what this `update` function is, but the actual implementation will be done in the parent component of `Link`, which is `LinkList`.

<Instruction>

Open `LinkList.js` and add the following method inside the scope of the `LinkList` component:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_updateCacheAfterVote = (store, createVote, linkId) => {
  // 1
  const data = store.readQuery({ query: FEED_QUERY })

  // 2
  const votedLink = data.feed.links.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes

  // 3
  store.writeQuery({ query: FEED_QUERY, data })
}
```

</Instruction>

What's going on here?

1. You start by reading the current state of the cached data for the `FEED_QUERY` from the `store`.
1. Now you're retrieving the link that the user just voted for from that list. You're also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
1. Finally, you take the modified data and write it back into the store.

Next you need to pass this function down to the `Link` so it can be called from there.

<Instruction>

Still in `LinkList.js`, update the way how the `Link` components are rendered in `render`:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
<Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} index={index} link={link}/>
```

</Instruction>

That's it! The `update` function will now be executed and make sure that the store gets updated properly after a mutation was performed. The store update will trigger a rerender of the component and thus update the UI with the correct information!

While we're at it, let's also implement `update` for adding new links!

<Instruction>

Open `CreateLink.js` and update the call to `postMutation` inside `_createLink` like so:

```js{6-13}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
await this.props.postMutation({
  variables: {
    description,
    url,
  },
  update: (store, { data: { post } }) => {
    const data = store.readQuery({ query: FEED_QUERY })
    data.feed.links.splice(0, 0, post)
    store.writeQuery({
      query: FEED_QUERY,
      data,
    })
  },
})
```

</Instruction>

The `update` function works in a very similar way as before. You first read the current state of the results of the `FEED_QUERY`. Then you insert the newest link at index `0` and write the query results back to the store.

<Instruction>

The last thing you need to do for this to work is import the `FEED_QUERY` into that file:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { FEED_QUERY } from './LinkList'
```

</Instruction>

Conversely, it also needs to be exported from where it is defined.

<Instruction>

Open `LinkList.js` and adjust the definition of the `FEED_QUERY` by adding the `export` keyword to it:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const FEED_QUERY = ...
```

</Instruction>

Awesome, now the store also updates with the right information after new links are added. The app is getting into shape. 🤓
