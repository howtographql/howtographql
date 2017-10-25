---
title: More Mutations and Updating the Store
pageTitle: "Mutations & Caching with GraphQL, Angular & Apollo Tutorial"
description: "Learn how to use Apollo's imperative store API to update the cache after a GraphQL mutation. The updates will automatically end up in your Angular components."
question: "What does the 'graphcool push' command do?"
answers: ["It uploads the local schema changes to the remote Graphcool project", "It pushes a git repository to Graphcool so you can manage your project and code together", "It tells the server to push its remote schema changes into the local project file", "There is no 'graphcool push' command"]
correctAnswer: 0
---

The next piece of functionality that you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route!

### Preparing the Angular Components

Once more, the first step to implement this new feature is to prepare your Angular components for the new functionality.

<Instruction>

Open `src/app/link-item/link-item.component.html` and update it to look like the following:

```html(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.html")
<div class="flex mt2 items-start">
  <div class="flex items-center">
    <span class="gray">{{index+1}}.</span>
    <div *ngIf="isAuthenticated" class="ml1 gray f11 upvote" (click)="voteForLink()">▲</div>
  </div>
  <div class="ml1">
    <a [href]="link.url" class="link">{{link.description}} ({{link.url}})</a>
    <div class="f6 lh-copy gray">
      {{link.votes.length}} votes | by {{link.postedBy ? link.postedBy.name : 'Unknown'}}
      {{humanizeDate(link.createdAt)}}
    </div>
  </div>
</div>
```

</Instruction>

<Instruction>

Then, update the code in `login.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
// ...

export class LinkItemComponent implements OnInit, OnDestroy {
  @Input()
  link: Link;

  @Input()
  index: number = 0;

  @Input()
  isAuthenticated: boolean = false;

  subscriptions: Subscription[] = [];

  constructor() {
  }

  ngOnInit() {
  }

  voteForLink = async () => {
    // ... you'll implement this in chapter 6
  }

  humanizeDate(date: string) {
    return timeDifferenceForDate(date);
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
```
</Instruction>

<Instruction>
Finally, add the following code in `login.component.css` :

```css(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.css")
.upvote {
  cursor: pointer;
}

.link {
  text-decoration: none;
  color: black;
}

```

</Instruction>


You're already preparing the `LinkItemComponent` to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in - that's what you're using the `isAuthenticated` for. If the `Link` is not associated with a `User`, the user's name will be rendered as `Unknown`.

Notice that you're also using a function called `timeDifferenceForDate` that gets passed the `createdAt` information for each link. The function will take the timestamp and convert it to a string that's more user friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function next so you can import and use it in the `LinkItemComponent`.

<Instruction>

Create a new file called `utils` in the `/src/app` directory with the following content:

```ts(path=".../hackernews-angular-apollo/src/app/utils.ts")
function timeDifference(current: number, previous: number) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current - previous;

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

export function timeDifferenceForDate(date: string) {
  const now = new Date().getTime();
  const updated = new Date(date).getTime();
  return timeDifference(now, updated);
}

```

</Instruction>


<Instruction>

Back in `src/app/link-item/link-item.component.ts`, import `timeDifferenceForDate`  at the top :

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
import {timeDifferenceForDate} from '../utils';
```

</Instruction>


Finally, each `Link` element will also render its position inside the list, so you have to pass down an `index` from the `LinkListComponent` and know also if the user is authenticated through the `isAuthenticated` property passed down.


<Instruction>

Open `src/app/link-list/link-list.component.html` and update the rendering of the `LinkItemComponent` to also include the link's position and the authentication state:

```html(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.html")
<h4 *ngIf="loading">Loading...</h4>
<hn-link-item
  *ngFor="let link of allLinks;let index=index"
  [link]="link"
  [index]="index"
  [isAuthenticated]="logged">
</hn-link-item>

```
</Instruction>

<Instruction>
Then, go ahead and update `src/app/link-list/link-list.component.ts` to look like the following:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
export class LinkListComponent implements OnInit, OnDestroy {
  allLinks: Link[] = [];
  loading: boolean = true;

  logged: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(private apollo: Apollo, private authService: AuthService) {
  }

  ngOnInit() {

    this.authService.isAuthenticated
      .distinctUntilChanged()
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

    const querySubscription = this.apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    }).valueChanges.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      this.loading = response.data.loading;
    });

    this.subscriptions = [...this.subscriptions, querySubscription];

  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
```

</Instruction>

Notice that the app won't run at the moment since the `votes` are not yet included in the query. You'll fix that next!

### Updating the Schema

For this new feature, you also need to update the schema again since votes on links will be represented with a custom `Vote` type.

<Instruction>

Open `types.graphql` and add the following type:

```graphql
type Vote {
  id: ID! @isUnique
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

</Instruction>

Each `Vote` will be associated with the `User` who created it as well as the `Link` that it belongs to. You also have to add the other end of the relation.

<Instruction>

Still in `types.graphql`, add the following field to the `User` type:

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

Next, open up a terminal window and navigate to the directory where `types.graphql` is located. Then apply your schema changes by typing the following command:

```bash(path=".../hackernews-angular-apollo/graphcool")
graphcool deploy
```

</Instruction>


Here is what the Terminal output looks like:

```(nocopy)
$ graphcool deploy
 ✔ Your schema was successfully updated. Here are the changes:

  | (+)  A new type with the name `Vote` is created.
  |
  | (+)  The relation `UsersVotes` is created. It connects the type `User` with the type `Vote`.
  |
  | (+)  The relation `VotesOnLink` is created. It connects the type `Link` with the type `Vote`.

```


<Instruction>

With these changes in the schema,you now need to make a couple more changes to `src/app/types.ts` to reflect these updates in your typescript types. We create the `Vote` class then update the `Link` and `User` class.

```ts(path=".../hackernews-angular-apollo/src/app/types.ts")
export class Link {
  id?: string;
  description?: string;
  url?: string;
  createdAt?: string;
  postedBy?: User;
  votes?: Vote[];
}

export class User {
  id?: string;
  name?: string;
  email?: string;
  votes?: Vote[];
}

export class Vote {
  id?: string;
  user?: User;
  link?: Link;
}

```

</Instruction>


Awesome! Now that you updated the schema and the typescript types, you can fix the issue that currently prevents you from properly running the app. It can be fixed by including the information about the links' votes in the `allLinks` query that's defined in `/src/app/graphql.ts`.

<Instruction>

Open `/src/app/graphql.ts` and update the definition of `ALL_LINKS_QUERY` to look as follows:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
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

![](https://i.imgur.com/8WLXSIe.png)

Let's now move on and implement the upvote mutation!

### Calling the Mutation

<Instruction>

Open `src/app/graphql.ts` and add the following mutation definition to the file:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
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
`;

export interface CreateVoteMutationResponse {
  loading: boolean;
  createVote: {
    id: string;
    link: Link;
    user: User;
  };
}

```

</Instruction>

This step should feel pretty familiar by now. You're adding the ability to call the `createVoteMutation` to the `src/app/graphql.ts` file and naming it `CREATE_VOTE_MUTATION`.

<Instruction>

As with the times before, you also need to import this constant near the top of the `script` block in `src/app/link-item/link-item.component.ts`. You need to import `GC_USER_ID` as well:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
import { CREATE_VOTE_MUTATION } from '../app/graphql'
import { GC_USER_ID } from '../app/constants'
```

</Instruction>

<Instruction>

Finally, you need to implement `voteForLink` as follows in `src/app/link-item/link-item.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
voteForLink() {
    const userId = localStorage.getItem(GC_USER_ID);
    const voterIds = this.link.votes.map(vote => vote.user.id);
    if (voterIds.includes(userId)) {
      alert(`User (${userId}) already voted for this link.`);
      return
    }
    const linkId = this.link.id;

    const mutationSubscription = this.apollo.mutate({
      mutation: CREATE_VOTE_MUTATION,
      variables: {
        userId,
        linkId
      }
    })
      .subscribe();

    this.subscriptions = [...this.subscriptions, mutationSubscription];
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

Open `src/app/link-item/link-item.component.ts` and update the call to `CREATE_VOTE_MUTATION` inside the `voteForLink` method as follows:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
const mutationSubscription = this.apollo.mutate({
      mutation: CREATE_VOTE_MUTATION,
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.updateStoreAfterVote(store, createVote, linkId)
      }
    })
      .subscribe();
```

</Instruction>


The `update` function that you're adding as an argument to the mutation will be called when the server returns the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state for the cache.

Notice that you're already _destructuring_ the server response and retrieving the `createVote` field from it.

All right, so now you know what this `update` function is,
but the actual implementation of the `updateStoreAfterVote` will be done in the parent component of `LinkItemComponent`, which is `LinkListComponent`.

<Instruction>

Open `src/app/link-list/link-list.component.ts` and add the following method inside the `LinkListComponent`:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
updateStoreAfterVote (store, createVote, linkId) {
    // 1
    const data = store.readQuery({
      query: ALL_LINKS_QUERY
    });

    // 2
    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    // 3
    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }
```
</Instruction>

What's going on here?

1. You start by reading the current state of the cached data for the `ALL_LINKS_QUERY` from the `store`.
2. Now you're retrieving the link that the user just voted for from that list. You're also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
3. Finally, you take the modified data and write it back into the store.

<Instruction>

Then in `src/app/link-item/link-item.component.ts`, don't forgot to add `@Input` for the `updateStoreAfterVote` callback :

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
@Input()
updateStoreAfterVote: UpdateStoreAfterVoteCallback;
```

</Instruction>

<Instruction>

The `UpdateStoreAfterVoteCallback` interface is defined as following:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
interface UpdateStoreAfterVoteCallback {
  (proxy: DataProxy, mutationResult: FetchResult<CreateVoteMutationResponse>, linkId: string);
}
```

</Instruction>


<Instruction>

Still in `src/app/link-item/link-item.component.ts`, you now need to import `ALL_LINKS_QUERY`:

```ts{2-9,5-7,9-10}(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
import { ALL_LINKS_QUERY, CREATE_VOTE_MUTATION } from '../app/graphql'
```

</Instruction>

That's it! The `update` method will now be executed and ensure that the store gets updated properly after a mutation is performed. The store update will trigger a re-render of the component and thus update the UI with the correct information!

Note that we already implemented this same "optimistic UI updating" within the `CreateLink` component in an earlier chapter. The app is rounding into shape! 🤓
