---
title: Authentication
pageTitle: "Authentication with GraphQL, React & Apollo Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Apollo Client to provide an email-and-password-based login in a React app with Graphcool."
question: "How are HTTP requests send by ApolloClient authenticated?"
answers: ["The ApolloClient needs to be instantiated with an authentication token", "ApolloClient exposes an extra method called 'authenticate' where you can pass an authentication token", "By attaching an authentication token to the request with dedicated ApolloLink middleware", "ApolloClient has nothing to do with authentication"]
correctAnswer: 1
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how you can implement authentication functionality with Apollo provide signup and login features for your users.

### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature. You'll start by implementing the `Login` component.

<Instruction>

Create a new file in `src/components` and call it `Login.js`. Then paste the following code into it:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'

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
            {this.state.login ? 'login' : 'create account' }
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

  _saveUserData = (token) => {
    localStorage.setItem(AUTH_TOKEN, token)
  }

}

export default Login
```

</Instruction>

Let's quickly understand the structure of this new component, which can have two major states:

- One state is **for users that already have an account** and only need to login. In this state, the component will only render two `input` fields for the user to provide their `email` and `password`. Notice that `state.login` will be `true` in this case.
- The second state is for **users that haven't created an account yet**, and thus still need to sign up. Here, you also render a third `input` field where users can provide their `name`. In this case, `state.login` will be `false`.

The method `_confirm`  will be used to implement the mutations that we need to send for the login functionality.

Next you also need to provide the `constants.js` file that we use to define keys for the credentials that we're storing in the browser's `localStorage`.

<Instruction>

In `src`, create a new file called `constants.js` and add the following two definition:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const AUTH_TOKEN = 'graphcool-auth-token'
```

</Instruction>

With that component in place, you can go and add a new route to your `react-router-dom` setup.

<Instruction>

Open `App.js` and update `render` to include the new route:

```js{7}(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <div className='center w85'>
      <Header />
      <div className='ph3 pv1 background-gray'>
        <Switch>
          <Route exact path='/login' component={Login}/>
          <Route exact path='/create' component={CreateLink}/>
          <Route exact path='/' component={LinkList}/>
        </Switch>
      </div>
    </div>
  )
}
```

</Instruction>

<Instruction>

Also import the `Login` component on top of the same file:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import Login from './Login'
```

</Instruction>

Finally, go ahead and add `Link` to the `Header` that allows the users to navigate to the `Login` page.

<Instruction>

Open `Header.js` and update `render` to look as follows:

```js
render() {
  const authToken = localStorage.getItem(AUTH_TOKEN)
  return (
    <div className='flex pa1 justify-between nowrap orange'>
      <div className='flex flex-fixed black'>
        <div className='fw7 mr1'>Hacker News</div>
        <Link to='/' className='ml1 no-underline black'>new</Link>
        {authToken &&
        <div className='flex'>
          <div className='ml1'>|</div>
          <Link to='/create' className='ml1 no-underline black'>submit</Link>
        </div>
        }
      </div>
      <div className='flex flex-fixed'>
        {authToken ?
          <div className='ml1 pointer black' onClick={() => {
            localStorage.removeItem(AUTH_TOKEN)
            this.props.history.push(`/new/1`)
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

You first retrieve the `authToken` from local storage. If the `authToken` is not available, the **submit_-button won't be rendered any more. That way you make sure only authenticated users can create new links.

You're also adding a second button to the right of the `Header` that users can use to login and logout.

<Instruction>

Lastly, you need to import the key definition from `constants.js` in `Header.js`. Add the following statement to the top of file:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
import { AUTH_TOKEN } from '../constants'
```

</Instruction>

Here is what the ready component looks like:

![](http://imgur.com/tBxMVtb.png)

Perfect, you're all set now to implement the authentication functionality.

### Using the authentication mutations

`signup` and `login` are two regular GraphQL mutations you can use in the same way as you did with the `createLink` mutation from before.

<Instruction>

Open `Login.js` and add the following two definitions to the bottom of the file, also replacing the current `export Login` statement:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      user {
        id
      }
      token
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
      }
      token
    }
  }
`

export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
)(Login)
```

</Instruction>

Note that you're using `compose` for the export statement this time since there is more than one mutation that you want to wrap the component with.

Before we take a closer look at the two mutations, go ahead and add the required imports.

<Instruction>

Still in `Login.js`, add the following statement to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

Now, let's understand what's going in the two mutations you just added to the component.

Both mutations look very similar to the mutations you already saw before. They take a number of arguments returns the `user`'s `id` as well as a `token` that you can attach to subsequent requests to authenticate the user (i.e. indicate that a request is made _on behalf_ of that user). You'll learn in a bit how to do so.

All right, all that's left to do is call the two mutations inside the code!

<Instruction>

Open `Login.js` and implement `_confirm` as follows:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
_confirm = async () => {
  const { name, email, password } = this.state
  if (this.state.login) {
    const result = await this.props.loginMutation({
      variables: {
        email,
        password,
      },
    })
    const { user, token } = result.data.login
    this._saveUserData(user.id, token)
  } else {
    const result = await this.props.signupMutation({
      variables: {
        name,
        email,
        password,
      },
    })
    const { user, token } = result.data.signup
    this._saveUserData(user.id, token)
  }
  this.props.history.push(`/`)
}
```

</Instruction>

The code is pretty straightforward. If the user wants to just login, you're calling the `loginMutation` and pass the provided `email` and `password` as arguments. Otherwise you're using the `signupMutation` where you additionally pass the user's `name`. After the mutation was performed, you're storing the returned `token` in `localStorage` and navigate back to the root route.

You can now create an account by providing a `name`, `email` and `password`. Once you did that, the **submit**-button will be rendered again:

![](http://imgur.com/WoWLmDJ.png)

If you haven't done so before, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the **need to create an account?**-button and provide some user data for the user you're creating. Finally, click the **create account**-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by sending the `users` query in the **dev** Playground in the **database** section.

### Configuring Apollo with the authentication token

Now that users are able to login and obtain a token that authenticates them against the GraphQL server, you actually need to make sure that the token gets attached to all requests that are sent to te API.

Since all the API requests are actually created and sent by the `ApolloClient` instance in your app, you need to make sure it knows about the user's token! Luckily, Apollo provides a nice way for authenticating all requests by using the concept of [middleware](http://dev.apollodata.com/react/auth.html#Header), implemented as an [Apollo Link](https://github.com/apollographql/apollo-link).

<Instruction>

Open `index.js` and put the following code _between_ the creation of the `httpLink` and the instantiation of `ApolloClient`:

```js(path=".../hackernews-react-apollo/src/index.js")
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  return forward(operation)
})

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)
```

</Instruction>

This middleware will be invoked every time `ApolloClient` sends a request to the server. You can imagine the process of sending a request as a _chain_ of functions that are called. Each function gets passed the GraphQL `operation` and another function called `forward`. `forward` needs to be called at the end of the middleware function to pass the `operation` to the next middleware function in the chain.

<Instruction>

Now you also need to make sure `ApolloClient` gets instantiated with the correct link - update the constructor call as follows:

```js(path=".../hackernews-react-apollo/src/index.js")
const client = new ApolloClient({
  link: httpLinkWithAuthToken,
  cache: new InMemoryCache()
})
```

</Instruction>

<Instruction>

Then directly import the key you need to retrieve the token from `localStorage` as well as `ApolloLink` on top of the same file:

```js(path=".../hackernews-react-apollo/src/index.js")
import { AUTH_TOKEN } from './constants'
import { ApolloLink } from 'apollo-client-preset'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

### Requiring authentication on the server-side

The last thing you're doing in this chapter is ensure only authenticated users are able to `post` new links. Plus, every `Link` that's created by a `post` mutation should automatically set the `User` who sent the request for its `postedBy` field.

To implement this functionality, this time you need to make a change on the server side.

<Instruction>

Open `/server/src/resolvers/Mutation.js` and adjust the `post` resolver to look as follows:

```js(path=".../hackernews-react-apollo/server/src/resolvers/Mutation.js")
function post(parent, { url, description }, ctx, info) {
  const userId = getUserId(ctx)
  return ctx.db.mutation.createLink(
    { data: { url, description, postedBy: { connect: { id: userId } } } },
    info,
  )
}
```

</Instruction>

With this change, you're extracting the `userId` from the `Authorization` header of the request. Note that `getUserId` will [throw an error](https://github.com/howtographql/react-apollo/blob/master/server/src/utils.js#L12) if the field is not provided or not valid token could be extracted.