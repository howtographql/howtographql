---
title: "Filtering: Searching the List of Links"
pageTitle: "Filtering with GraphQL, VueJS & Apollo Tutorial"
description: "Learn how to use filters with GraphQL and Apollo Client. Graphcool provides a powerful filter and ordering API that you'll explore in this example."
question: "What object is used within a GraphQL query to add 'search' functionality through filtering?"
answers: ["limit", "search", "filter", "You can not filter within a GraphQL query"]
correctAnswer: 2
---

In this section, you'll implement a search feature and learn about the filtering capabilities of your GraphQL API.

> Note: If you're interested in all the filtering capabilities of Graphcool, you can check out the [documentation](https://www.graph.cool/docs/reference/simple-api/filtering-by-field-xookaexai0/) on it.


### Preparing the VueJS Components

The search will be available under a new route and implemented in a new VueJS component.

<Instruction>

Start by creating a new file called `src/components/Search.vue` and add the following code:

```js{5-6,18-19,30-43}(path=".../hackernews-vue-apollo/src/components/Search.vue")
<template>
  <div>
    <div>
      Search
      <!-- 1 -->
      <input type="text" v-model="searchText">
    </div>
    <link-item
      v-for="(link, index) in allLinks"
      :key="link.id"
      :link="link"
      :index="index">
    </link-item>
  </div>
</template>

<script>
  // 2
  import { ALL_LINKS_SEARCH_QUERY } from '../constants/graphql'
  import LinkItem from './LinkItem'

  export default {
    name: 'Search',
    data () {
      return {
        allLinks: [],
        searchText: ''
      }
    },
    // 3
    apollo: {
      allLinks: {
        query: ALL_LINKS_SEARCH_QUERY,
        variables () {
          return {
            searchText: this.searchText
          }
        },
        skip () {
          return !this.searchText
        }
      }
    },
    components: {
      LinkItem
    }
  }
</script>
```

</Instruction>

Let's review what you are doing here.

1. First, you bind `searchText` to an input element
2. Next, you import the, soon to be created, `ALL_LINKS_SEARCH_QUERY`
3. Finally, you define a smart query. Note that `variables` is a function rather than an object. This means that each time `this.searchText` is updated, `variables` will trigger the smart query to re-run. You also define `skip` which ensures this query will not run if there is no `searchText` to search.

Notice that the `allLinks` field in the component's `data` will hold all the links to be rendered, so this time we're not accessing query results through the component props!

<Instruction>

Now add the `Search` component as a new route to the app. Open `src/router/index.js` and update it to look like the following:

```js{7-8,26-30}(path=".../hackernews-vue-apollo/src/router/index.js")
import Vue from 'vue'
import Router from 'vue-router'

import AppLogin from '../components/AppLogin'
import CreateLink from '../components/CreateLink'
import LinkList from '../components/LinkList'
// 1
import Search from '../components/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: LinkList
    },
    {
      path: '/create',
      component: CreateLink
    },
    {
      path: '/login',
      component: AppLogin
    },
    // 2
    {
      path: '/search',
      component: Search
    }
  ],
  mode: 'history'
})
```

</Instruction>

1. You import the `Search` component
2. You render the `Search` component when the `/search` route is reached


For the user to be able to comfortably navigate to the search functionality, you should also add a new navigation item to the `AppHeader`.

<Instruction>

Open `src/components/AppHeader.vue` and put a new `RouterLink` between `new` and `submit`:

```js{6-7}(path=".../hackernews-vue-apollo/src/components/AppHeader.vue")
<template>
  <div class="flex pa1 justify-between nowrap orange">
    <div class="flex flex-fixed black">
      <div class="fw7 mr1">Hacker News</div>
      <router-link to="/" class="ml1 no-underline black">new</router-link>
      <div class="ml1">|</div>
      <router-link to="/search" class="ml1 no-underline black">search</router-link>
      <div class="flex" v-if="userId">
        <div class="ml1">|</div>
        <router-link to="/create" class="ml1 no-underline black">submit</router-link>
      </div>
    </div>
    <div class="flex flex-fixed">
      <div v-if="userId" class="ml1 pointer black" @click="logout()">logout</div>
      <router-link v-else to="/login" class="ml1 no-underline black">login</router-link>
    </div>
  </div>
</template>
```

</Instruction>

You can now navigate to the search functionality using the new button in the `AppHeader`:

![See the search functionality in the Header component](http://imgur.com/XxPdUvo.png)

Great, let's now define `ALL_LINKS_SEARCH_QUERY`.

### Filtering Links

<Instruction>

Open `src/constants/graphql.js` and add the following query definition to the file:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
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
`
```

</Instruction>


This query looks similar to the `allLinks` query that's used in `LinkList`. However, this time it takes in an argument called `searchText` and specifies a `filter` object that will be used to specify conditions on the links that you want to retrieve.

In this case, you're specifying two filters that account for the following two conditions: A link is only returned if either its `url` contains the provided `searchText` _or_ its `description` contains the provided `searchText`. Both conditions can be combined using the `OR` operator.


The implementation is almost trivial. You're executing the `ALL_LINKS_SEARCH_QUERY` each time `searchText` changes, and binding the results to `allLinks` on the component's `data` so that they can be rendered.

Go ahead and test the app by navigating to `http://localhost:8080/search`. Then type a search string into the text field and verify the links that are returned fit the filter conditions.
