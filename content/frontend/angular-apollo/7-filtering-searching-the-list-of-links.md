---
title: "Filtering: Searching the List of Links"
pageTitle: "Filtering with GraphQL, Angular & Apollo Tutorial"
description: "Learn how to use filters with GraphQL and Apollo Client. Graphcool provides a powerful filter and ordering API that you'll explore in this example."
question: "What object is used within a GraphQL query to add 'search' functionality through filtering?"
answers: ["limit", "search", "filter", "You can not filter within a GraphQL query"]
correctAnswer: 2
---

In this section, you'll implement a search feature and learn about the filtering capabilities of your GraphQL API.

> Note: If you're interested in all the filtering capabilities of Graphcool, you can check out the [documentation](https://www.graph.cool/docs/reference/simple-api/filtering-by-field-xookaexai0/) on it.


### Preparing the Angular Components

The search will be available under a new route and implemented in a new Angular component.

<Instruction>

Start by running `ng generate component search` and this create `search.component.ts` , `search.component.spec.ts`, `search.component.html`, `search.component.css` in `src/app/search` folder and add the following code inside `search.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/search/search.component.html")
<div>
  Search
  <!-- 1 -->
  <input type="text" [(ngModel)]="searchText" (ngModelChange)="executeSearch()">
</div>
<hn-link-item
  *ngFor="let link of allLinks;let index=index"
  [link]="link"
  [index]="index"
  [isAuthenticated]="logged">
</hn-link-item>

```
</Instruction>

<Instruction>
Then, add the following code in `search.component.ts`:

```ts{6-7,}(path=".../hackernews-angular-apollo/src/app/search/search.component.ts")
import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Apollo} from 'apollo-angular';
import {Subscription} from 'rxjs/Subscription';
import {Link} from '../types';
// 2
import {ALL_LINKS_SEARCH_QUERY, AllLinksSearchQueryResponse} from '../graphql';

@Component({
  selector: 'hn-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  allLinks: Link[] = [];
  loading: boolean = true;
  searchText: string = '';

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

  }

  // 3
  executeSearch() {
    if (!this.searchText) {
      return;
    }

    const querySubscription = this.apollo.watchQuery<AllLinksSearchQueryResponse>({
      query: ALL_LINKS_SEARCH_QUERY,
      variables: {
        searchText: this.searchText
      },
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

Let's review what you are doing here.

1. First, you bind `searchText` to an input element and listen his change thanks to `ngModelChange` event
2. Next, you import the, soon to be created, `ALL_LINKS_SEARCH_QUERY`
3. Finally, you define a `executeSearch` function that will executed each time `this.searchText` is updated. You also will not run it if there is no `searchText` to search.


<Instruction>

Now add the `SearchComponent` as a new route to the app. Open `src/app/app.routing.ts` and update it to look like the following:

```ts{6-7,28-33}(path=".../hackernews-angular-apollo/src/router/index.ts")
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LinkListComponent} from './link-list/link-list.component';
import {CreateLinkComponent} from './create-link/create-link.component';
import {LoginComponent} from './login/login.component';
// 1
import {SearchComponent} from './search/search.component';

/**
 * Setup all routes here
 */
const routes: Routes = [
  {
    path: '',
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
  // 2
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

// ...
```

</Instruction>

1. You import the `SearchComponent`
2. You render the `SearchComponent` when the `/search` route is reached


For the user to be able to comfortably navigate to the search functionality, you should also add a new navigation item to the `HeaderComponent`.

<Instruction>

Open `src/app/header/header.component.html` and put a new `route` between `new` and `submit`:

```ts{6-7}(path=".../hackernews-angular-apollo/src/app/header/header.component.")
<div class="flex pa1 justify-between nowrap orange">
  <div class="flex flex-fixed black">
    <div class="fw7 mr1">Hacker News</div>
    <a [routerLink]="['/']" class='ml1 no-underline black'>new</a>
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

You can now navigate to the search functionality using the new button in the `HeaderComponent`:

![](http://imgur.com/XxPdUvo.png)

Great, let's now define `ALL_LINKS_SEARCH_QUERY`.

### Filtering Links

<Instruction>

Open `src/app/graphql.ts` and add the following query definition to the file:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
export const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
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
`;

export interface AllLinksSearchQueryResponse {
  loading: boolean;
  allLinks: Link[];
}

```

</Instruction>


This query looks similar to the `allLinks` query that's used in `LinkListComponent`. However, this time it takes in an argument called `searchText` and specifies a `filter` object that will be used to specify conditions on the links that you want to retrieve.

In this case, you're specifying two filters that account for the following two conditions: A link is only returned if either its `url` contains the provided `searchText` _or_ its `description` contains the provided `searchText`. Both conditions can be combined using the `OR` operator.


The implementation is almost trivial. You're executing the `ALL_LINKS_SEARCH_QUERY` each time `searchText` changes, and binding the results to `allLinks`  so that they can be rendered.

Go ahead and test the app by navigating to `http://localhost:4200/search`. Then type a search string into the text field and verify the links that are returned fit the filter conditions.
