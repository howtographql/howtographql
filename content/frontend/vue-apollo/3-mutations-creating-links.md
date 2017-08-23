---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with VueJS & Apollo Tutorial"
description: "Learn how you can use GraphQL mutations with Apollo Client. Use Apollo's `mutate` method to define and send mutations."
videoId: N/A
duration: N/A
videoAuthor: "Matt Dionis"
question:
answers: []
correctAnswer:
---

In this section, you'll learn how you can send mutations with Apollo. It's actually not that different from sending queries and follows similar steps that were mentioned before with queries:

1. Write the query as a JS constant using the `gql` parser function
2. use `apollo` to call the mutation through the `mutate` method


### Preparing the VueJS components

Like before, let's start by writing the VueJS component where users will be able to add new links.

<Instruction>

Create a new file in the `src/components` directory and call it `CreateLink.vue`. Then paste the following code into it:

```vue(path=".../hackernews-vue-apollo/src/components/CreateLink.vue")
<template>
  <div>
    <div class="flex flex-column mt3">
      <input
        class="mb2"
        v-model="description"
        type="text"
        placeholder='A description for the link'>
      <input
        class="mb2"
        v-model="url"
        type="text"
        placeholder="The URL for the link">
    </div>
    <button @click="createLink()">Submit</button>
  </div>
</template>

<script>
  export default {
    name: 'CreateLink',
    data () {
      return {
        description: '',
        url: ''
      }
    },
    methods: {
      createLink () {
        // ... you'll implement this in a bit
      }
    }
  }
</script>

<style scoped>
</style>
```

</Instruction>


This is a standard setup for a VueJS component with two `input` fields where users can provide the `url` and `description` of the `Link` they want to create. The data that's typed into these fields is stored in the component's `data` and will be used in `createLink` when the mutation is sent.

### Writing the Mutation

But how can you now actually send the mutation? Let's follow the three steps from before.

First you need to define the mutation in your `graphql` constants file and parse your query with `gql`. You'll do that in a similar way as with the query before.

<Instruction>

In `src/constants/graphql.js`, add the following statement to the bottom of the file:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
// 1
export const CREATE_LINK_MUTATION = gql`
  # 2
  mutation CreateLinkMutation($description: String!, $url: String!) {
    createLink(
      description: $description,
      url: $url,
    ) {
      id
      createdAt
      url
      description
    }
  }
`
```

</Instruction>


Let's take a closer look again to understand what's going on:

1. You first create the JavaScript constant called `CREATE_LINK_MUTATION ` that stores the mutation.
2. Now you define the actual GraphQL mutation. It takes two arguments, `url` and `description`, that you'll have to provide when calling the mutation.

<Instruction>

Before moving on, you need to import the mutation from the `graphql` constants file. Add the following to the top of `src/components/CreateLink.vue`'s `script` block:

```js(path=".../hackernews-vue-apollo/src/components/CreateLink.vue")
import { CREATE_LINK_MUTATION } from '../constants/graphql'
```

</Instruction>

Let's see the mutation in action!


<Instruction>

Still in `src/components/CreateLink.vue`, implement the `createLink` mutation as follows:

```vue(path=".../hackernews-vue-apollo/src/components/CreateLink.vue")
createLink () {
  const { description, url } = this
  this.$apollo.mutate({
    mutation: CREATE_LINK_MUTATION,
    variables: {
      description,
      url
    }
  })
}
```

</Instruction>


As promised, all you need to do is call `this.$apollo.mutate` and pass the mutation and the variables that represent the user input.

<Instruction>

Go ahead and see if the mutation works. To be able to test the code, open `src/App.vue` and change the template to looks as follows:

```html(path=".../hackernews-vue-apollo/src/App.vue")
<template>
  <div id="app">
    <link-list></link-list>
    <create-link></create-link>
  </div>
</template>
```

</Instruction>

<Instruction>

Next, import the `CreateLink` component by adding the following statement to the top of `App.vue`'s `script` block:

```js(path=".../hackernews-vue-apollo/src/App.vue")
import CreateLink from './CreateLink'
```

</Instruction>

You should now see the following screen:

![](http://imgur.com/AJNlEfj.png)

Two input fields and a _submit_-button - not very pretty but functional.

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then click the _submit_-button. You won't get any visual feedback in the UI, but let's see if the query actually worked by checking the current list of links in a Playground.

Type `graphcool playground` into a Terminal and send the following query:

```graphql
{
  allLinks {
    description
    url
  }
}
```

You'll see the following server response:

```js
{
  "data": {
    "allLinks": [
      // ...,
      {
        "description": "The best learning resource for GraphQL",
        "url": "www.howtographql.com"
      }
    ]
  }
}
```

Awesome! The mutation works, great job! 💪
