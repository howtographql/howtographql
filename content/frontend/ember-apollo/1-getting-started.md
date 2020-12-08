---
title: Getting Started
pageTitle: "Getting Started with GraphQL, Ember & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with ember-cli, ember-apollo-client, and the backend with Prisma.
question: Why are there two GraphQL API layers in a backend architecture with Prisma?
answers: ["To increase robustness and stability of the GraphQL server (if one layer fails, the server is backed by the second one).", "To increase performance of the GraphQL server (requests are accelerated  by going through multiple layers).", "Prisma provides the database layer which offers CRUD operations. The second layer is the application layer for business logic and common workflows (like authentication).", "Having two GraphQL layers is a hard requirement by the GraphQL specification."]
correctAnswer: 2
draft: false
videoId: ""
duration: 0		
videoAuthor: ""
---

@TODO update starter branch and add api-server folder.
@TODO update curl script in this section to use api-server folder

Since this is a frontend track, you're not going to spend any time implementing the backend. Instead, you'll use the server from the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

Once you've created your Ember application, you'll pull in the required code for the backend.

> **Note**: The final project for this tutorial can be found on [GitHub](https://github.com/howtographql/ember-apollo). You can always use it as a reference whenever you get lost throughout the course of the following chapters.
> Also note that each code block is annotated with a filename. These annotations directly link to the corresponding file on GitHub so you can clearly see where to put the code and what the end result will look like.

### Frontend

#### Creating the app

First, you are going to create the Ember project! As menitoned in the beginning, you'll use `ember-cli` for that.

<Instruction>

If you haven’t already, you need to install `ember-cli` using npm:

```bash(path=".../hackernews-ember-apollo")
npm install -g ember-cli
```

</Instruction>

<Instruction>

Next, you can use the `ember-cli` to create your Ember application:

```bash(path=".../hackernews-ember-apollo")
ember new hackernews-ember-apollo --yarn
```

</Instruction>

This will create a new directory called `hackernews-ember-apollo` that has all the basic configuration setup.

<Instruction>

Make sure everything works by navigating into the directory and starting the app:

```bash(path=".../hackernews-ember-apollo")
cd hackernews-ember-apollo
yarn start
```

</Instruction>

> **Note**: This tutorial uses [Yarn](https://yarnpkg.com/) for dependency and project management. Find instructions for how you can install it [here](https://yarnpkg.com/en/docs/install). If you prefer using `npm`, you can just run the equivalent commands. 

Now open a browser and navigate to `http://localhost:4200` where the app is running. If everything went well, you’ll see the following:

![](http://i.imgur.com/ZZlb4ms.png)

Great job! 👏

<!-- <Instruction>

Next, go move `project.graphcool` into the `hackernews-ember-apollo` directory to manage everything in one place.

```bash(path=".../hackernews-ember-apollo")
mv ../project.graphcool .
```

</Instruction> -->

Your project structure should now look as follows:

```bash(nocopy)
.
├── app
├── config
├── dist
├── node_modules
├── public
├── tests
├── vendor
├── .editorconfig
├── .ember-cli
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .template-lintrc.js
├── .travis.yml
├── .watchmanconfig
├── ember-cli-build.js
├── package.json
├── README.md
├── testem.js
├── yarn.lock
```

### Prepare Styling

This tutorial is about the concepts of GraphQL and how you can use it from within an Ember application, so you want to spend the least time on styling issues and in-depth Ember concepts. To reduce the usage of CSS in this project, you’ll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

<Instruction>

In your terminal add the `ember-cli-tachyons-shim` add-on: 

```bash(path=".../hackernews-ember-apollo")
ember install ember-cli-tachyons-shim
```
</Instruction>

Since you still want to have a bit more custom styling here and there, we also prepared some styles for you that you need to include in the project.

<Instruction>

Open `app/styles/app.css` and add the following:

```css
body {
  font-family: Verdana, Geneva, sans-serif;
  margin: 0;
  padding: 0;
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
  background-color: buttonface;
  border-color: buttonface;
  border-style: outset;
  border-width: 2px;
  color: black;
  cursor: pointer;
  font-family: monospace;
  font-size: 10pt;
  max-width: 250px;
  padding: 2px 6px 3px;
  text-align: center;
}
```

</Instruction>

### Install Apollo Client

<Instruction>

Next, you need to pull in the functionality of Apollo which is exposed in the `ember-apollo-client` add-on:

```bash(path=".../hackernews-ember-apollo")
ember install ember-apollo-client
```

</Instruction>

Here's an overview of the packages you just installed:

* `apollo-client`: Where all the magic happens
* `apollo-cache`: 
* `apollo-cache-inmemory`: Our recommended cache
* `apollo-link`
* `apollo-link-context`
* `apollo-link-http`: An Apollo Link for remote data fetching
* `graphql`: contains Facebook's reference implementation of GraphQL - Apollo Clien tuses some of it's functionality as well.


That’s it, you’re ready to write some code! 🚀

### Configuring `Apollo`

Apollo abstracts away all lower-lever networking logic and provides a nice interface to the GraphQL API. In contrast to working with REST APIs, you don’t have to deal with constructing your own HTTP requests any more - instead you can simply write queries and mutations and send them using `ember-apollo-client`.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the _endpoint_ of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `config/environment.js` and add the following inside the `ENV` object:

```js(path=".../hackernews-ember-apollo/config/environment.js")
apollo: {
  apiURL: 'http://localhost:4000'
},
```

</Instruction>

### Removing the welcome message

To remove the welcome message you need to do two small things.

<Instruction>

Inside of `app/templates/application.hbs` remove the `{{welcome-page}}`component.

Also, in your terminal remove the `ember-welcome-page` add-on:

```bash(path=".../hackernews-ember-apollo")
yarn remove ember-welcome-page
```

</Instruction>

That’s it! Now you are all set to start building your app! 😎

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

In your terminal, navigate to the `hackernews-ember-apollo` directory and run the following command:

```bash(path=".../hackernews-ember-apollo")
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

```graphql(path=".../hackernews-ember-apollo/server/src/schema.graphql"&nocopy)
scalar DateTime

type Query {
  info: String!
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

```sh(path=".../hackernews-ember-apollo/server")
yarn install
yarn prisma deploy
```

</Instruction>

The `prisma deploy` command starts an interactive process.

<Instruction>

First select the **Demo server** from the options provided. When the browser opens, register with Prisma Cloud and go back to your terminal.

Then you need to select the **region** for your demo server. Once that’s done, you can just hit enter twice to use the suggested values for **service** and **stage**.

</Instruction>

The Demo server that you used as a deployment target for Prisma is hosted for free in Prisma Cloud and comes with a connected database (AWS Aurora).

> **Note**: You can also omit `yarn` in the above command if you have the `prisma` CLI installed globally on your machine (which you can do with `yarn global add prisma`). In that case, you can simply run `prisma deploy`.

#### Exploring the server

Now that Prisma is deployed, you can go and explore the server!

<Instruction>

Run the following command inside the new `server` directory (not in `ember-apollo`) to start the server:

```bash(path=".../hackernews-ember-apollo/server")
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
    description: "The best GraphQL client for Ember",
    url: "https://github.com/bgentry/ember-apollo-client"
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
          "description": "The best GraphQL client for Ember",
          "url": "https://github.com/bgentry/ember-apollo-client"
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