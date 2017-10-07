---
title: Routing
pageTitle: "Angular Routing with GraphQL & Apollo Tutorial"
description: "Learn how to use Angular Router  together with GraphQL and Apollo Client to implement navigation in a Angular app."
question: Where do you handle optimistic UI updates when executing a GraphQL mutation in a Angular component?
answers: ["Within an optimisticUpdate method", "Within the .subscribe block of a mutation", "You can not optimistically update the UI in a Angular component", "Within the update option of a mutation"]
correctAnswer: 3
---

In this section, you'll learn how to use the [`Angular Router`](https://angular.io/guide/router)  with Apollo to implement some navigation functionality!


### Install Dependencies

The Angular Router is an optional service that are already installed thanks to `angular-cli`.


### Create a Header

Before you're moving on to configure the different routes for your application, you need to create a `Header` component that users can use to navigate between the different parts of your app.

<Instruction>

Go ahead and run `ng generate component header` and this create `header.component.ts` , `header.component.spec.ts`, `header.component.html`, `header.component.css` in `src/app/header` folder and add the following code in `header.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/header/header.component.ts")
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hn-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
```
</Instruction>

<Instruction>
Then, add the following code in `header.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/header/header.component.html")
<div class='flex pa1 justify-between nowrap orange'>
  <div class='flex flex-fixed black'>
    <div class='fw7 mr1'>Hacker News</div>
    <a [routerLink]="['/']" class='ml1 no-underline black'>new</a>
    <div class='ml1'>|</div>
    <a [routerLink]="['/create']" class='ml1 no-underline black'>submit</a>
  </div>
</div>


```

</Instruction>

This simply renders two `router-link` that users can use to navigate between the `LinkListComponent` and the `CreateLinkComponent` components.


### Setup routes

You'll configure the different routes for the app in `src/app/app.routing.ts`.

<Instruction>

Open the corresponding file `src/app/app.routing.ts` and update the code to match the following:

```js{4-6,11-23}(path=".../hackernews-angular-apollo/src/app/app.routing.ts")
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

// 1
import {LinkListComponent} from './link-list/link-list.component';
import {CreateLinkComponent} from './create-link/create-link.component';

/**
 * Setup all routes here
 */
const routes: Routes = [
  // 2
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
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [
    // 3
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

```

</Instruction>

Let's take a closer look to better understand what's going on:

1. Here you import the `CreateLinkComponent` and `LinkListComponent` components which will be rendered for different routes
2. Here you map each route to the component that should be rendered
3. Here you configure the angular router

You now need to make some small updates to `src/app/app.module.ts`.

<Instruction>

Open up `src/app/app.module.ts` and add the following import:

```js(path=".../hackernews-angular-apollo/src/app/app.module.ts")
import {AppRoutingModule} from './app.routing.module';
```

</Instruction>

<Instruction>

Still in `src/app/app.module.ts`, import `AppRoutingModule` to the `AppModule`:

```ts{25}(path=".../hackernews-angular-apollo/src/app/app.module.ts")
// ...
imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ApolloModule.forRoot(provideClient)
  ],
  providers: [],
  // ...
```

</Instruction>


You need to update one more file, `src/app/app.component.html`.

<Instruction>

In `src/app/app.component.html` update your template to the following (`router-outlet` is where the component for the current route will be rendered):

```html{4}(path=".../hackernews-angular-apollo/src/App.vue")
<div class="center w85">
  <hn-header></hn-header>
  <div class='ph3 pv1 background-gray'>
    <router-outlet></router-outlet>
  </div>
</div>

```

</Instruction>


That's it. You can now access two URLs: `http://localhost:4200/` will render `LinkListComponent` and `http://localhost:4200/create` will render the `CreateLinkComponent` component you just wrote in the previous section.

![](https://imgur.com/KBoxhjP.gif)


### Implement navigation

To wrap up this section, you need to implement an automatic redirect from `CreateLinkComponent` to `LinkListComponent` after a mutation is performed.

<Instruction>

Open `src/app/create-link/create-link.component.ts` and update the `createLink` method to look like the following:

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
// ...
createLink() {
    this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: this.description,
        url: this.url
      },
      update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY
        });

        data.allLinks.push(createLink);
        store.writeQuery({ query: ALL_LINKS_QUERY, data })
      },
    }).subscribe((response) => {
      // We injected the Router service
      this.router.navigate(['/']);
    });
  }
// ...
```
</Instruction>


After the mutation is performed, the angular router (`Router` service) will now navigate back to the `LinkListComponent` component that's accessible on the root route: `/`.
