---
title: More Mutations and Updating the Store
---

The next piece of functionality that you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the React Components

Once more, the first step to implement this new feature is to make your React components ready for the expected functionality.

</Instruction>

Open `Link.js` and update `render` to look as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
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
        <div className='f6 lh-copy gray'>{this.props.link.votes.length} votes | by {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'} {timeDifferenceForDate(this.props.link.createdAt)}</div>
      </div>
    </div>
  )
}
```

</Instruction>


You're already preparing the `Link` component to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in - that's what your're using the `userId` for. If the `Link` is not associated with a `User`, the user's name will be rendered as `Unknown`.

Notice that you're also using a function called `timeDifferenceForDate` that gets passed the `createdAt` information for each link. The function will take the timestamp and convert it to a string that's more user friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function next so you can import and use it in the `Link` component. 

<Instruction>

Create a new file called `utils.js` in the `/src` directory and paste the following code into it:

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

Back in `Link.js`, import `GC_USER_ID` and `timeDifferenceForDate`  on top the file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { GC_USER_ID } from '../constants'
import { timeDifferenceForDate } from '../utils'
```

</Instruction>


Finally, each `Link` element will also render its position inside the list, so you have to pass down an `index` from the `LinkList` component. 


<Instruction>

Open `LinkList.js` and update the rendering of the `Link` components inside `render` to also incude the link's position:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
{linksToRender.map((link, index) => (
  <Link key={link.id} index={index} link={link}/>
))}
```

</Instruction>


Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

### Updating the Schema

For this new feature, you also need to update the schema again since votes on links will be represented with a custom `Vote` type.

<Instruction>

Open `project.graphcool` and add the following type:

```graphql(path=".../hackernews-react-apollo/project.graphcool")
type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

</Instruction>

Each `Vote` will be associated with the `User` who created it as well as the `Link` that it belongs to. You also have to add the other end of the relation. 

<Instruction>

Still in `project.graphcool`, add the following field to the `User` type:

```graphql(path=".../hackernews-react-apollo/project.graphcool")
votes: [Vote!]! @relation(name: "UsersVotes")
```  

</Instruction>

<Instruction>

Now add another field to the `Link` type:

```graphql(path=".../hackernews-react-apollo/project.graphcool")
votes: [Vote!]! @relation(name: "VotesOnLink")
```

</Instruction>

<Instruction>

Next open up a terminal window and navigate to the directory where `project.graphcool` is located. Then apply your schema changes by typing the following command:

```bash(path=".../hackernews-react-apollo")
graphcool push
```

</Instruction>


Here is what the Terminal output looks like:

```(nocopy)
$ gc push
 ✔ Your schema was successfully updated. Here are the changes: 

  | (+)  A new type with the name `Vote` is created.
  |
  | (+)  The relation `UsersVotes` is created. It connects the type `User` with the type `Vote`.
  |
  | (+)  The relation `VotesOnLink` is created. It connects the type `Link` with the type `Vote`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
```

Awesome! Now that you updated the schema, you can fix the issue that currently prevents you from propery running the app. It can be fixed by including the information about the links' votes in the `allLinks` query that's defined in `LinkList`.

<Instruction>

Open `LinkList.js` and update the definition of `ALL_LINKS_QUERY` to look as follows:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
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
`
```

</Instruction>


All you do here is to also include information about the user who posted a link as well as information about the links' votes in the query's payload. You can now run the app again and the links will be properly displayed. 

![](http://imgur.com/eHaPg3L.png)

Let's now move on and implement the upvote mutation!

### Calling the Mutation

<Instruction>

Open `Link.js` and add the following mutation definition to the bottom of the file. Once more, also replacing the current `export Link` statement:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote(userId: $userId, linkId: $linkId) {
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

export default graphql(CREATE_VOTE_MUTATION, {
  name: 'createVoteMutation'
})(Link)
```

</Instruction>

This step should feel pretty familiar by now. You're adding the ability to call the `createVoteMutation` to the `Link` component by wrapping it with the `CREATE_VOTE_MUTATION`.

<Instruction>

As with the times before, you also need to import the `gql` and `graphql` functions on top of the `Link.js` file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { gql, graphql } from 'react-apollo'
```

</Instruction>

<Instruction>

Finally, you need to implement `_voteForLink` as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
_voteForLink = async () => {
  const userId = localStorage.getItem(GC_USER_ID)
  const voterIds = this.props.link.votes.map(vote => vote.user.id)
  if (voterIds.includes(userId)) {
    console.log(`User (${userId}) already voted for this link.`)
    return
  }

  const linkId = this.props.link.id
  await this.props.createVoteMutation({
    variables: {
      userId,
      linkId
    }
  })
}
```

</Instruction>


Notice that in the first part of the method, you're checking whether the current user already voted for that link. If that's the case, you return early from the method and not actually execute the mutation.

You can now go and test the implementation! Run `yarn start` and click the upvote button on a link. You're not getting any UI feedback yet, but after refreshing the page you'll see the added votes. 

There still is a flaw in the app though. Since the `votes` on a `Link` don't get updated right away, a `User` currently can submit an indefinite number of votes until the page is refreshed. Only then the protection mechanism will apply and instead of an upvote, the click on the voting button will simply result in the  following logging statement in the console: _User (cj42qfzwnugfo01955uasit8l) already voted for this link._

But at least you know that the mutation is working. In the next section, you'll fix the issue and make sure that the cache gets updated directly after each mutation!

### Updating the Cache

One cool thing about Apollo is that you can manually control the contents of the cache. This is really handy, especially after a mutation was performed, since this allows to determine precisely how you want the cache to be updated. Here, you'll use it to make sure the UI displays the correct number of votes right after the `createVote` mutation was performed.

You can implement this functionality by using Apollo's [imperative store API](https://dev-blog.apollodata.com/apollo-clients-new-imperative-store-api-6cb69318a1e3).

<Instruction>

Open `Link` and update the call to `createVoteMutation` inside the `_voteForLink` method as follows:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
const linkId = this.props.link.id
await this.props.createVoteMutation({
  variables: {
    userId,
    linkId
  },
  update: (store, { data: { createVote } }) => {
    this.props.updateStoreAfterVote(store, createVote, linkId)
  }
})
```

</Instruction>


The `update` function that you're adding as an argument to the mutation call will be called when the server returns the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state of the cache. 

Notice that you're already _desctructuring_ the server response and retrieving the `createVote` field from it. 

All right, so now you know what this `update` function is, but the actual implementation will be done in the parent component of `Link`, which is `LinkList`. 

<Instruction>

Open `LinkList.js` and add the following method inside the scope of the `LinkList` component:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
_updateCacheAfterVote = (store, createVote, linkId) => {
  // 1
  const data = store.readQuery({ query: ALL_LINKS_QUERY })
  
  // 2
  const votedLink = data.allLinks.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes
  
  // 3
  store.writeQuery({ query: ALL_LINKS_QUERY, data })
}
```

</Instruction>

What's going on here?

1. You start by reading the current state of the cached data for the `ALL_LINKS_QUERY` from the `store`.
2. Now you're retrieving the link that the user just voted for from that list. You're also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
3. Finally, you take the modified data and write it back into the store.

Next you need to pass this function down to the `Link` so it can be called from there. 

<Instruction>

Still in `LinkList.js`, update the way how the `Link` components are rendered in `render`:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
<Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote}  index={index} link={link}/>
```

</Instruction>

That's it! The `updater` function will now be executed and make sure that the store gets updated properly after a mutation was performed. The store update will trigger a rerender of the component and thus update the UI with the correct information!

While we're at it, let's also implement `update` for adding new links!

<Instruction>

Open `CreateLink.js` and update the call to `createLinkMutation` inside `_createLink` like so:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
await this.props.createLinkMutation({
  variables: {
    description,
    url,
    postedById
  },
  update: (store, { data: { createLink } }) => {
    const data = store.readQuery({ query: ALL_LINKS_QUERY })
    data.allLinks.splice(0,0,createLink)
    store.writeQuery({
      query: ALL_LINKS_QUERY,
      data
    })
  }
})
```

</Instruction>


The `update` function works in a very similar way as before. You first read the current state of the results of the `ALL_LINKS_QUERY`. Then you insert the newest link to the top and write the query results back to the store.

<Instruction>

The last thing you need to do for this to work is add import the `ALL_LINKS_QUERY` into that file:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { ALL_LINKS_QUERY } from './LinkList'
```

</Instruction>


Conversely, it also needs to be exported from where it is defined. 

<Instruction>

Open `LinkList.js` and adjust the definition of the `ALL_LINKS_QUERY` by adding the `export` keyword to it:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const ALL_LINKS_QUERY = ...
```

</Instruction>


Awesome, now the store also updates with the right information after new links are added. The app is getting into shape. 🤓
