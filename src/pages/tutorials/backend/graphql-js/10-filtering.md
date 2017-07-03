---
title: Filtering
---

Another important Hackernews feature is searching the links, so you're going to be adding support for that now. You already know that it's possible to pass input data to mutations, via arguments. Now you're going to use this same concept to apply optional filters to the existing `allLinks` query.

So start by adding a new argument in the schema definition for this query:

```
type Query {
  allLinks(filter: LinkFilter): [Link!]!
}

input LinkFilter {
  OR: [LinkFilter!]
  description_contains: String
  url_contains: String
}
```

Again, you can use any format you want for your filters. Here, you'll again follow the same schema that's used in the frontend tutorials. It will allow searching links by their `description` and `url`. Go back to the resolver for `allLinks` now and have it use MongoDB queries to support this filtering feature, like this:

```
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

Restart the server and try your new filter out now.
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/GT3ykWdKlSr29Ptw4PQtCg]