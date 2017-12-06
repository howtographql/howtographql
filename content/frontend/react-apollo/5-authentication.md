---
title: Authentication
pageTitle: "Authentication with GraphQL, React & Apollo Tutorial"
description: "Learn best practices to implement authentication with GraphQL & Apollo Client to provide an email-and-password-based login in a React app with Graphcool."
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

Create a new file in `src/components` and call it `Login.js`. Then paste the following code into it:

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

  _saveUserData = (id, token) => {
    localStorage.setItem(GC_USER_ID, id)
    localStorage.setItem(GC_AUTH_TOKEN, token)
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
 
Before you can implement the authentication functionality in `Login.js`, you need to update the running Graphcool service and add authentication on the server-side.

### Enabling Email-and-Password Authentication & Updating the Schema

Authentication in the Graphcool Framework is based on [resolver](https://www.graph.cool/docs/reference/functions/resolvers-su6wu3yoo2) functions that deal with login-functionality by issuing and returning [node tokens](https://www.graph.cool/docs/reference/auth/authentication/authentication-tokens-eip7ahqu5o#node-tokens) which are used to authenticate requests.

Graphcool has a lightweight and flexible [template](https://www.graph.cool/docs/reference/service-definition/templates-zeiv8phail) system that allows to conventiently pull in predefined functionality into a service. You'll be using the `email-password` template for authentication.

You can use the CLI's [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command to use a template in your Graphcool service. This command will perform two major tasks:

- Download the files from Graphcool's [`templates` repository](https://github.com/graphcool/templates) that are required for the `email-password` template.
- Add commented lines to `graphcool.yml` and `types.graphql` that allow you to "activate" the template's functionality by uncommenting them and then invoking `graphcool deploy` again. 

<Instruction>

Navigate into the `server` directory inside your project and run the following command:

```bash(path="../hackernews-react-apollo/server")
graphcool add-template graphcool/templates/auth/email-password
```

</Instruction>

This now downloaded six new files and placed them in the `src/email-password` directory. It also added comments to `graphcool.yml` and `types.graphql`.

Next, you have to actually "activate" the templates functionality by uncommenting these lines.

<Instruction>

Open `graphcool.yml` and uncomment the definitions for the `signup`, `authenticate` and `loggedInUser` functions:

```yml(path=".../hackernews-react-apollo/server/graphcool.yml)
functions:

# added by email-password template: (please uncomment)

  signup:
    type: resolver
    schema: src/email-password/signup.graphql
    handler:
      code: src/email-password/signup.ts

  authenticate:
    type: resolver
    schema: src/email-password/authenticate.graphql
    handler:
      code: src/email-password/authenticate.ts

  loggedInUser:
    type: resolver
    schema: src/email-password/loggedInUser.graphql
    handler:
      code: src/email-password/loggedInUser.ts
```

</Instruction>

If you take a look at the code for these functions, you'll notice that they're referencing a `User` type that still needs to be added to your data model. In fact, the `add-template` command already wrote this `User` type to `types.graphql` - except that it still has comments.

<Instruction>

Open `types.graphql` and uncomment the `User` type:

```graphql(path=".../hackernews-react-apollo/server/types.graphql)
# added by email-password template: (please uncomment)
type User @model {
  id: ID! @isUnique   
  createdAt: DateTime!
  updatedAt: DateTime!
  email: String! @isUnique
  password: String!
}
```

</Instruction>

Before you apply the changes to the running service, you'll make another modification to your data model by adding the _relation_ between the `Link` and the newly added `User` type as well as a new field `name` for the `User`.

<Instruction>

Open your type definitions file `types.graphql` and update the `User` and `Link` types as follows:

```{7,14,17}graphql
type Link @model {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
  description: String!
  url: String!
  postedBy: User @relation(name: "UsersLinks")
}

type User @model {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  email: String @isUnique
  password: String
  links: [Link!]! @relation(name: "UsersLinks")
}
```

</Instruction>

You added two things to the schema:

- A new field on the `User` type to store the `name` of the user.
- A new relation between the `User` and the `Link` type that represents a one-to-many relationship and expresses that one `User` can be associated with multiple links. The relation manifests itself in the two fields `postedBy` and `links`.

Now it's time to apply the changes by deploying your service again.

<Instruction>

Save the file and execute the following command in the `server` directory in a terminal:

```bash(path="../hackernews-react-apollo/server")
graphcool deploy
```

</Instruction>

Your GraphQL API now includes three additional operations, as specified in `graphcool.yml`:

- `signup`: Create a new user based on `email` and `password`.
- `authenticate`: Log in existing user with `email` and `password`.
- `loggedInUser`: Checks whether a user is currently logged in.

### Adding an additional Argument to the `signup` Mutation

You can see the GraphQL interface for the newly added operations in the corresponding `.graphql`-files inside the `server/src/email-password` directory. Let's take a look at the interface of the `signup` function:

```graphql(nocopy)
type SignupUserPayload {
  id: ID!
  token: String!
}

extend type Mutation {
  signupUser(email: String!, password: String!): SignupUserPayload
}
```

The `signupUser`-mutation is used to create a new `User` in the database. The problem right now is that our schema requires every `User` instance to have a `name`. However, the above `signupUser`-mutation only accepts `email` and `password` as arguments. You now need to adjust the `signup` resolver so it also accepts the `name` for the new `User` as an input argument and make sure it's saved when the `User` is created.

<Instruction>

Open `server/src/email-password/signup.graphql` and update the extension of the `Mutation` type to look as follows:

```graphql(path="../hackernews-react-apollo/server/src/email-password/signup.graphql")
extend type Mutation {
  signupUser(email: String!, password: String!, name: String!): SignupUserPayload
}
```

</Instruction>

For now you only adjusted the _interface_ of the `signup` resolver. Next, you also need to make sure to update the _implementation_. 

> Note: The `signup` resolver is implemented as a [serverless function](https://www.graph.cool/docs/reference/functions/overview-aiw4aimie9) which will be deployed for you by the Graphcool Framework. The input arguments for that function are determined by the input arguments of the corresponding GraphQL operation. In this case, this is the `signupUser`-mutation, so the function will received three string as input arguments: `email`, `password` and `name`. (Notice that these are wrapped in a single object called `event` though.)

The goal in the new implementation is to retrieve the `name` argument from the input `event` and send it along when creating the new `User`.

<Instruction>

Open `signup.ts` and update the definition of the `EventData` interface like so:

```ts{4}(path="../hackernews-react-apollo/server/src/email-password/signup.ts")
interface EventData {
  email: string
  password: string
  name: string
}
```

</Instruction>

<Instruction>

Still in `signup.ts`, adjust the implementation of the anonymous (and topmost) function to look as follows:

```ts{8,26}(path="../hackernews-react-apollo/server/src/email-password/signup.ts")
export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')

    const { email, password, name } = event.data

    if (!validator.isEmail(email)) {
      return { error: 'Not a valid email' }
    }

    // check if user exists already
    const userExists: boolean = await getUser(api, email)
      .then(r => r.User !== null)
    if (userExists) {
      return { error: 'Email already in use' }
    }

    // create password hash
    const salt = bcrypt.genSaltSync(SALT_ROUNDS)
    const hash = await bcrypt.hash(password, SALT_ROUNDS)

    // create new user
    const userId = await createGraphcoolUser(api, email, hash, name)

    // generate node token for new User node
    const token = await graphcool.generateNodeToken(userId, 'User')

    return { data: { id: userId, token } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during signup.' }
  }
}
```

</Instruction>

All you do is also retrieve the `name` from the input `event` and then pass it to the `createGraphcoolUser` function a bit later.

<Instruction>

Still in `signup.ts`, update the `createGraphcoolUser` function like so:

```ts{1,7,17}(path="../hackernews-react-apollo/server/src/email-password/signup.ts")
async function createGraphcoolUser(api: GraphQLClient, email: string, password: string, name: string): Promise<string> {
  const mutation = `
    mutation createGraphcoolUser($email: String!, $password: String!, $name: String!) {
      createUser(
        email: $email,
        password: $password,
        name: $name
      ) {
        id
      }
    }
  `

  const variables = {
    email,
    password,
    name
  }

  return api.request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id)
}
```

</Instruction>

All that's left for you now is deploying these changes to make sure your running Graphcool service gets updated and exposes the new functionality in its API.

<Instruction>

In your terminal, navigate to the `server` directory and run:

```bash(path=".../hackernews-react-apollo/server")
graphcool deploy
```

</Instruction>  

Perfect, you're all set now to actually implement the authentication functionality in the frontend as well.

### Implementing the Login Mutations

`signupUser` and `authenticateUser` are two regular GraphQL mutations that you can use in the same way as you did with the `createLink` mutation from before.

<Instruction>

Open `Login.js` and add the following two definitions to the bottom of the file, also replacing the current `export Login` statement:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
const SIGNUP_USER_MUTATION = gql`
  mutation SignupUserMutation($email: String!, $password: String!, $name: String!) {
    signupUser(
      email: $email,
      password: $password,
      name: $name
    ) {
      id
      token
    }
  }
`

const AUTHENTICATE_USER_MUTATION = gql`
  mutation AuthenticateUserMutation($email: String!, $password: String!) {
    authenticateUser(
      email: $email,
      password: $password
    ) {
      token
      user {
        id
      }
    }
  }
`

export default compose(
  graphql(SIGNUP_USER_MUTATION, { name: 'signupUserMutation' }),
  graphql(AUTHENTICATE_USER_MUTATION, { name: 'authenticateUserMutation' })
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

Now, let's understand what's going in the two mutations that you just added to the component.

Both mutations look very similar to the mutations you already saw before. They take a number of arguments returns info the user's `id` as well as a `token` that you can attach to subsequent requests to authenticate the user. You'll learn in a bit how to do so.

All right, all that's left to do is call the two mutations inside the code!

<Instruction>

Open `Login.js` and implement `_confirm` as follows:

```js(path=".../hackernews-react-apollo/src/components/Login.js")
  _confirm = async () => {
    const { name, email, password } = this.state
    if (this.state.login) {
      const result = await this.props.authenticateUserMutation({
        variables: {
          email,
          password
        }
      })
      const { id, token } = result.data.authenticateUser
      this._saveUserData(id, token)
    } else {
      const result = await this.props.signupUserMutation({
        variables: {
          name,
          email,
          password
        }
      })
      const { id, token } = result.data.signupUser
      this._saveUserData(id, token)
    }
    this.props.history.push(`/`)
  }
```

</Instruction>

The code is pretty straightforward. If the user wants to only login, you're calling the `authenticateUserMutation` and pass the provided `email` and `password` as arguments. Otherwise you're using the `signupUserMutation` where you additionally pass the user's `name`. After the mutation was performed, you're storing the returned `id` and `token` in `localStorage` and navigate back to the root route.

You can now create an account by providing a `name`, `email` and `password`. Once you did that, the _submit_-button will be rendered again:

![](http://imgur.com/WoWLmDJ.png) 

### Updating the `createLink`-mutation

Since you're now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That's what the `postedBy` field on `Link` will be used for.

<Instruction>

Open `CreateLink.js` and update the definition of `CREATE_LINK_MUTATION` as follows:

```js{2,6,12-15}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
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


There are two major changes. You first added another argument to the mutation that represents the `id` of the user that is posting the link. Secondly, you also include the `postedBy` information in the _selection set_ of the mutation.

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

If you haven't done so before, go ahead and test the login functionality. Run `yarn start` and open `http://localhost:3000/login`. Then click the _need to create an account?_-button and provide some user data for the user you're creating. Finally, click the _create account_-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by checking the _data browser_ in the [Graphcool Console](https://console.graph.cool) or sending the `allUsers` query in a Playground.

### Configuring Apollo with the Authentication Token

Now that users are able to login and obtain a token that authenticates them against the Graphcool backend, you actually need to make sure that the token gets attached to all requests that are sent to your service's API.

Since all the API requests are actually created and sent by the `ApolloClient` instance in your app, you need to make sure it knows about the user's token. Luckily, Apollo provides a nice way for authenticating all requests by using the concept of [middleware](http://dev.apollodata.com/react/auth.html#Header), implemented as an [Apollo Link](https://github.com/apollographql/apollo-link).

<Instruction>

Open `index.js` and put the following code _between_ the creation of the `httpLink` and the instantiation of the `ApolloClient`:

```js(path=".../hackernews-react-apollo/src/index.js")
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GC_AUTH_TOKEN)
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

This middleware will be invoked every time `ApolloClient` sends a request to the server. You can imagine the process of sending a request as a _chain_ of functions that are called. Each function gets passed the GraphQL `operation` and another function called `forward` which needs to be called when the middleware is finished with its task to passed the `operation` to the next function in the chain. 

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
import { GC_AUTH_TOKEN } from './constants'
import { ApolloLink } from 'apollo-client-preset'
```

</Instruction>

That's it - now all your API requests will be authenticated if a `token` is available.

> **Note**: In a real application you would now configure the [permissions rules](https://www.graph.cool/docs/reference/auth/authorization/overview-iegoo0heez/) of your project to define what kind of operations authenticated and non-authenticated users should be allowed to perform. See [this](https://github.com/graphcool/framework/tree/master/examples/permissions) Graphcool service definition for a practical example. 
