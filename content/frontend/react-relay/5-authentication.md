---
title: Authentication
pageTitle: "Authentication with GraphQL, React & Relay Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Relay to provide an email-and-password-based login in a React app with Graphcool."
videoId: f0Mf2YyGdqc
duration: 18
question: "What are the names of the two mutations that are added to the Graphcool project after the Email+Password Auth Provider was enabled?"
answers: ["loginUser & logoutUser", "signinUser & createUser", "createUser & loginUser", "signinUser & logoutUser"]
correctAnswer: 1
---

In this section, you'll learn how you can implement authentication functionality with Relay and Graphcool to provide a login to the user.

### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature. You'll start by implementing the `Login` component. 

<Instruction>

Create a new file in `src/components` and call it `Login.js`. Then paste the following code inside of it:

```js(path=".../hackernews-react-relay/src/components/Login.js")
import React, { Component } from 'react'
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants'

class Login extends Component {

  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: ''
  }

  render() {

    return (
      <div>
        <h4 className='mv3'>{this.state.login ? 'Login' : 'Sign Up'}</h4>
        <div className='flex flex-column'>
          {!this.state.login &&
          <input
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
            type='text'
            placeholder='Your name'
          />}
          <input
            value={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
            type='text'
            placeholder='Your email address'
          />
          <input
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
            type='password'
            placeholder='Choose a safe password'
          />
        </div>
        <div className='flex mt3'>
          <div
            className='pointer mr2 button'
            onClick={() => this._confirm()}
          >
            {this.state.login ? 'login' : 'create Account' }
          </div>
          <div
            className='pointer button'
            onClick={() => this.setState({ login: !this.state.login })}
          >
            {this.state.login ? 'need to create an account?' : 'already have an account?'}
          </div>
        </div>
      </div>
    )
  }

  _confirm = async () => {
    // ... you'll implement this in a bit
  }

  _saveUserData = (id, token) => {
    localStorage.setItem(GC_USER_ID, id)
    localStorage.setItem(GC_AUTH_TOKEN, token)
  }

}

export default Login
``` 

</Instruction>


Let's quickly understand the structure of this `Login` new component. It can have two major states based on the boolean flag that's represented by `state.login`. 

One state is for users that already have an account and only need to login, here the component will only render two `input` fields for the user provide `email` and `password`. Notice that `state.login` will be `true` in this case. 

The second state is for users that haven't created an account yet and thus still need to sign up. Here, you also render a third `input` field where users can provide their `name`. In this case, `state.login` will be `false`.

The method `_confirm`  will be used to implement the mutations that we need to send for the login functionality.

Next you also need to provide the `constants.js` file that we use to define keys for the credentials that we're storing in the browser's `localStorage`. 

<Instruction>

In `src`, create a new file called `constants.js` and add the following two definitions:

```js(path=".../hackernews-react-relay/src/constants.js")
export const GC_USER_ID = 'graphcool-user-id'
export const GC_AUTH_TOKEN = 'graphcool-auth-token'
```

</Instruction>


With that component in place, you can go and add a new route to your `react-router-dom` setup. 

<Instruction>

Open `App.js` and update `render` to include the new route:

```js{7}(path=".../hackernews-react-relay/src/components/App.js")
render() {
  return (
    <div className='center w85'>
      <Header />
      <div className='ph3 pv1 background-gray'>
        <Switch>
          <Route exact path='/' component={LinkListPage}/>
          <Route exact path='/login' component={Login}/>
          <Route exact path='/create' component={CreateLink}/>
        </Switch>
      </div>
    </div>
  )
}
```

</Instruction>


<Instruction>

Also import the `Login` component on top of the same file: 

```js(path=".../hackernews-react-relay/src/components/App.js")
import Login from './Login'
```

</Instruction>

Finally, go ahead and add `Link` to the `Header` that allows the users to navigate to the `Login` page. 

<Instruction>

Open `Header.js` and update `render` to look as follows:

```js{2,8,13,15-25}(path=".../hackernews-react-relay/src/components/Header.js")
render() {
  const userId = localStorage.getItem(GC_USER_ID)
  return (
    <div className='flex pa1 justify-between nowrap orange'>
      <div className='flex flex-fixed black'>
        <div className='fw7 mr1'>Hacker News</div>
        <Link to='/' className='ml1 no-underline black'>new</Link>
        {userId &&
        <div className='flex'>
          <div className='ml1'>|</div>
          <Link to='/create' className='ml1 no-underline black'>submit</Link>
        </div>
        }
      </div>
      <div className='flex flex-fixed'>
        {userId ?
          <div className='ml1 pointer black' onClick={() => {
            localStorage.removeItem(GC_USER_ID)
            localStorage.removeItem(GC_AUTH_TOKEN)
            this.props.history.push(`/`)
          }}>logout</div>
          :
          <Link to='/login' className='ml1 no-underline black'>login</Link>
        }
      </div>
    </div>
  )
}
```

</Instruction>


You first retrieve the `userId` from local storage. If the `userId` is not available, the _submit_-button won't be rendered any more. That way you make sure only authenticated users can create new links. 

You're also adding a second button to the right of the `Header` that users can use to login and logout.

<Instruction>

Lastly, you need to import the key definitions from `constants.js` in `Header.js`. Add the following statement to the top of file:

```js(path=".../hackernews-react-relay/src/components/Header.js")
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants'
```

</Instruction>

Here is what the ready component looks like:

![](http://imgur.com/tBxMVtb.png)
 
Before you can implement the authentication functionality in `Login.js`, you need to prepare the Graphcool project and enable authentication on the server-side.

### Enabling Email-and-Password Authentication & Updating the Schema

<Instruction>

In the directory where `project.graphcool` is located, type the following into the terminal:

```bash(path="../hackernews-react-relay")
graphcool console
```

</Instruction>

This will open up the Graphcool Console - the web UI that allows you to configure your Graphcool project.

<Instruction>

Select the _Integrations_-tab in the left side-menu and then click on the _Email-Password-Auth_-integration.

</Instruction>


![](http://imgur.com/FkyzuuM.png)

This will open the popup that allows you to enable the Graphcool's email-based authentication mechanism.

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

Next, you have to make sure that the changes introduced by the authentication provider are reflected in your local project file. You can use the `graphcool pull` to update your local schema file with changes that happened remotely.

<Instruction>

Open a terminal window and navigate to the directory where `project.graphcool` is located. Then run the following command:

```bash(path="../hackernews-react-relay")
graphcool pull
```

</Instruction>

> Note: Before the remote schema gets fetched, you will be asked to confirm that you want to override the current project file. You can confirm by typing `y`. 

This will bump the schema `version` to `2` and update the `User` type to look also include the `email` and `password` fields:

```{3,5}graphql(nocopy)
type User implements Node {
  createdAt: DateTime!
  email: String @isUnique
  id: ID! @isUnique
  password: String
  updatedAt: DateTime!
}
```

Perfect, you're all set now to actually implement the authentication functionality inside your app.


### Implementing the Login Mutations

`createUser` and `signinUser` are two regular GraphQL mutations that you can use in the same way as you did with the `createLink` mutation from before.

You'll start with the `createUser` mutation.

<Instruction>

Create a new file in `src/mutations` and call it `CreateUserMutation.js`. Then copy the following code into it:

```js(path=".../hackernews-react-relay/src/mutations/CreateUserMutation.js")
import {
  commitMutation,
  graphql
} from 'react-relay'
import environment from '../Environment'

const mutation = graphql`
  mutation CreateUserMutation($createUserInput: SignupUserInput!, $signinUserInput: SigninUserInput!) {
    createUser(input: $createUserInput) {
      user {
        id
      }
    }

    signinUser(input: $signinUserInput) {
      token
      user {
        id
      }
    }
  }
`
```

</Instruction>

Let's quickly understand what's going in the code that you just added.

You're again defining a `mutation` by using the `graphql` function. The template string that you're tagging with `graphql` actually contains _two_ mutations at once!

The first mutation is used to _create_ a new `User`. It takes the `SignupUserInput` as an argument, which is essentially a wrapper object for the user's `name`, `email` and `password`.

The second mutation is used to _log in_ the user and will return a `token` that you can attach to all subsequent requests and thus authenticate the user against the API.

When these two mutations are sent to the server, it will execute them _synchronously_ from _top to bottom_. This means that the server will first _create_ the user and then directly _log them in_ so that you don't have to send an additional request to obtain the user's authentication token. Neat!

To send the mutation, you need to use the `commitMutation` function again and pass it the `mutation`, the `environment` and the right user input. 

<Instruction>

Still in `CreateUserMutation.js`, add the following snippet below the code you just added before:

```js(path=".../hackernews-react-relay/src/mutations/CreateUserMutation.js")
export default (name, email, password, callback) => {
  const variables = {
    // 1 
    createUserInput: {
      name,
      authProvider: {
        email: {
          email,
          password
        }
      },
      clientMutationId: ""
    },
    // 2
    signinUserInput: {
      email: {
        email,
        password
      },
      clientMutationId: ""
    }
  }

  // 3
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // 4
      onCompleted: (response) => {
        const id = response.createUser.user.id
        const token = response.signinUser.token
        callback(id, token)
      },
      onError: err => console.error(err),
    },
  )
}
```

</Instruction>

Let's quickly walk through what's going on here!

1. Here you prepare the first input object that you're passing as an argument into the `createUser` mutation
2. Then, directly after that you're creating the second input object for the `signinUser` mutation
3. Once the arguments are ready and stored in `variables`, you're calling `commitMutation` and pass the required data
4. Finally, you're implementing `onCompleted` again where you retrieve the `id` of the user and their authentication `token` and pass it into a callback

Go ahead and add the single `signinUser` mutation right away so that users can also login without having to create an account.

 <Instruction>

Create a new file in `src/mutations` and call it `SigninUserMutation.js`.

```js(path=".../hackernews-react-relay/src/mutations/SigninUserMutation.js")
import {
  commitMutation,
  graphql
} from 'react-relay'
import environment from '../Environment'

const mutation = graphql`
  mutation SigninUserMutation($input: SigninUserInput!) {
    signinUser(input: $input) {
      token
      user {
        id
      }
    }
  }
`

export default (email, password, callback) => {
  const variables = {
    input: {
      email: {
        email,
        password
      },
      clientMutationId: ""
    },
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {
        const id = response.signinUser.user.id
        const token = response.signinUser.token
        callback(id, token)
      },
      onError: err => console.error(err),
    },
  )
}
```

</Instruction>

This code is very similar to the mutation you just implemented, just a bit simpler. In fact, it's very much the same setup except that the `createUser` mutation is removed - so the sole purpose of this mutation will be to authenticate an existing `User` and get a `token` for them from the server.

### Calling the Login Mutations

Finally, you need to make sure that the two mutations can be called from within the `Login` component.

<Instruction>

Open `Login.js` and implement `_confirm` as follows:

```js(path=".../hackernews-react-relay/src/components/Login.js")
_confirm = () => {
  const { name, email, password } = this.state
  if (this.state.login) {
    SigninUserMutation(email, password, (id, token) => {
      this._saveUserData(id, token)
      this.props.history.push(`/`)
    })
  } else {
    CreateUserMutation(name, email, password, (id, token) => {
      this._saveUserData(id, token)
      this.props.history.push(`/`)
    })
  }
}
```

</Instruction>

The code is pretty straightforward. If the user wants to only login, you're calling the `SigninUserMutation ` and pass the provided `email` and `password` as arguments. Otherwise you're using the `CreateUserMutation` where you also pass the user's `name`. The last argument in both cases is the callback that receives the `id` and `token` which you're then storing in `localStorage` using the `_saveUserData` method and navigate back to the root route.

Before you're running the app, you need to import the mutations and run the Relay Compiler again.

<Instruction>

Still in `Login.js`, add the following two imports to the top of the file:

```js(path=".../hackernews-react-relay/src/components/Login.js")
import SigninUserMutation from '../mutations/SigninUserMutation'
import CreateUserMutation from '../mutations/CreateUserMutation'
```

</Instruction>

Now invoke the Relay Compiler.

<Instruction>

In a terminal, navigate to the project's root directory and execute the following command:

```bash(path=".../hackernews-react-relay")
relay-compiler --src ./src --schema ./schema.graphql
```

</Instruction>

You can now create an account by providing a `name`, `email` and `password`. Once you did that, the _submit_-button will be rendered again:

![](http://imgur.com/WoWLmDJ.png) 

### Updating the `createLink`-mutation

Since you're now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That's what the `postedBy` field on `Link` will be used for.

<Instruction>

Open `CreateLinkMutation.js` and update the exported function as follows:

```js{1,4}(path=".../hackernews-react-relay/src/components/CreateLink.js")
export default (postedById, description, url, callback) => {
  const variables = {
    input: {
      postedById,
      description,
      url,
      clientMutationId: ""
    },
  }

  ...
}
```

</Instruction>

All you do is include a new argument that represents the `id` of the user who is posting the link.

Secondly, you should also include the information about the user in the mutation's payload so Relay can put it into the cache.

<Instruction>

Still in `CreateLinkMutation.js`, update the definition of `mutation` like so:

```js{9-11}(path=".../hackernews-react-relay/src/mutations/CreateLinkMutation.js")
const mutation = graphql`
  mutation CreateLinkMutation($input: CreateLinkInput!) {
    createLink(input: $input) {
      link {
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
  }
`
```

</Instruction>

Now you need to make sure that the `id` of the posting user is included when you're calling the mutation in `_createLink`.

<Instruction>

Open in `CreateLink.js` and adjust the implementation of `_createLink` to also pass the user's id that you're retrieving from `localStorage`:

```js(path=".../hackernews-react-relay/src/components/CreateLink.js")
_createLink = () => {
  const postedById = localStorage.getItem(GC_USER_ID)
  if (!postedById) {
    console.error('No user logged in')
    return
  }
  const { description, url } = this.state
  CreateLinkMutation(postedById, description, url, () => this.props.history.push('/'))
}
```

</Instruction>


For this to work, you also need to import the `GC_USER_ID` key. 

<Instruction>

Add the following import statement to the top of `CreateLink.js`.

```js(path=".../hackernews-react-relay/src/components/CreateLink.js")
import { GC_USER_ID } from '../constants'
```

</Instruction>

Perfect! Before sending the mutation, you're now also retrieving the corresponding user id from `localStorage`. If that succeeds, you'll pass it to the call to `createLinkMutation` so that every new `Link` will from now on store information about the `User` who created it.

If you haven't done so before, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the _need to create an account?_-button and provide some user data for the user you're creating. Finally, click the _create Account_-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by checking the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) or sending the `allUsers` query in a Playground.

### Configuring Relay with the Auth Token

Now that users are able to login and obtain a token that authenticates them against the Graphcool backend, you actually need to make sure that the token gets attached to all requests that are sent to the API.

Since all the API request are actually created and sent by Relay in your app, you need to make sure it knows about the user's token. 

All you need to do for that is reconfigure the `fetchQuery` function that you're currently using to instantiate the Relay `Environment` and attach the token to a header.

<Instruction>

Open `Environment.js` and update the `headers` in `fetchQuery` to also include the token:

```js{4}(path=".../hackernews-react-relay/src/Environment.js")
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(GC_AUTH_TOKEN)}`
},
```

</Instruction>


<Instruction>

Then directly import the key that you need to retrieve the token from `localStorage` on top of the same file:

```js(path=".../hackernews-react-relay/src/Environment.js")
import { GC_AUTH_TOKEN } from './constants'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

> Note: In a real application you would now configure the [authorization rules](https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/) (permissions) of your project to define what kind of operations authenticated and non-authenticated users should be allowed to perform. 
