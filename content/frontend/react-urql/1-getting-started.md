---
title: Getting Started
pageTitle: "Getting Started with GraphQL, React & urql Tutorial"
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

> **Note**: The final project for this tutorial can be found on [GitHub](https://github.com/howtographql/react-urql). You can always use it as a reference whenever you get lost throughout the course of the following chapters.
> Also note that each code block is annotated with a filename. These annotations directly link to the corresponding file on GitHub so you can clearly see where to put the code and what the end result will look like.

> **Need some help?** No tutorial is perfect and questions always come up, so [feel free to reach out to us and the community over on the urql Spectrum](https://spectrum.chat/urql), if you have any questions or need some help!

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
create-react-app hackernews-react-urql
```

</Instruction>

This will create a new directory called `hackernews-react-urql` that has all the basic configuration setup.

Make sure everything works by navigating into the directory and starting the app:

```bash
cd hackernews-react-urql
yarn start
```

This will open a browser and navigate to `http://localhost:3000` where the app is running. If everything went well, you'll see the following:

![](http://imgur.com/Yujwwi6.png)

<Instruction>

To improve the project structure, move on to create two directories, both inside the `src` folder. The first is called `components` and will hold all our React components. Call the second one `styles`, that one is for all the CSS files you'll use.

`App.js` is a component, so move it into `components`. `App.css` and `index.css` contain styles, so move them into `styles`. You also need to change the references to these files in both `index.js` and `App.js` accordingly:

</Instruction>

```js{4}(path=".../hackernews-react-urql/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
```

```js{2}(path=".../hackernews-react-urql/src/components/App.js")
import React, { Component } from 'react';
import logo from '../logo.svg';
import '../styles/App.css';
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
│   ├── serviceWorker.js
│   └── styles
│       ├── App.css
│       └── index.css
└── yarn.lock
```

#### Prepare styling

This tutorial is about the concepts of GraphQL and how you can use it from within a React application, so we want to spend the least time possible on styling. To reduce the usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

<Instruction>

Open `public/index.html` and add a third `link` tag right below the two existing ones that pulls in Tachyons:

```html{3}(path=".../hackernews-react-urql/public/index.html")
<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
<link rel="stylesheet" href="https://unpkg.com/tachyons@4.2.1/css/tachyons.min.css"/>
```

</Instruction>

Since we still want to have a bit more custom styling here and there, we also prepared some styles for you that you need to include in the project.

<Instruction>

Open `index.css` and replace its content with the following:

```css(path=".../hackernews-react-urql/src/styles/index.css")
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

#### Install urql

<Instruction>

Next, you need to pull in the functionality of `urql`. We'll also be installing
two "Exchanges" for urql, which we'll use to set up normalized caching and support
for React Suspense:

```bash(path=".../hackernews-react-urql")
yarn add urql @urql/exchange-graphcache @urql/exchange-suspense graphql graphql-tag
```

</Instruction>

Here's an overview of the packages you just installed:

- [`urql`](https://github.com/FormidabLabs/urql) offers the basic `urql` client which includes React hooks and components, and a basic document cache by default
- [`@urql/exchange-graphcache`](https://github.com/FormidableLabs/urql-exchange-graphcache) is a replacement for `urql`'s default cache, which supports full normalized caching, which we'll set up later
- [`@urql/exchange-suspense`](https://github.com/FormidableLabs/urql-exchange-suspense) allows us to fully use the React Suspense feature
- [`graphql`](https://github.com/graphql/graphql-js) contains Facebook's reference implementation of GraphQL - urql and its other packages use some of its functionality as well.
- [`graphql-tag`](https://github.com/apollographql/graphql-tag) is a utility to write GraphQL query definitions using [tagged template literals](https://mxstbr.blog/2016/11/styled-components-magic-explained/).

> **Note**: You can find more information on [how urql's Exchanges work in its docs](https://formidable.com/open-source/urql/docs/architecture/). Generally speaking, every GraphQL operation goes through a chain of middleware that can transform, filter, or fulfill them. Every core feature in urql including fetching, deduplication, and caching is implemented using Exchanges.

That's it, you're ready to write some code! 🚀

#### Configure urql's Client

Instead of dealing with GraphQL requests directly, urql has a central Client. It controls when and how operations are made and deals with all the details of deduplication, caching, and cancellation. In contract to working with REST APIs, you don't have to construct any HTTP requests manually or store the results explicitly - instead you can simply write queries and mutations and send them using `urql`'s React bindings. Internally these bindings just use methods on the Client, for instance `executeQuery` and `executeMutation`.

The first thing you have to do when using urql is configure a `Client` instance. It needs to know the _endpoint_ of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/index.js` and replace the contents with the following:

```js{6-7,9-12,15-18}(path=".../hackernews-react-urql/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'

// 1
import { Provider, Client, defaultExchanges } from 'urql'

// 2
const client = new Client({
  url: 'http://localhost:4000',
  exchanges: defaultExchanges
})

// 3
ReactDOM.render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

</Instruction>

> Note: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use **no semicolons** and mostly **single quotes**. You're also free to delete any existing semicolons and replace double with single quotes 🔥

Let's try to understand what's going on in that code snippet:

1. You're importing the `Client`, `Provider`, and `defaultExchanges` from `urql`.
2. Here you're instantiating a new `Client` and are passing it your endpoint `url` and a list of `defaultExchanges`
3. Finally you render the root component of your React app. The `App` is wrapped with the context Provider for the `urql` Client.

The `defaultExchanges` would also be applied automatically, but in the next step we'll be
setting up suspense support and the normalized cache!

#### Set up additional urql Exchanges

By default urql sets up three built-in exchanges, which provide its core functionality:

- `dedupExchange` deduplicates operations. If you're sending the same queries at the same time, then it will make sure that only one of them is actually sent to your API
- `cacheExchange` caches operation results. This is only a document cache, so it caches results from your GraphQL API by the unique query + variables combination that those results have been requested with.
- `fetchExchange` sends GraphQL requests using `fetch` and supports cancellation by default.

As you can see above, by default `urql` only comes with a simple document cache. This cache is very useful for content-heavy sites. It treats every query and result as documents that it can simply cache 1:1. For more complex apps you will most likely want to use normalized caching, which makes sure that data updates globally across the app, if it can be shared across queries.

In this tutorial we'd also like to show you how you can use `<React.Suspense>` to simplify your data loading logic.

Let's set up a normalized cache and suspense support.

<Instruction>

Modify `src/index.js` with the following new changes:

```js{6-9,11-12,16-18}(path=".../hackernews-react-urql/src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'

// 1
import { Provider, Client, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache
import { suspenseExchange } from '@urql/exchange-suspense

// 2
const cache = cacheExchange({})

const client = new Client({
  url: 'http://localhost:4000',
  // 3
  exchanges: [dedupExchange, suspenseExchange, cache, fetchExchange],
  suspense: true
})

ReactDOM.render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

</Instruction>

Let's go through the changes we've made to our `index.js` in order:

1. We're now importing `dedupExchange` and `fetchExchange` from `urql` and have added `cacheExchange` and `suspenseExchange` from our two extension packages.
2. We're creating a new normalized cache by calling `cacheExchange` with a config, which is empty for now.
3. Lastly we're replacing `defaultExchanges` on the `Client` with our new list of exchanges, which need to be in a specific order (basically: `fetch` last, `dedup` first.) We also flip on the Client's `suspense` mode.

That's it, you're all set to start for loading some data into your app! 😎

### Backend

#### Downloading the server code

As mentioned above, for the backend in this tutorial you'll simply use the final project from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

<Instruction>

In your terminal, navigate to the `hackernews-react-urql` directory and run the following commands:

```bash(path=".../hackernews-react-urql")
curl https://codeload.github.com/howtographql/react-urql/tar.gz | tar -xz --strip=1 react-urql/server
```

</Instruction>

> **Note**: If you are on Windows, you may want to install [Git CLI](https://git-scm.com/) to avoid potential problems with commands such as `curl`.

You now have a new directory called `server` inside your project that contains all the code you need for your backend.

Before we start the server, let's quickly understand the main components:

- `prisma`: This directory holds all the files that relate to your [Prisma](https://www.prisma.io) setup. The Prisma client is used to access the database in your GraphQL resolvers (similar to an ORM).
  - `prisma.yml` is the root configuration file for your Prisma project.
  - `datamodel.prisma` defines your data model in the GraphQL [Schema Definition Language](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). When using Prisma, the datamodel is used to describe the database schema.
- `src`: This directory holds the source files for your GraphQL server.
  - `schema.graphql` contains your **application schema**. The application schema defines the GraphQL operations you can send from the frontend. We'll take a closer look at this file in just a bit.
  - `generated/prisma-client` contains the auto-generated Prisma client, a type-safe database access library (similar to an ORM).
  - `resolvers` contains the [_resolver functions_](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e#1880) for the operations defined in the application schema.
  - `index.js` is the entry point for your GraphQL server.

From the mentioned files, only the application schema defined in `server/src/schema.graphql` is relevant for you as a frontend developer. This file contains the [GraphQL schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) which defines all the operations (queries, mutations and subscriptions) you can send from your frontend app.

Here is what it looks like:

```graphql(path=".../hackernews-react-urql/server/src/schema.graphql"&nocopy)
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

There is one thing left to do before you can start your server and begin sending queries and mutations to it. The Prisma project needs to be deployed so the GraphQL server can access it.

To deploy the service all you need to do is install the server's dependencies and invoke the `prisma deploy` command inside the `server` directory.

<Instruction>

In your terminal, navigate to the `server` directory and execute the following commands:

```sh(path=".../hackernews-react-urql/server")
cd server
yarn install
yarn prisma deploy
```

</Instruction>

Note that you can also omit `yarn prisma` in the above command if you have the `prisma` CLI installed globally on your machine (which you can do with `yarn global add prisma`). In that case, you can simply run `prisma deploy`.

<Instruction>

When prompted where you want to set/deploy your service, select `Demo server` (it requires login, you could sign in with your GitHub account), then choose a _region_, e.g. `demo-us1` or `demo-eu1`. The Demo server includes a free instance of an AWS Aurora database. (If you have Docker installed, you can also deploy locally.)

</Instruction>

> **Note**: Once the command has finished running, the CLI writes the endpoint for the Prisma API to your prisma.yml. It will look similar to this: https://eu1.prisma.sh/john-doe/hackernews-node/dev.

#### Exploring the server

With the proper Prisma endpoint in place, you can now explore the server!

<Instruction>

Navigate into the `server` directory and run the following commands to start the server:

```bash(path=".../hackernews-react-urql/server")
yarn start
```

</Instruction>

The `yarn start` executes the `start` script defined in `package.json`. The script first starts the server (which is then running on `http://localhost:4000`) and then opens up a [GraphQL Playground](https://github.com/graphcool/graphql-playground) for you to explore and work with the API.

![](https://imgur.com/V1hp4ID.png)

> A Playground is a "GraphQL IDE", providing an interactive environment that allows to send queries, mutations and subscriptions to your GraphQL API. It is similar to a tool like [Postman](https://www.getpostman.com) which you might know from working with REST APIs, but comes with a lot of additional benefits.

The first thing to note about the Playground is that it has built-in documentation for its GraphQL API. This documentation is generated based on the GraphQL schema and can be opened by clicking the green **SCHEMA**-button on the right edge of the Playground. Consequently, it shows you the same information you saw in the application schema above:

![](https://imgur.com/8xK81qt.png)

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

mutation CreateUrqlLink {
  post(
    description: "The best GraphQL client for React",
    url: "https://github.com/FormidableLabs/urql"
  ) {
    id
  }
}
```

</Instruction>

Since you're adding two mutations to the editor at once, the mutations need to have _operation names_. In your case, these are `CreatePrismaLink` and `CreateUrqlLink`.

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
          "url": "https://github.com/FormidableLabs/urql"
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
