---
title: Authentication
description: In this chapter, you implement the authentication functionality so users can login to your app.
question: "What are the names of the two mutations that are added to the Graphcool project after the Email+Password Auth Provider was enabled?"
answers: ["loginUser & logoutUser", "signinUser & createUser", "createUser & loginUser", "signinUser & logoutUser"]
correctAnswer: 1
videoId: MiNDIWK7Q1I
duration: 12
videoAuthor: "Abhi Aiyer"
---

In this section, you'll learn how you can implement authentication functionality with Apollo and Graphcool to provide a login to the user.

### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature. You'll start by implementing the `Login` component. 

<Instruction>

Create a new file in `src/components` and call it `Login.js`. Then paste the following code inside of it:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
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


Let's quickly understand the structure of this new component. The component can have two major states. 

One state for users that already have an account and only need to login, here the component will only render two `input` fields for the user provide `email` and `password`. Notice that `state.login` will be `true` in this case. 

The second state is for users that haven't created an account yet and thus still need to sign up. Here, you also render a third `input` field where users can provide their `name`. In this case, `state.login` will be `false`.

The method `_confirm`  will be used to implement the mutations that we need to send for the login functionality.

Next you also need to provide the `constants.js` file that we use to define keys for the credentials that we're storing in the browser's `localStorage`. 

<Instruction>

In `src`, create a new file called `constants.js` and add the following two definitions:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const GC_USER_ID = 'graphcool-user-id'
export const GC_AUTH_TOKEN = 'graphcool-auth-token'
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

```js{2,8,13,15-25}(path=".../hackernews-react-apollo/src/components/Header.js")
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


You first retrieve the `userId` from local storage. If the `userId` is not available, the _submit_-button won't be rendered any more. That way you make sure only authenticated users can create new links. 

You're also adding a second button to the right of the `Header` that users can use to login and logout.

<Instruction>

Lastly, you need to import the key definitions from `constants.js` in `Header.js `. Add the following statement to the top of file:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants'
```

</Instruction>

 
Here is what the ready component looks like:

![](http://imgur.com/tBxMVtb.png)
 
Before you can implement the authentication functionality in `Login.js`, you need to prepare the Graphcool project and enable authentication on the server-side.

### Enabling Email-and-Password Authentication & Updating the Schema


<Instruction>

In the directory where `project.graphcool` is located, type the following into the terminal:

```bash(path="../hackernews-react-apollo")
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

```bash(path="../hackernews-react-apollo")
graphcool pull
```

</Instruction>

> Note: Before the remote schema gets fetched, you will be asked to confirm that you want to override the current project file. You can confirm by typing `y`. 

This will bump the schema `version` to `2` and update the `User` type to now also include the `email` and `password` fields:

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

```{7,17}graphql
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

```bash(path="../hackernews-react-apollo")
graphcool push
```

</Instruction>


Here is the Terminal output after you can the command:

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

Open `Login.js` and add the following two definitions to the bottom of the file, also replacing the current `export Login` statement:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
const CREATE_USER_MUTATION = gql`
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
`

const SIGNIN_USER_MUTATION = gql`
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
`

export default compose(
  graphql(CREATE_USER_MUTATION, { name: 'createUserMutation' }),
  graphql(SIGNIN_USER_MUTATION, { name: 'signinUserMutation' })
)(Login)
```

</Instruction>


Note that you're using `compose` for the export statement this time since there is more than one mutation that you want to wrap the component with.

Before we take a closer look at the two mutations, go ahead and add the required imports. 

<Instruction>

Still in `Login.js`, add the following statement to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
import { gql, graphql, compose } from 'react-apollo'
```

</Instruction>


Now, let's understand what's going in the two mutations that you just added to the component.

The `SIGNIN_USER_MUTATION` looks very similar to the mutations we saw before. It simply takes the `email` and `password` as arguments and returns info about the `user` as well as a `token` that you can attach to subsequent requests to authenticate the user. You'll learn in a bit how to do so.

The `CREATE_USER_MUTATION` however is a bit different! Here, we actually define _two_ mutations at once! When you're doing that, the execution order is always _from top to bottom_. So, in your case the `createUser` mutation will be executed _before_ the `signinUser` mutation. Bundling two mutations like this allows to sign up and login in a single request!

All right, all that's left to do is call the two mutations inside the code!

<Instruction>

Open `Login.js` and implement `_confirm` as follows:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
_confirm = async () => {
  const { name, email, password } = this.state
  if (this.state.login) {
    const result = await this.props.signinUserMutation({
      variables: {
        email,
        password
      }
    })
    const id = result.data.signinUser.user.id
    const token = result.data.signinUser.token
    this._saveUserData(id, token)
  } else {
    const result = await this.props.createUserMutation({
      variables: {
        name,
        email,
        password
      }
    })
    const id = result.data.signinUser.user.id
    const token = result.data.signinUser.token
    this._saveUserData(id, token)
  }
  this.props.history.push(`/`)
}
```

</Instruction>

The code is pretty straightforward. If the user wants to only login, you're calling the `signinUserMutation` and pass the provided `email` and `password` as arguments. Otherwise you're using the `createUserMutation` where you also pass the user's `name`. After the mutation was performed, you're storing the `id` and `token` in `localStorage` and navigate back to the root route.

You can now create an account by providing a `name`, `email` and `password`. Once you did that, the _submit_-button will be rendered again:

![](http://imgur.com/WoWLmDJ.png) 

### Updating the `createLink`-mutation

Since you're now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That's what the `postedBy` field on `Link` will be used for.

<Instruction>

Open `CreateLink.js` and update the definition of `CREATE_LINK_MUTATION` as follows:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
const CREATE_LINK_MUTATION = gql`
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

Now you need to make sure that the `id` of the posting user is included when you're calling the mutation in `_createLink`.

<Instruction>

Still in `CreateLink.js`, update the implementation of `_createLink` like so:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
_createLink = async () => {
  const postedById = localStorage.getItem(GC_USER_ID)
  if (!postedById) {
    console.error('No user logged in')
    return
  }
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url,
      postedById
    }
  })
  this.props.history.push(`/`)
}
```

</Instruction>


For this to work, you also need to import the `GC_USER_ID` key. 


<Instruction>

Add the following import statement to the top of `CreateLink.js`.

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { GC_USER_ID } from '../constants'
```

</Instruction>


Perfect! Before sending the mutation, you're now also retrieving the corresponding user id from `localStorage`. If that succeeds, you'll pass it to the call to `createLinkMutation` so that every new `Link` will from now on store information about the `User` who created it.

If you haven't done so before, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the _need to create an account?_-button and provide some user data for the user you're crreating. Finally, click the _create Account_-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by checking the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) or sending the `allUsers` query in a Playground.

### Configuring Apollo with the Auth Token

Now that users are able to login and obtain a token that authenticates them against the Graphcool backend, you actually need to make sure that the token gets attached to all requests that are sent to the API.

Since all the API request are actually created and sent by the `ApolloClient` in your app, you need to make sure it knows about the user's token. Luckily, Apollo provides a nice way for authenticating all request by using [middleware](http://dev.apollodata.com/react/auth.html#Header).

<Instruction>

Open `index.js` and put the following code _between_ the creation of the `networkInterface` and the instantation of the `ApolloClient`:

```js(path=".../hackernews-react-apollo/src/index.js")
networkInterface.use([{
  applyMiddleware(req, next) {
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

```js
import { GC_AUTH_TOKEN } from './constants'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

> Note: In a real application you would now configure the [authorization rules](https://www.graph.cool/docs/reference/auth/authorization-iegoo0heez/) (permissions) of your project to define what kind of operations authenticated and non-authenticated users should be allowed to perform. 