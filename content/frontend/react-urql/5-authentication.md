---
title: Authentication
pageTitle: "Authentication with GraphQL, React & urql Tutorial"
description: "Learn how to implement authentication with GraphQL & urql to provide an email-&-password login in a React app with Prisma."
question: "How are authenticated HTTP requests sent by urql?"
answers: ["The Client needs to be instantiated with an authentication token", "The Client exposes an extra method called 'authenticate' where you can pass an authentication token", "The Client accepts a 'fetchOptions' function that can add the authentication token to requests", "The Client doesn't need to implement authentication at all"]
correctAnswer: 2
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how you can implement authentication with urql to provide signup and login features to your users.

### Prepare the token logic

You'll later be adding a `Login` component and some mutations to either login or signup a user. These mutations return a `token` string that authenticates each request sent to your GraphQL API. For the purpose of this tutorial we'll store this token in your browser's `LocalStorage`.

However, let's write some utilities to make it easier to reuse this code and abstract the local storage API away.

<Instruction>

Create a new file in `src` and call it `token.js`. Then paste the following code into it:

```js(path=".../hackernews-react-urql/src/token.js")
const AUTH_TOKEN = 'auth-token';

export const getToken = () => localStorage.getItem(AUTH_TOKEN);
export const setToken = token => localStorage.setItem(AUTH_TOKEN, token);
export const deleteToken = () => localStorage.removeItem(AUTH_TOKEN);
```

</Instruction>

You now have two functions that you can use in the upcoming steps to set up authentication:

- the `getToken` funtion returns the token or `null` if the user is not logged in yet.
- the `setToken` function updates the token in local storage.
- the `deleteToken` function removes the token from local storage, when logging out.

> **Warning**: Storing JWTs in `localStorage` is not a safe approach to implement authentication on the frontend. Because this tutorial is focused on GraphQL, we want to keep things simple and therefore are using it here. You can read more about this topic [here](https://www.rdegges.com/2018/please-stop-using-local-storage/).

### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature. You'll start by building the `Login` UI.

<Instruction>

Create a new file in `src/components` and call it `Login.js`. Then paste the following code into it:

```js(path=".../hackernews-react-urql/src/components/Login.js")
import React from 'react'
import { setToken } from '../token'

const Login = props => {
  // Used to switch between login and signup
  const [isLogin, setIsLogin] = React.useState(true)

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  
  return (
    <div>
      <h4 className="mv3">{isLogin ? 'Login' : 'Sign Up'}</h4>

      <div className="flex flex-column">
        {!isLogin && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            type="text"
            placeholder="Your name"
          />
        )}
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="text"
          placeholder="Your email address"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Choose a safe password"
        />
      </div>

      <div className="flex mt3">
        <button
          type="button"
          className="pointer mr2 button"
        >
          {isLogin ? "login" : "create account"}
        </button>
        <button
          type="button"
          className="pointer button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'need to create an account?' : 'already have an account?'}
        </button>
      </div>
    </div>
  )
}

export default Login
```

</Instruction>

Let's quickly understand the structure of this new component, which can have two major states:

- One state is **for users that already have an account** and only need to login. In this state, the component will only render two `input` fields for the user to provide their `email` and `password`. `isLogin` will be `true` in this case.
- The second state is for **users that haven't created an account yet**, and thus still need to sign up. Here, you also render a third `input` field where users can provide their `name`. In this case, `isLogin` will be `false`.

Later, you'll add an `onClick` handler to the first button to execute the mutations for the login and signup functionality. You've also added an import for `setToken` at the top of the file that will later be used to update the token after the mutation is sent.

With that component in place, you can go ahead and add a new route to your `react-router` setup.

<Instruction>

Open `App.js` and update your routes to include the new `Login` component:

```js{8,18}(path=".../hackernews-react-urql/src/components/App.js")
import React from 'react'
import { Switch, Route } from 'react-router-dom'

import LoadingBoundary from './LoadingBoundary'
import Header from './Header'
import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Login from './Login'

const App = () => (
  <div className="center w85">
    <Header />
    <div className="ph3 pv1 background-gray">
      <LoadingBoundary>
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </LoadingBoundary>
    </div>
  </div>
)

export default App
```

</Instruction>

Finally, let's add a new link to the `Header` that allows the users to navigate to the `Login` page.

<Instruction>

Open `Header.js` and update it to look as follows:

```js{3,6,15-22,25-41}(path=".../hackernews-react-urql/src/components/Header.js")
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { getToken, deleteToken } from '../token'

const Header = props => {
  const isLoggedIn = !!getToken();

  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Hacker News</div>
        <Link to="/" className="ml1 no-underline black">
          new
        </Link>
        {isLoggedIn && (
          <div className="flex">
            <div className="ml1">|</div>
            <Link to="/create" className="ml1 no-underline black">
              submit
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-fixed">
        {isLoggedIn ? (
          <div
            className="ml1 pointer black"
            onClick={() => {
              deleteToken()
              props.history.push('/')
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

export default Header
```

</Instruction>

You first call `getToken()` to retrieve the current token from local storage. We just use it to see if the user is logged in. If the token is not available, the "Submit" link won't be rendered any more. That way you make sure only authenticated users can create new links.

You're also adding a second button to the right of the `Header` that users can use to either login or logout.

Here is what the app now looks like:

![](http://imgur.com/tBxMVtb.png)

Perfect, you're all set now to implement the authentication mutations.

### Add the authentication mutations

`signup` and `login` are two regular GraphQL mutations you can use in the same way as you did with the `createLink` mutation from before.

<Instruction>

Open `Login.js` and add the following import statements and GraphQL mutations at the top:

```js(path=".../hackernews-react-urql/src/components/Login.js")
import gql from 'graphql-tag'
import { useMutation } from 'urql'
import { setToken } from '../token'

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

Both mutations are very similar. They take a number of arguments and return a `token` that you can save to local storage to authenticate the user. You've also added the `useMutation` and `setToken` imports that are used in the next step to actually authenticate the user.

You're now going to implement the two mutations. Luckily you can write just one `useMutation` hook for both login and signup since their results are identical and only one of them is used at a time.

<Instruction>

Add the `useMutation` hook to the `Login` component:

```js(path=".../hackernews-react-urql/src/components/Login.js")
const Login = props => {
  // ...

  const [state, executeMutation] = useMutation(
    isLogin ? LOGIN_MUTATION : SIGNUP_MUTATION
  );

  const mutate = React.useCallback(() => {
    executeMutation({ email, password, name })
      .then(({ data }) => {
        const token = data && data[isLogin ? 'login' : 'signup'].token
        if (token) {
          setToken(token)
          props.history.push('/')
        }
      });
  }, [executeMutation, props.history, setToken, email, password, name]);
    
  // ...
};
```

</Instruction>

If the user wants to login you're passing `LOGIN_MUTATION` to `useMutation`, if the user wants to sign up you're passing `SIGNUP_MUTATION`. The `mutate` handler then calls `executeMutation` with all variables; `email`, `password`, and `name`. Lastly, after the mutation has finished, the token from the result data is stored, and the app then redirects to the homepage.

All right, all that's left to do is to add the handler to the `button` element!

<Instruction>

Also in `Login.js` and update `div` containing the two buttons as follows:

```js{5-6,13}(path=".../hackernews-react-urql/src/components/Login.js")
<div className="flex mt3">
  <button
    type="button"
    className="pointer mr2 button"
    disabled={state.fetching}
    onClick={mutate}
  >
    {isLogin ? "login" : "create account"}
  </button>
  <button
    type="button"
    className="pointer button"
    disabled={state.fetching}
    onClick={() => setIsLogin(!isLogin)}
  >
    {isLogin ? 'need to create an account?' : 'already have an account?'}
  </button>
</div>
```

</Instruction>

To summarise what you've been coding:

- you've added the `LOGIN_MUTATION` and the `SIGNUP_MUTATION`, and added a `useMutation` hook that uses one of them depending on `isLogin`.
- you've implemented a `mutate` handler that calls `executeMutation` with the `Login` form's variables, stores the token from the result in local storage, and redirects to the homepage
- and lastly, you added the handler and `disabled` flags to the buttons

> **Note**: Like with queries, depending on what your mutations definitions request, you'll get different sets of data. That's why you need to read either from `login` or `signup` on the result `data`.

You can now create an account by providing a `name`, `email` and `password`. Once you've done that, the "Submit" button in the header will be displayed again:

![](https://imgur.com/z4KILTw.png)

If you haven't done so yet, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the "**need to create an account?**" button and provide some user data for the user you're creating. Finally, submit and if all went well, the app will navigate back to the homepage and your user was created.

You can verify that the new user has properly been added by sending the `users` query to the **dev** Playground in the **database** project.

### Configuring the urql Client with the token

Now that users are able to login and obtain a token that authenticates them against your GraphQL API, you actually need to make sure that the token gets attached to all requests that are sent.

Since all the API requests are actually created and sent by urql's `Client` in your app, you need to make sure it knows about the user's token! There are several ways of doing this, the easiest being the `fetchOptions` option that you can pass to the client.

<Instruction>

Open `src/index.js` and modify the `client` and import statements like so:

```js{1,7-12}(path=".../hackernews-react-urql/src/index.js")
import { getToken } from './token'

// ...

const client = new Client({
  url: 'http://localhost:4000',
  fetchOptions: () => {
    const token = getToken()
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' }
    }
  },
  exchanges: [dedupExchange, suspenseExchange, cache, fetchExchange],
  suspense: true
})

```

</Instruction>

Just one more configuration option for the `Client`, that's it!

Now all your GraphQL operations will have an `Authorization` header if a `token` is available. This works because `fetchExchange` will call `fetchOptions` for every request it sends and attaches them to its default `fetch` parameters. Your GraphQL API will use this token to retrieve data on the user that is currently logged in.

> **Note**: In fully productionized apps you may run into cases where you need to reauthenticate or refresh the token on the fly, or maybe you can't retrieve the token synchronously.
> In those cases it will make sense to write a custom Exchange that handles authentication for you. [You can find a guide on how to write an authentication exchange on the urql docs.](https://formidable.com/open-source/urql/docs/guides/#authentication)

### Requiring authentication on the server-side

The last thing you might do in this chapter is check how to ensure only authenticated users are able to `post` new links. Plus, every `Link` that's created by a `post` mutation should automatically set the `User` who sent the request for its `postedBy` field.

<Instruction>

Open `server/src/resolvers/Mutation.js` and take a look at how you may implement this:

```js(path=".../hackernews-react-urql/server/src/resolvers/Mutation.js")
function post(parent, { url, description }, context) {
  const userId = getUserId(context)
  return context.prisma.createLink({
    url,
    description,
    postedBy: {
      connect: {
        id: userId
      }
    }
  })
}
```

</Instruction>

With this, you're extracting the `userId` from the `Authorization` header of the request and use it to directly [`connect`](https://www.prismagraphql.com/docs/reference/prisma-api/mutations-ol0yuoz6go#nested-mutations) it with the `Link` that's being created. Note that `getUserId` will [throw an error](https://github.com/howtographql/react-urql/blob/master/server/src/utils.js#L12) if the token is invalid or missing.
