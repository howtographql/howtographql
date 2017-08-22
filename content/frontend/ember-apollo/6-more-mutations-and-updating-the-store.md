---
title: "More Mutations and Updating the Store"
pageTitle: "Mutations & Caching with GraphQL, Ember & Apollo Tutorial"
description: "Learn how to use Apollo's imperative store API to update the cache after a GraphQL mutation. The updates will automatically end up in your Ember app."
question: "What does the 'graphcool push' command do?"
answers: ["It uploads the local schema changes to the remote Graphcool project", "It pushes a git repository to Graphcool so you can manage your project and code together", "It tells the server to push its remote schema changes into the local project file", "There is no 'graphcool push' command"]
correctAnswer: 0
---

The next piece of functionality that you’ll implement is the voting feature! Authenticated users are allowed to submit a vote for a link.

### Preparing the Component

Once more, the first step to implement this new feature is to make your component ready for the expected functionality.

<Instruction>

Open the template for your `link-post` component and update it to look as follows:

```hbs(path=".../hackernews-ember-apollo/app/templates/components/link-post.hbs")
<div class='flex mt2 items-start'>
  <div class='flex items-center'>
    <span class='gray'>{{add index 1}}.</span>
    {{#if userLoggedIn}}
      <div class='ml1 gray f11 pointer' {{action 'voteForLink' link.votes link.id}}>
        ▲
      </div>
    {{/if}}
  </div>
  <div class='ml1'>
    <div>{{link.description}} ({{link.url}})</div>
    <div class='f6 lh-copy gray'>{{link.votes.length}} votes | by {{if link.postedBy.name link.postedBy.name 'Unknown'}} {{moment-from-now link.createdAt}}</div>
  </div>
</div>
```

</Instruction>

You’re preparing the `link-post` component to render the number of votes for each link and the name of the user that posted it. Plus you’ll render the upvote button if a user is currently logged in - that’s what you’re using the `userId` for. If the `Link` is not associated with a `User`, the user’s name will be rendered as `Unknown`.

Notice that you’re also using several helpers including `moment-from-now` that gets passed the `createdAt` information for each link. The helper will take the timestamp and convert it to a string that’s more user friendly, e.g. `"3 hours ago"`.

Go ahead and add the `moment-from-now` and `add` helpers next.

<Instruction>

Create a new file called `add.js` in the `app/helpers` directory and paste the following code into it:

```js(path=".../hackernews-ember-apollo/app/helpers/add.js")
import Ember from 'ember';

export function add(params) {
  return params.reduce((a, b) => Number(a) + Number(b));
}

export default Ember.Helper.helper(add);
```

In your terminal, add the `ember-moment` add-on:

```bash
ember install ember-moment
```

Finally, you need to let your `link-post` component know about your `auth` service and the user's currently logged in status:

```js(path=".../hackernews-ember-apollo/app/components/link-post.js")
import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),

  userLoggedIn: Ember.computed.oneWay('auth.isLoggedIn')
});
```

</Instruction>

Notice that the app won’t run at the moment since the `votes` are not yet included in the query. You’ll fix that next!

### Updating the Schema

For this new feature, you also need to update the schema again since votes on links will be represented with a custom `Vote` type.

<Instruction>

Open `project.graphcool` and add the following type:

```graphql(path=".../hackernews-ember-apollo/project.graphcool")
type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

</Instruction>

Each `Vote` will be associated with the `User` who created it as well as the `Link` that it belongs to. You also have to add the other end of the relation.

<Instruction>

Still in `project.graphcool`, add the following field to the `User` type:

```graphql(path=".../hackernews-ember-apollo/project.graphcool")
votes: [Vote!]! @relation(name: "UsersVotes")
```

Now add another field to the `Link` type:

```graphql(path=".../hackernews-ember-apollo/project.graphcool")
votes: [Vote!]! @relation(name: "VotesOnLink")
```

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

Awesome! Now that you updated the schema, you can fix the issue that currently prevents you from properly running the app. It can be fixed by including the information about the links’ votes in the `allLinks` query.

<Instruction>

Open `gql/queries/allLinks.graphql` and update the definition of `AllLinksQuery` to look as follows:

```graphql(path=".../hackernews-ember-apollo/gql/queries/allLinks.graphql")
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
```

</Instruction>

All you do here is to also include information about the user who posted a link as well as information about the links’ votes in the query’s payload. You can now run the app again and the links will be properly displayed. 

Time to move on and implement the upvote mutation!

### Calling the Mutation

<Instruction>

Open the component file for your `link-post` component and add the following import and actions:

```js(path=".../hackernews-ember-apollo/app/components/link-post/component.js")
import Ember from 'ember';
import createVote from 'hackernews-ember-apollo/gql/mutations/createVote';
import allLinks from 'hackernews-ember-apollo/gql/queries/allLinks';

export default Ember.Component.extend({
  actions: {
    voteForLink(votes, linkId) {
      const userId = this.get('auth').getUserId();
      const voterIds = votes.map(vote => vote.user.id);
      if (voterIds.includes(userId)) {
        console.error(`User (${userId}) already voted for this link.`);
        return;
      }

      return this.get('apollo').mutate(
        {
          mutation: createVote,
          variables: { userId, linkId }
        },
        'createVote'
      ).catch(error => alert(error));
    }
  },

  apollo: Ember.inject.service(),

  auth: Ember.inject.service(),

  userLoggedIn: Ember.computed.oneWay('auth.isLoggedIn')
});
```

</Instruction>

This step should feel pretty familiar by now. You’re adding the ability to call the `createVote` mutation to the `link-post` component.

Notice that in the first part of the method, you’re checking whether the current user already voted for that link. If that’s the case, you return early from the method and not actually execute the mutation.

<Instruction>

You need to now add the `createVote` mutation that you imported. Create a new file in `app/gql/mutations` named `createVote` and add these contents:

```graphql(path=".../hackernews-ember-apollo/gql/mutations/createVote.graphql")
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
```

</Instruction>

You can now go and test the implementation! Run `yarn start` and click the upvote button on a link. You’re not getting any UI feedback yet, but after refreshing the page you’ll see the added votes. 

There still is a flaw in the app though. Since the `votes` on a `link-post` don’t get updated right away, a user currently can submit an indefinite number of votes until the page is refreshed. Only then the protection mechanism will apply and instead of an upvote, the click on the voting button will simply result in the following logging statement in the console: *User (cj42qfzwnugfo01955uasit8l) already voted for this link.*

But at least you know that the mutation is working. In the next section, you’ll fix the issue and make sure that the cache gets updated directly after each mutation!

### Updating the Cache

One cool thing about Apollo is that you can manually control the contents of the cache. This is really handy, especially after a mutation was performed, since this allows you to determine precisely how you want the cache to be updated. Here, you’ll use it to make sure the UI displays the correct number of votes right after the `createVote` mutation was performed.
You can implement this functionality by using Apollo’s [imperative store API](https://dev-blog.apollodata.com/apollo-clients-new-imperative-store-api-6cb69318a1e3).

<Instruction>

Open the component file for your `link-post` component and update the call to `ember-apollo-client`s `mutate` method as follows:

```js(path=".../hackernews-ember-apollo/app/components/link-post.js")
return this.get('apollo').mutate(
  {
    mutation: createVote,
    variables: { userId, linkId },
    update: (store, { data: { createVote } }) => {
      // 1.
      const data = store.readQuery({ query: allLinks });
      
      // 2.
      const votedLink = data.allLinks.find(link => link.id === linkId);
      votedLink.votes = createVote.link.votes;
      
      // 3.
      store.writeQuery({ query: allLinks, data });
    }
  },
  'createVote'
).catch(error => alert(error));
```

Also be sure to import the `allLinks.graphql` query that you are using in the update method:

```js(path=".../hackernews-ember-apollo/app/components/link-post.js")
import allLinks from 'hackernews-ember-apollo/gql/queries/allLinks';
```

</Instruction>

The `update` function that you’re adding as an argument to the mutation call will be called when the server returns the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state of the cache. 

Notice that you’re already *destructuring* the server response and retrieving the `createVote` field from it. 

What’s going in the update function?

1. You start by reading the current state of the cached data for the `allLinks` query from the `store`.
2. Now you’re retrieving the link that the user just voted for from that list. You’re also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
3. Finally, you take the modified data and write it back into the store.

While you're at it, also implement `update` for adding new links!

<Instruction>

Open the controller for your `create` route and update the `mutate` method like so:

```js(path=".../hackernews-ember-apollo/app/controllers/create.js")
return this.get('apollo')
  .mutate(
    {
      mutation,
      variables,
      update: (store, { data: { createLink } }) => {
        const data = store.readQuery({ query: allLinks })
        data.allLinks.splice(0,0,createLink)
        store.writeQuery({
          query: allLinks,
          data
        })
      }
    },
    'createLink'
  )
  .then(() => {
    this.set('description', '');
    this.set('url', '');
    this.transitionToRoute('links');
  }).catch(error => alert(error));
```

Also be sure to import the `allLinks.graphql` query that you are using in the update method:

```js(path=".../hackernews-ember-apollo/app/components/link-post.js")
import allLinks from 'hackernews-ember-apollo/gql/queries/allLinks';
```

The `update` function works in a very similar way as before. You first read the current state of the results of the `allLinks` query. Then you insert the newest link to the top and write the query results back to the store.

Awesome, now the store also updates with the right information after new links are added. The app is taking shape. 🤓