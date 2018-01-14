---
title: Getting Started
pageTitle: "Getting Started with GraphQL, React & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with create-react-app and the backend with Graphcool.
question: Which are the two types that you find in every Graphcool project file?
answers: ["File & System", "Query & Mutation", "User & Group", "File & User"]
correctAnswer: 3
draft: false
videoId: ""
duration: 0		
videoAuthor: ""
---

Since this is a frontend track, you're not going to spend any time implementing the backend. Instead, you'll use the server from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

Once you created your React application, you'll pull in the required code for the backend.

### Frontend

#### Creating the app

Next, you are going to create the React project! As mentioned in the beginning, you'll use `create-react-app` for that.

<Instruction>

If you haven't already, you need to install `create-react-app` using npm:

```bash
npm install -g create-react-app
```

</Instruction>

<Instruction>

Next, you can use it to bootstrap your React application:

```bash
create-react-app hackernews-react-apollo
```

</Instruction>

This will create a new directory called `hackernews-react-apollo` that has all the basic configuration setup.

Make sure everything works by navigating into the directory and starting the app:

```bash
cd hackernews-react-apollo
yarn start
```

This will open a browser and navigate to `http://localhost:3000` where the app is running. If everything went well, you'll see the following:

![](http://imgur.com/Yujwwi6.png)

<Instruction>

To improve the project structure, move on to create two directories, both inside the `src` folder. The first is called `components` and will hold all our React components. Call the second one `styles`, that one is for all the CSS files you'll use.

Now clean up the existing files accordingly. Move `App.js` into `components` and `App.css` as well as `index.css` into `styles`.

</Instruction>

Your project structure should now look as follows:

```bash(nocopy)
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

#### Prepare styling

This tutorial is about the concepts of GraphQL and how you can use it from within a React application, so we want to spend the least time possible on styling. To ease up usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

<Instruction>

Open `public/index.html` and add a third `link` tag right below the two existing ones that pulls in Tachyons:

```html{3}(path=".../hackernews-react-apollo/public/index.html")
<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
<link rel="stylesheet" href="https://unpkg.com/tachyons@4.2.1/css/tachyons.min.css"/>
```

</Instruction>

Since we still want to have a bit more custom styling here and there, we also prepared some styles for you that you need to include in the project.

<Instruction>

Open `index.css` and replace its content with the following:

```css(path=".../hackernews-react-apollo/src/styles/index.css")
body {
  margin: 0;
  padding: 0;
  font-family: Verdana, Geneva, sans-serif;
}

input {
  max-width: 500px;
}

.gray {
  color: #828282;
}

.orange {
  background-color: #ff6600;
}

.background-gray {
  background-color: rgb(246,246,239);
}

.f11 {
  font-size: 11px;
}

.w85 {
  width: 85%;
}

.button {
  font-family: monospace;
  font-size: 10pt;
  color: black;
  background-color: buttonface;
  text-align: center;
  padding: 2px 6px 3px;
  border-width: 2px;
  border-style: outset;
  border-color: buttonface;
  cursor: pointer;
  max-width: 250px;
}
```

</Instruction>

#### Install Apollo Client

<Instruction>

Next, you need to pull in the functionality of Apollo Client (and its React bindings) which comes in several packages:

```bash(path=".../hackernews-react-apollo")
yarn add apollo-client-preset react-apollo graphql-tag graphql
```

</Instruction>

Here's an overview of the packages you just installed:

- [`apollo-client-preset`](https://www.npmjs.com/package/apollo-client-preset) offers some convenience by bundling several packages you need when working with Apollo Client:
  - `apollo-client`
  - `apollo-cache-inmemory`
  - `apollo-link`
  - `apollo-link-http`
- [`react-apollo`](https://github.com/apollographql/react-apollo) contains the bindings to use Apollo Client with React.
- [`graphql-tag`](https://github.com/apollographql/graphql-tag) is a GraphQL parser. Every GraphQL operation you hand over to Apollo Client will have to be parsed by the `gql` function.
- [`graphql`](https://github.com/graphql/graphql-js) contains Facebook's reference implementation of GraphQL - Apollo Client uses some of its functionality as well. 

That's it, you're ready to write some code! 🚀

#### Configure `ApolloClient`

Apollo abstracts away all lower-lever networking logic and provides a nice interface to with your GraphQL API. In contrast to working with REST APIs, you don't have to deal with constructing your own HTTP requests any more - instead you can simply write queries and mutations and send them using an `ApolloClient` instance.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the _endpoint_ of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/index.js` and replace the contents with the following:

```js{7-10,13,16-19,23-25}(path=".../hackernews-react-apollo/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
// 1
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// 2
const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

// 3
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
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

</Instruction>

> Note: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use **no semicolons** and **single quotes**. You're also free to delete any existing semicolons and replace double with single quotes 🔥

Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the installed npm packages.
1. Here you create the `HttpLink` that will connect your `ApolloClient` instance with the GraphQL API; your GraphQL server will be running on `http://localhost:4000`.
1. Now you instantiate `ApolloClient` by passing in the `httpLink` and a new instance of an `InMemoryCache`.
1. Finally you render the root component of your React app. The `App` is wrapped with the higher-order component `ApolloProvider` that gets passed the `client` as a prop.

That's it, you're all set to start for loading some data into your app! 😎

### Backend

#### Downloading the server code

As mentioned above, for the backend in this tutorial you'll simply use the final project from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

<Instruction>

In your terminal, navigate to the `hackernews-react-apollo` directory and run the following commands:

```bash(path=".../hackernews-react-apollo")
curl https://codeload.github.com/howtographql/graphql-js/tar.gz/starter | tar -xz graphql-js-starter
mv graphql-js-starter server # rename the downloaded directory to `server`
```

</Instruction>

You now have a new directory called `server` inside your project that contains all the code you need for your backend.

Before we start the server, let's quickly understand the main components:

- `database`: This directory holds all the files that relate to your Graphcool database service.
  - `graphcool.yml` is the root configuration file for the service.
  - `datamodel.graphql` defines your data model in the GraphQL [Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). The data model is the foundation for the GraphQL API generated by Graphcool which provides powerful CRUD operations for the types rom your data model.
- `src`: This directory holds the source files for your GraphQL server.
  - `schema.graphql` contains your **application schema**. The application schema defines the GraphQL operations you can send from the frontend. We'll take a closer look at this file in just a bit.
  - `generated/graphcool.graphql` contains the auto-generated **Graphcool schema**. The Graphcool schmea defines the CRUD operations for the types in your data model and gets automatically updated when the data model changes. You should never edit it manually!
  - `resolvers` contains the _resolver functions_ for the operations defined in the application schema.
  - `index.js` is the entry point for your GraphQL server

From the mentioned files, only the application schema defined in `server/src/schema.graphql` is relevant for you as a frontend developer. This file contains the [GraphQL schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) which defines all the operations (queries, mutations and subscriptions) you can send from your frontend app.

Here is what it looks like:

```graphql(path=".../hackernews-react-apollo/server/src/"&nocopy)
# import Link, Vote from "./generated/database.graphql"

type Query {
  feed(filter: String, skip: Int, first: Int, orderBy: LinkOrderByInput): Feed!
}

type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote
}

type Subscription {
  newLink: LinkSubscriptionPayload
  newVote: VoteSubscriptionPayload
}

type Feed {
  links: [Link!]!
  count: Int!
}

type AuthPayload {
  token: String
  user: User
}

type User {
  id: ID!
  name: String!
  email: String! @unique
}
```

This schema allows for the following operations:

- Queries:
  - `feed`: Retrieves all links from the backend, note that this query also allows for filter, sorting and pagination arguments
- Mutations:
  - `post`: Allows authenticated users to create a new link
  - `signup`: Create an account for a new user
  - `login`: Login an existing user
  - `vote`: Allows authenticated users to vote for an existing link
- Subscriptions:
  - `newLink`: Receive realtime updates when a new link is created
  - `newVote`: Receive realtime updates when a vote was submitted

For example, you can send the the following query to retrieve the first 10 links from the server:

```graphql(nocopy)
{
  feed(skip: 0, first: 10) {
    links {
      description
      url
      postedBy {
        name
      }
    }
  }
}
```

Or this mutation to create a new user:

```graphql(nocopy)
mutation {
  signup(
    name: "Sarah",
    email: "sarah@graph.cool",
    password: "graphql"
  ) {
    token
    user {
      id
    }
  }
}
```

#### Exploring the server

Let's and explore the server!

<Instruction>

Navigate into the `server` directory and run the following commands to start the server:

```bash(path=".../hackernews-react-apollo/server")
yarn install
yarn start
```

</Instruction>

The server is now running on `http://localhost:4000`. If you open that URL in your browser, you'll see a [GraphQL Playground](https://github.com/graphcool/graphql-playground).

![](https://imgur.com/k2I7NJn.png)

A Playground is a "GraphQL IDE", providing an interactive environment that allows to send queries, mutations and subscriptions to your GraphQL API. It is similar to a tool like [Postman](https://www.getpostman.com) which you might know from working with REST APIs, but comes with a lot of additional benefits.

The first thing to note about the Playground is that it has built-in documentation for its GraphQL API. This documentation is generated based on the GraphQL schema and can be openend by clicking the green **SCHEMA**-button on the right edge of the Playground. Consequently, it shows you the same information you saw in the application schema above:

![](https://imgur.com/8xK81qt.png)

Another important thing about the Playground to note about the Playground you see is that it actually allows you to interact with two (!) GraphQL APIs.

The first one is defined by your **application schema**, this is the one your React application will interact with. It can be opened by selecting the **default** Playground in the **app** section in the left side-menu.

There also is the Graphcool database API which provides full access to the data stored in the database. This one you can open by selecting the **dev** Playground in the **database** section in the left side-menu. This API is defined by the **Graphcool schema** (in `server/src/generated/graphcool.graphql`).

Why do you need two GraphQL APIs at all? The answer is pretty straightforward, you can actually think of the two APIs as two _layers_.

The application schema defines the first layer, also called _application layer_. It defines the operations your client applications will be able to send to your API. This includes business logic and other common features and workflows (such as signup and login).

The second layer is the _database layer_ defined by the Graphcool schema. It provides powerful CRUD operations that allow you to perform _any_ kind of operation against the data in your database.

> **Note**: It is of course possible to _only_ use the database API from the frontend. However, in most real-world applications you'll need at least a little bit of business logic which the API can not provide. If your app really only needs to perform CRUD operations and access a database, then it's totally fine to run against the Graphcool database API directly.

Next, go ahead and create some dummy data in the database. You can not use the `post` mutation in the **default** Playground because that requires an authenticated user. So let's start by simply adding to `Link` elements using the Graphcool database API directly.

The left pane of the Playground is the _editor_ that you can use to write your queries, mutations and subscriptions. Once you click the play button in the middle, the server response will be displayed in the _results_ pane on the right.

<Instruction>

Copy the following two mutations into the _editor_ pane:

```graphql
mutation CreateGraphcoolLink {
  createLink(data: {
    description: "The coolest GraphQL database 😎",
    url: "https://graph.cool"
  }) {
    id
  }
}

mutation CreateApolloLink {
  createLink(data: {
    description: "The best GraphQL client",
    url: "http://dev.apollodata.com/"
  }) {
    id
  }
}
```

</Instruction>

Since you're adding two mutations to the editor at once, the mutations need to have _operation names_. In your case, these are `CreateGraphcoolLink` and `CreateApolloLink`.

<Instruction>

Click the **Play**-button in the middle of the two panes and select each mutation from the dropdown exactly once.

</Instruction>

![](https://imgur.com/6A6yrp8.png)

This creates two new `Link` records in the database. You can verify that the mutations actually worked by sending the following query in the already open Playground:

```graphql
{
  links {
    id
    description
    url
  }
}
```

> **Note**: You can also send the `feed` query in the **default** Playground in the **app** section.

If everything went well, the query will return the following data (the `id`s will of course be different in your case):

```js(nocopy)
{
  "data": {
    "links": [
      {
        "id": "cj4jo6xxat8o901420m0yy60i",
        "description": "The coolest GraphQL backend 😎",
        "url": "https://graph.cool"
      },
      {
        "id": "cj4jo6z4it8on0142p7q015hc",
        "description": "The best GraphQL client",
        "url": "http://dev.apollodata.com/"
      }
    ]
  }
```