---
title: "React + Apollo"
videoid: "asdasd"
---

# React + Apollo

## Introduction

### Overview

In the previous chapter, you learned about major concepts and benefits of GraphQL. Now is the time to get your hands dirty and start out with an actual project!

You're going to build a simple clone of [Hackernews](https://news.ycombinator.com/). Here's a list of the features the app will have:

- Display a list of links
- Search the list of links
- Users can authenticate
- Authenticated users can create new links
- Authenticated users can upvote links (one vote per link and user)
- Realtime updates when other users upvote a link or create a new one

In this track, you'll use the following technologies for building the app:

- Frontend:
    - [React](https://facebook.github.io/react/): Frontend framework for building user interfaces
    - [Apollo Client](https://github.com/apollographql/apollo-client): Fully-featured, production ready caching GraphQL client
- Backend:
    - [Graphcool](https://www.graph.cool/): Flexible backend platform combining GraphQL + Serverless

You'll create the React project with [`create-react-app`](https://github.com/facebookincubator/create-react-app), a popular command-line tool that gives you a blank project with all required build configuration already setup.


### Why a GraphQL Client?

In the [Clients]() section in the GraphQL part, we already covered the responsibilities of a GraphQL client on a higher level, now it's time to get bit more concrete.

In short, you should use a GraphQL client for tasks that are repetitive and agnostic to the app you're building. For example, being able to send queries and mutations without having to worry about lower-level networking details or maintaining a local cache. This is functionality that you'll want in any frontend application that's talking to a GraphQL server - why build it yourself if you can use one of the amazing GraphQL clients out there?

There are a few GraphQL client libraries available. For very simple use cases (such as writing scripts), [`graphql-request`](https://github.com/graphcool/graphql-request) might already be enough for your needs. However, chances are that you're writing a somewhat larger application where you want to benefit from caching, optimistic UI updates and other handy features. In these cases, you pretty much have the choice between [Apollo Client](https://github.com/apollographql/apollo-client) and [Relay](https://facebook.github.io/relay/).


### Apollo vs Relay

The most common question heard from people that are getting started with GraphQL on the frontend is which GraphQL client they should use. We'll try to provide a few hints that'll help you decide which of these clients is the right one for your next project!

[Relay](https://facebook.github.io/relay/) is Facebook's homegrown GraphQL client that they open-sourced alongside GraphQL in 2015. It incorporates all the learnings that Facebook gathered since they started using GraphQL in 2012. Relay is heavily optimized for performance and tries to reduce network traffic where possible. An interesting side-note is that Relay itself actually started out as a _routing_ framework that eventually got combined with data loading responsibilities. It thus evolved into a powerful data management solution that can be used in Javascript apps to interface with GraphQL APIs.

The performance benefits of Relay come at the cost of a notable learning curve. Relay is a pretty complex framework and understanding all its bits and pieces does require some time to really get into it. The overall situation in that respect has improved with the release of the 1.0 version, called [Relay Modern](), but if you're for something to _just get started_ with GraphQL, Relay might not be the right choice just yet.

[Apollo Client](https://github.com/apollographql/apollo-client) is a community-driven effort to build an easy-to-understand, flexible and powerful GraphQL client. Apollo has the ambition to build one library for every major development platform that people use to build web and mobile applications. Right now there is a Javascript client with bindings for popular frameworks like [React](https://github.com/apollographql/react-apollo), [Angular](https://github.com/apollographql/apollo-angular) or [Vue](https://github.com/Akryum/vue-apollo) as well as early versions of [iOS](https://github.com/apollographql/apollo-ios) and [Android](https://github.com/apollographql/apollo-android) clients. Apollo is production-ready and has handy features like caching, optimistic UI, subscription support and many more.


## Getting Started

### Backend

Since this is a frontend track, we don't want to spend too much time setting up the backend. This is why we use [Graphcool](https://www.graph.cool/), a service that provides a production-ready GraphQL API out-of-the-box.

#### The Data Model

You'll use the [Graphcool CLI](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/) to generate the server based on the data model that we need for the app. Speaking of the data model, here is what the final version of it looks like written in the [GraphQL Schema Definition Language]() (SDL):

```graphql
type User {
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link {
  url: String!
  postedBy: User! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

#### Creating the GraphQL Server

For starting out, we're not going to use the full data model that you saw above. That's becasue we want to evolve the schema when it becomes necessary for the features that we implement.

For now, we're just going use the `Link` type to create our backend.

The first thing you need to do is install the Graphcool CLI with npm. Open up a terminal window and type the following:

```sh
npm install -g graphcool
```

Now you can go and create the server. Type the following command into the terminal:

```sh
graphcool init --schema https://graphqlbin.com/hn-starter.graphql --name Hackernews
```

This will execute the `graphcool init` command with two arguments:

- `--schema`: This option accepts a `.graphql`-schema that's either stored locally or at a remote URL. In your case, you're using the starter schema stored at [https://graphqlbin.com/hn-starter.graphql](https://graphqlbin.com/hn-starter.graphql), we'll take a look at it in a bit.
- `--name`: This is the name of the Graphcool project you're creating, here you're simply calling it `Hackernews`.

Note that this command will open up a browser window first and ask you to authenticate on the Graphcool platform.

The schema that's stored at [https://graphqlbin.com/hn-starter.graphql](https://graphqlbin.com/hn-starter.graphql) only defines the `Link` type for now:

```graphql
type Link implements Node {
  description: String!
  url: String!
}

```

Once the project was created, you'll find the [Graphcool Project File](https://www.graph.cool/docs/reference/cli/project-files-ow2yei7mew/) (`project.graphcool`) in the directory where you executed the command. It should look similar to this:

```graphql
# project: cj400nwfthe5501857zl5zvi1
# version: 1

type File implements Node {
  contentType: String!
  createdAt: DateTime!
  id: ID! @isUnique
  name: String!
  secret: String! @isUnique
  size: Int!
  updatedAt: DateTime!
  url: String! @isUnique
}

type Link implements Node {
  createdAt: DateTime!
  description: String!
  id: ID! @isUnique
  updatedAt: DateTime!
  url: String!
}

type User implements Node {
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
}
```

The top of the file contains some metadata about the project, namely the _project ID_ and the _version number of the schema_.

The [`User`](https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#user-type) and [`File`](https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#file-type) types are generated by Graphcool and have some special characteristics. `User` can be used for _authentication_ and `File` for _file management_.

Also notice that each type has three fields called `id`, `createdAt` and `updatedAt`. These are managed by the system and read-only for you.

#### Populate The Database & GraphQL Playgrounds

TBD for import command


### Frontend

#### Creating the App

Next, you are going to create the React project! As mentioned in the beginning, you'll use `create-react-app` for that.

If you haven't already, you need to install `create-react-app` using npm:

```sh
npm install -g create-react-app
```

Next, you can use it to bootstrap your React application:

```sh
create-react-app hackernews-react-apollo
```

This will create a new directory called `hackernews-react-apollo` that has all the basic configuration setup.

Make sure everything works by navigating into the directory and starting the app:

```sh
cd hackernews-react-apollo
yarn start
```

This will open a browser and navigate to `http://localhost:3000` where the app is running. If everything went well, you'll see the following:

![](http://imgur.com/Yujwwi6.png)

Next you should move `project.graphcool` into the `hackernews-react-apollo` directory to manage everything in one place.

To improve the project structure, you can now create two directories, both inside the `src` folder. The first is called `components` and will hold all our React components. Call the second one `styles`, that one is for all the CSS files.

Now clean up the existing files accordingly. Move `App.js` into `components` and `App.css` as well as `index.css` into `styles`.

Your project structure should now look as follows:

```sh
.
├── README.md
├── node_modules
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── App.test.js
│   ├── components
│   │   └── App.js
│   ├── index.js
│   ├── logo.svg
│   ├── registerServiceWorker.js
│   └── styles
│       ├── App.css
│       └── index.css
└── yarn.lock
```


#### Installing Dependencies

There are two dependencies that you're going to install right away. The first one is the [Tachyons](http://tachyons.io/) library that will ease usage of CSS in the project.

In the `hackernews-react-apollo` directory, type the following into a terminal:

```sh
yarn add tachyons --dev
```

Next, you need to pull in the functionality of Apollo Client that's all bundled in the `react-apollo` package:

```sh
yarn add react-apollo
```

That's it, you're ready to write some code!


#### Configuring the `ApolloClient`

Apollo abstracts away all lower-lever networking logic and provides a nice interface to the GraphQL API. In contrast to working with REST APIs, you don't have to deal with constructing your own HTTP requests any more - instead you can simply write queries and mutations and send them using the `ApolloClient`.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the endpoint of your GraphQL API so it can deal with the network connections.

Open `src/index.js` and replace the contents with the following:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
// 1
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'

// 2
const networkInterface = createNetworkInterface({
  uri: '__SIMPLE_API_ENDPOINT__'
})

// 3
const client = new ApolloClient({
  networkInterface
})

// 4
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
  , document.getElementById('root')
)
registerServiceWorker()
```

> Note: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use no semicolons and single quotes.

Let's try to understand what's going on in there:

1. You're importing the required dependencies from the `react-apollo` package
2. Here you create the `networkInterface`, you'll replace the placeholder `__SIMPLE_API_ENDPOINT__` with your actual endpoint in a bit.
3. Now you instantiate the `ApolloClient` by passing in the `networkInterface`.
4. Finally you render the root component of your React app. The `App` is wrapped with the higher-order component `ApolloProvider` that gets passed the `client` as a prop.

Next you need to replace the placeholder for the GraphQL endpoint with your actual endpoint. But where do you get your endpoint from?

There are two ways for you to get your endpoint. You can either open the [Graphcool Console](https://console.graph.cool) and click the _Endoints_-button in the bottom-left corner. The second option is to use the CLI.

In the terminal, navigate into the directory where `project.graphcool` is located and use the following command:

```
graphcool endpoints
```

Copy the endpoint for the `Simple API` and paste it into `index.js` to replace the current placeholder `__SIMPLE_API_ENDPOINT__`.

That's it, you're all set to start loading some data into your app!


### Queries: Loading Links

#### Preparing the React components

The first piece of functionality that we want to implement in the app is loading and displaying a list of `Link` elements.

We'll walk up our way in the React component hierarchy and start with the component that'll render a single link.

Create a new file called `Link.js` in the `components` directory and add the following code:

```js
import React, { Component } from 'react'

class Link extends Component {

  render() {
    return (
      <div>
        <div>{this.props.link.description} ({this.props.link.url})</div>
      </div>
    )
  }

  _voteForLink = async () => {
    // ... you'll implement this in chapter 6
  }

}

export default Link
```

This is a simple React component that expects a `link` in its `props` and renders the link's `description` and `url`. Easy as pie!

Next, you'll implement the component that renders a list of links.

Again, in the `components` directory, go ahead and create a new file called `LinkList.js` and add the following code:

```js
import React, { Component } from 'react'
import Link from './Link'

class LinkList extends Component {

  render() {

    const linksToRender = [{
      id: '1',
      description: 'The Coolest GraphQL Backend',
      url: 'https://www.graph.cool'
    }, {
      id: '2',
      description: 'The Best GraphQL Client',
      url: 'http://dev.apollodata.com/'
    }]

    return (
      <div>
        {linksToRender.map(link => (
          <Link key={link.id} link={link}/>
        ))}
      </div>
    )
  }

}

export default LinkList
```

Here, you're using mock data for now to make sure the component setup works. You'll soon replace this with some actual data loaded from the server - patience, young Padawan!

To complete the setup, open `App.js` and replace the contents with the following:

```js
import React, { Component } from 'react'

class App extends Component {
  render() {
    return (
      <LinkList />
    )
  }
}

export default App
```

Run the app to check if everything works so far! The app should now display the two links from the `linksToRender` array:

![](http://imgur.com/NgR8gZC.png)


#### Writing the GraphQL Query

You'll now load the actual links that are stored on the server. The first thing you need to do for that is define the GraphQL query that you want to send to the API.

Here is what it looks like:

```graphql
query AllLinks {
  allLinks {
    id
    createdAt
    description
    url
  }
}
```

You could now simply execute this query in a Playground. But how can you use inside your Javascript code?


#### Queries with Apollo Client

When using Apollo, you've got two ways of sending queries to the server.

The first one is to use the [`query`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.query) method on the `ApolloClient` directly. This is a more _imperative_ way of fetching data and will allow you to process the response as a _promise_.

A practical example would look as follows:

```js
client.query({
  query: gql`
    query AllLinks {
      allLinks {
        id
      }
    }
  `
}).then(response => console.log(response.data.allLinks))
```

A more idiomatic way when using React however is to use Apollo's higher-order component [`graphql`](http://dev.apollodata.com/react/api-graphql.html) to wrap your React component with a query.

With this approach, all you need to do when it comes to data fetching is write the GraphQL query and `graphql` will fetch the data for you under the hood and then make it available in your component's props.

In general, the process for you to add some data fetching logic will be very similar every time:

1. write the query as a JS constant using the `gql` parser function
2. use the `graphql` container to wrap your component with the query
3. access the query results in the component's `props`

Open up `LinkList.js` and add the query to the bottom of the file, also replacing the current `export LinkList` statement:

```js
// 1
const ALL_LINKS_QUERY = gql`
  # 2
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`

// 3
export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' }) (LinkList)
```

What's going on there?

1. Here you create the Javascript constant called `ALL_LINKS_QUERY` that stores the query. The `gql` function is used to parse the plain GraphQL code.
2. Now you define the plain GraphQL query. The name `AllLinksQuery` is the _operation name_ and will be used by Apollo to refer to this query in its internals.  (Notice we're using a GraphQL comment here.)
3. Finally, you're using the `graphql` container to combine the `LinkList` component with the `ALL_LINKS_QUERY`. Note that you're also passing an option to the function call where you specify a `name` to be `allLinksQuery`. This is the name of the `prop` that Apollo injects into the `LinkList`component. If you didn't specify it here, the injected prop would be called `data`.

For this code to work, you also need to import the corresponding dependencies. Add the following line to the top of the file below the other import statements:

```js
import { graphql, gql } from 'react-apollo'
```

Awesome, that's all your data fetching code, can you believe that?

You can now finally remove the mock data and render actual links that are fetched from the server.

Still in `LinkList.js`, update `render` as follows:

```js
render() {

  // 1
  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  // 2
  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }


  // 3
  const linksToRender = this.props.allLinksQuery.allLinks

  return (
    <div>
      {linksToRender.map(link => (
        <Link key={link.id} link={link}/>
      ))}
    </div>
  )
}
```

Let's walk through what's happening in this code. As expected, Apollo injected a new prop into the component called `allLinksQuery`. This prop itself has 3 fields that provide information about the _state_ of the network request:

1. `loading`: Is `true` as long as the request is still ongoing and the response hasn't been received.
2. `error`: In case the request fails, this field will contain information about what exactly went wrong.
3. `allLinks`: This is the actual data that was received from the server. It's an array of `Link` elements.

That's it! Go ahead and run `yarn start` again. You should see the exact same screen as before.


### Mutations: Creating Links

In this section, you'll learn how you can send mutations with Apollo. It's actually not that different from sending queries and follows the same three steps that were mentioned before, with a minor (but logical) difference in step 3:

1. write the mutation as a JS constant using the `gql` parser function
2. use the `graphql` container to wrap your component with the mutation
3. use the mutation function that gets injected into the component's props


#### Preparing the React components

Like before, let's start by writing the React component where users will be able to add new links.

Create a new file in the `src/components` directory and call it `CreateLink.js`. Then paste the following code into it:

```js
import React, { Component } from 'react'

class CreateLink extends Component {

  state = {
    description: '',
    url: ''
  }

  render() {

    return (
      <div>
        <div>
          <input
            value={this.state.description}
            onChange={(e) => this.setState({ description: e.target.value })}
            type='text'
            placeholder='A description for the link'
          />
          <input
            value={this.state.url}
            onChange={(e) => this.setState({ url: e.target.value })}
            type='text'
            placeholder='The URL for the link'
          />
        </div>
        <button
          onClick={() => this._createLink()}
        >
          Create Link
        </button>
      </div>
    )

  }

  _createLink = async () => {
    // ... you'll implement this in a bit
  }

}

export default CreateLink
```

This is a standard setup for a React component with two `input` fields where users can provide the `url` and description of the link they want to post. The data that's typed into these fields is stored in the data in will be used in `_createLink` when the mutation is sent.


#### Writing the Mutation

But how can you now actually send the mutation? Let's follow the three steps from before.

First you need to define the mutation in your Javascript code and wrap your component with the `graphl` container. You'll do that in a similar way as with the query before. In `CreateLink.js`, add the following statement to the bottom of the file (also replacing the current `export default CreatLink` statement):

```js
// 1
const CREATE_LINK_MUTATION = gql`
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
`

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(CreateLink)
```

Let's take close look again to understand what's going on:

1. You first create the Javascript constant called `CREATE_LINK_MUTATION ` that stores the mutation.
2. Now you define the actual GraphQL mutation. It takes two arguments, `url` and `description`, that you'll have to provide when calling the mutation.
3. Lastly, you're using the `graphql` container to combine the `CreateLink` component with the `CREATE_LINK_MUTATION `. The `name` that's spefified refers to the name of the prop that's injected into `CreateLink`. This time, a function will be injected that's called `createLinkMutation` and that you can call and pass in the required arguments.

Before moving on, you need to import the Apollo dependencies. Add the following to the top of `CreatLink.js`:

```js
import { graphql, gql } from 'react-apollo'
```

Let's see the mutation in action!

Still in `CreateLink.js`, implement the `_createLink` mutation as follows:

```js
_createLink = async () => {
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url
    }
  })
}
```

As promised, all you need to do is call the function that Apollo injects into `CreateLink` and pass the variables that represent the user input. Easy as pie! 🍰

Go ahead and see if the mutation works. To be able to test the code, open `App.js` and change `render` to looks as follows:

```js
render() {
  return (
    <CreateLink />
  )
}
```

Next, import the `CreatLink` component by adding the following statement to the top of `App.js`:

```js
import CreateLink from './CreateLink'
```

Now, run `yarn start`, you'll see the following screen:

![](http://imgur.com/JQ5PzEE.png)

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then click the _Create Link_-button. You won't get any visual feedback in the UI, but let's see if the query actually worked by checking the current list of links in a Playground.

Type `graphcool playground` into a Terminal and send the following query:

```graphql
{
  allLinks {
    description
    url
  }
}
```

You'll see the following server response:

```js
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


### Routing

In this section, you'll learn how to use the [`react-router`](https://github.com/ReactTraining/react-router) library with Apollo to implement some nagivation functionality!


#### Install Dependencies

First add the dependency to the app. Open a Terminal, navigate to your project directory and and type:

```sh
yarn add react-router-dom
```

#### Setup routes

You'll configure the different routes for the app in the project's root component: `App`. Open the correspdonding file `App.js` and update `render` to include the `LinkList` and the `CreateLink` components in different routes:

```js
render() {
  return (
    <Switch>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/' component={LinkList}/>
    </Switch>
  )
}
```

For this code to work, you need to import the required dependencies of `react-router`. Add the following statement to the top of the file:

```
import { Switch, Route } from 'react-router-dom'
```

Now you need to wrap the `App` with with `BrowserRouter` so that all child components of `App` will get access to the routing functionality.

Open `index.js` and add the following import statement to the top:

```js
import { BrowserRouter } from 'react-router-dom'
```

Now update `ReactDOM.render` and wrap the whole app with the `BrowserRouter`:

```js
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
```

That's it. If you run `yarn start`, you can now access two URLs. `http://localhost:3000/` will render `LinkList` and `http://localhost:3000/create` renders the `CreateLink` component you just wrote in the previous section.


#### Implement navigation

To wrap up this section, you'll implement functionality for the user to be able to switch between routes.

First, add a button to the `LinkList` component that allows the user to navigate to `CreateLink`.

Open `LinkList.js` and update `render` to return the following:

```js
return (
  <div>
    <button onClick={() => {
      this.props.history.push('/create')
    }}>New Link</button>
    {linksToRender.map(link => (
      <Link key={link.id} link={link}/>
    ))}
  </div>
)
```

Second, you want to navigate back to the previous list after having created the new link with the `createLinkMutation`.

Open `CreateLink.js` and update `_createLink` to look as follows:

```js
_createLink = async () => {
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url
    }
  })
  this.props.history.push(`/`)
}
```

After the mutation was performed, `react-router` will now navigate back to the `LinkList` component that's accessible on the root route: `/`.


### Authentication

In this section, you'll learn how you can implement authentication functionality with Apollo and Graphcool to provide log-in functionality to the user.

#### Prepare the React components

As in the sections before, you'll set the stage for the login functionality by preparing the React components that are needed for this feature.

You'll start by implementing the `Login` component. Create a new file in `src/components` and call it `Login.js`. Then paste the following code inside of it:

```js
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
        <div>{this.state.login ? 'Login' : 'Sign Up'}</div>
        <div>
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
        <button
          onClick={() => this._confirm()}
        >
          {this.state.login ? 'Login' : 'Create Account' }
        </button>
        <button
          onClick={() => this.setState({ login: !this.state.login })}
        >
          {this.state.login ? 'Need to create an account?' : 'Already have an account?'}
        </button>
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

Let's quickly understand the structure of this new component. The component can have two major states. One state for users that already have an account and only need to login, here the component will only render two `input` fields for the user provide `email` and `password`. Notice that `state.login` will be `true` in this case. The second state is for users that haven't created an account yet and that still need to sign up. Here, you also render a third `input` field where users can provide their `name`.

The method `_confirm`  will be used to implement the mutations that we need to send for the login functionality.

Next you also need to provide the `constants.js` file that we use to define keys for the credentials that we're storing in the browser's `localStorage`. In `src`, create a new file called `constants.js` and add the following two definitions:

```js
export const GC_USER_ID = 'graphcool-user-id'
export const GC_AUTH_TOKEN = 'graphcool-auth-token'
```


With that component in place, you can go and add a new route to your `react-router` setup. Open `App.js` and update `render` to include the new route:

```js
render() {
  return (
    <Switch>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/' component={LinkList}/>
    </Switch>
  )
}
```

Finally, go ahead and add a second `button` to `LinkList` that allows the users to navigate to the `Login` page. You'll actually reuse the _New Link_-button and make it point to the `Login` component if a user is not logged in.

Open `LinkList.js` and update `render` to look as follows:

```js
render() {

  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }

  const linksToRender = this.props.allLinksQuery.allLinks
  const userId = localStorage.getItem(GC_USER_ID)

  return (
    <div>
      {!userId ?
        <button onClick={() => {
          this.props.history.push('/login')
        }}>Login</button> :
        <div>
          <button onClick={() => {
            this.props.history.push('/create')
          }}>New Link</button>
          <button onClick={() => {
            localStorage.removeItem(GC_USER_ID)
            localStorage.removeItem(GC_AUTH_TOKEN)
            this.forceUpdate() // doesn't work as it should :(
          }}>Logout</button>
        </div>
      }
      {linksToRender.map(link => (
        <Link key={link.id} link={link}/>
      ))}
    </div>
  )
}
```

You first retrieve the `userId` from local storage. If that's not available, the button will navigate to the `Login` component. Otherwise, the user can go ahead and create new links and a _Logout_-button will be rendered as well.

Lastly, import the key definitions from `constants.js`. Still in `LinkList.js`, add the following statement to the top of file:

```js
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants'
```

Before you can implement the authentication functionality in `Login.js`, you need to prepare the Graphcool project and enable authentication on the server-side.

#### Enabling Email-and-Password Authentication & Updating the Schema

<enable authentication provider>

![](http://imgur.com/FkyzuuM.png)

![](http://imgur.com/HNdmas3.png)

Having the `Email-and-Password` auth provider enabled adds two new mutations to the project's schema:

```graphql
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

Next you need to make one more modification to the schema. Generally, when updating the schema of a Graphcool project, you've got two ways of doing so:

1. Use the web-based [Graphcool Console](https://console.graph.cool) and change the schema directly
2. Use the Graphcool project file and the CLI to update the schema from your local machine

Open your project file `project.graphcool` and update the `User` and `Link` types as follows:

```js
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
  updatedAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
}
```

You added two things to the schema:

- A new field on the `User` type to store the `name` of the user.
- A new relation between the `User` and the `Link` type that represents a one-to-many relationship and expressed that one `User` can be associated with multiple links. The relation manifests itself in the two fields `postedBy` and `links`.

Save the file and execute the following command in the Terminal:

```sh
graphcool push
```

Here is the Terminal output after you can the command:

```sh
$ graphcool push
 ✔ Your schema was successfully updated. Here are the changes:

  | (*)  The type `User` is updated.
  ├── (+)  A new field with the name `name` and type `String!` is created.
  |
  | (+)  The relation `UsersLinks` is created. It connects the type `Link` with the type `User`.

Your project file project.graphcool was updated. Reload it in your editor if needed.

nburk@macbook-pro hackernews-react-apollo $

```

> **Note**: You can also use the `graphcool status` after having made changes to the schema to see the potential changes that would be performed with `graphcool push`.

Perfect, you're all set now to actually implement the authentication functionality inside your app.


#### Implementing the Login Mutations

`createUser` and `signinUser` are two regular GraphQL mutations that you can use in the same way as you did with the `createLink` mutation from before.

Open `Login.js` and add the following two definitions to the bottom of the file:

```js
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

Note that you're using `compose` for the export statement this time since there is more than one mutation that you want to wrap the component with.

Before we take a closer look at the two mutations, go ahead and add the required imports. Still in `Login.js`, add the following statement to the top of the file:

```js
import { gql, graphql, compose } from 'react-apollo'
```

Now, let's understand what's going in the two mutations that you just added to the component.

The `SIGNIN_USER_MUTATION` looks very similar to the mutations we saw before. It simply takes the `email` and `password` as arguments and returns info about the `user` as well as a `token` that you can attach to subsequent requests to authenticate the user.

The `CREATE_USER_MUTATION` however is a bit different! Here, we actually define _two_ mutations at once! When you're doing that, the execution order is always from to bottom. So, in your case the `createUser` mutation will be executed _before_ the `signinUser` mutation. Bundling two mutations like this allows to sign up and login in a single request!

All right, all that's left to do is call the two mutations inside the code!

Open `Login.js` and implement `_confirm` as follows:

```js
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

The code is pretty straightforward. If the user wants to only login, you're calling the `signinUserMutation` and pass the provided `email` and `password` as arguments. Otherwise you're using the `createUserMutation` where you also pass the user's `name`. After the mutation was performed, you're storing the `id` and `token` in `localStorage` and navigate back to the root route.


#### Updating the `createLink`-mutation

Since you're now able to authenticate users and also added a new relation between the `Link` and `User` type, you can also make sure that every new link that gets created in the app can store information about the user that posted it. That's what the `postedBy` field on `Link` will be used for.

Open `CreateLink.js` and update the definition of `CREATE_LINK_MUTATION`    as follows:

```js
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

There are two major changes. You first added another argument to the mutation that represents the `id` of the user that is posting the link. Secondly, you also include the `postedBy` information in the _payload_ of the mutation.

Now you need to make sure that the `id` of the posting user is included when you're calling the mutation in `_createLink`.

Still in `CreateLink.js`, update the implementation of `_createLink` like so:

```js
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

For this to work, you also need to import the `GC_USER_ID` key. Add the following import statement to the top of `CreateLink.js`.

```js
import { GC_USER_ID } from '../constants'
```

Perfect! Before sending the mutation, you're now also retrieving the corresponding user id from `localStorage`. If that succeeds, you'll pass it to the call to `createLinkMutation` so that every new links will from now on store information about the user that created it.

Go ahead and test the login functionality. run `yarn start` and open `http://localhost:3000/login`. Then click the _Need to create an account?_-button and provide some user data for the user you're crreating. Finally, click the _Create Account_-button. If all went well, the app navigates back to the root route and your user was created. You can verify that the new user is there by checking the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) or sending the `allUsers` query in a Playground.


### More Mutations and Updating the Store

The next piece of functionality that you'll implement is the voting feature! Authenticated users are allowed to submit a vote for a link. The most upvoted links will later be displayed on a separate route that you'll implement soon!

#### Preparing the React Components

Once more, the first step to implement this new feature is to make your React components ready for the expected functionality.

Open `Link.js` and update `render` to look as follows:

```js
render() {
  const userId = localStorage.getItem(GC_USER_ID)
  return (
    <div>
      {userId && <div onClick={() => this._voteForLink()}>▲</div>}
      <div>{this.props.link.description} ({this.props.link.url})</div>
        <div>{this.props.link.votes.length} votes | by {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'} {this.props.link.createdAt}</div>
    </div>
  )
}
```

You're already preparing the `Link` component to render the number of votes for each link and the name of the user that posted it. Plus you'll render the upvote button if a user is currently logged in.

Also make sure to import `GC_USER_ID` on top the file:

```js
import { GC_USER_ID } from '../constants'
```

#### Updating the Schema

For this new feature, you also need to update the schema again since votes on links will be represented with a custom type.

Open `project.graphcool` and add the following type:

```js
type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

Each `Vote` will be associated with the `User` who created it as well as the `Link` that it belongs to. You also have to add the other end of the relation.

Still in `project.graphcool`, add the following field to the `User` type:

```graphql
votes: [Vote!]! @relation(name: "UsersVotes")
```

Now add another field to the `Link` type:

```graphql
votes: [Vote!]! @relation(name: "VotesOnLink")
```

Next open up a Terminal window and navigate to the directory where `project.graphcool` is located. Then apply your schema changes by typing the following command:

```sh
graphcool push
```

Here is what the Terminal output looks like:

```sh
$ gc push
 ✔ Your schema was successfully updated. Here are the changes:

  | (+)  A new type with the name `Vote` is created.
  |
  | (+)  The relation `UsersVotes` is created. It connects the type `User` with the type `Vote`.
  |
  | (+)  The relation `VotesOnLink` is created. It connects the type `Link` with the type `Vote`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
```

Awesome! Let's now move on and implement the upvote mutation!


#### Calling the Mutation

Open `Link.js` and add the following mutation definition to the bottom of the file:

```js
const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote(userId: $userId, linkId: $linkId) {
      id
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`

export default graphql(CREATE_VOTE_MUTATION, {
  name: 'createVoteMutation'
})(Link)
```

This step should feel pretty familiar by now. You're adding the ability to call the `createVoteMutation` to the `Link` component by wrapping it with the `CREATE_VOTE_MUTATIIN`.

Finally, you need to implement `_voteForLink` as follows:

```js
_voteForLink = async () => {
  const userId = localStorage.getItem(GC_USER_ID)
  const voterIds = this.props.link.votes.map(vote => vote.user.id)
  if (voterIds.includes(userId)) {
    console.log(`User (${userId}) already voted for this link.`)
    return
  }

  const linkId = this.props.link.id
  await this.props.createVoteMutation({
    variables: {
      userId,
      linkId
    }
  })
}
```

Notice that in the first part of the method, you're checking whether the current user already voted for that link. If that's the case, you return early from the method and not actually execute the mutation.

You now also need to include the information about the links' votes in the `allLinks` query that's defined in `LinkList`.

Open `LinkList.js` and update the definition of `ALL_LINKS_QUERY` to look as follows:

```js
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`
```

All you do here is to also include information about the user who posted a link as well as information about the links' votes in the query's payload.

You can now go and test the implementation! Run `yarn start` and click the upvote button on a link. You're not getting any UI feedback yet, however, you'll notice that after you clicked the button for the first time, all subsequent clicks will simply print the loggin statement: _User (cj42qfzwnugfo01955uasit8l) already voted for this link._

Great, so you at least know that the mutation is working! You can also refresh the page and you'll see the vote is counted and the link is now shown to have one upvote.


#### Updating the Cache

One cool thing about Apollo is that you can manually control the contents of the cache. This is really handy especially after a mutation was performed, since this allows to determine precisely how you want the cache to be updated. Here, you'll use it to make sure the UI gets updated after the mutation was performed.

You can implement this functionality by using Apollo's [imperative store API](https://dev-blog.apollodata.com/apollo-clients-new-imperative-store-api-6cb69318a1e3).

Open `Link` and update the call to `createVoteMutation` inside the `_voteForLink` method as follows:

```js
const linkId = this.props.link.id
await this.props.createVoteMutation({
  variables: {
    userId,
    linkId
  },
  update: (store, { data: { createVote } }) => {
    this.props.updateStoreAfterVote(store, createVote, linkId)
  }
})
```

The `update` function that we're adding as an argument to the mutation call will be called when the server returns the response. It receives the payload of the mutation (`data`) and the current cache (`store`) as arguments. You can then use this input to determine a new state of the cache.

Notice that we're already _desctructuring_ the server response and retrieving the `createVote` field from it.

All right, so now you know what this `update` function is, but the actual implementation will be done in the parent component of `Link`, which is `LinkList`.

Open `LinkList.js` and add the following method to inside the scope of the `LinkList` component:

```js
_updateCacheAfterVote = (store, createVote, linkId) => {
  // 1
  const data = store.readQuery({ query: ALL_LINKS_QUERY })

  // 2
  const votedLink = data.allLinks.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes

  // 3
  store.writeQuery({ query: ALL_LINKS_QUERY, data })
}
```

What's going on here?

1. You start by reading the current state of the cached data for the `ALL_LINKS_QUERY` from the `store`.
2. Now you're retrieving the link that the user just voted for from that list. You're also manipulating that link by resetting its `votes` to the `votes` that were just returned by the server.
3. Finally, you take the modified data and write it back into the store.

Next you need to pass this function down to the `Link` component so it can be called from there.

Still in `LinkList.js`, update the way how links are rendered in `render`:

```js
<Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} link={link}/>
```

That's it! The `updater` function will now be executed and make sure that the store gets updated properly after a mutation was performed. The store update will trigger a rerender of the component and thus update the UI with the correct information!

While we're at it, let's also implement `update` for adding new links!

Open `CreateLink.js` and update the call to `createLinkMutation` inside `_createLink` like so:

```js
await this.props.createLinkMutation({
  variables: {
    description,
    url,
    postedById
  },
  update: (store, { data: { createLink } }) => {
    const data = store.readQuery({ query: ALL_LINKS_QUERY })
    data.allLinks.splice(0,0,createLink)
    store.writeQuery({
      query: ALL_LINKS_QUERY,
      data
    })
  }
})
```

The `update` function works in a very similar way as before. You first read the current state of the results of the `ALL_LINKS_QUERY`. Then you insert the newest link to the top and write the query results back to the store.

The last think you need to do for this to work is add import the `ALL_LINKS_QUERY` into that file:

```js
import { ALL_LINKS_QUERY } from './LinkList'
```

Conversely, it also needs to be exported from where it is defined.

Open `LinkList.js` and adjust the definition of the `ALL_LINKS_QUERY` by adding the `export` keyword to it:

```js
export const ALL_LINKS_QUERY = ...
```

Awesome, now the store also updates with the right information after new links are added. The app is getting in shape. 🤓


### Filtering: Searching the List of Links

In this section, you'll implement a search feature and learn about the filtering capabilities of your GraphQL API.

> Note: If you're interested in all the filtering capabilities of Graphcool, you can check out the [documentation](https://www.graph.cool/docs/reference/simple-api/filtering-by-field-xookaexai0/) on it.


#### Preparing the React Components

The search will be available under a new route and implemented in a new React component.

Start by creating a new file called `Search.js` in `src/components` and add the following code:

```js
import React, { Component } from 'react'
import { gql, withApollo } from 'react-apollo'
import Link from './Link'

class Search extends Component {

  state = {
    links: [],
    searchText: ''
  }

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={(e) => this.setState({ searchText: e.target.value })}
          />
          <button
            onClick={() => this._executeSearch()}
          >
            OK
          </button>
        </div>
        {this.state.links.map(link => <Link key={link.id} link={link}/>)}
      </div>
    )
  }

  _executeSearch = async () => {
    // ... you'll implement this in a bit
  }

}

export default withApollo(Search)
```

Again, this is a pretty standard setup. You're rendering an `input` field where the user can type a search string.

Notice that the `links` field in the component state will hold all the links to be rendered, so this time we're not accessing query results through the component props! We'll also talk about the `withApollo` function that you're using when exporting the component in a bit!

Now add the `Search` component as a new route to the app. Open `App.js` and update render to look as follows:

```js
render() {
  return (
    <Switch>
      <Route exact path='/search' component={Search}/>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/' component={LinkList}/>
    </Switch>
  )
}
```

Also import the component on top of the file:

```js
import Search from './Search'
```

Great, let's now go back to the `Search` component and see how we can implement the actual search.

#### Filtering Links

Open `Search.js` and add the following query definition on the bottom of the file:

```js
const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`
```

This query looks similar to the `allLinks` query that's used in `LinkList`. However, this time it takes in an argument called `searchTect` and specifies a `filter` object that will be used to specify conditions on the links that you want to retrieve.

In this case, you're specifying two filters that account for the following two conditions. A link is only returned if either its `url` contains the provided `searchText` _or_ its `description` contains the provided `searchText`. Both conditions can be combined using the `OR` operator.

Perfect, the query is defined! But this time we actually want to load the data every time the user hits the _OK_-button.

That's what you're using the `withApollo` function for. All it does is injecting a new prop into the `Search` component called `client`. This `client` is precisely the `ApolloClient` instance that you're creating in `index.js` and that's now directly available inside `Search`.

The `client` has a method called `query` that you can use to send a query manually instead of using the `graphql` HOC.

Here's what the code looks like. Open `Search.js` and implement `_executeSearch` as follows:

```js
_executeSearch = async () => {
  const { searchText } = this.state
  const result = await this.props.client.query({
    query: ALL_LINKS_SEARCH_QUERY,
    variables: { searchText }
  })
  const links = result.data.allLinks
  this.setState({ links })
}
```

The implementation is almost trivial. You're executing the `ALL_LINKS_SEARCH_QUERY` manually, retrieve the `links` from the response that's returned by the server to finally put them into the component's `state` from where they can be rendered.

Go ahead and test the app by running `yarn start` in a Terminal and navigating to `http://localhost:3000/search`. Then type a search string into the text field, click the _OK_-button and make sure the links that are returned fit the filter conditions.


### Subscriptions

This section is all about bringing realtime functionality into the app by using GraphQL subscriptions.


#### What are GraphQL Subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens on the backend. Subscriptions are usually implemented with WebSockets, where the server holds a steady connection to the client. That is, the _Request-Response-Cycle_ that we used for all previous interactions with the API is not used for subscriptions. Instead, the client initially opens up a steady connection to the server by specifying which events it is interested in. Once this event happens, the server uses the connection to push the data that's related to the event to the client.

#### Subscriptions with Apollo

When using Apollo, you need to configure your `ApolloClient` with information about the subscriptions endpoint. This is done by using functionality from the `subscriptions-transport-ws` npm module.

Go and add this dependency to your app first. Open a Terminal and navigate to the project's root directory. Then execute the following command:

```sh
yarn add subscriptions-transport-ws
```

Next, make sure your `ApolloClient` instance knows about the subscription server.

Open `index.js` and add the following import to the top of the file:

```
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

Now update the configuration code like so:

```js
const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/<project-id>'
})

const wsClient = new SubscriptionClient('__SUBSCRIPTION_API_ENDPOINT__', {
  reconnect: true,
  connectionParams: {
     authToken: localStorage.getItem(GC_AUTH_TOKEN),
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

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

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})
```

You're instantiating a `SubscriptionClient` that knows the endpoint for the Subscriptions API. Notice that you're also authenticating the websocket connection with the user's token that you retrieve from `localStorage`.

Now you need to replace the placeholder `__SUBSCRIPTION_API_ENDPOINT__ ` with the endpoint for the subscriptions API.

To get access to this endpoint, open up a Terminal and navigate to the directory where `project.graphcool` is located. Then type the `graphcool endpoints` command. Now copy the endpoint for the `Subscriptions API` and replace the placeholder with it.

> Note: The endpoints for the Subscription API generally are of the form: `wss://subscriptions.graph.cool/v1/<project-id>`


#### Subscribing to new Links

For the app to update in realtime when new links are created, you need to subscribe to events that are happening on the `Link` type. There generally are three kinds of events you can subscribe to:

- a new `Link` is _created_
- an existing `Link` is _updated_
- an existing `Link` is _deleted_

You'll implement the subscription in the `LinkList` component since that's where all the links are rendered.

Open `LinkList.js` and add the following method inside the scope of the `LinkList` component:

```js
_subscribeToNewLinks = () => {
  this.props.allLinksQuery.subscribeToMore({
    document: gql`
      subscription {
        Link(filter: {
          mutation_in: [CREATED]
        }) {
          node {
            id
            url
            description
            createdAt
            postedBy {
              id
              name
            }
            votes {
              id
              user {
                id
              }
            }
          }
        }
      }
    `,
    updateQuery: (previous, { subscriptionData }) => {
      // ... you'll implement this in a bit
    }
  })
}
```

Let's understand what's going on here! You're using the `allLinksQuery` that you have access to inside the component's props (because you wrapped it with the `graphql` container) to call [`subscribeToMore`](http://dev.apollodata.com/react/subscriptions.html#subscribe-to-more). This call opens up a websocket connection to the subscription server.

You're passing two arguments to `subscribeToMore`:

1. `document`: This represents the subscription itself. In your case, the subscription will fire for `CREATED` events on the `Link` type, i.e. every time a new link is created.
2. `updateQuery`: Similar to `update`, this function allows you to determine how the store should be updated with the information that was sent by the server.

Go ahead and implement `updateQuery` next. This function works slightly differently than `update`. In fact, it follows exactly the same principle as a [Redux reducer](http://redux.js.org/docs/basics/Reducers.html): It takes as arguments the previous state (of the query that `subscribeToMore` was called on) and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated version. Let's see what this looks like in action!

Still in `LinkList.js` implement `updateQuery` like so:

```js
updateQuery: (previous, { subscriptionData }) => {
  const newAllLinks = [
    subscriptionData.data.Link.node,
    ...previous.allLinks
  ]
  const result = {
    ...previous,
    allLinks: newAllLinks
  }
  return result
}
```

All you do here is retrieve the new link from the subscription data (` subscriptionData.data.Link.node`), merge it into the existing list of links and return the result of this operation.

The last thing here is to make sure that the component actually subscribes to the events by calling `subscribeToMore`.

In `LinkList.js`, add a new method inside the scope of the `LinkList` component and implement it like so:

```js
componentDidMount() {
  this._subscribeToNewLinks()
}
```
> **Note**: `componentDidMount` is a so-called [_lifecycle_ method](https://facebook.github.io/react/docs/react-component.html#the-component-lifecycle) of React components that will be called once right after the component was initialized.

Awesome, that's it! You can test your implementation by opening two browser windows. In the first window, you have your application runnning on `http://localhost:3000/`. The second window you use to open a Playground and send a `createLink` mutation. When you're sending the mutation, you'll see the app update in realtime! ⚡️

#### Susbcribing to new Votes

Next you'll subscribe to new votes that are emitted by other users as well so that the latest vote count is always visible in the app.

Open `LinkList.js` and add the following method to the `LinkList` component:

```js
_subscribeToNewVotes = () => {
  this.props.allLinksQuery.subscribeToMore({
    document: gql`
      subscription {
        Vote(filter: {
          mutation_in: [CREATED]
        }) {
          node {
            id
            link {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
            user {
              id
            }
          }
        }
      }
    `,
    updateQuery: (previous, { subscriptionData }) => {
      const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
      const link = subscriptionData.data.Vote.node.link
      const newAllLinks = previous.allLinks.slice()
      newAllLinks[votedLinkIndex] = link
      const result = {
        ...previous,
        allLinks: newAllLinks
      }
      return result
    }
  })
}
```

Similar as before, you're calling `subscribeToMore` on the `allLinksQuery`. This time you're passing in a subscription that asks for newly created votes. In `updateQuery`, you're then adding the information about the new vote to the cache by first looking for the `Link` that was just voted and and then updating its `votes` with the `Vote` element that was sent from the server.

Finally, go ahead and call `_subscribeToNewVotes` inside `componentDidMount` as well:

```js
componentDidMount() {
  this._subscribeToNewLinks()
  this. _subscribeToNewVotes()
}
```

Fantastic! Your app is now ready for realtime and will immediately update links and votes whenever they're created by other users.


### Pagination

The last topic that we'll cover in this tutorial is pagination. You'll implement a simple pagination approach so that user's are able to view the links in smaller chunks rather than having an extremely list of `Link` elements.


### Preparing the React Components

Once more, you first need to prepare the React components for this new functionality. In fact, we'll slightly adjust the current routing setup. Here's the idea: The `LinkList` component will be used for two different use cases (and routes). The first one is to display the 10 top voted links. And its second use case is to display a _new_ links in a list where the user can paginate.

Open `App.js` and adjust the render method like so:


```js
render() {
  return (
    <Switch>
      <Route exact path='/' render={() => <Redirect to='/new/1' />} />
      <Route exact path='/login' component={Login}/>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/search' component={Search}/>
      <Route exact path='/top' component={LinkList}/>
      <Route exact path='/new/:page' component={LinkList}/>
    </Switch>
  )
}
```

You now added two new routes: `/top` and `/new/:page`. The second one reads the value for `page` from the url so that this information is available inside the component that's rendered, here that's `LinkList`.

The root route `/` now redirects to the first page of the route where new posts are displayed.

We need to add quite some logic to the `LinkList` component to account for the two different responsibilities that it now has.

Open `LinkList.js` and add three arguments to the `AllLinksQuery` by replacing the `ALL_LINKS_QUERY` definition with the following:

```js
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
    _allLinksMeta {
      count
    }
  }
`
```

The query now accepts arguments that we'll use to implement pagination and ordering. `skip` defines the _offset_ where the query will start. If you passed a value of e.g. `10` to this argument, it means that the first 10 items of the list will not be included in the response. `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.

 But how can we pass the variables when using the `graphql` container which is fetching the data under the hood? You need to provide the arguments right where you're wrapping your component with the query.

Still in `LinkList.js`, replace the current `export` statement with the following:

```js
export default graphql(ALL_LINKS_QUERY, {
  name: 'allLinksQuery',
  options: (ownProps) => {
    const page = parseInt(ownProps.match.params.page, 10)
    const isNewPage = ownProps.location.pathname.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy }
    }
  }
}) (LinkList)
```

You're now passing a function to `graphql` that takes in the props of the component (`ownProps`) before the query is executed. This allows you to retrieve the information about the current page from the router (`ownProps.match.params.page`) and use it to calculate the chunk of links that you retrieve with `first` and `skip`.

Also note that we're including the ordering attribute `createdAt_DESC` for the `new` page to make sure the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes for each link.

You also need to define the `LINKS_PER_PAGE` constant and then import it into the `ListList` component.

Open `src/constants.js` and add the following definition:

```js
export const LINKS_PER_PAGE = 5
```

Now adjust the import statement from `../constants` in `LinkList.js` to also include the new constant:

```js
import { GC_USER_ID, GC_AUTH_TOKEN, LINKS_PER_PAGE } from '../constants'
```

#### Implementing Navigation

Next, you need functionality for the user to switch between the pages. First add two `button` elements to the bottom of the `LinkList` component that can be used to navigate back and forth.

Open `LinkList.js` and update `render` to look as follows:

```js
render() {

  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }

  const isNewPage = this.props.location.pathname.includes('new')
  const linksToRender = this._getLinksToRender(isNewPage)
  const userId = localStorage.getItem(GC_USER_ID)

  return (
    <div>
      {!userId ?
        <button onClick={() => {
          this.props.history.push('/login')
        }}>Login</button> :
        <div>
          <button onClick={() => {
            this.props.history.push('/create')
          }}>New Post</button>
          <button onClick={() => {
            localStorage.removeItem(GC_USER_ID)
            localStorage.removeItem(GC_AUTH_TOKEN)
            this.forceUpdate() // doesn't work as it should :(
          }}>Logout</button>
        </div>
      }
      <div>
        {linksToRender.map(link => (
          <Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} link={link}/>
        ))}
      </div>
      {isNewPage &&
      <div>
        <button onClick={() => this._previousPage()}>Previous</button>
        <button onClick={() => this._nextPage()}>Next</button>
      </div>
      }
    </div>
  )

}
```

Since the setup is slightly more complicated now, you are going to calculate the list of links to be rendered in a separate method.

Still in `LinkList.js`, add the following method implementation:

```js
_getLinksToRender = (isNewPage) => {
  if (isNewPage) {
    return this.props.allLinksQuery.allLinks
  }
  const rankedLinks = this.props.allLinksQuery.allLinks.slice()
  rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
  return rankedLinks
}
```

For the `newPage`, you'll simply return all the links returned by the query. That's logical since here you don't have to make any manual modifications to the list that is to be rendered. If the user loaded the component from the `/top` route, you'll sort the list according to the number of votes and return the top 10 links.

Next, you'll implement the functionality for the _Previous_- and _Next_-buttons.

In `LinkList.js`, add the following two methods that will be called when the buttons are pressed:

```js
_nextPage = () => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    this.props.history.push(`/new/${nextPage}`)
  }
}

_previousPage = () => {
  const page = parseInt(this.props.match.params.page, 10)
  if (page > 1) {
    const nextPage = page - 1
    this.props.history.push(`/new/${nextPage}`)
  }
}
```

The implementation of these is very simple. You're retrieving the current page from the url and implement a sanity check to make sure that it makes sense to paginate back or forth. Then you simply calculate the next page and tell the router where to navigate next. The router will then reload the component with a new `page` in the url that will be used to calculate the right chunk of links to load. Run the app by typing `yarn start` in a Terminal and use the new buttons to paginate through your list of links!

#### Final Adjustments

Through the changes that we made to the `ALL_LINKS_QUERY`, you'll notice that the `update` functions of your mutations don't work any more. That's because `readQuery` now also expects to get passed the same variables that we defined before.

> **Note**: `readyQuery` essentially works in the same way as the `query` method on the `ApolloClient` that you used to implement the search. However, instead of making a call to the server, it will simply resolve the query against the local store! If a query was fetched from the server with variables, `readQuery` also needs to know the variables to make sure it can deliver the right information from the cache.

With that information, open `LinkList.js` and update the `_updateCacheAfterVote` method to look as follows:

```js
_updateCacheAfterVote = (store, createVote, linkId) => {
  const isNewPage = this.props.location.pathname.includes('new')
  const page = parseInt(this.props.match.params.page, 10)
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? "createdAt_DESC" : null
  const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: { first, skip, orderBy } })

  const votedLink = data.allLinks.find(link => link.id === linkId)
  votedLink.votes = createVote.link.votes
  store.writeQuery({ query: ALL_LINKS_QUERY, data })
}
```

All that's happening here is the computation of the variables depending on whether the user currently is on the `/top` or `/new` route.

Finally, you also need to adjust the implementation of `update` when new links are created.

Open `CreateLink.js` and replace the current contents of `_createLink` like so:

```js
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
    },
    update: (store, { data: { createLink } }) => {
      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC'
      const data = store.readQuery({
        query: ALL_LINKS_QUERY,
        variables: { first, skip, orderBy }
      })
      data.allLinks.splice(0,0,createLink)
      data.allLinks.pop()
      store.writeQuery({
        query: ALL_LINKS_QUERY,
        data,
        variables: { first, skip, orderBy }
      })
    }
  })
  this.props.history.push(`/new/1`)
}
```

Since we don't have the `LINKS_PER_PAGE` constant available in this component yet, make sure to import it on top of the file:

```js
import { GC_USER_ID, LINKS_PER_PAGE } from '../constants'
```

### Summary

In this chapter, you learned how to build an application with React and Apollo.