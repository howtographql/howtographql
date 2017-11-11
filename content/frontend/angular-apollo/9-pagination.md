---
title: Pagination
pageTitle: "Pagination with GraphQL, Angular & Apollo Tutorial"
description: "Learn how to implement limit-offset pagination with GraphQL and Apollo Client in a Angular app. The Graphcool API exposes the required arguments for lists."
question: "How do you access information about the current page URL?"
answers: ["A GraphQL query", "Import & use the router-info package", "By injecting the ActivatedRoute service and using the params method", "You can not gain access to this information"]
correctAnswer: 2
---

The last topic that we'll cover in this tutorial is pagination. You'll implement a simple pagination approach so that users can view the links in smaller chunks rather than having an incredibly long list of `Link` elements.


## Preparing the Angular Components

Once more, you first need to prepare the Angular components for this new functionality. In fact, we'll slightly adjust the current routing setup. Here's the idea: The `LinkListComponent`  will be used for two different use cases (and routes). The first one is to display the 10 top voted links. Its second use case is to present new links in a list separated into multiple pages that the user can navigate through.

<Instruction>


Open `src/app/app.routing.ts` and adjust the routes like so:

```ts{13-27}(path=".../hackernews-angular-apollo/src/app/app.routing.ts")
routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/new/1'
  },
  {
    path: 'new/:page',
    component: LinkListComponent,
    pathMatch: 'full'
  },
  {
    path: 'top',
    component: LinkListComponent,
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: CreateLinkComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full'
  },
  {
    path: 'search',
    component: SearchComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
  }
];
```

</Instruction>


You added two new routes: `/top` and `/new/:page`. The second one reads the value for `page` from the URL so that this information is available inside the component that's rendered, here that's `LinkListComponent`.

The root route `''` now redirects to the first page of the route where new posts are displayed.

You need to update the `HeaderComponent` to show the new `/top` route:

<Instruction>

Open `src/app/header/header.component.html` and add `top`. This component's template should now look like this:

```html{6-7}(path=".../hackernews-angular-apollo/src/app/header/header.component.html")
<div class="flex pa1 justify-between nowrap orange">
  <div class="flex flex-fixed black">
    <div class="fw7 mr1">Hacker News</div>
    <a [routerLink]="['/']" class='ml1 no-underline black'>new</a>
    <div class="ml1">|</div>
    <a [routerLink]="['/top']" class='ml1 no-underline black'>top</a>
    <div class="ml1">|</div>
    <a [routerLink]="['/search']" class='ml1 no-underline black'>search</a>
    <div class="flex" *ngIf="logged">
      <div class="ml1">|</div>
      <a [routerLink]="['/create']" class='ml1 no-underline black'>submit</a>
    </div>
  </div>
  <div class="flex flex-fixed">
    <div *ngIf="logged" class="ml1 pointer black" (click)="logout()">logout</div>
    <a *ngIf="!logged" [routerLink]="['/login']" class='ml1 no-underline black'>login</a>
  </div>
</div>
```

</Instruction>

We need to add quite a bit of logic to the `LinkListComponent` to account for the two different responsibilities that it now has.

<Instruction>

Open `src/app/graphql.ts` and add three arguments to the `AllLinksQuery` by replacing the `ALL_LINKS_QUERY` definition with the following. Note that you are also adding the `count` property from `_allLinksMeta` so that you have access to the count of links:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
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
    _allLinksMeta {
      count
    }
  }
`;

export interface AllLinkQueryResponse {
  allLinks: Link[];
  _allLinksMeta: { count: number };
  loading: boolean;
}
```

</Instruction>


The query now accepts arguments that we'll use to implement pagination and ordering. `skip` defines the _offset_ where the query will start. If you passed a value of, e.g. `10` to this argument, it means that the first 10 items of the list will not be included in the response. `first` then defines the _limit_, or _how many_ elements; you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.

You need to update the references to this query in the `CreateLink` component.

<Instruction>

Open `src/app/create-link/create-link.component.ts` and update the `update` callback within the mutation to look like this:

```ts{47-51,57-61}(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: 5,
            skip: 0,
            orderBy: 'createdAt_DESC'
          }
        });

        data.allLinks.push(createLink);
        store.writeQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: 5,
            skip: 0,
            orderBy: 'createdAt_DESC'
          },
          data
        })
      },
```

Here you are merely adding the variables that this query now expects.

</Instruction>

<Instruction>

Next, open `src/app/link-list/link-list.component.ts` and update `watchQuery` function call:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
    // 0
    const pageParams$: Observable<number> = this.route.paramMap
      .map((params) => {
        return parseInt(params.get('page'), 10);
      });

    // 1
    const path$: Observable<string> = this.route.url
      .map((segments) => segments.toString());

    // 2
    this.first$ = path$
      .map((path) => {
        const isNewPage = path.includes('new');
        return isNewPage ? this.linksPerPage : 100;
      });

    // 3
    this.skip$ = Observable.combineLatest(path$, pageParams$)
      .map(([path, page]) => {
        const isNewPage = path.includes('new');
        return isNewPage ? (page - 1) * this.linksPerPage : 0;
      });

    // 4
    this.orderBy$ = path$
      .map((path) => {
        const isNewPage = path.includes('new');
        return isNewPage ? 'createdAt_DESC' : null;
      });

    // 5
    const getQuery = (variables): Observable<ApolloQueryResult<AllLinkQueryResponse>> => {
      const query = this.apollo.watchQuery<AllLinkQueryResponse>({
        query: ALL_LINKS_QUERY,
        variables
      });

      // Call .subscribeToMore on the query for NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION omitted

      return query.valueChanges;
    };


    const allLinkQuery: Observable<ApolloQueryResult<AllLinkQueryResponse>> = Observable
      // 6
      .combineLatest(first$, skip$, orderBy$, (first, skip, orderBy) => ({ first, skip, orderBy }))
      // 7
      .switchMap((variables: any) =>  getQuery(variables));

    // 8
    const querySubscription = allLinkQuery.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      this.count = response.data._allLinksMeta.count;
      this.loading = response.data.loading;
    });
```

</Instruction>

Let's retake a close look to understand what's going on:

0. You define the `pageParams$` observable based on the `this.route.paramMap` where we retrieve all the `params` and map it to get only the `page` param, then we parse in `number`
1. We perform kinds of the same thing for the `path$` observable that we create from `this.route.url`, a `SegmentUrl` converted in `string`
2. Now, we begin to create the first stream, that will be used as `variables` in the `watchQuery` function, `first$`. `first$` used to calculate the chunk of links that you retrieve.
3. Then, we declare `skip$`, the second variable that will enable us to perform the chunk of links that you retrieve
4. Afterwards, we provide `orderBy$` that will include the ordering attribute `createdAt_DESC` for the `new` page to make sure the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes for each link.
5. We create the `getQuery` function that will receive the variables (the values of `first$`, `skip$` and `orderBy$` ) in parameter, set it in the options and returns the `Observable` of `valueChanges`. Note, that we also perform the `subscribeToMore`.
6. Now, we combine all observables of `first$`, `skip$` and `orderBy$`,  get their values  and create  an object having the property first, skip, orderBy
7. Then we retrieve the object created by the combination of  `first$`, `skip$` and `orderBy$` to provide it to the `getQuery` function. Due the fact that `getQuery` returns an `Observable<ApolloQueryResult<AllLinkQueryResponse>>`, we will get an `Observable<Observable<ApolloQueryResult<AllLinkQueryResponse>>>` if we use the `.map` operator. Therefore, we use `switchMap` to "flatten" the `Observable<Observable<ApolloQueryResult<AllLinkQueryResponse>>>` to an `Observable<ApolloQueryResult<AllLinkQueryResponse>>`
8. In the end, We execute the query and save the `allLinks` and the `count`

You also need to define the `LINKS_PER_PAGE` constant and then import it into the `LinkListComponent` as well as the `LinkItemComponent`.

<Instruction>

Open `src/app/constants.ts` and add the following definition:

```ts(path=".../hackernews-angular-apollo/src/app/constants.ts")
export const LINKS_PER_PAGE = 5;
```

</Instruction>

<Instruction>

Still in the `LinkListComponent`, add the following variables:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
  first$: Observable<number>;
  skip$: Observable<number>;
  orderBy$: Observable<string | null>;
```

</Instruction>


<Instruction>

Now add an import statement from `../app/constants` in `src/app/link-list/link-list.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
import { LINKS_PER_PAGE } from '../app/constants';
```

</Instruction>

You also need to map `linksPerPage` to `LINKS_PER_PAGE` in `src/app/link-list/link-list.component.ts`.

<Instruction>

Add a `linksPerPage` property to the `LinkListComponent`:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
  linksPerPage = LINKS_PER_PAGE;
```

</Instruction>

### Implementing Navigation

Next, you need functionality for the user to switch between the pages. First, add two `button` elements to the bottom of the `LinkListComponent`  that can be used to navigate back and forth.

<Instruction>

Open `src/app/link-list/link-list.component.html` and update the `template` to look like the following:

```html(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.html")
<h4 *ngIf="loading">Loading...</h4>
<hn-link-item
  *ngFor="let link of (orderedLinks| async);let index=index"
  [link]="link"
  [index]="index"
  [pageNumber]="pageNumber | async"
  [isAuthenticated]="logged">
</hn-link-item>
<div *ngIf="isNewPage | async">
  <button *ngIf="!(isFirstPage | async)" (click)="previousPage()">Previous</button>
  <button *ngIf="morePages| async" (click)="nextPage()">Next</button>
</div>
```

Also note that we are rendering the `orderedLinks`, a new property (`getter`) in the `LinkListComponent` that we will add soon.
Moreover, the `AsyncPipe` aka `async` subscribes to an Observable ‡or Promise and returns the latest value it has emitted. Using async pipe more than once in your template will trigger the query for each pipe.

</Instruction>

Since you added `pageNumber` as one of the `Input` on `hn-link-item`, you now need to add it to the `LinkItemComponent`.

<Instruction>

Open `src/app/link-item/link-item.component.ts` and add the `pageNumber` `Input`:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
  @Input()
  pageNumber: number = 0;
```

</Instruction>


Since the setup is slightly more complicated now, you are going to calculate the list of links to be rendered in a separate method.

For the `isNewPage`, you'll simply return all the links returned by the query. That's logical since here you don't have to make any manual modifications to the list that is to be rendered. If the user loaded the component from the `/top` route, you'll sort the list according to the number of votes and return the top 10 links. This is accomplished through an `orderedLinks` computed property which you will implement next.

You will make use of the [lodash](https://lodash.com/) library within the `orderedLinks` function.

<Instruction>

Open a terminal window and within your project directory run the following command:

```bash(path=".../hackernews-angular-apollo")
npm install --save lodash

# or

# yarn add lodash

```

</Instruction>

<Instruction>

Now, in `src/app/link-list/link-list.component.ts`, import `lodash`:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
import _ from 'lodash'
```

</Instruction>

<Instruction>

Still in `src/app/link-list/link-list.component.ts`, add the `orderedLinks` getter and implement it as following :

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
get orderedLinks(): Observable<Link[]> {
    return this.route.url
      .map((segments) => segments.toString())
      .map(path => {
        if (path.includes('top')) {
          return _.orderBy(this.allLinks, 'votes.length').reverse()
        } else {
          return this.allLinks
        }
      })
  }
```

</Instruction>

<Instruction>

Still in `src/app/link-list/link-list.component.ts` there are four more `getter` properties you need to add as follows:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
  get isFirstPage(): Observable<boolean> {
    return this.route.paramMap
      .map((params) => {
        return parseInt(params.get('page'), 10);
      })
      .map(page => page === 1)
  }

  get isNewPage(): Observable<boolean> {
    return this.route.url
      .map((segments) => segments.toString())
      .map(path => path.includes('new'))
  }

  get pageNumber(): Observable<number> {
    return this.route.paramMap
      .map((params) => {
        return parseInt(params.get('page'), 10);
      });
  }

  get morePages(): Observable<boolean> {
    return this.pageNumber.map(pageNumber => pageNumber < this.count / this.linksPerPage);
  }
```

</Instruction>

You also need to add a `count` property to the `LinkListComponent`.

<Instruction>

Still in `src/app/link-list/link-list.component.ts` add `count` property and initialize it to 0:

```ts{4}(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
  count = 0;
```

</Instruction>

Next, you'll implement the functionality for the _Previous_- and _Next_-buttons.

<Instruction>

In `src/app/link-list/link-list.component.ts`, add the following two methods that will be called when the buttons are pressed:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
nextPage () {
  const page = parseInt(this.$route.params.page, 10)
  if (page < this.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    this.$router.push({path: `/new/${nextPage}`})
  }
},
previousPage () {
  const page = parseInt(this.$route.params.page, 10)
  if (page > 1) {
    const previousPage = page - 1
    this.$router.push({path: `/new/${previousPage}`})
  }
}
```

</Instruction>


The implementation of these is straightforward. You're retrieving the current page from the URL and implementing a sanity check to make sure that it makes sense to paginate back or forth. Then you merely calculate the next page and tell the router where to navigate next. The router will then reload the component with a new `page` in the URL that will be used to calculate the right chunk of links to load. Hop on over to the running app and use the new buttons to paginate through your list of links!

### Final Adjustments

Through the changes that we made to the `ALL_LINKS_QUERY`, you'll notice that the `update` functions of your mutations don't work anymore. That's because `readQuery` now also expects to get passed the same variables that we defined before.

> **Note**: `readQuery` essentially works in the same way as the `query` method on the `ApolloClient` that you used to implement the search. However, instead of making a call to the server, it will simply resolve the query against the local store! If a query was fetched from the server with variables, `readQuery` also needs to know the variables to make sure it can deliver the right information from the cache.

<Instruction>

With that information, open `LinkListComponent` and update the `updateCacheAfterVote` method to look as follows:

```js(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
updateStoreAfterVote = (store, createVote, linkId) => {
    let variables;

    Observable
      .combineLatest(this.first$, this.skip$, this.orderBy$, (first, skip, orderBy) => ({ first, skip, orderBy }))
      .take(1)
      .subscribe(values => variables = values);
    // 1
    const data = store.readQuery({
      query: ALL_LINKS_QUERY,
      variables
    });

    // 2
    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    // 3
    store.writeQuery({ query: ALL_LINKS_QUERY, variables, data })
  }
```

</Instruction>

All that's happening here is the computation of the variables depending on whether the user currently is on the `/top` or `/new` route.

Finally, you also need to adjust the implementation of `update` when new links are created.

<Instruction>

Open `CreateLinkComponent` and replace the current contents of `createLink` like so:

```js(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
 createLink() {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return
    }

    const newDescription = this.description;
    const newUrl = this.url;
    this.description = '';
    this.url = '';

    const createMutationSubscription = this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: newDescription,
        url: newUrl,
        postedById
      },
      update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: LINKS_PER_PAGE,
            skip: 0,
            orderBy: 'createdAt_DESC'
          }
        });
        let allLinks = data.allLinks.slice();
        allLinks.splice(0, 0, createLink);
        allLinks.pop();
        data.allLinks = allLinks;
        store.writeQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: LINKS_PER_PAGE,
            skip: 0,
            orderBy: 'createdAt_DESC'
          },
          data
        })
      },
    }).subscribe((response) => {
      // We injected the Router service
      this.router.navigate(['/']);
    }, (error) => {
      console.error(error);
      this.description = newDescription;
      this.url = newUrl;
    });

    this.subscriptions = [...this.subscriptions, createMutationSubscription];
  }
```

</Instruction>

<Instruction>

Since you don't have the `LINKS_PER_PAGE` constant available in this component yet, make sure to import it on top of the file:

```js(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
import { GC_USER_ID, LINKS_PER_PAGE } from '../constants'
```

</Instruction>

You have now added a simple pagination system to the app, allowing users to load links in small chunks instead of loading them all up front.
