---
title: Filtering
pageTitle: "Server-side Filtering with GraphQL, Javascript & NodeJS"
question: How can you implement filters in GraphQL servers?
answers: ["You need to define a special Filter root type", "You can simply use field arguments for that", "You need to use a special function from `graphql-tools`", "That's not possible yet"]
correctAnswer: 1
description: Learn how to use arguments to add filtering to your GraphQL queries.
---

Another important Hackernews feature is searching the links, so you're going to be adding support for that now. You already know that it's possible to pass input data to mutations, via arguments. Now you're going to use this same concept to apply optional filters to the existing `allLinks` query.

<Instruction>

So start by adding a new argument in the schema definition for this query:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type Query {
  allLinks(filter: LinkFilter): [Link!]!
}

input LinkFilter {
  OR: [LinkFilter!]
  description_contains: String
  url_contains: String
}
```

</Instruction>

Again, you can use any format you want for your filters. Here, you'll again follow the same schema that's used in the frontend tutorials. It will allow searching links by their `description` and `url`.

<Instruction>

Go back to the resolver for `allLinks` now and have it use MongoDB queries to support this filtering feature, like this:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
// ...

function buildFilters({OR = [], description_contains, url_contains}) {
  const filter = (description_contains || url_contains) ? {} : null;
  if (description_contains) {
    filter.description = {$regex: `.*${description_contains}.*`};
  }
  if (url_contains) {
    filter.url = {$regex: `.*${url_contains}.*`};
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
}

module.exports = {
  Query: {
    allLinks: async (root, {filter}, {mongo: {Links, Users}}) => {
      let query = filter ? {$or: buildFilters(filter)} : {};
      return await Links.find(query).toArray();
    },
  },

  //...
};
```

</Instruction>

<Instruction>

Restart the server and try your new filter out now.
![](https://i.imgur.com/lrsChh9.png)

</Instruction>