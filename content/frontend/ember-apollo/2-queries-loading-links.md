---
title: "Queries: Loading Links"
pageTitle: "Fetching Data using GraphQL Queries with Ember & Apollo Tutorial"
description: "Learn how you can use GraphQL queries with Apollo Client to load data from a server and display it in your React components."
question: ember-apollo-client exposes a service to your Ember application named what?
answers: ["apollo-store", "apollo", "ember-apollo", "store"]
correctAnswer: 1
videoId: ""
duration: 0		
videoAuthor: ""
---

### Preparing the components

The first piece of functionality that you’ll implement in the app is loading and displaying a list of links. You'll build each part of the hierarchy, but for now  start with the component that’ll render a single link. 

<Instruction>

In your terminal, create a new component named `link-post`. You are naming this component `link-post`, as opposed to `link`, because Ember requires all components to have a hyphen in it’s name.

```bash(path=".../hackernews-ember-apollo")
ember generate component link-post
```

</Instruction>

Running that generator creates a component file and a handlebars template along with a test for the component. 

<Instruction>

Replace the code in the `link-post` template with the following:

```html(path=".../hackernews-ember-apollo/app/templates/components/link-post.hbs")
<div>
  <div>{{link.description}} ({{link.url}})</div>
</div>
```

</Instruction>

This is a simple component that takes a `link` and renders the link’s `description` and `url`. Easy peasy!

Next, you’ll implement the route that renders a list of links.

<Instruction>

Again, you will use an ember-cli generate command to create a links route.

```bash(path=".../hackernews-ember-apollo")
ember generate route links
```

</Instruction>

This creates a few files including a route file, template for the route, and it adds a `/links` route to the router map.

<Instruction>

Replace the contents of the route template with the following:

```html(path=".../hackernews-ember-apollo/app/templates/links.hbs")
<div>
  {{#each this.model as |link index|}}
    {{link-post index=index link=link}}
  {{/each}}
</div>
```

</Instruction>

<Instruction>

In the link route’s `model` hook, add the following code: 

```js(path=".../hackernews-ember-apollo/app/routes/links.js")
model() {
  return [
    {
      id: '1',
      description: 'Prisma replaces traditional ORMs and makes it easy to build GraphQL servers 😎',
      url: 'https://www.prisma.io',
    },
    {
      id: '2',
      description: 'The best GraphQL client',
      url: 'https://www.apollographql.com/docs/react/',
    },
  ];
}
```

</Instruction>

Here, you’re using mock data for now to make sure the setup works. You’ll soon replace this with some actual data loaded from the server.

<Instruction>

To complete the setup, open `router.js` and change the links route to add a custom pathname.

```js(path=".../hackernews-ember-apollo/app/router.js")
Router.map(function() {
  this.route('links', { path: '/' });
});
```

</Instruction>

Run the app to check if everything works so far! The app should now display the two links from the array:

![](https://i.imgur.com/hqXOE4Y.png)

### Writing the GraphQL Query

Next you'll load the actual links that are stored in the database. The first thing you need to do for that is define the GraphQL query you want to send to the API.

Here is what it looks like:

```graphql
{
  feed {
    links {
      id
      createdAt
      description
      url
    }
  }
}
```

You could now simply execute this query in a [Playground](https://github.com/prisma/graphql-playground/) and retrieve the results from your GraphQL server. But how can you use it inside your JavaScript code?

### Queries with `ember-apollo-client`

When using Apollo in Ember, you can use the [`query`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.query) method on the `ApolloClient`. This will fetch the data and will allow you to process the response as a *promise*. This method is exposed by the `ember-apollo-client` add-on through the `apollo` service.

A example would look as follows:

```js(nocopy)
this.get(‘apollo’).query({
  query: gql`
    {
      feed {
        links {
          id
        }
      }
    }
  `
}, 'feed.links').then(response => console.log(response))
```

In general, the process for you to add some data fetching logic will be very similar every time:

1. Write the query into a `.graphql` file.
2. Import the query and use the `apollo` service to query your GraphQL endpoint.
3. Access the query results via the promise that is returned.

You can store your queries and mutations in separate files within your `app` folder, so add your first query!

<Instruction>

Create a nested set of folders in the `app` folder like so: 

```bash(nocopy)
.
├── app
│ ├── gql
│ │ ├── queries
│ │ ├── mutations
```

</Instruction>

<Instruction>

In the `queries` folder, create a new file named `allLinks.graphql` and add the following contents:

```graphql(path=".../hackernews-ember-apollo/app/gql/queries/feed.graphql")
query FeedQuery{
  feed {
    links {
      id
      createdAt
      url
      description
    }
  }
}
```

</Instruction>

What’s going on here?

You defined the plain GraphQL query. The name `FeedQuery` is the *operation name* and will be used by Apollo to refer to this query in its internals.

You can now finally remove the mock data and render actual links that are fetched from the server.

<Instruction>

In the `links.js` route file, update the code as follows:

```js(path=".../hackernews-ember-apollo/app/routes/links.js")
import Route from "@ember/routing/route";
import { RouteQueryManager } from "ember-apollo-client";
import query from ‘hackernews-ember-apollo/gql/queries/feed';

// 1.
export default Route.extend(RouteQueryManager, {
  model() {
    // 2.
    return this.get('apollo').query({ query }, 'feed.links').catch(error => alert(error));
  }
});
```

</Instruction>

Let’s walk through what’s happening in this code.

1. After importing your query and the `RouteQueryManager` mixin, you are extending the route and using the `RouteQueryManager` mixin. More about this mixin in the “More Mutations and Updating the Store” section.
2. You are using the `apollo` service to query your GraphQL endpoint. The final string, `feed`, is specifying where in the returned data your expected data will be located.

That's it! You should see the exact same screen as before.

> **Note**: If the browser on `http://localhost:4000` only says error and is empty otherwise, you probably forgot to have your server running. Note that for the app to work the server needs to run as well - so you have two running processes in your terminal: One for the server and one for the Ember app. To start the server, navigate into the `api-server` directory and run `yarn start`.
