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
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── App.test.js
│   ├── components
│   │   └── App.js
│   ├── index.js
│   ├── logo.svg
│   ├── registerServiceWorker.js
│   └── styles
│       ├── App.css
│       └── index.css
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
import { Switch, Route, Redirect } from 'react-router-dom'
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
  postedBy: User! @relation(name: "UsersLinks")
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
 ✔ Your schema was successfully updated. Here are the changes: 

  | (*)  The type `User` is updated.
  ├── (+)  A new field with the name `name` and type `String!` is created.
  |
  | (+)  The relation `UsersLinks` is created. It connects the type `Link` with the type `User`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
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














