---
title: "Filtering: Searching the List of Links"
pageTitle: "Filtering with GraphQL, Ember & Apollo Tutorial"
description: "Learn how to use filters with GraphQL and Apollo Client. Prisma provides a powerful filter and ordering API that you'll explore in this example."
question: "What ember-apollo-client method queries the server and creates a subscription on the store?"
answers: ["queryOnce", "querySubscribe", "query", "observableQuery"]
correctAnswer: 2
---

In this section, you’ll implement a search feature and learn about the filtering capabilities of your GraphQL API.

### Preparing the route

<Instruction>

The search will be available under a new route. Start by creating a new route called `search`:

```bash(path=".../hackernews-ember-apollo")
ember generate route search
```

</Instruction>

This will generate a new route, add it to your `router.js` and create a new template. You won't be needing the route file so delete `app/routes/search.js`.

<Instruction>

Open the search template (`app/templates/search.hbs`) and replace the contents with the following code:

```html(path=".../hackernews-ember-apollo/app/templates/search.hbs")
<div>
  <form {{action 'executeSearch' on='submit'}}>
    {{input type='text' value=filter}}
    {{input type='submit' value='search'}}
  </form>
  {{#each model as |link index|}}
    {{link-post index=index link=link}}
  {{/each}}
</div>
```

</Instruction>

Again, this is a pretty standard setup. You’re rendering an `input` field where the user can type a search string. 

Notice that you are also preparing to display the results using the `link-post` component.

For the user to be able to comfortably navigate to the search functionality, you should also add a new navigation item to the `site-header` component.

<Instruction>

Open the template for your `site-header` component and insert a new link between `new` and `submit`:

```html(path=".../hackernews-ember-apollo/app/templates/components/site-header.hbs")
<div class='flex pa1 justify-between nowrap orange'>
  <div class='flex flex-fixed black'>
    <div class='fw7 mr1'>Hacker News</div>
    {{#link-to 'links' class='ml1 no-underline black'}}new{{/link-to}}
    <div class='ml1'>|</div>
    {{#link-to 'search' class='ml1 no-underline black'}}search{{/link-to}}
    {{#if userLoggedIn}}
      <div class='flex'>
        <div class='ml1'>|</div>
        {{#link-to 'create' class='ml1 no-underline black'}}submit{{/link-to}}
      </div>
    {{/if}}
  </div>
  <div class='flex flex-fixed'>
    {{#if userLoggedIn}}
      <div class='ml1 pointer black' {{action 'logout'}}>
        logout
      </div>
    {{else}}
      {{#link-to 'login' class='ml1 no-underline black'}}login{{/link-to}}
    {{/if}}
  </div>
</div>
```

</Instruction>

You can now navigate to the search functionality using the new button in the `site-header` component.

### Filtering Links

<Instruction>

Create a new controller for this route by adding a new file in your `app/controllers` folder. Name the file `search.js` and add the following code:

```js(path=".../hackernews-ember-apollo/app/controllers/search.js")
import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import query from 'hackernews-ember-apollo/gql/queries/feedSearch';

export default Controller.extend({
  actions: {
    executeSearch() {
      const filter = this.get('filter');
      if (!filter) return console.error('No search text provided.');
      return this.get('apollo').query({ query, variables: { filter } }, 'feed.links').then(result => {
        this.set('model', result);
      }).catch(error => alert(error));
    }
  },

  apollo: service()
});
```

</Instruction>

<Instruction>

Also create a new file named `feedSearch.graphql` in your `app/gql/queries` directory, and add the following contents:

```graphql
query FeedSearchQuery($filter: String!) {
  feed(filter: $filter) {
    links {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
}
```

</Instruction>

This query looks similar to the `feed` query that's used in `LinkList`. However, this time it takes in an argument called `filter` that will be used to constrain the list of links you want to retrieve.

The actual filter is built and used in the `feed` resolver which is implemented in `server/src/resolvers/Query.js`:

```js(path=".../hackernews-react-apollo/server/src/resolvers/Query.js"&nocopy)
async function feed(parent, args, ctx, info) {
  const { filter, first, skip } = args // destructure input arguments
  const where = filter
    ? { OR: [{ url_contains: filter }, { description_contains: filter }] }
    : {}

  const queriedLinks = await ctx.db.query.links({ first, skip, where })

  return {
    linkIds: queriedLinks.map(link => link.id),
    count
  }
}
```

> **Note**: To understand what's going on in this resolver, check out the [Node tutorial](https://www.howtographql.com/graphql-js/0-introduction).

In this case, two `where` conditions are specified: A link is only returned if either its `url` contains the provided `filter` _or_ its `description` contains the provided `filter`. Both conditions are combined using Prisma's `OR` operator.

Perfect, the query is defined! But this time you actually want to load the data every time the user hits the *search*-button which is what the `executeSearch` method is handling. You are getting the `filter` the user provided, running a 
`query` method on your Apollo client, and setting the results to your model.

Go ahead and test the app by running `yarn start` in a terminal and navigating to `http://localhost:4200/search`. Then type a search string into the text field, click the *search*-button and verify the links that are returned fit the filter conditions.