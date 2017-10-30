---
title: Getting Started
pageTitle: "Getting Started with GraphQL, React & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with create-react-app and the backend with Graphcool.
videoId: JV0nLsdeMfo
duration: 4
videoAuthor: "Abhi Aiyer"
question: Which are the two types that you find in every Graphcool project file?
answers: ["File & System", "Query & Mutation", "User & Group", "File & User"]
correctAnswer: 3
draft: false
---

### Backend

Since this is a frontend track, you don't want to spend too much time setting up the backend. This is why you use [Graphcool](https://www.graph.cool/), a service that provides a production-ready GraphQL API out-of-the-box.

#### The Data Model

You'll use the [Graphcool CLI](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/) to generate the server based on the data model that you need for the app. Speaking of the data model, here is what the final version of it looks like written in the [GraphQL Schema Definition Language](https://www.graph.cool/docs/faq/graphql-sdl-schema-definition-language-kr84dktnp0/) (SDL):

```graphql(nocopy)
type User @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link @model { 
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  url: String!
  postedBy: User! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Vote @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)

  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

#### Creating the GraphQL Server

For starting out, you're not going to use the full data model that you saw above. That's because we want to evolve the schema when it becomes necessary for the features that we implement.

For now, you'll just use the `Link` type to create the backend.

The first thing you need to do to get your GraphQL server is install the Graphcool CLI with npm.

<Instruction>

Open up a terminal window and type the following:

```bash
npm install -g graphcool
```

</Instruction>

> **NOTE**: This tutorial uses the [legacy](https://www.graph.cool/docs/reference/service-definition/legacy-console-projects-aemieb1aev) version of [Graphcool](https://www.graph.cool/) and will be updated soon to use the new [Graphcool Framework](https://blog.graph.cool/introducing-the-graphcool-framework-d9edab2a7816). The CLI commands mentioned in tutorial are outdated, you can read more about the new CLI [here](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/). If you still want to go through this tutorial, you can install the old version of the CLI using `npm install -g graphcool@0.4`.

Now you can go and create the server. 

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
type Link @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  description: String!
  url: String!
}
```

Once the project was created, you'll find the [Graphcool Project File](https://www.graph.cool/docs/reference/cli/project-files-ow2yei7mew/) (`project.graphcool`) in the directory where you executed the command. It should look similar to this:

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

![](http://imgur.com/ZBgeq22.png)

This creates two new `Link` records in the database. You can verify that the mutations actually worked by either viewing the currently stored data in the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) (simply click _DATA_ in the left side-menu) or by sending the following query in the already open Playground:

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

Next, go ahead move `project.graphcool` into the `hackernews-react-apollo` directory to manage everything in one place.

To improve the project structure, move on to create two directories, both inside the `src` folder. The first is called `components` and will hold all our React components. Call the second one `styles`, that one is for all the CSS files you'll use.

Now clean up the existing files accordingly. Move `App.js` into `components` and `App.css` as well as `index.css` into `styles`.

</Instruction>


Your project structure should now look as follows:

```bash(nocopy)
.
├── README.md
├── node_modules
├── project.graphcool
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

#### Prepare Styling

This tutorial is about the concepts of GraphQL and how you can use it from within a React application, so we want to spend the least time on styling issues. To ease up usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides a number of CSS classes.

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



#### Installing Apollo

<Instruction>

Next, you need to pull in the functionality of Apollo Client which is all bundled in the `react-apollo` package:

```bash(path=".../hackernews-react-apollo")
yarn add react-apollo
```

</Instruction>

That's it, you're ready to write some code! 🚀

#### Configuring the `ApolloClient`

Apollo abstracts away all lower-lever networking logic and provides a nice interface to the GraphQL API. In contrast to working with REST APIs, you don't have to deal with constructing your own HTTP requests any more - instead you can simply write queries and mutations and send them using the `ApolloClient`.

The first thing you have to do when using Apollo is configure your `ApolloClient` instance. It needs to know the endpoint of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/index.js` and replace the contents with the following:

```js{6-7,9-12,14-17,19-25}(path="src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import './styles/index.css'
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

</Instruction>


> Note: The project that was generated by `create-react-app` uses semicolons and double quotes for strings. All the code that you're going to add will use **no semicolons** and **single quotes**.

Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the `react-apollo` package
2. Here you create the `networkInterface`, you'll replace the placeholder `__SIMPLE_API_ENDPOINT__` with your actual endpoint in a bit.
3. Now you instantiate the `ApolloClient` by passing in the `networkInterface`.
4. Finally you render the root component of your React app. The `App` is wrapped with the higher-order component `ApolloProvider` that gets passed the `client` as a prop.

Next you need to replace the placeholder for the GraphQL endpoint with your actual endpoint. But where do you get your endpoint from?

There are two ways for you to get your endpoint. You can either open the [Graphcool Console](https://console.graph.cool) and click the _Endoints_-button in the bottom-left corner. The second option is to use the CLI.

<Instruction>

In the terminal, navigate into the directory where `project.graphcool` is located and use the following command:

```bash(path=".../hackernews-react-apollo")
graphcool endpoints
```

</Instruction>

<Instruction>

Copy the endpoint for the `Simple API` and paste it into `src/index.js` to replace the current placeholder `__SIMPLE_API_ENDPOINT__`.

</Instruction>


That's it, you're all set to start for loading some data into your app! 😎
