---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with React & Apollo Tutorial"
description: "Learn how you can use GraphQL mutations with Apollo Client. Use Apollo's service injected in the component to define and send mutations."
question: Which of the following statements is true?
answers: ["Only queries can be executed with the Apollo service ", "'gql' is a higher-order component from the apollo-angular package", "GraphQL mutations never take any arguments"]
correctAnswer: 2
---

In this section, you'll learn how you can send mutations with Apollo. It's not that different from creati queries and follows similar steps that were mentioned before with queries:

1. write the mutation as a ts constant using the `gql` parser function
2. use `Apollo` service to call the mutation through the `mutate` method


### Preparing the Angular components

Like before, let's start by writing the Angular component where users will be able to add new links.

<Instruction>
In the root directory, go ahead and run `ng generate component create-link` and this create `create-link.component.ts` , `create-link.component.spec.ts`, `create-link.component.html`, `create-link.component.css` in `src/app/create-link` folder and add the following code in `create-link.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'hn-create-link',
  templateUrl: './create-link.component.html',
  styleUrls: ['./create-link.component.css']
})
export class CreateLinkComponent implements OnInit {
  description: string = '';
  url: string = '';

  constructor() {
  }

  ngOnInit() {
  }

  createLink() {
    // ... you'll implement this in a bit
  }
}

```
</Instruction>

<Instruction>
Then, add the following code in `create-link.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.html")

<div class='flex flex-column mt3'>
  <input
    class='mb2'
    [(ngModel)]="description"
    type='text'
    placeholder='A description for the link'
  />
  <input
    class='mb2'
    [(ngModel)]="url"
    type='text'
    placeholder='The URL for the link'
  />
</div>
<button
  (click)="createLink()">
  Submit
</button>

```

Note: `[(ngModel)]` is the Angular syntax to bind the `description` and `URL` property to their textbox. Data flows in both directions: from the property to the textbox, and from the textbox back to the property. `NgModel` isn't available by default. It belongs to the optional `FormsModule`. You must import it in `src/app/app.module.ts` to be able to use.

</Instruction>

This is a standard setup for an Angular component with two `input` fields where users can provide the `URL` and `description` of the `Link` they want to create. The data that's typed into these fields is bound in the component's properties (`description` and `URL`) and will be used in `createLink` when the mutation is sent.

### Writing the Mutation

But how can you now actually send the mutation? Let's follow the two steps from before.

First, you need to define the mutation in your `graphql` file and parse your query with `gql`. You'll do that in a similar way as with the query before.

<Instruction>

In `src/app/graphql.ts`, add the following statement to the bottom of the file:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
// 1
export const CREATE_LINK_MUTATION = gql`
  # 2
  mutation CreateLinkMutation($description: String!, $url: String!) {
    createLink(
      description: $description,
      url: $url,
    ) {
      id
      createdAt
      url
      description
    }
  }
`;

//3
export interface CreateLinkMutationResponse {
  createLink: Link;
  loading: boolean;
}

```

</Instruction>

Let's retake a close look to understand what's going on:

1. You first create the typescript constant called `CREATE_LINK_MUTATION ` that stores the mutation.
2. Now you define the actual GraphQL mutation. It takes two arguments, `URL` and `description`, that you'll have to provide when calling the mutation.
3. You also declare the response interface of `CreateLinkMutationResponse`

<Instruction>

Before moving on, you need to import the mutation from the `graphql` file and the Apollo dependencies. Add the following to the top of `src/app/create-link/create-link.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
import {Apollo} from 'apollo-angular';
import {CREATE_LINK_MUTATION, CreateLinkMutationResponse} from '../graphql';
```

</Instruction>


Let's see the mutation in action!


<Instruction>

Still in `CreateLinkComponent.ts`, implement the `createLink` mutation as follows:

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
createLink() {
    this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: this.description,
        url: this.url
      }
    }).subscribe((response) => {

    });
}
```

</Instruction>


As promised, all you need to do is call `this.apollo.mutate` and pass the mutation and the variables that represent the user input.

<Instruction>

Go ahead and see if the mutation works. To be able to test the code, open `src/app/app.component.html` and change the template to looks as follows:

```html(path=".../hackernews-angular-apollo/src/app/app.component.html")

<hn-link-list></hn-link-list>
<hn-create-link></hn-create-link>

```

</Instruction>

<Instruction>

Next, check that the `CreateLinkComponent` components in `app.module.ts` is declared, the current contents should look like:

```ts(path=".../hackernews-angular-apollo/src/app/app.module.ts")
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {GraphQLModule} from './apollo.config';
import {LinkListComponent} from './link-list/link-list.component';
import {LinkItemComponent} from './link-item/link-item.component';
import {CreateLinkComponent} from './create-link/create-link.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LinkListComponent,
    LinkItemComponent,
    CreateLinkComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    GraphQLModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}


```

</Instruction>

You should now see the following screen:

![](https://i.imgur.com/mPiqOCd.png)

Two input fields and a _submit_-button - not very pretty but functional.

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then click the _submit_-button. You won't get any visual feedback in the UI, but let's see if the query worked by checking the current list of links in a Playground.

Type `graphcool-framework playground` into a Terminal and send the following query:

```graphql
{
  allLinks {
    description
    url
  }
}
```

You'll see the following server response:

```ts
{
  "data": {
    "allLinks": [
      {
        "description": "The best learning resource for GraphQL",
        "url": "www.howtographql.com"
      },
      // ...
    ]
  }
}
```

Awesome! The mutation works, great job! 💪
