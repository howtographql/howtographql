---
title: Getting Started
pageTitle: "Getting Started with GraphQL, React & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with create-react-app and the backend with Prisma.
question: Why are there two GraphQL API layers in a backend architecture with Prisma?
answers: ["To increase robustness and stability of the GraphQL server (if one layer fails, the server is backed by the second one).", "To increase performance of the GraphQL server (requests are accelerated  by going through multiple layers).", "Prisma provides the database layer which offers CRUD operations. The second layer is the application layer for business logic and common workflows (like authentication).", "Having two GraphQL layers is a hard requirement by the GraphQL specification."]
correctAnswer: 2
draft: false
videoId: ""
duration: 0		
videoAuthor: ""
---

Since this is a frontend track, you're not going to spend any time implementing the backend. Instead, you'll use the server from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

Once you created your React application, you'll pull in the required code for the backend.

> **Note**: The final project for this tutorial can be found on [GitHub](https://github.com/howtographql/react-apollo). You can always use it as a reference whenever you get lost throughout the course of the following chapters.
> Also note that each code block is annotated with a filename. These annotations directly link to the corresponding file on GitHub so you can clearly see where to put the code and what the end result will look like.

### Frontend

#### Creating the app

First, you are going to create the React project! As mentioned in the beginning, you'll use `create-react-app` for that.

<Instruction>

Use `npx` to bootstrap your React application with `create-react-app`:

```bash
npx create-react-app hackernews-react-apollo
```

</Instruction>

This will create a new directory called `hackernews-react-apollo` that has all the basic configuration setup.

Make sure everything works by navigating into the directory and starting the app:

```bash
cd hackernews-react-apollo
yarn start
```


> **Note**: This tutorial uses [Yarn](https://yarnpkg.com/) for dependency and project management. Find instructions for how you can install it [here](https://yarnpkg.com/en/docs/install). If you prefer using `npm`, you can just run the equivalent commands. 

This will open a browser and navigate to `http://localhost:3000` where the app is running. If everything went well, you'll see the following:

![](http://imgur.com/Yujwwi6.png)

Great job! 👏

<Instruction>

To improve the project structure, move on to create two directories, both inside the `src` folder. The first is called `components` and will hold all our React components. Call the second one `styles`, that one is for all the CSS files you'll use.

`App.js` is a component, so move it into `components`. `App.css` and `index.css` contain styles, so move them into `styles`. You also need to change the references to these files in `index.js` accordingly:

</Instruction>

```js{4}(path=".../hackernews-react-apollo/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
```

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

This tutorial is about the concepts of GraphQL and how you can use it from within a React application, so we want to spend the least time possible on styling. To reduce the usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

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
yarn add apollo-boost react-apollo graphql
```

</Instruction>

Here's an overview of the packages you just installed:

- [`apollo-boost`](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) offers some convenience by bundling several packages you need when working with Apollo Client:
  - `apollo-client`: Where all the magic happens
  - `apollo-cache-inmemory`: Our recommended cache
  - `apollo-link-http`: An Apollo Link for remote data fetching
  - `apollo-link-error`: An Apollo Link for error handling
  - `apollo-link-state`: An Apollo Link for local state management
  - `graphql-tag`: Exports the `gql` function for your queries & mutations
- [`react-apollo`](https://github.com/apollographql/react-apollo) contains the bindings to use Apollo Client with React.
- [`graphql`](https://github.com/graphql/graphql-js) contains Facebook's reference implementation of GraphQL - Apollo Client uses some of its functionality as well.

That's it, you're ready to write some code! 🚀

#### Configure `ApolloClient`

Apollo abstracts away all lower-level networking logic and provides a nice interface to the GraphQL server. In contrast to working with REST APIs, you don't have to deal with constructing your own HTTP requests any more - instead you can simply write queries and mutations and send them using an `ApolloClient` instance.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the _endpoint_ of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/index.js` and replace the contents with the following:

```js{6-9,11-13,15-18,21-23}(path=".../hackernews-react-apollo/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
registerServiceWorker()
```

</Instruction>

> **Note**: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use **no semicolons** and mostly **single quotes**. You're also free to delete any existing semicolons and replace double with single quotes 🔥

Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the installed packages.
1. Here you create the `httpLink` that will connect your `ApolloClient` instance with the GraphQL API, your GraphQL server will be running on `http://localhost:4000`.
1. Now you instantiate `ApolloClient` by passing in the `httpLink` and a new instance of an `InMemoryCache`.
1. Finally you render the root component of your React app. The `App` is wrapped with the higher-order component `ApolloProvider` that gets passed the `client` as a prop.

That's it, you're all set to start loading some data into your app! 😎 In the next section, you're adding the server that will provide that data.

### Backend

The overall architecture of your app looks as follows:

![](https://imgur.com/OyIQQxF.png)

In the following sections, you're going to configure all backend components:

- API server (based on [`graphql-yoga`](https://github.com/prisma/graphql-yoga/))
- Prisma
- Database (you'll use a free and hosted demo AWS Aurora database in Prisma Cloud)

#### Downloading the server code

As mentioned above, for the backend in this tutorial you'll simply use the final project from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

<Instruction>

In your terminal, navigate to the `hackernews-react-apollo` directory and run the following commands:

```bash(path=".../hackernews-react-apollo")
curl https://codeload.github.com/howtographql/react-apollo/tar.gz/starter | tar -xz --strip=1 react-apollo-starter/server
```

</Instruction>

> **Note**: If you are on Windows, you may want to install [Git CLI](https://git-scm.com/) to avoid potential problems with commands such as `curl`.

You now have a new directory called `server` inside your project that contains all the code you need for your backend.

Before you start the server, let's quickly understand the main components:

- `prisma`: This directory holds all the files that relate to your Prisma and database setup. [Prisma](https://www.prisma.io) is used as a replacement for a traditional ORM and is responsible for accessing the database (using the Prisma client).
  - `prisma.yml` is the root configuration file for Prisma.
  - `datamodel.prisma` defines your datamodel. Every model gets mapped to a table in the database.
- `src`: This directory holds the source files for your GraphQL server.
  - `schema.graphql` contains your [GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e). 
  - `resolvers` contains the [resolver functions](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) for the operations defined in the GraphQL schema.
  - `index.js` is the entry point for your GraphQL server.

From the mentioned files, only the application schema defined in `server/src/schema.graphql` is relevant for you as a frontend developer. This file contains the [GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) which defines all the operations (queries, mutations and subscriptions) you can send from your frontend app.

Here is what it looks like:

```graphql(path=".../hackernews-react-apollo/server/src/schema.graphql"&nocopy)
scalar DateTime

type Query {
  feed(filter: String, skip: Int, first: Int, orderBy: LinkOrderByInput): Feed!
}

enum LinkOrderByInput {
  description_ASC
  description_DESC
  url_ASC
  url_DESC
  createdAt_ASC
  createdAt_DESC
}

type Feed {
  links: [Link!]!
  count: Int!
}

type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote!
}

type Subscription {
  newLink: Link
  newVote: Vote
}

type AuthPayload {
  token: String
  user: User
}

type User {
  id: ID!
  name: String!
  email: String!
  links: [Link!]!
}

type Link {
  id: ID!
  createdAt: DateTime!
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}

type Vote {
  id: ID!
  link: Link!
  user: User!
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

For example, you can send the following `feed` query to retrieve the first 10 links from the server:

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

Or the `signup` mutation to create a new user:

```graphql(nocopy)
mutation {
  signup(
    name: "Sarah",
    email: "sarah@prisma.io",
    password: "graphql"
  ) {
    token
    user {
      id
    }
  }
}
```

#### Deploying the Prisma datamodel

There is one thing left to do before you can start your server and begin sending queries and mutations to it. Prisma needs to be deployed so the GraphQL server can access it.

To deploy Prisma all you need to do is install the server's dependencies and invoke the `prisma deploy` command inside the `server` directory.

<Instruction>

In your terminal, navigate to the `server` directory and execute the following commands:

```sh(path=".../hackernews-react-apollo/server")
yarn install
yarn prisma deploy
```

</Instruction>

The `prisma deploy` command starts an interactive process.

<Instruction>

First select the **Demo server** from the options provided. When the browser opens, register with Prisma Cloud and go back to your terminal.

Then you need to select the **region** for your Demo server. Once that’s done, you can just hit enter twice to use the suggested values for **service** and **stage**.

</Instruction>

The Demo server that you used as a deployment target for Prisma is hosed for free in Prisma Cloud and comes with a connected database (AWS Aurora).

> **Note**: You can also omit `yarn` in the above command if you have the `prisma` CLI installed globally on your machine (which you can do with `yarn global add prisma`). In that case, you can simply run `prisma deploy`.

#### Exploring the server

Now that Prisma is deployed, you can go and explore the server!

<Instruction>

Run the following command inside the new `server` directory (not in `react-apollo`) to start the server:

```bash(path=".../hackernews-react-apollo/server")
yarn start
```

</Instruction>

Now you can open a GraphQL Playground by navigation to [http://localhost:4000](http://localhost:4000) where the GraphQL server is running.

<Instruction>

Copy the following mutation into the left pane of the Playground:

```graphql
mutation {
  prismaLink: post(
    description: "Prisma replaces traditional ORMs and makes it easy to build GraphQL servers 😎",
    url: "https://www.prisma.io"
  ) {
    id
  }
  apolloLink: post(
    description: "The best GraphQL client for React",
    url: "https://www.apollographql.com/docs/react/"
  ) {
    id
  }
}
```

</Instruction>


<Instruction>

Click the **Play**-button in the middle of the two panes to send the mutation and post the two links.

</Instruction>

This creates two new `Link` records in the database. You can verify that the mutations actually worked by sending the following query in the already open Playground:

```graphql
{
  feed {
    links {
      id
      description
      url
    }
  }
}
```

If everything went well, the query will return the following data (the `id`s will of course be different in your case since they were generated by Prisma and are globally unique):

```json(nocopy)
{
  "data": {
    "feed": {
      "links": [
        {
          "id": "cjcnfwjeif1rx012483nh6utk",
          "description": "The best GraphQL client",
          "url": "https://www.apollographql.com/docs/react/"
        },
        {
          "id": "cjcnfznzff1w601247iili50x",
          "description": "Prisma replaces traditional ORMs and makes it easy to build GraphQL servers 😎",
          "url": "https://www.prisma.io"
        }
      ]
    }
  }
}
```

Fantastic, your server works! 👏
