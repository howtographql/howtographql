---
title: Pagination
---

Another important feature for Hackernews is pagination. Fetching all links that were ever posted to the app would soon become too much, besides not being that useful. What's usually done is show just a few at a time, letting the user navigate to pages with older links.


> In this tutorial, you'll implement a simple pagination approach that's called limit-offset pagination. This approach would not work with Relay on the frontend, since Relay requires cursor-based pagination using the concept of connections. You can read more about pagination in the GraphQL [docs](http://graphql.org/learn/pagination/).  

<Instruction>

To make this work you'll need to update the schema for `allLinks` once more:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type Query {
  allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
}
```

</Instruction>

If these new arguments are provided, GraphQL should now return at most the number of links specified by `first`, skipping the number of links specified by `skip`.

<Instruction>

This is pretty straightforward to implement with MongoDB, by using cursor methods.

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
Query: {
  allLinks: async (root, {filter, first, skip}, {mongo: {Links, Users}}) => {
    let query = filter ? {$or: buildFilters(filter)} : {};
    const cursor = Links.find(query)
    if (first) {
      cursor.limit(first);
    }
    if (skip) {
      cursor.skip(skip);
    }
    return cursor.toArray();
  },
},
```

</Instruction>

All done! Now restart the server again and test it out.

![](https://vtex.quip.com/-/blob/MYYAAAFJyue/6xVtG_y0JICkisZQSqpuXw)