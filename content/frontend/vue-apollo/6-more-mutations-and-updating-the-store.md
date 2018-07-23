---
title: More Mutations and Updating the Store
pageTitle: "Mutations & Caching with GraphQL, VueJS & Apollo Tutorial"
description: "Learn how to use Apollo's imperative store API to update the cache after a GraphQL mutation. The updates will automatically end up in your VueJS components."
question: "What does the 'graphcool push' command do?"
answers: ["It uploads the local schema changes to the remote Graphcool project", "It pushes a git repository to Graphcool so you can manage your project and code together", "It tells the server to push its remote schema changes into the local project file", "There is no 'graphcool push' command"]
correctAnswer: 0
---

The next piece of functionality that you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the VueJS Components

Once more, the first step to implement this new feature is to prepare your VueJS components for the new functionality.

<Instruction>

Open `src/components/LinkItem.vue` and update it to look like the following:

```js(path=".../hackernews-vue-apollo/src/components/LinkItem.vue")
<template>
  <div class="flex mt2 items-start">
    <div class="flex items-center">
      <span class="gray">{{linkNumber}}.</span>
      <div v-if="userId" class="ml1 gray f11 upvote" @click="voteForLink()">▲</div>
    </div>
    <div class="ml1">
      <a :href="link.url" class="link">{{link.description}} ({{link.url}})</a>
      <div class="f6 lh-copy gray">
        {{link.votes.length}} votes | by {{link.postedBy ? link.postedBy.name : 'Unknown'}} {{timeDifferenceForDate(link.createdAt)}}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LinkItem',
    computed: {
      userId () {
        return this.$root.$data.userId
      },
      linkNumber () {
        if (this.$route.path.includes('new')) {
          return (this.pageNumber - 1) * this.linksPerPage + (this.index + 1)
        } else {
          return this.index + 1
        }
      }
    },
    props: ['link', 'index'],
    methods: {
      timeDifferenceForDate
    }
  }
</script>

<style scoped>
  .upvote {
    cursor: pointer;
  }

  .link {
    text-decoration: none;
    color: black;
  }
</style>
```

</Instruction>


You're already preparing the `LinkItem` component to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in - that's what you're using the `userId` for. If the `Link` is not associated with a `User`, the user's name will be rendered as `Unknown`.

Notice that you're also using a function called `timeDifferenceForDate` that gets passed the `createdAt` information for each link. The function will take the timestamp and convert it to a string that's more user friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function next so you can import and use it in the `LinkItem` component.

<Instruction>

Create a new directory called `utils` in the `/src` directory and create a an `index.js` file within this directory with the following content:

```js(path=".../hackernews-vue-apollo/src/utils/index.js")
function timeDifference (current, previous) {
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

export function timeDifferenceForDate (date) {
  const now = new Date().getTime()
  const updated = new Date(date).getTime()
  return timeDifference(now, updated)
}
```

</Instruction>


<Instruction>

Back in `src/components/LinkItem.vue`, import `timeDifferenceForDate`  near the top of the `script` block:

```js(path=".../hackernews-vue-apollo/src/components/LinkItem.vue")
import { timeDifferenceForDate } from '../utils'
```

</Instruction>


Finally, each `Link` element will also render its position inside the list, so you have to pass down an `index` from the `LinkList` component.


<Instruction>

Open `src/components/LinkList.vue` and update the rendering of the `LinkItem` components to also include the link's position:

```html(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
<link-item
  v-for="(link, index) in allLinks"
  :key="link.id"
  :link="link"
  :index="index">
</link-item>
```

</Instruction>

Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

### Updating the Schema

For this new feature, you also need to update the schema again since votes on links will be represented with a custom `Vote` type.

<Instruction>

Open `project.graphcool` and add the following type:

```graphql
type Vote @model{
  id: ID! @isUnique
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

</Instruction>

Each `Vote` will be associated with the `User` who created it as well as the `Link` that it belongs to. You also have to add the other end of the relation.

<Instruction>

Still in `project.graphcool`, add the following field to the `User` type:

```graphql
votes: [Vote!]! @relation(name: "UsersVotes")
```

</Instruction>

<Instruction>

Now add another field to the `Link` type:

```graphql
votes: [Vote!]! @relation(name: "VotesOnLink")
```

</Instruction>

<Instruction>

Next, open up a terminal window and navigate to the directory where `project.graphcool` is located. Then apply your schema changes by typing the following command:

```bash
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

Awesome! Now that you updated the schema, you can fix the issue that currently prevents you from properly running the app. It can be fixed by including the information about the links' votes in the `allLinks` query that's defined in `/src/constants/graphql.js`.

<Instruction>

Open `/src/constants/graphql.js` and update the definition of `ALL_LINKS_QUERY` to look as follows:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const ALL_LINKS_QUERY = gql`
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


All you do here is add information about the user who posted a link as well as information about the links' votes in the query's payload. You can now run the app again and the links will be properly displayed.

![](http://imgur.com/j50X5Dm.png)

Let's now move on and implement the upvote mutation!

### Calling the Mutation

<Instruction>

Open `src/constants/graphql.js` and add the following mutation definition to the file:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const CREATE_VOTE_MUTATION = gql`
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
```

</Instruction>

This step should feel pretty familiar by now. You're adding the ability to call the `createVoteMutation` to the `src/constants/graphql.js` file and naming it `CREATE_VOTE_MUTATION`.

<Instruction>

As with the times before, you also need to import this constant near the top of the `script` block in `src/components/LinkItem.vue`. You need to import `GC_USER_ID` as well:

```js(path=".../hackernews-vue-apollo/src/components/LinkItem.vue")
import { CREATE_VOTE_MUTATION } from '../constants/graphql'
import { GC_USER_ID } from '../constants/settings'
```

</Instruction>

<Instruction>

Finally, you need to implement `voteForLink` as follows in `src/components/LinkItem.vue`:

```js(path=".../hackernews-vue-apollo/src/components/LinkItem.vue")
voteForLink () {
  const userId = localStorage.getItem(GC_USER_ID)
  const voterIds = this.link.votes.map(vote => vote.user.id)
  if (voterIds.includes(userId)) {
    alert(`User (${userId}) already voted for this link.`)
    return
  }
  const linkId = this.link.id
  this.$apollo.mutate({
    mutation: CREATE_VOTE_MUTATION,
    variables: {
      userId,
      linkId
    }
  })
}
```

</Instruction>


Notice that in the first part of the method, you're checking whether the current user already voted for that link. If that's the case, you return early from the method and do not actually execute the mutation.

You can now go ahead and test the implementation! Click the upvote button on a link. You're not getting any UI feedback yet, but after refreshing the page you'll see the added votes.

There is still a flaw in the app. Since the `votes` on a `Link` don't get updated right away, a `User` currently can submit an indefinite number of votes until the page is refreshed. Only then will the protection mechanism be applied and instead of an upvote, the click on the voting button will simply result in the  following logging statement in the console: _User (cj42qfzwnugfo01955uasit8l) already voted for this link._

But at least you know that the mutation is working. In the next section, you'll fix the issue and make sure that the cache gets updated directly after each mutation!

### Updating the Cache

One cool thing about Apollo is that you can manually control the contents of the cache. This is really handy, especially after a mutation was performed, since this allows you to determine precisely how you want the cache to be updated. Here, you'll use it to make sure the UI displays the correct number of votes right after the `createVote` mutation is performed.

You can implement this functionality by using Apollo's [imperative store API](https://dev-blog.apollodata.com/apollo-clients-new-imperative-store-api-6cb69318a1e3).

<Instruction>

Open `src/components/LinkItem.vue` and update the call to `CREATE_VOTE_MUTATION` inside the `voteForLink` method as follows:

```js(path=".../hackernews-vue-apollo/src/components/LinkItem.vue")
this.$apollo.mutate({
  mutation: CREATE_VOTE_MUTATION,
  variables: {
    userId,
    linkId
  },
  update: (store, { data: { createVote } }) => {
    this.updateStoreAfterVote(store, createVote, linkId)
  }
})
```

</Instruction>


The `update` function that you're adding as an argument to the mutation will be called when the server returns the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state for the cache.

Notice that you're already _destructuring_ the server response and retrieving the `createVote` field from it.

All right, so now you know what this `update` function is, next you will need to implement the `updateStoreAfterVote` method.

<Instruction>

Still in `src/components/LinkItem.vue`, add the following method:

```js{2-5,7-9,11-12}(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
updateStoreAfterVote (store, createVote, linkId) {
  // 1
  const data = store.readQuery({
    query: ALL_LINKS_QUERY
  })

  // 2
  const votedLink = data.allLinks.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes

  // 3
  store.writeQuery({ query: ALL_LINKS_QUERY, data })
}
```

</Instruction>

<Instruction>

Still in `src/components/LinkItem.vue`, you now need to import `ALL_LINKS_QUERY`:

```js{2-9,5-7,9-10}(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
import { ALL_LINKS_QUERY, CREATE_VOTE_MUTATION } from '../constants/graphql'
```

</Instruction>

What's going on here?

1. You start by reading the current state of the cached data for the `ALL_LINKS_QUERY` from the `store`.
2. Now you're retrieving the link that the user just voted for from that list. You're also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
3. Finally, you take the modified data and write it back into the store.

That's it! The `update` method will now be executed and ensure that the store gets updated properly after a mutation is performed. The store update will trigger a re-render of the component and thus update the UI with the correct information!

Note that we already implemented this same "optimistic UI updating" within the `CreateLink` component in an earlier chapter. The app is rounding into shape! 🤓
