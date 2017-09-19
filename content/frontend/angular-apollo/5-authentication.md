---
title: Authentication
pageTitle: "Authentication with GraphQL, Angular & Apollo Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Apollo Client to provide an email-and-password-based login in a Angular app with Graphcool."
question: "What are the names of the two mutations that are added to the Graphcool project after the Email+Password Auth Provider was enabled?"
answers: ["loginUser & logoutUser", "signinUser & createUser", "createUser & loginUser", "signinUser & logoutUser"]
correctAnswer: 1
---

In this section, you'll learn how you can implement authentication functionality with Apollo and Graphcool to provide a login to the user.

### Prepare the Angular components

As in the sections before, you'll set the stage for the login functionality by preparing the Angular components that are needed for this feature. You'll start by implementing the `Login` component.

<Instruction>

Go ahead and run `ng generate component login` and this create `login.component.ts` , `login.component.spec.ts`, `login.component.html`, `login.component.css` in `src/app/login` folder and add the following code inside `login.component.ts`:

```ts(path=".../hackernews-angular-apollo/src/app/login/login.component.ts")
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'hn-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: boolean = true; // switch between Login and SignUp
  email: string = '';
  password: string = '';
  name: string = '';

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

  confirm() {
    // ... you'll implement this in a bit
  }

  saveUserData(id, token) {
    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this.authService.setUserId(id);
  }
}


```
Then, add the following code in `login.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/login/login.component.html")

<h4 class='mv3'>{{login ? 'Login' : 'Sign Up'}}</h4>
<div class='flex flex-column'>
  <input
    *ngIf="!login"
    [(ngModel)]="name"
    type="text"
    placeholder="Your name">
  <input
    [(ngModel)]="email"
    type="text"
    placeholder="Your email address">
  <input
    [(ngModel)]="password"
    type="password"
    placeholder="Password">
</div>
<div class='flex mt3'>
  <div
    class='pointer mr2 button'
    (click)="confirm()">
    {{login ? 'login' : 'create account'}}
  </div>
  <div
    class='pointer button'
    (click)="login = !login">
    {{login ? 'need to create an account?' : 'already have an account?'}}
  </div>
</div>


```

</Instruction>


Let's quickly gain an understanding of the structure of this new component which can have two major states.

One state is for users that already have an account and only need to login. In this state, the component will only render two `input` fields for the user to provide their `email` and `password`. Notice that `login` will be `true` in this case.

The second state is for users that haven't created an account yet, and thus still need to sign up. Here, you also render a third `input` field where users can provide their `name`. In this case, `login` will be `false`.

The method `confirm`  will be used to implement the mutations that we need to send for the login functionality.

Next you also need to provide the `src/app/constants.ts` file that we use to define keys for the credentials that we're storing in the browser's `localStorage`.

<Instruction>

In `src/app`, create a new file called `constants.ts` and add the following two definitions:

```ts(path=".../hackernews-angular-apollo/src/app/constants.ts")
export const GC_USER_ID = 'graphcool-user-id'
export const GC_AUTH_TOKEN = 'graphcool-auth-token'
```

</Instruction>


With that component in place, you can go ahead and add a new route to your `src/app/app.routing.module` file.


<Instruction>

Open `src/app/app.routing.module.ts` and update the `routes` array to include the new route:

```ts{23-27}(path=".../hackernews-angular-apollo/src/app/app.routing.module.ts")
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
  {
    path: '**',
    redirectTo: '',
  }
];
```

</Instruction>


<Instruction>

Also import the `Login` component near top of the same file:

```ts(path=".../hackernews-angular-apollo/src/app/app.routing.module.ts")
import {LoginComponent} from './login/login.component';
```

</Instruction>

<Instruction>

Let's continue by creating a new file in `src/app` called `auth.service.ts` and add the following code inside:

```ts(path=".../hackernews-angular-apollo/src/app/auth.service.ts")
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {GC_AUTH_TOKEN, GC_USER_ID} from './constant';

// 1
@Injectable()
export class AuthService {
  // 2
  private userId: string = null;

  // 3
  private _isAuthenticated = new BehaviorSubject(false);

  constructor() {
  }

  // 4
  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }
  // 5
  saveUserData(id: string, token: string) {

    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this.setUserId(id);
  }

  // 6
  setUserId(id: string) {
    this.userId = id;

    this._isAuthenticated.next(true);
  }
  // 7
  logout() {
    localStorage.removeItem(GC_USER_ID);
    localStorage.removeItem(GC_AUTH_TOKEN);
    this.userId = null;

    this._isAuthenticated.next(false);
  }

  // 8
  autoLogin() {
    const id = localStorage.getItem(GC_USER_ID);

    if (id) {
      this.setUserId(id);
    }
  }
}
```

Let's take close look again to understand what's going on:

1. You first create the typescript class called `AuthService ` that will manage the authentication and be injected in the `src/app/app.module.ts`'s `providers`.
2. Now you define the `userId` property where will save the user id received from the backend.
3. Then you declare the `_isAuthenticated` stream where we will push the authentication state changes
4. You provide next the `isAuthenticated` observable to listen to the `_isAuthenticated` stream
5. Afterwards, you declare `saveUserData` method to save the data coming from the backend in the local storage and the service itself
6. Then, you define `setUserId`, the actual method that will the user id in the service and dispatch to all listeners that the user is authenticated (through the `next` method in `_isAuthenticated`)
7. Now, you provide the `logout` method to log out the user by removing user data from local storage ,  the service and dispatching to all listeners that the user is not authenticated
7. In the end, you declare the `autoLogin` method to log automatically the user if a token is already stored in the localStorage.

Note, don't forgot to inject `AuthService` in `app.module.ts`:

```ts{31-33}(path=".../hackernews-angular-apollo/src/app/app.module.ts")
providers: [
    AuthService
],
```

</Instruction>


Finally, go ahead and add the `Login` link to the `Header` component that allows users to navigate to the `Login` page.

<Instruction>

Open `src/app/header/header.ts` and update the file to look like the following:
```ts(path=".../hackernews-angular-apollo/src/app/header/header.component.ts")
import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'hn-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logged: boolean = false;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.isAuthenticated
      .distinctUntilChanged() // Only emit when the current value is different than the last
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

  }

  logout() {
    this.authService.logout();
  }
}

```
Then, update the following code in `header.component.html`:

```html(path=".../hackernews-angular-apollo/src/app/header/header.component.html")
<div class="flex pa1 justify-between nowrap orange">
  <div class="flex flex-fixed black">
    <div class="fw7 mr1">Hacker News</div>
    <a [routerLink]="['/']" class='ml1 no-underline black'>new</a>
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

You first subscribe to the `isAuthenticated` stream from `authService` and update the `logged` property. If the `logged` is falsy, the _submit_-button won't be rendered anymore. That way you make sure only authenticated users can create new links.

You're also adding a second button on the right side of the `HeaderComponent` that users can use to login and logout.


Here is what the `LoginComponent` and `HeaderComponent` components now look like:

![](https://i.imgur.com/myNAp8K.png)

Before you can implement the authentication functionality in `src/app/login/login.component.ts`, you need to prepare the Graphcool project and enable authentication on the server-side.

### Enabling Email-and-Password Authentication & Updating the Schema


<Instruction>

In the directory where `project.graphcool` is located, type the following into the terminal:

```bash
graphcool console
```

</Instruction>

This will open up the Graphcool Console - the web UI that allows you to configure your Graphcool project.

<Instruction>

Select the _Integrations_-tab on the left side-menu and then click on the _Email-Password-Auth_-integration.

</Instruction>


![](http://imgur.com/FkyzuuM.png)

This will open the popup that allows you to enable Graphcool's email-based authentication mechanism.

<Instruction>

In the popup, simply click _Enable_.

</Instruction>


![](http://imgur.com/HNdmas3.png)

Having the `Email-and-Password` auth provider enabled adds two new mutations to the project's API:

```graphql(nocopy)
# 1. Create new user
createUser(authProvider: { email: { email, password } }): User

# 2. Login existing user
signinUser(email: { email, password }): SignInUserPayload

# SignInUserPayload bundles information about the `user` and `token`
type SignInUserPayload {
  user: User
  token: String
}
```

Next, you have to make sure that the changes introduced by the authentication provider are reflected in your local project file. You can use the `graphcool pull` command to update your local schema file with changes that happened remotely.

<Instruction>

Open a terminal window and navigate to the directory where `project.graphcool` is located. Then run the following command:

```bash
graphcool pull
```

</Instruction>

> Note: Before the remote schema gets fetched, you will be asked to confirm that you want to override the current project file. You can confirm by typing `y`.

This will bump the schema `version` to `3` and update the `User` type to now also include the `email` and `password` fields:

```{3,5}graphql(nocopy)
type User implements Node {
  createdAt: DateTime!
  email: String @isUnique
  id: ID! @isUnique
  password: String
  updatedAt: DateTime!
}
```

Next you need to make one more modification to the schema. Generally, when updating the schema of a Graphcool project, you've got two ways of doing so:

1. Use the web-based [Graphcool Console](https://console.graph.cool) and change the schema directly
2. Use the Graphcool project file and the CLI to update the schema from your local machine

<Instruction>

Open your project file `project.graphcool` and update the `User` and `Link` types as follows:

```graphql{7,15,17}
type Link implements Node {
  createdAt: DateTime!
  description: String!
  id: ID! @isUnique
  updatedAt: DateTime!
  url: String!
  postedBy: User @relation(name: "UsersLinks")
}

type User implements Node {
  createdAt: DateTime!
  id: ID! @isUnique
  email: String @isUnique
  updatedAt: DateTime!
  name: String!
  password: String
  links: [Link!]! @relation(name: "UsersLinks")
}
```

</Instruction>

You added two things to the schema:

- A new field on the `User` type to store the `name` of the user.
- A new relation between the `User` and the `Link` type that represents a one-to-many relationship and expresses that one `User` can be associated with multiple links. The relation manifests itself in the two fields `postedBy` and `links`.

<Instruction>

Save the file and execute the following command in the Terminal:

```bash
graphcool push
```

</Instruction>


Here is the Terminal output after you issue the command:

```sh(nocopy)
$ graphcool push
 ✔ Your schema was successfully updated. Here are the changes:

  | (*)  The type `User` is updated.
  ├── (+)  A new field with the name `name` and type `String!` is created.
  |
  | (+)  The relation `UsersLinks` is created. It connects the type `Link` with the type `User`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
```

> **Note**: You can also use the `graphcool status` command after having made changes to the schema to preview the potential changes that would be performed with `graphcool push`.

Perfect, you're all set now to actually implement the authentication functionality inside your app.


### Implementing the Login Mutations

`createUser` and `signinUser` are two regular GraphQL mutations that you can use in the same way as you did with the `createLink` mutation from before.

<Instruction>

Open `src/app/graphql.ts` and add the following two definitions to the file:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
import {Link, User} from './types';
// ...
export const CREATE_USER_MUTATION = gql`
  mutation CreateUserMutation($name: String!, $email: String!, $password: String!) {
    createUser(
      name: $name,
      authProvider: {
        email: {
          email: $email,
          password: $password
        }
      }
    ) {
      id
    }

    signinUser(email: {
      email: $email,
      password: $password
    }) {
      token
      user {
        id
      }
    }
  }
`;

export interface CreateUserMutationResponse {
  loading: boolean;
  createUser: User;
  signinUser: {
    token: string,
    user?: User
  };
}

export const SIGNIN_USER_MUTATION = gql`
  mutation SigninUserMutation($email: String!, $password: String!) {
    signinUser(email: {
      email: $email,
      password: $password
    }) {
      token
      user {
        id
      }
    }
  }
`;


export interface CreateUserMutationResponse {
  loading: boolean;
  signinUser: {
    token: string,
    user?: User
  };
}
```

</Instruction>

Now, let's gain a better understanding what's going on in the two mutations that you just added to the `src/app/graphql.ts` file.

The `SIGNIN_USER_MUTATION` looks very similar to the mutations we saw before. It simply takes the `email` and `password` as arguments and returns info about the `user` as well as a `token` that you can attach to subsequent requests to authenticate the user. You'll learn in a bit how to do so.

The `CREATE_USER_MUTATION` however is a bit different! Here, we actually define _two_ mutations at once! When you're doing that, the execution order is always _from top to bottom_. So, in your case the `createUser` mutation will be executed _before_ the `signinUser` mutation. Bundling two mutations like this allows you to sign up and login in a single request!

All right, all that's left to do is to call the two mutations inside the `Login` component!

<Instruction>

Open `src/app/login/login.component.ts` and implement `confirm` as follows:

```ts(path=".../hackernews-angular-apollo/src/app/login/login.component.ts")
// ...
  login: boolean = true; // switch between Login and SignUp
  email: string = '';
  password: string = '';
  name: string = '';

  constructor(private router: Router,
              private authService: AuthService,
              private apollo: Apollo) {
  }

  ngOnInit() {
  }

  confirm() {
    if (this.login) {
      this.apollo.mutate<CreateUserMutationResponse>({
        mutation: SIGNIN_USER_MUTATION,
        variables: {
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        const id = result.data.signinUser.user.id;
        const token = result.data.signinUser.token;
        this.saveUserData(id, token);

        this.router.navigate(['/']);

      }, (error) => {
        alert(error)
      });
    } else {
      this.apollo.mutate<SigninUserMutationResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: {
          name: this.name,
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        const id = result.data.signinUser.user.id;
        const token = result.data.signinUser.token;
        this.saveUserData(id, token);

        this.router.navigate(['/']);

      }, (error) => {
        alert(error)
      })
    }
  }

// ...
```

</Instruction>

The code is pretty straightforward. If the user wants to only login, you're calling the `SIGNIN_USER_MUTATION` and pass the provided `email` and `password` as arguments. Otherwise you're using the `CREATE_USER_MUTATION` where you also pass the user's `name`. After the mutation is performed, you are calling the `authService` that will take care of storing the data and navigating back to the root route.

<Instruction>

Also import the `CREATE_USER_MUTATION` and `SIGNIN_USER_MUTATION` constants and response interface near top of the component:

```ts(path=".../hackernews-angular-apollo/src/app/login/login.component.ts")
import {
  CREATE_USER_MUTATION,
  CreateUserMutationResponse,
  SIGNIN_USER_MUTATION,
  SigninUserMutationResponse
} from '../graphql';
```

</Instruction>

You now need to make a couple more changes to `src/app/app.component.ts` to get things working.

<Instruction>

First, import `AuthService` near top of `./auth.service`:

```js(path=".../hackernews-vue-apollo/src/main.js")
import {AuthService} from './auth.service';
```

</Instruction>

<Instruction>

Still in `src/app/app.component.ts` make the following change :

```ts{1-2,9-12}(path=".../hackernews-apollo-apollo/src/app/app.component.ts")
// ...
export class AppComponent implements OnInit {
  title = 'app';
  // 1
  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    // 2
    this.authService.autoLogin();
  }
}

```

</Instruction>

1. You inject the `authService`
2. You try to log in automatically
2. You set this `userId` on the `$root` `$data` object


You can now create an account by providing a `name`, `email` and `password`. Once you do so, the _submit_-button will be rendered again:

![](http://imgur.com/WoWLmDJ.png)

### Updating the `createLink`-mutation

Since you're now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That's what the `postedBy` field on `Link` will be used for.

<Instruction>

Open `src/app/graphql.ts` and update the definition of `CREATE_LINK_MUTATION` as follows:

```ts(path=".../hackernews-angular-apollo/src/app/graphql.ts")
export const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!, $postedById: ID!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById
    ) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`
```

</Instruction>


There are two major changes. You first added another argument to the mutation that represents the `id` of the user that is posting the link. Secondly, you also include the `postedBy` information in the _payload_ of the mutation.

Now you need to make sure that the `id` of the posting user is included when you're calling the mutation in `CreateLinkComponent`.

<Instruction>

Open `src/app/create-link/create-link.component.ts` and update the implementation of `createLink` like so:

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
createLink () {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return
    }

    const newDescription = this.description;
    const newUrl = this.url;
    this.description = '';
    this.url = '';

    this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: newDescription,
        url: newUrl,
        postedById
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
    }, (error)=>{
      console.error(error);
      this.description = newDescription;
      this.url = newUrl;
    });
}
```

</Instruction>


For this to work, you also need to import the `GC_USER_ID` key.


<Instruction>

Add the following import statement near the top of `src/app/create-link/create-link.component.ts`.

```ts(path=".../hackernews-angular-apollo/src/app/create-link/create-link.component.ts")
import {GC_USER_ID} from '../constant';
```

</Instruction>


Perfect! Before sending the mutation, you're now also retrieving the corresponding user id from `localStorage`. If that succeeds, you'll pass it to the call to `CREATE_LINK_MUTATION` so that every new `Link` will from now on store information about the `User` who created it.

If you haven't done so before, go ahead and test the login functionality. Open `http://localhost:4200/login`. Then click the _need to create an account?_-button and provide some user data for the user you're creating. Finally, click the _create Account_-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by checking the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) or sending the `allUsers` query in a Playground.

### Configuring Apollo with the Auth Token

Now that users are able to login and obtain a token that authenticates them against the Graphcool backend, you actually need to make sure that the token gets attached to all requests that are sent to the API.

Since all the API requests are actually created and sent by the `ApolloClient` in your app, you need to make sure it knows about the user's token. Luckily, Apollo provides a nice way for authenticating all requests by using [middleware](http://dev.apollodata.com/angular2/auth.html).

<Instruction>

Open `src/app/apollo.config.ts` and put the following code _between_ the creation of the `networkInterface` and the instantiation of the `ApolloClient`:

```ts(path=".../hackernews-angular-apollo/src/app/apollo.config.ts")
networkInterface.use([{
  applyBatchMiddleware (req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    const token = localStorage.getItem(GC_AUTH_TOKEN)
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])
```

</Instruction>


<Instruction>

Then directly import the key that you need to retrieve the token from `localStorage` on top of the same file:

```ts(path=".../hackernews-angular-apollo/src/app/constants.ts")
import { GC_USER_ID, GC_AUTH_TOKEN } from './constants'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

> Note: In a real application you would now configure the [authorization rules](https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/) (permissions) of your project to define what kind of operations authenticated and non-authenticated users should be allowed to perform.
