---
title: Getting Started
pageTitle: 'Getting Started with GraphQL, React and Apollo Tutorial'
description:
  Start building a Hackernews clone. Create the frontend with create-react-app
  and the backend with Prisma.
question:
  Why are there two GraphQL API layers in a backend architecture with Prisma?
answers:
  [
    'To increase robustness and stability of the GraphQL server (if one layer
    fails, the server is backed by the second one).',
    'To increase performance of the GraphQL server (requests are accelerated  by
    going through multiple layers).',
    'Prisma provides the database layer which offers CRUD operations. The second
    layer is the application layer for business logic and common workflows (like
    authentication).',
    'Having two GraphQL layers is a hard requirement by the GraphQL
    specification.',
  ]
correctAnswer: 2
draft: false
videoId: ''
duration: 0
videoAuthor: ''
---

Since this is a frontend track, we're not going to spend any time implementing
the backend. Instead, we'll use the server from the
[Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

Once our React application is created, we'll pull in the required code for the
backend.

> **Note**: The final project for this tutorial can be found on
> [GitHub](https://github.com/howtographql/react-apollo). You can always use it
> as a reference whenever you get lost throughout the course of the following
> chapters. Also note that each code block is annotated with a filename. These
> annotations directly link to the corresponding file on GitHub so you can
> clearly see where to put the code and what the end result will look like.

### Frontend

#### Creating the app

The first step is to create a React project! As mentioned in the beginning,
we'll use `create-react-app` for that.

<Instruction>

To create new project, run the command below:

```bash
yarn create react-app hackernews-react-apollo
```

</Instruction>

> **Note**: This tutorial uses [yarn](https://yarnpkg.com/) for dependency
> management. Find instructions for how you can install it
> [here](https://yarnpkg.com/en/docs/install). If you prefer using `npm`, you
> can just run the equivalent commands.

This will create a new directory called `hackernews-react-apollo` that has all
the basic configuration setup.

Make sure everything works by navigating into the directory and starting the
app:

```bash
cd hackernews-react-apollo
yarn start
```

This will open a browser and navigate to `http://localhost:3000` where the app
is running. If everything went well, we'll see the following:

![App running on localhost:3000](https://imgur.com/RZsBM1p.png)

<Instruction>

To improve the project structure, create two directories, both inside the `src`
folder. The first is called `components` and will hold all our React components.
Create a second directory called `styles` to hold all of the CSS for the
project.

`App.js` is a component, so move it into `components`. You can also move
`App.test.js` there as well (or delete it as we won't use it here). `App.css`
and `index.css` contain styles, so move them into `styles`. We also need to
change the references to these files in both `index.js` and `App.js`
accordingly:

</Instruction>

```js{3,4}(path=".../hackernews-react-apollo/src/index.js")
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
```

```js{2}(path=".../hackernews-react-apollo/src/components/App.js")
import React, { Component } from 'react';
import logo from './../logo.svg';
import './../styles/App.css';
```

The project structure should now look as follows:

```bash(nocopy)
.
├── README.md
├── node_modules
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
│   └── logo192.png
│   └── logo512.png
│   └── robot.txt
├── src
│   ├── App.test.js
│   ├── components
│   │   └── App.js
│   │   └── App.test.js
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   └── styles
│       ├── App.css
│       └── index.css
└── yarn.lock
```

#### Prepare Styling

This tutorial is about the concepts of GraphQL and how we can use it from within
a React application, so we want to spend as little time as possible on styling.
To reduce the usage of CSS in this project, we'll use the
[Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

<Instruction>

Open `public/index.html` and add a third `link` tag right below the two existing
ones that pulls in Tachyons:

```html{3}(path=".../hackernews-react-apollo/public/index.html")
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
<link
  rel="stylesheet"
  href="https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css"
/>
```

</Instruction>

Since we still want to have a bit more custom styling, we also prepared some
styles that need to be included in the project.

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
  background-color: rgb(246, 246, 239);
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

Next, we need to pull in the functionality of Apollo Client (and its React
hooks) which comes in several packages:

```bash(path=".../hackernews-react-apollo")
yarn add @apollo/client graphql
```

</Instruction>

Here's an overview of the packages we installed:

- [`@apollo/client`](https://github.com/apollographql/apollo-client) contains
  all the pieces needed to wire up the GraphQL client for our app. It exposes
  the `ApolloClient`, a provider to wrap around the React app called
  `ApolloProvider`, custom hooks such as `useQuery`, and much more.
- [`graphql`](https://github.com/graphql/graphql-js) contains Facebook's
  reference implementation of GraphQL - Apollo Client uses some of its
  functionality within.

That's it, we're ready to write some code! 🚀

#### Configure `ApolloClient`

Apollo abstracts away all lower-level networking logic and provides a nice
interface to the GraphQL server. In contrast to working with REST APIs, we don't
have to deal with constructing our own HTTP requests any more - instead we can
simply write queries and mutations and send them using an `ApolloClient`
instance.

The first thing we have to do when using Apollo is configure our `ApolloClient`
instance. It needs to know the _endpoint_ of our GraphQL API so it can deal with
the network connections.

<Instruction>

Open `src/index.js` and replace the contents with the following:

```js{6-9,11-13,15-18,21-23}(path=".../hackernews-react-apollo/src/index.js")
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

// 1
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';

// 2
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});

// 3
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

// 4
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
serviceWorker.unregister();
```

</Instruction>

Let's take a look at what's going on in the code snippet above:

1. We import all the dependencies we need to wire up the Apollo client, all from
   `@apollo/client`.
2. We create the `httpLink` that will connect our `ApolloClient` instance with
   the GraphQL API. The GraphQL server will be running on
   `http://localhost:4000`.
3. We instantiate `ApolloClient` by passing in the `httpLink` and a new instance
   of an `InMemoryCache`.
4. Finally, we render the root component of our React app. The `App` is wrapped
   with the higher-order component `ApolloProvider` that gets passed the
   `client` as a prop.

That's it, we're all set to start for loading some data into our app! 😎

### Backend

#### Downloading the Server Code

As mentioned above, for the backend in this tutorial we'll simply use the final
project from the
[Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

<Instruction>

In the terminal, navigate to the `hackernews-react-apollo` directory and run the
following commands:

```bash(path=".../hackernews-react-apollo")
curl https://codeload.github.com/howtographql/react-apollo/tar.gz/starter | tar -xz --strip=1 react-apollo-starter/server
```

</Instruction>

> **Note**: If you are on Windows, you may want to install
> [Git CLI](https://git-scm.com/) to avoid potential problems with commands such
> as `curl`.

We now have a new directory called `server` inside our project that contains all
the code needed for our backend.

Before we start the server, let's quickly understand the main components:

- `prisma`: This directory holds all the files that relate to our
  [Prisma](https://www.prisma.io) setup. Prisma Client is used to access the
  database in our GraphQL resolvers (similar to an ORM).
  - `schema.prisma` defines our data model for the project. It uses the
    [Prisma Schema Language](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema)
    to define the shape of our databases tables and the relations between them.
  - `dev.db` is a SQLite database that will be used to store and retrieve data
    for this tutorial
- `src`: This directory holds the source files for our GraphQL server.
  - `schema.graphql` contains our **application schema**. The application schema
    defines the GraphQL operations we can send from the frontend. We'll take a
    closer look at this file in just a bit.
  - `resolvers` contains the
    [_resolver functions_](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e#resolvers-implement-the-api)
    for the operations defined in the application schema.
  - `index.js` is the entry point for our GraphQL server.

From the mentioned files, only the application schema defined in
`server/src/schema.graphql` is relevant for you as a frontend developer. This
file contains the
[GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e)
which defines all the operations (queries, mutations and subscriptions) we can
send from your frontend app.

Here is what it looks like:

```graphql(path=".../react-apollo/blob/master/server/src/schema.graphql")
type Query {
  info: String!
  feed(filter: String, skip: Int, take: Int, orderBy: LinkOrderByInput): Feed!
}

type Feed {
  id: ID!
  links: [Link!]!
  count: Int!
}

type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  vote(linkId: ID!): Vote
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
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
  createdAt: DateTime!
}

type Vote {
  id: ID!
  link: Link!
  user: User!
}

input LinkOrderByInput {
  description: Sort
  url: Sort
  createdAt: Sort
}

enum Sort {
  asc
  desc
}

scalar DateTime
```

This schema allows for the following operations:

- Queries:
  - `feed`: Retrieves all links from the backend, note that this query also
    allows for filter, sorting and pagination arguments
- Mutations:
  - `post`: Allows authenticated users to create a new link
  - `signup`: Create an account for a new user
  - `login`: Login an existing user
  - `vote`: Allows authenticated users to vote for an existing link
- Subscriptions:
  - `newLink`: Receive realtime updates when a new link is created
  - `newVote`: Receive realtime updates when a vote was submitted

For example, we can send the following `feed` query to retrieve the first 10
links from the server:

```graphql(nocopy)
{
  feed(skip: 0, take: 10) {
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
  signup(name: "Sarah", email: "sarah@prisma.io", password: "graphql") {
    token
    user {
      id
    }
  }
}
```

#### Creating a Database and Generating Prisma Client

There is one thing left to do before we can start our server and begin sending
queries and mutations to it. We need a database and a generated Prisma Client so
that we can actually store and retrieve data.

Prisma
[supports several relational databases](https://www.prisma.io/docs/more/supported-databases),
including Postgres, MySQL, and SQLite.

For this tutorial, we'll keep things simple and use SQLite. It's a filesystem
database that is very easy to get started with. It should be noted, however,
that SQLite may not be suitable for production purposes.

There is a file called `dev.db` located in the `server/prisma` directory. This
file is our SQLite database.

> **Note**: You are free to use Postgres or MySQL for this tutorial if you
> prefer. All aspects of the tutorial will still work with those databases.

Next, let's run database migratons and generate Prisma Client.

<Instruction>

We need to change directories into `server` and run some commands to generate
Prisma Client.

Before doing so, make sure to install the dependencies.

```bash
cd server
yarn
```

```sh(path=".../react-apollo/server")
npx prisma generate
```

#### Exploring the server

With Prisma Client generated, we can now explore our server.

<Instruction>

Navigate into the `server` directory and run the following commands to start the
server:

```bash(path=".../hackernews-react-apollo/server")
yarn dev
```

</Instruction>

The `yarn dev` executes the `dev` script defined in `package.json`. The script
first starts the server using [nodemon](https://www.npmjs.com/package/nodemon)
(which is then running on `http://localhost:4000`) and then opens up a
[GraphQL Playground](https://github.com/graphcool/graphql-playground) for us to
explore and work with the API.

![Run yarn dev and view the GraphQL Playground](https://imgur.com/xLyx3Sr.png)

> A Playground is a "GraphQL IDE", providing an interactive environment that
> allows to send queries, mutations and subscriptions to your GraphQL API. It is
> similar to a tool like [Postman](https://www.getpostman.com) which you might
> know from working with REST APIs, but comes with a lot of additional benefits.

The first thing to note about the Playground is that it has built-in
documentation for its GraphQL API. This documentation is generated based on the
GraphQL schema and can be opened by clicking the green **SCHEMA** button on the
right edge of the Playground. Consequently, it shows you the same information
you saw in the application schema above:

![GraphQL Playground](https://imgur.com/zhlNpOE.png)

The left pane of the Playground is the _editor_ that you can use to write your
queries, mutations and subscriptions. Once you click the play button in the
middle, your request is sent and the server's response will be displayed in the
_results_ pane on the right.

<Instruction>

Copy the following two mutations into the _editor_ pane.

```graphql
mutation CreatePrismaLink {
  post(
    description: "Prisma gives you a powerful database toolkit 😎"
    url: "https://prisma.io"
  ) {
    id
  }
}

mutation CreateApolloLink {
  post(
    description: "The best GraphQL client for React"
    url: "https://www.apollographql.com/docs/react/"
  ) {
    id
  }
}
```

</Instruction>

Since you're adding two mutations to the editor at once, the mutations need to
have _operation names_. In your case, these are `CreatePrismaLink` and
`CreateApolloLink`.

<Instruction>

Click the **Play** button in the middle of the two panes and select each
mutation from the dropdown exactly once.

</Instruction>

![Press the play button](https://imgur.com/d2y5jBL.png)

This creates two new `Link` records in the database. You can verify that the
mutations actually worked by sending the following query in the already open
Playground:

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

> **Note**: You can also send the `feed` query in the **default** Playground in
> the **app** section.

If everything went well, the query will return the following data (the `id`s
will of course be different in your case since they were generated by Prisma and
are globally unique):

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
          "description": "Prisma gives you a powerful database toolkit 😎",
          "url": "https://prisma.io"
        }
      ]
    }
  }
}
```

Fantastic, our server works! 👏
