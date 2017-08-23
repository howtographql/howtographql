---
title: Routing
pageTitle: "Vue-router with GraphQL & Apollo Tutorial"
description: "Learn how to use vue-router together with GraphQL and Apollo Client to implement navigation in a VueJS app."
question: Where do you handle optimistic UI updates when executing a GraphQL mutation in a VueJS component?
answers: ["Within an optimisticUpdate method", "Within the .then block of a mutation", "You can not optimistically update the UI in a VueJS component", "Within the update callback of a mutation"]
correctAnswer: 3
---

In this section, you'll learn how to use the [`vue-router`](https://github.com/vuejs/vue-router) library with Apollo to implement some navigation functionality!


### Create a Header

Before moving on to configure the different routes for your application, you need to create an `AppHeader` component that users can use to navigate between the different parts of your app.

<Instruction>

Create a new file in `src/components` and call it `AppHeader.js`. Then paste the following code inside of it:

```js(path=".../hackernews-vue-apollo/src/components/AppHeader.vue")
<template>
  <div class="flex pa1 justify-between nowrap orange">
    <div class="flex flex-fixed black">
      <div class="fw7 mr1">Hacker News</div>
      <router-link to="/" class="ml1 no-underline black">new</router-link>
      <div class="ml1">|</div>
      <router-link to="/create" class="ml1 no-underline black">submit</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AppHeader'
  }
</script>

<style scoped>
</style>
```

</Instruction>


This simply renders two `RouterLink` components that users can use to navigate between the `LinkList` and the `CreateLink` components.


### Setup routes

You'll configure the different routes for the app in `src/router/index.js`.

<Instruction>

Open the corresponding file `src/router/index.js` and update the code to match the following:

```js{4-6,11-23}(path=".../hackernews-vue-apollo/src/router/index.js")
import Vue from 'vue'
import Router from 'vue-router'

// 1
import CreateLink from '../components/CreateLink'
import LinkList from '../components/LinkList'

Vue.use(Router)

export default new Router({
  // 2
  routes: [
    {
      path: '/',
      component: LinkList
    },
    {
      path: '/create',
      component: CreateLink
    }
  ],
  // 3
  mode: 'history'
})
```

</Instruction>

Let's take a closer look to better understand what's going on:

1. Here you import the `CreateLink` and `LinkList` components which will be rendered for different routes
2. Here you map each route to the component that should be rendered
3. Here you set mode to 'history' to remove the hash from the URLs


You now need to make some small updates to `src/main.js`.

<Instruction>

Open up `src/main.js` and add the following import:

```js(path=".../hackernews-vue-apollo/src/main.js")
import router from './router'
```

</Instruction>

<Instruction>

Still in `src/main.js`, and `router` to the Vue instance:

```js{4}(path=".../hackernews-vue-apollo/src/main.js")
new Vue({
  el: '#app',
  apolloProvider,
  router,
  template: '<App/>',
  components: { App }
})
```

</Instruction>


You need to update one more file, `src/App.vue`.

<Instruction>

In `src/App.vue` update your template to the following (`router-view` is where the component for the current route will be rendered):

```html{6}(path=".../hackernews-vue-apollo/src/App.vue")
<template>
  <div id="app">
    <div class="center w85">
      <app-header></app-header>
      <div class='ph3 pv1 background-gray'>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
```

</Instruction>

<Instruction>

Still in `src/App.vue` remove the `CreateLink` and `LinkList` imports from the `script` block. Your `script` block should now look like this:

```js(path=".../hackernews-vue-apollo/src/App.vue")
import AppHeader from './components/AppHeader'

export default {
  name: 'app',
  components: {
    AppHeader
  }
}
```

</Instruction>

That's it. You can now access two URLs: `http://localhost:8080/` will render `LinkList` and `http://localhost:3000/create` will render the `CreateLink` component you just wrote in the previous section.

![](http://imgur.com/bcHzt5W.gif)


### Implement navigation

To wrap up this section, you need to implement an automatic redirect from `CreateLink` to `LinkList` after a mutation is performed. You also need to incorporate the result of your mutation into an "optimistic UI update".

<Instruction>

First, open `src/components/CreateLink.vue` and add `ALL_LINKS_QUERY` to your imports like so:

```js(path=".../hackernews-vue-apollo/src/components/CreateLink.vue")
import { ALL_LINKS_QUERY, CREATE_LINK_MUTATION } from '../constants/graphql'
```

</Instruction>

<Instruction>

Still in `src/components/CreateLink.vue` update the `createLink` method to look like the following:

```js{9-21}(path=".../hackernews-vue-apollo/src/components/CreateLink.vue")
createLink () {
  const { description, url } = this
  this.$apollo.mutate({
    mutation: CREATE_LINK_MUTATION,
    variables: {
      description,
      url
    },
    // 1
    update: (store, { data: { createLink } }) => {
      const data = store.readQuery({ query: ALL_LINKS_QUERY })
      data.allLinks.push(createLink)
      store.writeQuery({ query: ALL_LINKS_QUERY, data })
    }
  // 2
  }).then((data) => {
    this.$router.push({path: '/'})
  // 3
  }).catch((error) => {
    console.error(error)
  })
}
```

</Instruction>

Let's unpack what's going on here:

1. You add an `update` method which queries the current cache (`store`) and updates it with the result of your mutation. This is known as an "optimistic UI update" and will be replaced by the actual data once the mutation completes.
2. Here you define a success handler which routes to `/` upon a successful mutation
3. Here you define an error handler which logs the error when a mutation fails

After the mutation is performed, `vue-router` will now navigate back to the `LinkList` component that's accessible on the root route: `/`.
