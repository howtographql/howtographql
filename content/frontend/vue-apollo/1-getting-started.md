---
title: Getting Started
pageTitle: "Getting Started with GraphQL, VueJS & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with vue-cli and the backend with Graphcool.
question: What packages need to be installed to work with GraphQL in a VueJS app?
answers: ["graphql", "apollo", "apollo-client & vue-apollo", "vue-apollo"]
correctAnswer: 2
---

### Backend

Since this is a frontend track, you don't want to spend too much time setting up the backend. This is why you use [Graphcool](https://www.graph.cool/), a service that provides a production-ready GraphQL API out-of-the-box.

#### The Data Model

You'll use the [Graphcool CLI](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/) to generate the server based on the data model that you need for the app. Speaking of the data model, here is what the final version of it looks like written in the [GraphQL Schema Definition Language](https://www.graph.cool/docs/faq/graphql-sdl-schema-definition-language-kr84dktnp0/) (SDL):

```graphql(nocopy)
type Link @model {
  url: String!
  description: String!
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
  postedBy: User @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type User @model {
  createdAt: DateTime!
  email: String @isUnique
  id: ID! @isUnique
  password: String
  updatedAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Vote @model {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
}
```

#### Creating the GraphQL Server

For starting out, you're not going to use the full data model that you saw above. That's because we want to evolve the schema when it becomes necessary for the features that we implement.

For now, you'll just use the `Link` type to create the backend.

The first thing you need to do to get your GraphQL server up and running is to install the Graphcool CLI with [npm](https://www.npmjs.com/).

<Instruction>

Open up a terminal window and type the following to install the Graphcool CLI globally:

```bash
npm install -g graphcool
```

</Instruction>

> **NOTE**: This tutorial uses the [legacy](https://www.graph.cool/docs/reference/service-definition/legacy-console-projects-aemieb1aev) version of [Graphcool](https://www.graph.cool/) and will be updated soon to use the new [Graphcool Framework](https://blog.graph.cool/introducing-the-graphcool-framework-d9edab2a7816). The CLI commands mentioned in tutorial are outdated, you can read more about the new CLI [here](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/). If you still want to go through this tutorial, you can install the old version of the CLI using `npm install -g graphcool@0.4`.

Now you can proceed to create the server.

<Instruction>

Type the following command into the terminal:

```bash
graphcool init --schema https://graphqlbin.com/hn-starter.graphql --name Hackernews
```

</Instruction>

This will execute the `graphcool init` command with two arguments:

- `--schema`: This option accepts a `.graphql`-schema that's either stored _locally_ or at a _remote URL_. In your case, you're using the starter schema stored at [https://graphqlbin.com/hn-starter.graphql](https://graphqlbin.com/hn-starter.graphql), we'll take a look at it in a bit.
- `--name`: This is the name of the Graphcool project you're creating, here you're simply calling it `Hackernews`.

Note that this command will open up a browser window first and ask you to authenticate on the Graphcool platform.

The schema that's stored at [https://graphqlbin.com/hn-starter.graphql](https://graphqlbin.com/hn-starter.graphql) only defines the `Link` type for now:

```graphql(nocopy)
type Link {
  description: String!
  url: String!
}
```

Once the project has been created, you'll find the [Graphcool Project File](https://www.graph.cool/docs/reference/cli/project-files-ow2yei7mew/) (`project.graphcool`) in the directory where you executed the command. It should look similar to this:

```graphql(nocopy)
# project: cj4k7j28p7ujs014860czx89p
# version: 1

type File @model {
  contentType: String!
  createdAt: DateTime!
  id: ID! @isUnique
  name: String!
  secret: String! @isUnique
  size: Int!
  updatedAt: DateTime!
  url: String! @isUnique
}

type Link @model {
  createdAt: DateTime!
  description: String!
  id: ID! @isUnique
  updatedAt: DateTime!
  url: String!
}

type User @model {
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
}
```

The top of the file contains some metadata about the project, namely the _project ID_ and the _version number of the schema_.

The [`User`](https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#user-type) and [`File`](https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#file-type) types are generated by Graphcool and have some special characteristics. `User` can be used for _authentication_ and `File` for _file management_.

Also notice that each type has three fields called `id`, `createdAt` and `updatedAt`. These are managed by the system and read-only for you.

#### Populate The Database & GraphQL Playgrounds

Before you move on to setup the frontend, go ahead and create some initial data in the project so you've got something to see once you start rendering data in the app!

You'll do this by using a GraphQL [Playground](https://www.graph.cool/docs/reference/console/playground-oe1ier4iej/) which is an interactive environment that allows you to send queries and mutations. It's a great way to explore the capabilities of an API.

<Instruction>

Open up a terminal and navigate to the directory where `project.graphcool` is located. Then execute the following command:

```bash
graphcool playground
```

</Instruction>

This command will read the project ID from the project file and open up a GraphQL Playground in a browser.

The left pane of the Playground is the _editor_ that you can use to write your queries and mutations (and even subscriptions). Once you click the play button in the middle, the response to the request will be displayed in the _results_ pane on the right.

<Instruction>

Copy the following two mutations into the _editor_ pane:

```graphql
mutation CreateGraphcoolLink {
  createLink(
    description: "The coolest GraphQL backend 😎",
    url: "https://graph.cool") {
    id
  }
}

mutation CreateApolloLink {
  createLink(
    description: "The best GraphQL client",
    url: "http://dev.apollodata.com/") {
    id
  }
}
```

</Instruction>

Since you're adding two mutations to the editor at once, the mutations need to have _operation names_. In your case, these are `CreateGraphcoolLink` and `CreateApolloLink `.

<Instruction>

Click the _Play_-button in the middle of the two panes and select each mutation from the dropdown exactly once.

</Instruction>

![Press the Play button](http://imgur.com/ZBgeq22.png)

This creates two new `Link` records in the database.

You can verify that the mutations actually worked by either viewing the currently stored data in the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) (simply click _DATA_ in the left side-menu) or by sending the following query in the already open Playground:

```graphql
{
  allLinks {
    id
    description
    url
  }
}
```

If everything went well, the query will return the following data:

```graphql(nocopy)
{
  "data": {
    "allLinks": [
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


### Frontend

#### Creating the App

Next, you are going to create the VueJS project! As mentioned in the beginning, you'll use `vue-cli` for that.

<Instruction>

If you haven't already, you need to install `vue-cli` globally using npm:

```bash
npm install -g vue-cli
```

</Instruction>

<Instruction>

Next, you can use it to bootstrap your VueJS application:

```bash
vue init webpack hackernews-vue-apollo
```

</Instruction>

The Webpack template will be downloaded and you will be presented with several questions. You can choose the project name and description you desire or simply hit "enter" to select the defaults. You can choose the lighter "Runtime-only" Vue build. Make sure to install [vue-router](https://router.vuejs.org/en/) as you will be using it in this tutorial. I also recommend using "standard" ESLint rules and choosing "yes" for unit tests in case you want to add some in the future. Note that you will not be writing tests in this tutorial.

Here is what my project setup looks like as an example:

![Example project setup](http://imgur.com/9qO3Lis.png)

Based on your choices, `vue-cli` will now create a new directory called `hackernews-vue-apollo` that has all the basic configuration setup.

<Instruction>

Make sure everything works by navigating into the directory, installing dependencies, and starting the app:

```bash
cd hackernews-vue-apollo
npm install
npm run dev
```

</Instruction>

This will open a browser and navigate to `http://localhost:8080` where the app is running. If everything went well, you'll see the following:

![Browser open to localhost:8080](http://imgur.com/aVqZDG2.png)


<Instruction>

Next, go ahead move `project.graphcool` into the `hackernews-vue-apollo` directory to manage everything in one place.

</Instruction>


Your project structure should now look as follows:

```bash(nocopy)
.
├── build
├── config
├── node_modules
├── src
    ├── assets
        └── logo.png
    ├── components
        └── Hello.vue
    ├── router
        └── index.js
    ├── App.vue
    └── main.js
├── static
├── test
├── .babelrc
├── .editorconfig
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .postcssrc.js
├── index.html
├── package-lock.json
├── package.json
├── project.graphcool
└── README.md
```

#### Prepare Styling

This tutorial is about the concepts of GraphQL and how you can use it from within a VueJS application, so we want to spend a minimal amount of time on styling issues. To ease up usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes. Use npm to install Tachyons like so:

<Instruction>

Make sure you are inside your project directory and run the following:

```bash
npm install --save tachyons
```

</Instruction>

Now that you have installed Tachyons, you need to import it into your project.

<Instruction>

Open up `src/main.js` and import Tachyons like this:

```js{4}(path=".../hackernews-vue-apollo/src/main.js")
import Vue from 'vue'
import App from './App'
import router from './router'
import 'tachyons'
```

</Instruction>

Since we still want to have a bit more custom styling here and there, we also prepared some styles for you that you need to include in the project.

<Instruction>

Open `src/App.vue` and replace the contents of the `style` block with the following:

```css(path=".../hackernews-vue-apollo/src/App.vue")
<style>
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
</style>
```

</Instruction>



#### Installing Apollo

<Instruction>

Next, you need to pull in the functionality of Apollo Client by installing both `apollo-client` and `vue-apollo`:

```bash
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

</Instruction>

That's it, you're ready to write some code! 🚀

#### Configuring the `ApolloClient`

Apollo abstracts away all lower-level networking logic and provides a nice interface to the GraphQL API. In contrast to working with REST APIs, you don't have to deal with constructing your own HTTP requests anymore - instead you can simply write queries and mutations and send them using the `ApolloClient`.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the endpoint of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/main.js` and replace the contents with the following:

```js{1-2,5-6,13-16,18-22,24-25,27-30,35-36}(path=".../hackernews-vue-apollo/src/main.js")
// 1
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import 'tachyons'
import Vue from 'vue'
// 2
import VueApollo from 'vue-apollo'

import App from './App'
import router from './router'

Vue.config.productionTip = false

// 3
const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: '__SIMPLE_API_ENDPOINT__'
})

// 4
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

// 5
Vue.use(VueApollo)

// 6
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // 7
  provide: apolloProvider.provide(),
  router,
  render: h => h(App)
})
```

</Instruction>


Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the `apollo-client` package
2. You're importing the `vue-apollo` package
3. Here you create the `httpLink`, you'll replace the placeholder `__SIMPLE_API_ENDPOINT__` with your actual endpoint in a bit
4. Now you instantiate the `ApolloClient` by passing in the `httpLink`
5. Here you install the vue plugin
6. Next you create a new apollo client instance through `VueApollo` and set the `defaultClient` to the `apolloClient` we just created. You also set `$loadingKey` to 'loading' so that we can easily display a loading indicator in the UI.
7. Finally you specify the `provide` object on your root component

Next you need to replace the placeholder for the `httpLink` `uri` with your actual endpoint. But where do you get your endpoint from?

There are two ways for you to get your endpoint. You can either open the [Graphcool Console](https://console.graph.cool) and click the _Endoints_-button in the bottom-left corner. The second option is to use the CLI.

<Instruction>

In the terminal, navigate into the directory where `project.graphcool` is located and use the following command:

```bash
graphcool endpoints
```

</Instruction>

<Instruction>

Copy the endpoint for the `Simple API` and paste it into `src/main.js` to replace the current placeholder `__SIMPLE_API_ENDPOINT__`.

</Instruction>


That's it, you're all set to start loading some data into your app! 😎
