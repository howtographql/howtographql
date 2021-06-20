---
title: "Queries: Loading link-items"
pageTitle: "Fetching Data using GraphQL Queries with Angular & Apollo Tutorial"
description: "Learn how you can use GraphQL queries with Apollo Client to load data from a server and display it in your Angular components."
question: What's the idiomatic way for loading data with Angular & Apollo?
answers: ["Using a higher-order component called 'graphql'", "Using the 'query' or 'watchQuery' method on Apollo service", "Using 'fetch' and putting the query in the body of the request", "Using XMLHTTPRequest and putting the query in the body of the request"]
correctAnswer: 0
---

### Preparing the Angular components

The first piece of functionality that you'll implement in the app is loading and displaying a list of `link-item` elements. You'll walk up our way in the Angular component hierarchy and start with the component that'll render a single link-item.

<Instruction>

Run the command below to generate all boilerplate files:

```bash(path=".../hackernews-angular-apollo/")
ng generate component link-item
```

</Instruction>

<Instruction>

This command will create a `link-item` folder containing several new files called `link-item.component.ts` , `link-item.component.spec.ts`, `link-item.component.html`, `link-item.component.css` in the `app` directory and add the following code in `link-item.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.ts")
import {Component, Input, OnInit} from '@angular/core';
import {Link} from '../types';

@Component({
  selector: 'hn-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.css']
})
export class LinkItemComponent implements OnInit {
  @Input()
  link: Link;

  constructor() {
  }

  ngOnInit() {
  }

  voteForLink= async () => {
    // ... you'll implement this in chapter 6
  }
}
```
</Instruction>

<Instruction>

Add the following code in `link-item.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/link-item/link-item.component.html")
<div>{{link.description}} ({{link.url}})</div>
```

</Instruction>

Note, we will be writing all our typings in a `./src/app/types.ts` file and merely importing these types into components as needed.

<Instruction>

This command will create a `link-item` folder containing several new files called `link-item.component.ts` , `link-item.component.spec.ts`, `link-item.component.html`, `link-item.component.css` in the `app` directory and add the following code in `link-item.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/types.ts")
export class Link {
  id: string;
  description: string;
  url: string;
  createdAt: string;
}

```
</Instruction>


This is a simple Angular component that expects a `link` in its `Input` (`link-item.component.ts`) and renders the link's `description` and `URL` (`link-item.component.html`). Easy as pie! 🍰

Next, you'll implement the component that renders a list of link-items.

<Instruction>

Again, in the root directory, go ahead and run `ng generate component link-list` and this create `link-list.component.ts` , `link-list.component.spec.ts`, `link-list.component.html`, `link-list.component.css` in `src/app/link-list` folder and add the following code in `link-list.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
import {Component, OnInit} from '@angular/core';
import {Link} from '../types';

@Component({
  selector: 'hn-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit {
  linksToRender: Link[] = [{
    id: '1',
    description: 'The Coolest GraphQL Backend 😎',
    url: 'https://www.graph.cool',
    createdAt: '2018-02-08T16:54:37.000Z',
  }, {
    id: '2',
    description: 'The Best GraphQL Client',
    url: 'http://dev.apollodata.com/',
    createdAt: '2018-02-08T16:54:37.000Z',
  }];

  constructor() {
  }

  ngOnInit() {
  }

}
```
</Instruction>

<Instruction>

Then, add the following code in `link-list.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.html")

<hn-link-item *ngFor="let link of linksToRender" [link]="link">
</hn-link-item>

```

</Instruction>


Here, you're using mock data (`link-list.component.ts`) for now to make sure the component setup works. You'll soon replace this with some actual data loaded from the server - patience, young Padawan!

<Instruction>

To complete the setup, we should check that all the components in `app.module.ts`, created until now, are declared ,the current contents should look like:

```ts(path=".../hackernews-angular-apollo/src/app/app.module.ts")
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {GraphQLModule} from './apollo.config';
import { LinkItemComponent } from './link-item/link-item.component';
import { LinkListComponent } from './link-list/link-list.component';

@NgModule({
  // here
  declarations: [
    AppComponent,
    LinkItemComponent,
    LinkListComponent,
  ],
  imports: [
    BrowserModule,
    GraphQLModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

```
</Instruction>
<Instruction>

Then, open `app.component.html` and replace the current contents with the following:

```html(path=".../hackernews-angular-apollo/src/app/app.component.html")
  <hn-link-list></hn-link-list>
```

</Instruction>


Run the app to check if everything works so far! The app should now display the two links from the `linksToRender` array:

![Run the search to find linksToRender](https://i.imgur.com/R7YcAlj.png)


### Writing the GraphQL Query

You'll now load the actual link-items stored on the server. The first thing you need to do is to define the GraphQL query that you want to send to the API.

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

You could now merely execute this query in a Playground and retrieve the results from your GraphQL server. But how can you use it inside your JavaScript code?


### Queries with Apollo Client

When using Angular with `apollo-angular` the `Apollo` service makes it easy to fetch GraphQL data.

With this approach, all you need to do when it comes to data fetching is write the GraphQL query, then injecting the `Apollo`  service and use [`query`](http://dev.apollodata.com/angular2/queries.html) or [`watchQuery`](http://dev.apollodata.com/angular2/queries.html) method on the service directly that will fetch the data for you and finally make it available in your component.

In general, the process for you to add some data fetching logic will be very similar every time:

1. Write the query as a typescript constant using the `gql` parser function
2. Initialize the property in your component
2. Use the `Apollo` service to fetch the results of your `graphql` query using Observable
3. Access the query results in the observable subscribe and assign it to the property in your component

You will be writing your queries and mutations in a `graphql.ts` file and merely importing these queries and mutations into components as needed.

<Instruction>

Create a file within `src/app` called `graphql.ts`. This is where all of your queries and mutations will live.

</Instruction>

<Instruction>

Open up `src/app/graphql.ts` and add your first query:

```ts{2-3,5-15,17-21}(path=".../hackernews-angular-apollo/src/app/graphql.ts")
import {Link} from './types';
// 1
import gql from 'graphql-tag'

// 2
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`;

// 3
export interface AllLinkQueryResponse {
  allLinks: Link[];
  loading: boolean;
}

```

</Instruction>

What's going on here?

1. First, you import `gql` from the `graphql-tag` package. The `gql` function is used to parse the plain GraphQL code.
2. Now you define the plain GraphQL query. The name `AllLinksQuery` is the _operation name_ and will be used by Apollo to refer to this query in its internals. You export this parsed query as `ALL_LINKS_QUERY` so you can easily import it into components.
3. You also declare the response interface of `AllLinksQuery`

Next, you will inject the `Apollo` service to the `LinkList` component and call this newly created query to fetch data.

<Instruction>

Open up `src/app/link-list/link-list.component.html`, update the HTML template to display a loading indicator while data is being fetched using `*ngIf`:

```html(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.html")

<h4 *ngIf="loading">Loading...</h4>
<hn-link-item *ngFor="let link of allLinks" [link]="link">
</hn-link-item>


```
</Instruction>

<Instruction>

Then, open up `src/app/link-list/link-list.component.ts`, import `ALL_LINKS_QUERY`, remove the hard-coded `linksToRender`, and inject the `Apollo` service. Your `LinkListComponent` component should now look like this:

```ts{5-6,17-18,23-25,27-28}(path=".../hackernews-angular-apollo/src/app/link-list/link-list.component.ts")
import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Link} from '../types';

// 1
import {ALL_LINKS_QUERY, AllLinkQueryResponse} from '../graphql';

@Component({
  selector: 'hn-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit {
  // 2
  allLinks: Link[] = [];
  loading: boolean = true;

  // 3
  constructor(private apollo: Apollo) {
  }

  ngOnInit() {

    // 4
    this.apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    }).valueChanges.subscribe((response) => {
      // 5
      this.allLinks = response.data.allLinks;
      this.loading = response.data.loading;
     });

  }

}

```

</Instruction>

What's going on here?

1. You import the `ALL_LINKS_QUERY` which you just created
2. Next, you initialize the `allLinks` data property to an empty array and `loading` to `true`. This will be set to false once data loads.
3. Now you inject an `Apollo` service to your component
4. You call the `query` method to it ( you can also use another method named `watchQuery`). This method requires a `query, ` and you pass it the `ALL_LINKS_QUERY`. As you can see, there is a new property, `valueChanges`. To watch results you have to subscribe to `valueChanges` property.
5. The `query` method gives back a observable where we subscribe to get the response that contains a `data` property with `loading` set to `true`  as long as the request is still ongoing and the response hasn't been received and `allLinks` which is the actual data that was received from the server.

That's it! If you ran `npm start` or `yarn start` earlier, you should see your UI update and show the two links.

