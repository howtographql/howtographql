---
title: Getting Started
pageTitle: "Getting Started with GraphQL, Angular & Apollo Tutorial"
description: Start building a Hackernews clone. Create the frontend with angular-cli and the backend with Graphcool.
duration: 4
question: Which are the two types that you find in every Graphcool project file?
answers: ["File & System", "Query & Mutation", "User & Group", "File & User"]
correctAnswer: 3
draft: false
---

### Backend

Since this is a frontend track, you don't want to spend too much time setting up the backend. This is why you use [Graphcool](https://www.graph.cool/), a service that provides a production-ready GraphQL API out-of-the-box.

#### The Data Model

You'll use the [Graphcool CLI](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/) to build (and deploy) your GraphQL API based on the data model that you need for the app.

Speaking of the data model, here is what the final version looks like written in the [GraphQL Schema Definition Language](https://www.graph.cool/docs/faq/graphql-sdl-schema-definition-language-kr84dktnp0/) (SDL):

```graphql(nocopy)
type User @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  email: String! @isUnique # for authentication
  password: String!        # for authentication

  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  description: String!
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

As you can see from the comments, some fields on your model types are read-only. This means they will be managed for you by the Graphcool Framework.

In general, there are a few things to note about these type definitions:

- Every type annotated with the `@model`-directive will be _mapped_ to the database and corresponding CRUD-operations are added to the GraphQL API of your Graphcool service.
- The `@isUnique`-directive means that the annotated field can never have the same value for two different records of that type (also called _nodes_). Since this is a read-only field, the Graphcool Framework will take care of managing this constraint.
- `createdAt` and `updatedAt` are special fields that are managed by the Graphcool Framework as well. `createdAt` will carry the date for when a node of that type was created, `updatedAt` when it was last updated.

#### Creating the GraphQL Server

For starting out, you're not going to use the full data model that you saw above. That's because we want to evolve the schema when it becomes necessary for the features that we implement.

For now, you'll just use the `Link` type to create the backend.

The first thing you need to do to get your GraphQL server, install the Graphcool CLI with npm.

<Instruction>

Open up a terminal window and type the following:

```bash
npm install -g graphcool
```

</Instruction>

Now you can go and create the server. There are two steps involved in this:

1. Creating the local file structure that contains all required configuration for your backend. This is done with the [`graphcool init`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-init) command.
2. Configuring the data model and deploying the server with [`graphcool deploy`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-deploy).

<Instruction>

Type the following command into the terminal:

```bash
# Create the file structure for the backend in a directory called `server`
graphcool init server
```

</Instruction>

This will create a new directory called `server` and place the following files in there:

- `graphcool.yml`: This is the [root configuration](https://www.graph.cool/docs/reference/service-definition/graphcool.yml-foatho8aip) file for your Graphcool service. It tells the Graphcool Framework where to find your data model (and other type definitions), specifies the [_permission rules_](https://www.graph.cool/docs/reference/auth/authorization/overview-iegoo0heez) and provides information about any integrated _serverless [functions](https://www.graph.cool/docs/reference/functions/overview-aiw4aimie9)_.
- `types.graphql`: This specifies the data model for your application, all type definitions are written in GraphQL SDL.
- `package.json`: If you're integrating any serverless functions that are using dependencies from npm, you need to list those dependencies here. Note that this file is completely independent from the dependencies of your frontend which you'll create in a bit. Since this tutorial won't actually use any serverless functions, you can simply ignore it.
- `src`: The `src` directory is used to for the code of the serverless functions you're integrating in your Graphcool service. It currently contains the setup for a simple "Hello World"-[resolver](https://www.graph.cool/docs/reference/functions/resolvers-su6wu3yoo2) function (which you can delete if you like). Again, you can ignore this directory since we're not going to use any functions in this tutorial.

Next you need to make sure that the data model of the GraphQL server is correct, so you need to adjust the type definitions in `types.graphql`.

<Instruction>

Open `types.graphql` and replace its current contents with the (not yet complete) definition of the `Link` type:

```graphql(path=".../hackernews-angular-apollo/server/types.graphql")
type Link @model {
  id: ID! @isUnique     # required system field (read-only)
  createdAt: DateTime!  # optional system field (read-only)
  updatedAt: DateTime!  # optional system field (read-only)

  description: String!
  url: String!
}
```

</Instruction>

As mentioned above, we'll start with only a sub-part of the actual data model and evolve our schema and API when necessary. This change is all you need to put your GraphQL server into production.

<Instruction>

Open a terminal and navigate into the `server` directory. Then deploy the server with the following command:

```bash(path=".../hackernews-angular-apollo/server")
graphcool deploy
```

</Instruction>

<Instruction>

When prompted, select any of the **Shared Clusters** deployment options, e.g. `shared-eu-west`.

For any other prompt, you can just hit **Enter** to go with the suggested default value.

</Instruction>

> Note that this command will open up a browser window first and ask you to authenticate on the Graphcool platform (if you haven't done so before).


#### Populate The Database & GraphQL Playgrounds

Before you move on to setup the frontend, go ahead and create some initial data in the project so you've got something to see once you start rendering data in the app!

You'll do this by using a GraphQL [Playground](https://github.com/graphcool/graphql-playground) which is an interactive environment that allows you to send queries and mutations. It's a great way to explore the capabilities of a GraphQL API.

<Instruction>

Still in the `server` directory in your terminal, run the following command:

```bash(path=".../hackernews-react-apollo/server")
graphcool playground
```

</Instruction>

The left pane of the Playground is the _editor_ that you can use to write your queries and mutations (and even realtime subscriptions). Once you click the play button in the middle, the response to the request will be displayed in the _results_ pane on the right.

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

This creates two new `Link` records in the database. You can verify that the mutations worked by either viewing the currently stored data in the [data browser](https://www.graph.cool/docs/reference/console/data-browser-och3ookaeb/) (simply click _DATA_ in the left side-menu) or by sending the following query in the already open Playground:

```graphql
{
  allLinks {
    id
    description
    url
  }
}
```

If everything went well, the query would return the following data:

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

Next, you are going to create the Angular project! As mentioned in the beginning, you'll use `angular-cli` for that.

<Instruction>

If you haven't already, you need to install `angular-cli` using npm:

```bash
npm install -g @angular/cli
```

</Instruction>

<Instruction>

Next, you can use it to bootstrap your Angular application:

```bash
ng new hackernews-angular-apollo
```

</Instruction>

This will create a new directory called `hackernews-angular-apollo` that has all the basic configuration setup.

Make sure everything works by navigating to the directory and starting the app:

```bash
cd hackernews-angular-apollo
npm install # or yarn
npm start # or yarn start
```

This will open a browser and navigate to `http://localhost:4200` where the app is running. If everything went well, you'd see the following:

![](http://i.imgur.com/9IUB9Qh.png)


<Instruction>

Next, go ahead move `graphcool` folder created into the `hackernews-angular-apollo` directory to manage everything in one place.

</Instruction>


Your project structure should now look as follows:

```bash(nocopy)(path=".../hackernews-angular-apollo")
.
├── README.md
├── e2e
│   ├── app.e2e-spec.ts
│   ├── app.po.ts
│   └── tsconfig.e2e.tson
├── karma.conf.ts
├── node_modules
├── package.tson
├── server
│   ├── graphcool.yml
│   ├── package.json
│   ├── types.graphql
│   └── src
│       ├── hello.js
│       └── hello.graphql
├── protractor.conf.ts
├── src
│   ├── app
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   └── app.module.ts
│   ├── assets
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── favicon.ico
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.css
│   ├── test.ts
│   ├── tsconfig.app.tson
│   ├── tsconfig.spec.tson
│   └── typings.d.ts
├── tsconfig.tson
├── tslint.tson
└── yarn.lock
```

#### Prepare Styling

This tutorial is about the concepts of GraphQL and how you can use it from within an Angular application, so we want to spend the least time on styling issues. To ease up usage of CSS in this project, you'll use the [Tachyons](http://tachyons.io/) library which provides some CSS classes.

<Instruction>

Open `src/index.html` and add a second `link` tag right below the two existing ones that pulls in Tachyons:

```html(path=".../hackernews-angular-apollo/src/index.html")
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="https://unpkg.com/tachyons@4.2.1/css/tachyons.min.css"/>
```

</Instruction>

Since we still want to have a bit more custom styling here and there, we also prepared some styles for you that you need to include in the project.

<Instruction>

Open `styles.css` and replace its content with the following:

```css(path=".../hackernews-angular-apollo/src/styles.css")
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

ApolloClient 2.0 introduced two new features, Links, and Cache. Links are for fetching and manipulating data using custom logic. The Cache API allows us to store and handle data in any way we want.


To get back all the functionality of Apollo Client (and its Angular bindings), we need to pull several packages:

```bash(path=".../hackernews-angular-apollo")
npm install apollo-angular apollo-cache-inmemory  apollo-client apollo-angular-link-http graphql graphql-tag --save

# or
# yarn add apollo-angular apollo-cache-inmemory apollo-client apollo-angular-link-http graphql graphql-tag

```


</Instruction>

Here's an overview of the packages you just installed:

- [`apollo-client`](https://www.npmjs.com/package/apollo-client) is the Apollo Client library
- [`apollo-angular`](https://github.com/apollographql/apollo-angular) contains the bindings to use Apollo Client with Angular.
- [`graphql-tag`](https://github.com/apollographql/graphql-tag) is a GraphQL parser. Every GraphQL operation you hand over to Apollo Client will have to be parsed by the `gql` function.
- [`apollo-angular-link-http`](https://github.com/apollographql/apollo-angular/tree/master/packages/apollo-angular-link-http) provides a similar `HttpLink` to Apollo's `HttpLink` with one difference, it uses Angular's `HttpClient`.
- [`apollo-cache-inmemory`](https://www.npmjs.com/package/apollo-cache-inmemory) is a cache implementation that supports all of Apollo Client 1.0's features without the dependency on `Redux`.
- [`graphql`](https://github.com/graphql/graphql-js) contains Facebook's reference implementation of GraphQL - Apollo Client uses some of its functionality as well.


That's it; you're ready to write some code! 🚀

#### Configuring the `ApolloClient`

Apollo abstracts away all lower-lever networking logic and provides a friendly interface to the GraphQL API. In contrast to working with REST APIs, you don't have to deal with constructing your HTTP requests anymore - instead, you can just write queries and mutations and send them using the `ApolloClient`.

The first thing you have to do when using Apollo is to configure your `ApolloClient` instance. It needs to know the endpoint of your GraphQL API so it can deal with the network connections.

<Instruction>

Open `src/app/apollo.config.ts` and add the following contents :

```ts{3-7,11-14,18-19,21-24,25-30}(path=".../hackernews-angular-apollo/src/app/apollo.config.ts")
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
// 1
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';


@NgModule({
  exports: [
    // 2
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  // 3
  constructor(apollo: Apollo, httpLink: HttpLink) {

    // 4
    const uri = '__SIMPLE_API_ENDPOINT__';
    const http = httpLink.create({ uri });

    // 6
    apollo.create({
      link: http,
      cache: new InMemoryCache()
    });
  }
}


```

</Instruction>

Let's try to understand what's going on in that code snippet:

1. You're importing the required dependencies from the `apollo-angular`, `apollo-angular-link-http`, `apollo-cache-inmemory` packages
2. We export the `HttpClientModule`, `ApolloModule`, `HttpLinkModule` to make them "public" when `GraphQLModule` is imported in another module. In fact, if you don't export, it stays private, visible only to other component declared in this module. You can find more information in [NgModule FAQs](https://angular.io/guide/ngmodule-faq#what-should-i-export)
3. We inject the `Apollo` and `HttpLink` to be able to configure them
4. We create a `link` by providing the `URI` (i.e. your actual GraphQL endpoint) to the `.create` method of the `HttpLink` instance. You'll replace the placeholder `__SIMPLE_API_ENDPOINT__` with your actual endpoint in a bit
3. Now you instantiate the `ApolloClient` by passing in the `link` created and an `InMemoryCache` cache instance. The `HttpLink` is a replacement for `createNetworkInterface` from Apollo Client 1.0

Finally, we export the `GraphQLModule`.

<Instruction>

Open `src/app/app.module.ts` and import the GraphQLModule in AppModule:

```ts{14}(path=".../hackernews-angular-apollo/src/app/app.module.ts")
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {GraphQLModule} from './apollo.config';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    // connection
    GraphQLModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

```

</Instruction>

Next, you need to replace the placeholder for the GraphQL endpoint with your actual endpoint. But where do you get your endpoint from?

There are two ways for you to get your endpoint. You can either open the [Graphcool Console](https://console.graph.cool) and click the _Endoints_-button in the bottom-left corner. The second option is to use the CLI.

<Instruction>

In the terminal, navigate into the `server` directory and use the following command to get access to the API endpoints of your Graphcools service:

```bash(path=".../hackernews-angular-apollo/graphcool")
graphcool info
```

</Instruction>

<Instruction>

Copy the endpoint for the `Simple API` and paste it into `src/app/apollo.config.ts` to replace the current placeholder `__SIMPLE_API_ENDPOINT__`.

</Instruction>


That's it; you're all set to start for loading some data into your app! 😎
