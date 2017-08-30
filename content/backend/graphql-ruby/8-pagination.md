---
title: Pagination
pageTitle: "Server-side Pagination with GraphQL & Ruby Tutorial"
description: "Learn best practices for implementing limit-offset pagination in a GraphQL API using query arguments with Ruby GraphQL server."
---

Another important feature for Hackernews is pagination.

Fetching all links that were ever posted to the app would soon become too much, besides not being that useful. Instead, we show just a few links at a time, letting the user navigate to pages with older links.

> In this tutorial, you'll implement a simple pagination approach that's called limit-offset pagination. This method would not work with Relay on the frontend since Relay requires cursor-based pagination using the concept of connections. You can read more about pagination in the GraphQL [docs](http://graphql.org/learn/pagination/).


To make this work you want to have a schema like that:

```graphql
type Query {
  allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
}
```

<Instruction>

So, lets add `skip` and `first` to `LinksSearch`:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/links_search.rb")
require 'search_object/plugin/graphql'

class Resolvers::LinksSearch
  # ...code

  option :filter, type: LinkFilter, with: :apply_filter
  option :first, type: types.Int, with: :apply_first
  option :skip, type: types.Int, with: :apply_skip

  def apply_first(scope, value)
    scope.limit(value)
  end

  def apply_skip(scope, value)
    scope.offset(value)
  end

  # ...code
end
```

</Instruction>

All done!

![](http://i.imgur.com/oZZnuMG.png)

In https://github.com/howtographql/graphql-ruby you can find the final project + a couple of further improvements 😺.

