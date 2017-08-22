---
title: "Authentication"
pageTitle: "Authentication with GraphQL, Ember & Apollo Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Apollo Client to provide an email-and-password-based login in an Ember app with Graphcool."
question: "What are the names of the two mutations that are added to the Graphcool project after the Email+Password Auth Provider was enabled?"
answers: ["loginUser & logoutUser", "signinUser & createUser", "createUser & loginUser", "signinUser & logoutUser"]
correctAnswer: 1
---

In this section, you’ll learn how you can implement authentication functionality with Apollo and Graphcool to provide a login to the user. Hang in there, because this will be a lengthy section. Once it’s all over you will understand how to handle authentication with Apollo and Ember though!

### One Service To Rule Them All

<Instruction>

Start off by creating an authentication service to handle the logic and state. You'll add this, again, by using a generator:

```bash
ember generate service auth
```

The `userId` and `authToken` will be stored in the user’s `localStorage` in this app, so add some methods for setting and retrieving that data from `localStorage` and in your service:

```js(path=".../hackernews-ember-apollo/app/services/auth.js")
import Ember from 'ember';

// 1.
const GC_USER_ID = 'graphcool-user-id';
const GC_AUTH_TOKEN = 'graphcool-auth-token';

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    // 2.
    this.getUserId();
    this.getAuthToken();
  },

  authToken: null,

  // 3.
  getUserId() {
    const userId = localStorage.getItem(GC_USER_ID);
    this.setUserId(userId);
    return userId;
  },

  getAuthToken() {
    const token = localStorage.getItem(GC_AUTH_TOKEN);
    this.setAuthToken(token);
    return token;
  },

  // 4.
  removeUserId() {
    localStorage.removeItem(GC_USER_ID);
    this.set('userId', null);
  },

  removeAuthToken() {
    localStorage.removeItem(GC_AUTH_TOKEN);
    this.set('authToken', null);
  },

  // 5.
  setUserId(id) {
    localStorage.setItem(GC_USER_ID, id);
    this.set('userId', id);
  },

  setAuthToken(token) {
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this.set('authToken', token);
  },

  userId: null
});
```

</Instruction>

Let’s breeze through what is happening in this piece of code as it’s vital to the application in the long run.

1. You are defining two constants, `GC_USER_ID` and `GC_AUTH_TOKEN` which hold the key values that `localStorage` will need.
2. Right off the bat in the service initialization, you are executing two methods to get the user’s ID and auth token, if they are set in `localStorage`.
3. You are also defining those two methods `getUserId` and `getAuthToken` which query the `localStorage` for the value and pass it to each method to be set on your service.
4. Two methods, `removeUserId` and `removeAuthToken`, are created to remove the value from `localStorage` and reset the local value, on the service, to null.
5. Finally, you have the two methods that are setting the value in `localStorage` and on the service.

What’s missing from this long block of code is methods to login, signup, and logout. You will add those in a moment, but first let’s talk about how Graphcool handles authentication.

### Enabling Email-and-Password Authentication & Updating the Schema

<Instruction>

In the directory where `project.graphcool` is located, type the following into the terminal:

```bash
graphcool console
```

</Instruction>

This will open up the Graphcool Console - the web UI that allows you to configure your Graphcool project.

<Instruction>

Select the *Integrations*-tab in the left side-menu and then click on the *Email-Password-Auth*-integration.

</Instruction>

![](http://imgur.com/25iMZtf)

This will open the popup that allows you to enable the Graphcool’s email-based authentication mechanism.

<Instruction>

In the popup, simply click *Enable*.

</Instruction>

Having the `Email-and-Password` auth provider enabled adds two new mutations to the project’s API:

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

This will bump the schema `version` and update the `User` type to now also include the `email` and `password` fields:

```graphql(nocopy)
type User implements Node {
  createdAt: DateTime!
  email: String @isUnique
  id: ID! @isUnique
  password: String
  updatedAt: DateTime!
}
```

Next you need to make one more modification to the schema. Generally, when updating the schema of a Graphcool project, you’ve got two ways of doing so:

1. Use the web-based [Graphcool Console](https://console.graph.cool/) and change the schema directly
2. Use the Graphcool project file and the CLI to update the schema from your local machine

<Instruction>

Open your project file `project.graphcool` and update the `User` and `Link` types as follows:

```graphql
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

* A new field on the `User` type to store the `name` of the user.
* A new relation between the `User` and the `Link` type that represents a one-to-many relationship and expresses that one `User` can be associated with multiple links. The relation manifests itself in the two fields `postedBy` and `links`.

<Instruction>

Save the file and execute the following command in the Terminal:

```bash
graphcool push
```

</Instruction>

Here is the Terminal output after you execute the command:

```bash(nocopy)
$ graphcool push
 ✔ Your schema was successfully updated. Here are the changes: 

  | (*)  The type `User` is updated.
  ├── (+)  A new field with the name `name` and type `String!` is created.
  |
  | (+)  The relation `UsersLinks` is created. It connects the type `Link` with the type `User`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
```

> **Note**: You can also use the `graphcool status` command after having made changes to the schema to preview the potential changes that would be performed with `graphcool push`.

Perfect, you’re all set now to actually implement the authentication functionality inside your app.

### Authentication with Graph.cool

Time to quickly add the remaning methods to your `auth` service that would allow us to login, sign up, and logout. 

First you need to add the `signInUserMutation` and `createUser` mutations to your mutations folder.

<Instruction>

Add a new file in the `app/gql/mutations` directory named `signInUser.graphql` and add these contents:

```graphql
mutation SigninUserMutation($email: String!, $password: String!) {
  signinUser(email: { email: $email, password: $password }) {
    token
    user {
      id
    }
  }
}
```

Also add a `createUser.graphql` file and add these contents:

```graphql
mutation CreateUserMutation($name: String!, $email: String!, $password: String!) {
  createUser(name: $name, authProvider: { email: { email: $email, password: $password } }) {
    id
  }
  signinUser(email: { email: $email, password: $password }) {
    token
    user {
      id
    }
  }
}
```

Now add some more imports to your `auth` service:

```js(path=".../hackernews-ember-apollo/app/services/auth.js")
import RSVP from 'rsvp';
import signInUserMutation from 'hackernews-ember-apollo/gql/mutations/signInUser';
import createUser from 'hackernews-ember-apollo/gql/mutations/createUser';
```

And the remaining methods for login, logout, and sign up:

```js(path=".../hackernews-ember-apollo/app/services/auth.js")
apollo: Ember.inject.service(),
  
// 1.
isLoggedIn: Ember.computed('userId', function() {
  return !!this.get('userId');
}),

// 2.
loginOrSignUp(state, name, email, password) {
  let variables;
  return new RSVP.Promise((resolve, reject) => {
    if (state) {
      variables = { email, password };
      this.get('apollo')
        .mutate({ mutation: signInUserMutation, variables }, 'signinUser')
        .then(result => {
          this.saveUserData(result.user.id, result.token);
          resolve();
        })
        .catch(error => reject(error));
    } else {
      variables = { name, email, password };
      this.get('apollo')
        .mutate({ mutation: createUserMutation, variables }, 'signinUser')
        .then(result => {
          this.saveUserData(result.user.id, result.token);
          resolve();
        })
        .catch(error => reject(error));
    }
  });
},

// 3.
logout() {
  return new RSVP.Promise(resolve => {
    this.removeUserId();
    this.removeAuthToken();
    resolve();
  });
},

// 4.
saveUserData(id, token) {
  this.setUserId(id);
  this.setAuthToken(token);
}
```

</Instruction>

Let’s look through what these new methods are doing:

1. `isLoggedIn` is a simple computed property utility you will use in templates regularly.
2. `loginOrSignUp` is a method that will, depending on the value of `state`, either create a new user or sign in an existing user. In both cases the user will end up signed in and their id and token is passed to `saveUserData`.
3. `logout` is simple method that removes the user’s ID and token on the service and `localStorage`, and resolves a Promise.
4. Finally `saveUserData` executes the methods to set the user ID and token on the service and in `localStorage`.

With that, you have a working authentication service and necessary mutations. Next you will create your login route and template and wire it all up to work.

### Implementing your Login route

<Instruction>

In your `router.js` file, add a `login` route:

```js(path=".../hackernews-ember-apollo/app/router.js")
Router.map(function() {
  this.route('links', { path: '/' });
  this.route('create');
  this.route('login');
});
```

Next, add a controller for your login route. Create a new file, `login.js` in the `app/controllers` directory, and add the following code:

```js(path=".../hackernews-ember-apollo/app/controllers/login.js")
import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    // 1.
    changeLoginState() {
      this.toggleProperty('loginState');
    },

    // 2.
    loginOrSignUp() {
      const loginState = this.loginState;
      const email = this.get('email');
      const name = this.get('name');
      const password = this.get('password');
      return this.get('auth')
        .loginOrSignUp(loginState, name, email, password)
        .then(() => {
          this.transitionToRoute('/');
        })
        .catch(error => console.error(error));
    }
  },

  auth: Ember.inject.service(),

  // 3.
  loginState: true
});
```

</Instruction>

This controller is:

1. Defining an action to change the value of `loginState`.
2. Adding an action to handle signing up and logging in.
3. Maintaining a state called `loginState`.

Now add the template for your login route.

<Instruction>

Add a new file named `login.hbs` to your `app/templates` directory and add the following contents:

```hbs(path=".../hackernews-ember-apollo/app/templates/login.hbs")
<div>
  <h4 class='mv3'>
    {{#if loginState}}
      Login
    {{else}}
      Sign Up
    {{/if}}
  </h4>
  <form {{action 'loginOrSignUp' on='submit'}} class='flex flex-column'>
    {{#unless loginState}}
      {{input type='text' class='mb2' placeholder='Your name' value=name}}
    {{/unless}}
    {{input type='text' class='mb2' placeholder='Your email address' value=email}}
    {{input type='password' class='mb2' placeholder='Choose a safe password' value=password}}
    <div class='flex'>
      {{input type='submit' class='mr2' value=(if loginState 'login' 'create account')}}
      <button {{action 'changeLoginState'}}>
        {{#if loginState}}
          need to create an account?
        {{else}}
          already have an account?
        {{/if}}
      </button>
    </div>
  </form>
</div>
```

</Instruction>

It’s a pretty simple template that brings us full circle with the login/signup functionality.

Go ahead and test the login functionality. Run `yarn start` and open `http://localhost:4200/login`. Then click the *need to create an account?*-button and provide some user data for the user you’re creating. Finally, click the *create Account*-button. If all went well, the app navigates back to the root route and your user was created. 

You can verify that the new user is there by checking the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) or sending the `allUsers` query in a Playground.

### Integrate authentication with** **`site-header`

You need to update your `site-header` component to add a link to the login route, and to show auth status.

<Instruction>

Inside of `app/components/site-header.js` add the following:

```js(path=".../hackernews-ember-apollo/app/components/site-header.js")
import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    logout() {
      this.get('auth').logout().then(() => {
        this.sendAction('onLogout');
      });
    }
  },

  auth: Ember.inject.service(),

  userLoggedIn: Ember.computed.oneWay('auth.isLoggedIn')
});
```

Also update the template:

```hbs(path=".../hackernews-ember-apollo/app/templates/components/site-header.hbs")
<div class='flex pa1 justify-between nowrap orange'>
  <div class='flex flex-fixed black'>
    <div class='fw7 mr1'>Hacker News</div>
    {{#link-to 'links' class='ml1 no-underline black'}}new{{/link-to}}
    {{#if userLoggedIn}}
      <div class='flex'>
        <div class='ml1'>|</div>
        {{#link-to 'create' class='ml1 no-underline black'}}submit{{/link-to}}
      </div>
    {{/if}}
  </div>
  <div class='flex flex-fixed'>
    {{#if userLoggedIn}}
      <div class='ml1 pointer black' {{action 'logout'}}>
        logout
      </div>
    {{else}}
      {{#link-to 'login' class='ml1 no-underline black'}}login{{/link-to}}
    {{/if}}
  </div>
</div>
```

</Instruction>

You are accessing your `auth` service so you can use the `isLoggedIn` helper and `logout` method. You also added a link to the login route. 

### Updating the** **`createLink`-mutation

I promise you are nearly done with authentication; only this section and one more!

Since you’re now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That’s what the `postedBy` field on `Link` will be used for.

<Instruction>

Open `createLink.graphql` and update the definition as follows:

```graphql(path=".../hackernews-ember-apollo/app/gql/mutations/createLink.graphql")
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
```

</Instruction>

There are two major changes. You first added another argument to the mutation that represents the `id` of the user that is posting the link. Secondly, you also include the `postedBy` information in the *payload* of the mutation.

Now you need to make sure that the `id` of the posting user is included when you’re calling the mutation in `createLink`.

<Instruction>

In the `create` controller, update the controller like so:

```js(path=".../hackernews-ember-apollo/app/controllers/create.js")
import Ember from 'ember';
import mutation from 'hackernews-ember-apollo/gql/mutations/createLink';

export default Ember.Controller.extend({
  actions: {
    createLink() {
      const postedById = this.get('auth').getUserId();
      if (!postedById) {
        console.error('No user logged in');
        return;
      }
      const description = this.get('description');
      const url = this.get('url');
      let variables = { description, url, postedById };

      return this.get('apollo')
        .mutate(
          {
            mutation,
            variables
          },
          'createLink'
        )
        .then(() => {
          this.set('description', '');
          this.set('url', '');
          this.transitionToRoute('links');
        });
    }
  },

  apollo: Ember.inject.service(),

  auth: Ember.inject.service()
});
```

</Instruction>

Perfect! Now, before you send the mutation you are gathering the user’s ID and setting that into the variables to be sent!

### Configuring Apollo with the Auth Token

Now that users are able to login and obtain a token that authenticates them against the Graphcool backend, you actually need to make sure that the token gets attached to all requests that are sent to the API.

Since all of the API requests are actually created and sent by the `ApolloClient` in your app, you need to make sure it knows about the user’s token. Luckily, Apollo provides a nice way for authenticating all request by using middleware.

You need to override the default `ApolloService` that `ember-apollo-client` is exposing so you can add your own middleware.

<Instruction>

Within your command line, add an apollo service:

```bash
ember generate service apollo
```

Add the following imports to the top of your new service:

```js(path=".../hackernews-ember-apollo/app/services/apollo.js")
import ApolloService from 'ember-apollo-client/services/apollo';
import middlewares from 'ember-apollo-client/utils/middlewares';
```

</Instruction>

Here you are importing the service that `ember-apollo-client` uses, and a utility that you will use to add your authorization middleware.

<Instruction>

Within the `apollo` service file you created, add the following code:

```js(path=".../hackernews-ember-apollo/app/services/apollo.js")
// 1.
export default ApolloService.extend({
  // 2.
  middlewares: middlewares('authorize'),

  auth: Ember.inject.service(),

  // 3.
  authorize(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};
    }
    const token = this.get('auth').getAuthToken();
    req.options.headers.authorization = token ? `Bearer ${token}` : null;
    next();
  }
});
```

</Instruction>

Let’s walk through this code:

1. You are not extending the typical Ember service, but are instead extending that `ApolloService` you imported.
2. You are using that `middlewares` utility you imported to add an new middleware
3. That new middleware checks that there are no headers. If there are none, then the user's `authToken` is retrieved, and attached to the authorization header

That’s it - now all your API requests will be authenticated if a `token` is available.

> Note: In a real application you would now configure the [authorization rules](https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/) (permissions) of your project to define what kind of operations authenticated and non-authenticated users should be allowed to perform.

At this point you should have a working login route to authenticate/signup with, and a working `site-header` component that updates based on the user's login status. You should also have a link creation process that attaches the user ID to that created link.