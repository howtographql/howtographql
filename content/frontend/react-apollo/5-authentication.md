---
title: Authentication
pageTitle: "Authentication with GraphQL, React & Apollo Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Apollo Client to provide an email-and-password-based login in a React app with Prisma."
question: "How are HTTP requests sent by ApolloClient authenticated?"
answers: ["The ApolloClient needs to be instantiated with an authentication token", "ApolloClient exposes an extra method called 'authenticate' where you can pass an authentication token", "By attaching an authentication token to the request with dedicated ApolloLink middleware", "ApolloClient has nothing to do with authentication"]
correctAnswer: 2
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how you can implement authentication functionality with Apollo to provide signup and login features to your users.

### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature. You'll start by building the `Login` component.

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
    name: '',
  }

  render() {
    const { login, email, password, name } = this.state
    return (
      <div>
        <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">
          {!login && (
            <input
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Your name"
            />
          )}
          <input
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Your email address"
          />
          <input
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="Choose a safe password"
          />
        </div>
        <div className="flex mt3">
          <div className="pointer mr2 button" onClick={() => this._confirm()}>
            {login ? 'login' : 'create account'}
          </div>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login
              ? 'need to create an account?'
              : 'already have an account?'}
          </div>
        </div>
      </div>
    )
  }

  _confirm = async () => {
    // ... you'll implement this 🔜
  }

  _saveUserData = token => {
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

Next you also need to provide the `constants.js` file that we use to define the key for the credentials that we're storing in the browser's `localStorage`.

> **Warning**: Storing JWTs in `localStorage` is not a safe approach to implement authentication on the frontend. Because this tutorial is focused on GraphQL, we want to keep things simple and therefore are using it here. You can read more about this topic [here](https://www.rdegges.com/2018/please-stop-using-local-storage/).

<Instruction>

In `src`, create a new file called `constants.js` and add the following definition:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const AUTH_TOKEN = 'auth-token'
```

</Instruction>

With that component in place, you can go and add a new route to your `react-router-dom` setup.

<Instruction>

Open `App.js` and update `render` to include the new route:

```js{7}(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <div className="center w85">
      <Header />
      <div className="ph3 pv1 background-gray">
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
          <Route exact path="/login" component={Login} />
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

```js(path=".../hackernews-react-apollo/src/components/Header.js")
render() {
  const authToken = localStorage.getItem(AUTH_TOKEN)
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Hacker News</div>
        <Link to="/" className="ml1 no-underline black">
          new
        </Link>
        {authToken && (
          <div className="flex">
            <div className="ml1">|</div>
            <Link to="/create" className="ml1 no-underline black">
              submit
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-fixed">
        {authToken ? (
          <div
            className="ml1 pointer black"
            onClick={() => {
              localStorage.removeItem(AUTH_TOKEN)
              this.props.history.push(`/`)
            }}
          >
            logout
          </div>
        ) : (
          <Link to="/login" className="ml1 no-underline black">
            login
          </Link>
        )}
      </div>
    </div>
  )
}
```

</Instruction>

You first retrieve the `authToken` from local storage. If the `authToken` is not available, the **submit**-button won't be rendered any more. That way you make sure only authenticated users can create new links.

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

Open `Login.js` and add the following two definitions to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`
```

</Instruction>

Both mutations look very similar to the mutations you already saw before. They take a number of arguments and return the `token` that you can attach to subsequent requests to authenticate the user (i.e. indicate that a request is made _on behalf_ of that user). You'll learn 🔜 how to do so.

<Instruction>

Also replace `flex mt3` class names `div` element with the following:

```js{2-12}(path=".../hackernews-react-apollo/src/components/Login.js")
<div className="flex mt3">
  <Mutation
    mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
    variables={{ email, password, name }}
    onCompleted={data => this._confirm(data)}
  >
    {mutation => (
      <div className="pointer mr2 button" onClick={mutation}>
        {login ? 'login' : 'create account'}
      </div>
    )}
  </Mutation>
  <div
    className="pointer button"
    onClick={() => this.setState({ login: !login })}
  >
    {login ? 'need to create an account?' : 'already have an account?'}
  </div>
</div>
```

</Instruction>

Before we take a closer look at the `<Mutation />` component implementation, go ahead and add the required imports.

<Instruction>

Still in `Login.js`, add the following statement to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

Now, let's understand what's going with the `<Mutation />` component you just added.

The code is pretty straightforward. If the user wants to just login, you're calling the `loginMutation`, otherwise you're using the `signupMutation`, thus mutation will be triggered on the div `onClick` event. GraphQL mutations receive `email`, `password` and `name` state values as params passed on `variables` prop. Lastly, after the mutation was completed, we call `_confirm` function passing as argument the mutation returned `data`.

All right, all that's left to do is implement `_confirm` function!

<Instruction>

Open `Login.js` and update `_confirm` as follows:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
_confirm = async data => {
  const { token } = this.state.login ? data.login : data.signup
  this._saveUserData(token)
  this.props.history.push(`/`)
}
```

</Instruction>

After the mutation was performed, you're storing the returned `token` in `localStorage` and navigate back to the root route.

> **Note**: Mutation returned `data` relies on GraphQL mutation definition, that's why we need to get the `token` depending on which mutation is triggered.

You can now create an account by providing a `name`, `email` and `password`. Once you did that, the **submit**-button will be rendered again:

![](https://imgur.com/z4KILTw.png)

If you haven't done so before, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the **need to create an account?**-button and provide some user data for the user you're creating. Finally, click the **create account**-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by sending the `users` query in the **dev** Playground in the **database** project.

### Configuring Apollo with the authentication token

Now that users are able to login and obtain a token that authenticates them against the GraphQL server, you actually need to make sure that the token gets attached to all requests that are sent to the API.

Since all the API requests are actually created and sent by the `ApolloClient` instance in your app, you need to make sure it knows about the user's token! Luckily, Apollo provides a nice way for authenticating all requests by using the concept of [middleware](http://dev.apollodata.com/react/auth.html#Header), implemented as an [Apollo Link](https://github.com/apollographql/apollo-link).

First, you need to add the required dependencies to the app. Open a terminal, navigate to your project directory and type:

<Instruction>

```bash(path=".../hackernews-react-apollo")
yarn add apollo-link-context
```

</Instruction>

Let’s see the authentication link in action!

<Instruction>

Open `index.js` and put the following code _between_ the creation of the `httpLink` and the instantiation of `ApolloClient`:

```js(path=".../hackernews-react-apollo/src/index.js")
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})
```

</Instruction>

<Instruction>

Before moving on, you need to import the Apollo dependencies. Add the following to the top of `index.js`:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { setContext } from 'apollo-link-context'
```

</Instruction>

This middleware will be invoked every time `ApolloClient` sends a request to the server. Apollo Links allow to create `middlewares` that let you modify requests before they are sent to the server.

Let's see how it works in our code, first, we get the authentication `token` from `local storage` if it exists, after that we return the `headers` to the `context` so httpLink can read them.

> **Note**: You can read more about Apollo's authentication [here](https://www.apollographql.com/docs/react/recipes/authentication.html).

<Instruction>

Now you also need to make sure `ApolloClient` gets instantiated with the correct link - update the constructor call as follows:

```js{2}(path=".../hackernews-react-apollo/src/index.js")
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})
```

</Instruction>

<Instruction>

Then directly import the key you need to retrieve the token from `localStorage` on top of the same file:

```js(path=".../hackernews-react-apollo/src/index.js")
import { AUTH_TOKEN } from './constants'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

### Requiring authentication on the server-side

The last thing you're doing in this chapter is ensure only authenticated users are able to `post` new links. Plus, every `Link` that's created by a `post` mutation should automatically set the `User` who sent the request for its `postedBy` field.

To implement this functionality, this time you need to make a small change on the server-side as well.

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

With this change, you're extracting the `userId` from the `Authorization` header of the request and use it to directly [`connect`](https://www.prismagraphql.com/docs/reference/prisma-api/mutations-ol0yuoz6go#nested-mutations) it with the `Link` that's created. Note that `getUserId` will [throw an error](https://github.com/howtographql/react-apollo/blob/master/server/src/utils.js#L12) if the field is not provided or not valid token could be extracted.

> **Note**: Stop the server and run it again executing `yarn dev` to apply the changes made.
