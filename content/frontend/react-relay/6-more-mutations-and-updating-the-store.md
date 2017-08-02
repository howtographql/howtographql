---
title: More Mutations and Updating the Store
pageTitle: "Mutations & Caching with GraphQL, React & Relay Tutorial"
description: "Learn how to use Relay Modern's imperative API to update the cache after a GraphQL mutation. The updates will automatically end up in your React components."
videoId: yfercdQVFFk
duration: 14
question: "What's the purpose of the 'updater' and 'optimisticUpdater' functions?"
answers: ["They allow to update the state of your React components after the response for a query was received", "They allow to update the UI after the response for a query was received", "They allow to update the UI after a mutation was performed", "They allow to update the Relay Store after mutation was performed."]
correctAnswer: 3
---

The next piece of functionality that you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the React Components

Once more, the first step to implement this new feature is to make your React components ready for the expected functionality.

</Instruction>

Open `Link.js` and update `render` to look as follows:

```js(path=".../hackernews-react-relay/src/components/Link.js")
render() {
  const userId = localStorage.getItem(GC_USER_ID)
  return (
    <div className='flex mt2 items-start'>
      <div className='flex items-center'>
        <span className='gray'>{this.props.index + 1}.</span>
        {userId && <div className='ml1 gray f11' onClick={() => this._voteForLink()}>▲</div>}
      </div>
      <div className='ml1'>
        <div>{this.props.link.description} ({this.props.link.url})</div>
        <div className='f6 lh-copy gray'>{this.props.link.votes.count} votes | by {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'} {timeDifferenceForDate(this.props.link.createdAt)}</div>
      </div>
    </div>
  )
}
```

</Instruction>


You're already preparing the `Link` component to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in - that's what you're using the `userId` for. If the `Link` is not associated with a `User`, the user's name will be rendered as `Unknown`.

Notice that you're also using a function called `timeDifferenceForDate` that gets passed the `createdAt` information for each link. The function will take the timestamp and convert it to a string that's more user friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function next so you can import and use it in the `Link` component. 

<Instruction>

Create a new file called `utils.js` in the `/src` directory and paste the following code into it:

```js(path=".../hackernews-react-relay/src/utils.js")
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

Back in `Link.js`, import `GC_USER_ID` and `timeDifferenceForDate`  on top the file:

```js(path=".../hackernews-react-relay/src/components/Link.js")
import { GC_USER_ID } from '../constants'
import { timeDifferenceForDate } from '../utils'
```

</Instruction>


Finally, each `Link` element will also render its position inside the list, so you have to pass down an `index` from the `LinkList` component. 

<Instruction>

Open `LinkList.js` and update the rendering of the `Link` components inside `render` to also include the link's position:

```js(path=".../hackernews-react-relay/src/components/LinkList.js")
{this.props.viewer.allLinks.edges.map(({node}, index) => (
  <Link key={node.__id} index={index} link={node}/>
))}
```

</Instruction>

Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

<Instruction>

Open `Link.js` and update the fragment that's passed into `createFragmentContainer` to look as follows:

```js(path=".../hackernews-react-relay/src/components/Link.js")
fragment Link_link on Link {
  id
  description
  url
  createdAt
  postedBy {
    id
    name
  }
  votes {
    count
  }
}
```

</Instruction>


All you do here is to also include information about the user who posted a link as well as information about the links' votes in the query's payload. 

Before you're running the app again, you'll have to invoke the Relay Compiler again since you made changes to code that was tagged with the `graphql` function.

<Instruction>

Open a terminal and navigate to the project's root directory, then invoke the compiler like before:

```bash(path=".../hackernews-react-relay")
relay-compiler --src ./src --schema ./schema.graphql
```

</Instruction>

You can now run the app again and will see the links being rendered with the additional information that you just added!

![](http://imgur.com/eHaPg3L.png)

Let's now move on and implement the upvote mutation!

### Writing the Mutation & Updating the Cache

<Instruction>

Create a new file called `CreateVoteMutation.js` and put it into the  `mutations` folder. Then paste this code into it:

```js(path=".../hackernews-react-relay/src/mutations/CreateVoteMutation.js")
import {
  commitMutation,
  graphql
} from 'react-relay'
import environment from '../Environment'
import { ConnectionHandler } from 'relay-runtime'

const mutation = graphql`
  mutation CreateVoteMutation($input: CreateVoteInput!) {
    createVote(input: $input) {
      vote {
        id
        link {
          id
          votes {
            count
          }
        }
        user {
          id
        }
      }
    }
  }
`

export default (userId, linkId) => {
  const variables = {
    input: {
      userId,
      linkId,
      clientMutationId: ""
    },
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      optimisticUpdater: proxyStore => {
        // ... you'll implement this in a bit
      },
      updater: proxyStore => {
        // ... this as well
      },
      onError: err => console.error(err),
    },
  )
}
```

</Instruction>

This mostly looks pretty familiar! After importing all dependencies, you're defining the `createVote` mutation and then export a function in which you're calling `commitMutation` with some `variables` and the `environment`.

However, the `optimisticUpdater` and `updater` callbacks are new. Let's quickly discuss them to understand their roles!

The `proxyStore` that's being passed into them allows you to directly manipulate the cache with the changes you expect to happen through this mutation.

`optimisticUpdater` is triggered right after the mutation is sent (before the server response comes back) - it allows you to implement the _success scenario_ of the mutation so that the user sees the effect of her mutation right away without having to wait for the server response.

`updater` is triggered when the actual server response comes back. If `optimisticUpdater` is implemented, then any changes that were introduced through it will be rolled back before `updater` is executed.

Go ahead and implement them!

<Instruction>

Still in `CreateVoteMutation.js`, implement the two functions like so:

```js(path=".../hackernews-react-relay/src/mutations/CreateVoteMutation.js")
optimisticUpdater: proxyStore => {
  const link = proxyStore.get(linkId)
  const currentVoteCount = link.getLinkedRecord('votes').getValue('count')
  const newVoteCount = currentVoteCount + 1

  link.getLinkedRecord('votes').setValue(newVoteCount, 'count')
},
updater: proxyStore => {
  const createVoteField = proxyStore.getRootField('createVote')
  const newVote = createVoteField.getLinkedRecord('vote')
  const updatedLink = newVote.getLinkedRecord('link')
  const newVotes = updatedLink.getLinkedRecord('votes')
  const newVoteCount = newVotes.getValue('count')

  const link = proxyStore.get(linkId)
  link.getLinkedRecord('votes').setValue(newVoteCount, 'count')
},
```

</Instruction>

All right, what's going on here? Recall that the `optimisticUpdater` is called _before_ the server's response is received. This allows you to directly update the state of your app _optimistically_, i.e. with the _expected behaviour_. In your case, the expected behaviour is that the vote count for the link will be increased by one.

You can implement this by first retrieving the link that's identified by `linkId` from the cache using `proxyStore.get(linkId)` and manually increment its number of votes by one.

In the `updater` on the other hand, you can work with the _actual_ server response. After the mutation was performed, you can retrieve the data from its payload by calling `proxyStore.getRootField('createVote')`. Here, `createVote` is the _root field_ of the mutation that you just sent!

From here, you can access the mutation payload by retrieving the _linked records_, i.e. traversing the payload of the mutation (by first accessing the `vote`, then the `link` and finally the `votes` field) from where you can retrieve the `count` value which is a _scalar_ value that can be accessed with `getValue`.

Once you did that, you effectively have the new number of votes available that was returned by the server. Now, you can use the same approach as in the `optimisticUpdater` to make sure that the link that's identified by `linkId` receives a new value for its number of votes. 

> Unfortunately, there is almost no reference documentation on the types that are used for the imperative store API. In case you want to learn more about their capabilities, check out the [type definitions](https://github.com/facebook/relay/blob/634fca46c036ec34301c627e7f766092b9c66daa/packages/relay-runtime/store/RelayStoreTypes.js) in the GitHub repo.


### Calling the Mutation

Next, you'll enable the user to actually call the mutation from within the `Link` component.

<Instruction>

Open `Link.js` and implement `_createVote` like so:

```js(path=".../hackernews-react-relay/src/components/Link.js")
_voteForLink = async () => {
  const userId = localStorage.getItem(GC_USER_ID)
  if (!userId) {
    console.log(`Can't vote without user ID`)
    return
  }

  const linkId = this.props.link.id

  const canUserVoteOnLink = await this._userCanVoteOnLink(userId, linkId)
  if (canUserVoteOnLink) {
    CreateVoteMutation(userId, linkId)
  } else {
    console.log(`Current already voted for that link`)
  }
}
```

</Instruction>

You're first retrieving the user's ID from `localStorage` to make sure a user is logged in that can actually cast a vote.

You're then calling a `_userCanVoteOnLink` method (that's not yet implemented) to determine whether the user had already voted on that link before. If that's the case, the function will return `false` and the corresponding message will be printed. Otherwise, you're calling the `CreateUserMutation` passing the IDs of the `User` and the `Link`.

But how can you actually implement the `_userCanVoteOnLink` method? Here is what it looks like:

<Instruction>

Still in `Link.js`, paste the following method into the scope of the `Link` component:

```js(path=".../hackernews-react-relay/src/components/Link.js")
_userCanVoteOnLink = async (userId, linkId) => {
  const checkVoteQueryText = `
  query CheckVoteQuery($userId: ID!, $linkId: ID!) {
    viewer {
      allVotes(filter: {
        user: { id: $userId },
        link: { id: $linkId }
      }) {
        edges {
          node {
            id
          }
        }
      }
    }
  }`
  const checkVoteQuery = { text: checkVoteQueryText }

  const result = await this.props.relay.environment._network.fetch(checkVoteQuery, {userId, linkId})
  return result.data.viewer.allVotes.edges.length === 0
}
```

</Instruction>

That's new - what is going on? Basically what's happening is that you're sending a single query directly to the server without using the `QueryRenderer` abstraction. You can do so by simply writing the query in a string (which you store in `checkVoteQueryText`). You're then constructing an object that represents the query (`checkVoteQuery`) and finally use the `fetch` function that's exposed by the `Network` inside the Relay `Environment` which you can access through the `relay` prop that every component that's wrapped with `createFragmentContainer` has access to. Phew!

The query that you send filters all the votes in the database for a vote that has been casted by the user with `userId` for the link with `linkId`. If such a vote is found, it means the user must not vote again on that link - otherwise it's ok.

Finally you need to import the `CreateVoteMutation` and run the Relay Compiler again.

<Instruction>

Again in `Link.js`, add the following import to the top of the file:

```js(path=".../hackernews-react-relay/src/components/Link.js")
import CreateVoteMutation from '../mutations/CreateVoteMutation'
```

</Instruction>


<Instruction>

Then compile the `graphql` code. In a terminal, call the following command from the root directory of the project:

```bash(path=".../hackernews-react-relay")
relay-compiler --src ./src --schema ./schema.graphql
```

</Instruction>

Fantastic! If you run the app you'll be able to vote on the different links that have been posted. 👏

![](http://imgur.com/RUBwP7H.png)

The app is getting into shape!
