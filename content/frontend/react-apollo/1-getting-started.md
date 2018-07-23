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

If you haven't already, you need to install `create-react-app` using yarn:

```bash
yarn global add create-react-app
```

</Instruction>

> **Note**: This tutorial uses [Yarn](https://yarnpkg.com/) for dependency management. Find instructions for how you can install it [here](https://yarnpkg.com/en/docs/install). If you prefer using `npm`, you can just run the equivalent commands. 

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

> Note: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use **no semicolons** and mostly **single quotes**. You're also free to delete any existing semicolons and replace double with single quotes 🔥

Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the installed packages.
1. Here you create the `httpLink` that will connect your `ApolloClient` instance with the GraphQL API, your GraphQL server will be running on `http://localhost:4000`.
1. Now you instantiate `ApolloClient` by passing in the `httpLink` and a new instance of an `InMemoryCache`.
1. Finally you render the root component of your React app. The `App` is wrapped with the higher-order component `ApolloProvider` that gets passed the `client` as a prop.

That's it, you're all set to start for loading some data into your app! 😎

### Backend

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

Before we start the server, let's quickly understand the main components:

- `database`: This directory holds all the files that relate to your Prisma database service.
  - `prisma.yml` is the root configuration file for the service.
  - `datamodel.graphql` defines your data model in the GraphQL [Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). The data model is the foundation for the GraphQL API generated by Prisma which provides powerful CRUD operations for the types in the data model.
- `src`: This directory holds the source files for your GraphQL server.
  - `schema.graphql` contains your **application schema**. The application schema defines the GraphQL operations you can send from the frontend. We'll take a closer look at this file in just a bit.
  - `generated/prisma.graphql` contains the auto-generated **Prisma database schema**. The Prisma schema defines powerful CRUD operations for the types in your data model. Note that you should never edit this file manually since it gets automatically updated when the data model changes.
  - `resolvers` contains the [_resolver functions_](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e#1880) for the operations defined in the application schema.
  - `index.js` is the entry point for your GraphQL server.

From the mentioned files, only the application schema defined in `server/src/schema.graphql` is relevant for you as a frontend developer. This file contains the [GraphQL schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) which defines all the operations (queries, mutations and subscriptions) you can send from your frontend app.

Here is what it looks like:

```graphql(path=".../hackernews-react-apollo/server/src/schema.graphql"&nocopy)
# import Link, Vote, LinkSubscriptionPayload, VoteSubscriptionPayload from "./generated/prisma.graphql"

type Query {
  feed(filter: String, skip: Int, first: Int, orderBy: LinkOrderByInput): Feed!
}

type Feed {
  links: [Link!]!
  count: Int!
}

type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote
}

type AuthPayload {
  token: String
  user: User
}

type User {
  id: ID!
  name: String!
  email: String!
}

type Subscription {
  newLink: LinkSubscriptionPayload
  newVote: VoteSubscriptionPayload
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

#### Deploying the Prisma database service

There is one thing left to do before you can start your server and begin sending queries and mutations to it. The Prisma database service needs to be deployed so the server can access it.

To deploy the service all you need to do is install the server's dependencies and invoke the `prisma deploy` command inside the `server` directory.

<Instruction>

In your terminal, navigate to the `server` directory and execute the following commands:

```sh(path=".../hackernews-react-apollo/server")
yarn install
yarn prisma deploy
```

</Instruction>

Note that you can also omit `yarn prisma` in the above command if you have the `prisma` CLI installed globally on your machine (which you can do with `yarn global add prisma`). In that case, you can simply run `prisma deploy`.

<Instruction>

When prompted where (i.e. to which cluster) you want to deploy your service, choose any of the development clusters, e.g. `public-us1` or `public-eu1`. (If you have Docker installed, you can also deploy locally.)

</Instruction>

<Instruction>

From the output of the `deploy` command, copy the `HTTP` endpoint and paste it into `server/src/index.js`, replacing the current placeholder `__PRISMA_ENDPOINT__`:

```js(path=".../hackernews-react-apollo/server/src/index.js")
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: '__PRISMA_ENDPOINT__',
      secret: 'mysecret123',
    }),
  }),
})
```

</Instruction>

> **Note**: If you ever lose the endpoint, you can get access to it again by running `yarn prisma info`.

#### Exploring the server

With the proper Prisma endpoint in place, you can now explore the server!

<Instruction>

Navigate into the `server` directory and run the following commands to start the server:

```bash(path=".../hackernews-react-apollo/server")
yarn dev
```

</Instruction>

The `yarn dev` executes the `dev` script defined in `package.json`. The script first starts the server (which is then running on `http://localhost:4000`) and then opens up a [GraphQL Playground](https://github.com/graphcool/graphql-playground) for you to explore and work with the API. Note that if you only want to start the server without opening a Playground, you can do so by running `yarn start`.

![](https://imgur.com/k2I7NJn.png)

> A Playground is a "GraphQL IDE", providing an interactive environment that allows to send queries, mutations and subscriptions to your GraphQL API. It is similar to a tool like [Postman](https://www.getpostman.com) which you might know from working with REST APIs, but comes with a lot of additional benefits.

The first thing to note about the Playground is that it has built-in documentation for its GraphQL API. This documentation is generated based on the GraphQL schema and can be openend by clicking the green **SCHEMA**-button on the right edge of the Playground. Consequently, it shows you the same information you saw in the application schema above:

![](https://imgur.com/8xK81qt.png)

Another important thing to note about the Playground is that it actually allows you to interact with two(!) GraphQL APIs.

The first one is defined by your **application schema**, this is the one your React application will interact with. It can be opened by selecting the **default** Playground in the **app** project in the left side-menu.

There also is the Prisma database API which provides full access to the data stored in the database. This one you can open by selecting the **dev** Playground in the **database** project in the left side-menu. This API is defined by the **Prisma schema** (in `server/src/generated/prisma.graphql`).

> **Note**: The Playground receives the information about the two GraphQL APIs from the `.graphqlconfig.yml` file which lists the two projects **app** and **database**. That's why it can provide you access to both.

Why do you need two GraphQL APIs at all? The answer is pretty straightforward, you can actually think of the two APIs as two _layers_.

The application schema defines the first layer, also called _application layer_. It defines the operations your client applications will be able to send to your API. This includes business logic as well as other common features and workflows (such as signup and login).

The second layer is the _database layer_ defined by the Prisma schema. It provides powerful CRUD operations that allow you to perform _any_ kind of operation against the data in your database.

Here is an overview of the architecture of the app:

![](https://imgur.com/M8cbht4.png)

> **Note**: It is of course possible to _only_ use the database API from the frontend. However, in most real-world applications you'll need at least a little bit of business logic which the API can not provide. If your app really only needs to perform CRUD operations and access a database, then it's totally fine to run against the Prisma database API directly.

The left pane of the Playground is the _editor_ that you can use to write your queries, mutations and subscriptions. Once you click the play button in the middle, your request is sent and the server's response will be displayed in the _results_ pane on the right.

<Instruction>

Copy the following two mutations into the _editor_ pane - make sure to have the **default** Playground from the **app** project selected in the left side-menu:

```graphql
mutation CreatePrismaLink {
  post(
    description: "Prisma turns your database into a GraphQL API 😎",
    url: "https://www.prismagraphql.com"
  ) {
    id
  }
}

mutation CreateApolloLink {
  post(
    description: "The best GraphQL client for React",
    url: "https://www.apollographql.com/docs/react/"
  ) {
    id
  }
}
```

</Instruction>

Since you're adding two mutations to the editor at once, the mutations need to have _operation names_. In your case, these are `CreatePrismaLink` and `CreateApolloLink`.

<Instruction>

Click the **Play**-button in the middle of the two panes and select each mutation from the dropdown exactly once.

</Instruction>

![](https://imgur.com/2GViJwb.png)

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

> **Note**: You can also send the `feed` query in the **default** Playground in the **app** section.

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
          "description": "Prisma turns your database into a GraphQL API 😎",
          "url": "https://www.prismagraphql.com"
        }
      ]
    }
  }
}
```

Fantastic, your server works! 👏
