---
title: Pagination
pageTitle: "Pagination with GraphQL, VueJS & Apollo Tutorial"
description: "Learn how to implement limit-offset pagination with GraphQL and Apollo Client in a VueJS app. The Graphcool API exposes the required arguments for lists."
question: "What's the difference between the 'query' and 'readQuery' methods on the 'ApolloClient'?"
answers: ["'readQuery' always fetches data over the network while 'query' can retrieve data either from the cache or remotely", "'readQuery' can only be used to reading data while 'query' can also be used to write data", "'readQuery' was formerly called 'query' and the functionality of both is identical", "'readQuery' always reads data from the local cache while 'query' might retrieve data either from the cache or remotely"]
correctAnswer: 3
---

Next up we'll cover pagination. You'll implement a simple pagination approach so that users are able to view the links in smaller chunks rather than having an extremely long list of `Link` elements.


## Preparing the VueJS Components

Once more, you first need to prepare the VueJS components for this new functionality. In fact, we'll slightly adjust the current routing setup. Here's the idea: The `LinkList` component will be used for two different use cases (and routes). The first one is to display the 10 top voted links. Its second use case is to display new links in a list separated into multiple pages that the user can navigate through.

<Instruction>

Open `src/router/index.js` and adjust the routes like so:

```js{4,15,23}(path=".../hackernews-vue-apollo/src/router/index.js")
const routes = [
  {
    path: '/',
    redirect: '/new/1'
  },
  {
    path: '/create',
    component: CreateLink
  },
  {
    path: '/login',
    component: AppLogin
  },
  {
    path: '/new/:page',
    component: LinkList
  },
  {
    path: '/search',
    component: Search
  },
  {
    path: '/top',
    component: LinkList
  }
]
```

</Instruction>


You now added two new routes: `/top` and `/new/:page`. The second one reads the value for `page` from the url so that this information is available inside the component that's rendered, here that's `LinkList`.

The root route `/` now redirects to the first page of the route where new posts are displayed.

We need to add quite a bit of logic to the `LinkList` component to account for the two different responsibilities that it now has.

<Instruction>

Open `src/constants/graphql.js` and add three arguments to the `AllLinksQuery` by replacing the `ALL_LINKS_QUERY` definition with the following:

```js(path=".../hackernews-vue-apollo/src/constants/graphql.js")
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
      id
      createdAt
      url
      description
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
    _allLinksMeta {
      count
    }
  }
`
```

</Instruction>


The query now accepts arguments that we'll use to implement pagination and ordering. `skip` defines the _offset_ where the query will start. If you passed a value of e.g. `10` to this argument, it means that the first 10 items of the list will not be included in the response. `first` then defines the _limit_, or _how many_ elements, you want to load from that list. Say, you're passing the `10` for `skip` and `5` for `first`, you'll receive items 10 to 15 from the list.

<Instruction>

Next, open `src/components/LinkList.vue` and replace the `allLinks` object within `apollo` with the following:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
allLinks: {
  query: ALL_LINKS_QUERY,
  variables () {
    const page = parseInt(this.$route.params.page, 10)
    const isNewPage = this.$route.path.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      first,
      skip,
      orderBy
    }
  },
  update (data) {
    this.count = data._allLinksMeta.count
    return data.allLinks
  }
}
```

</Instruction>

You've set the `variables` to a function which runs before the query is executed. This allows you to retrieve the information about the current page from the router (`this.$route.params.page`) and use it to calculate the chunk of links that you retrieve with `first` and `skip`.

Also note that you're including the ordering attribute `createdAt_DESC` for the `new` page to make sure the newest links are displayed first. The ordering for the `/top` route will be calculated manually based on the number of votes for each link.

You also need to define the `LINKS_PER_PAGE` constant and then import it into the `LinkList` component.

<Instruction>

Open `src/constants/settings.js` and add the following definition:

```js(path=".../hackernews-vue-apollo/src/constants/settings.js")
export const LINKS_PER_PAGE = 5
```

</Instruction>


<Instruction>

Now add an import statement from `../constants/settings` in `src/components/LinkList.vue`:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
import { LINKS_PER_PAGE } from '../constants/settings'
```

</Instruction>

### Implementing Navigation

Next, you need functionality for the user to switch between the pages. First add two `button` elements to the bottom of the `LinkList` component that can be used to navigate back and forth.

<Instruction>

Open `src/components/LinkList.vue` and update the `template` to look like the following:

```html(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
<template>
  <div>
    <div>
      <link-item
        v-for="(link, index) in orderedLinks"
        :key="link.id"
        :link="link"
        :index="index"
        :pageNumber="pageNumber"
        :updateStoreAfterVote="updateCacheAfterVote">
      </link-item>
    </div>
    <div v-if="isNewPage">
      <button v-show="!isFirstPage" @click="previousPage()">Previous</button>
      <button v-show="morePages" @click="nextPage()">Next</button>
    </div>
  </div>
</template>
```

</Instruction>


Since the setup is slightly more complicated now, you are going to calculate the list of links to be rendered in a separate method.


<Instruction>

Still in `src/components/LinkList.vue`, add the following method:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
getLinksToRender (isNewPage) {
  if (isNewPage) {
    return this.$apollo.queries.allLinks
  }
  const rankedLinks = this.$apollo.queries.allLinks.slice()
  rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
  return rankedLinks
}
```

</Instruction>


For the `isNewPage`, you'll simply return all the links returned by the query. That's logical since here you don't have to make any manual modifications to the list that is to be rendered. If the user loaded the component from the `/top` route, you'll sort the list according to the number of votes and return the top 10 links.

Next, you'll implement the functionality for the _Previous_- and _Next_-buttons.

<Instruction>

In `src/components/LinkList.vue`, add the following two methods that will be called when the buttons are pressed:

```js(path=".../hackernews-vue-apollo/src/components/LinkList.vue")
nextPage () {
  const page = parseInt(this.$route.params.page, 10)
  if (page <= this.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    this.$router.push({path: `/new/${nextPage}`})
  }
},
previousPage () {
  const page = parseInt(this.$route.params.page, 10)
  if (page > 1) {
    const previousPage = page - 1
    this.$router.push({path: `/new/${previousPage}`})
  }
}
```

</Instruction>


The implementation of these is very simple. You're retrieving the current page from the url and implementing a sanity check to make sure that it makes sense to paginate back or forth. Then you simply calculate the next page and tell the router where to navigate next. The router will then reload the component with a new `page` in the url that will be used to calculate the right chunk of links to load. Hop on over to the running app and use the new buttons to paginate through your list of links!

You have now added a simple pagination system to the app, allowing users to load links in small chunks instead of loading them all up front.