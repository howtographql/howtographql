---
title: Mutations
pageTitle: "Implementing Mutations with an Elixir GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with Absinthe & Elixir. You can test your implementation in a GraphiQL Playground."
---


### Mutation for creating links

Setting up mutations is as easy as queries, and you'll follow basically the same process. Create a root mutation object in your `lib/community/web/schema.ex` file and add a `:create_link` field to it with a couple of arguments.

```elixir(path=".../graphql-elixir/lib/community/web/schema.ex")
mutation do
  field :create_link, :link do
    arg :url, non_null(:string)
    arg :description, non_null(:string)

    resolve &Web.NewsResolver.create_link/3
  end
end
```

### Resolvers with arguments

As before you'll need to actually write the `create_link` function inside the news resolver.

```elixir(path=".../graphql-elixir/lib/community/web/resolvers/news_resolver.ex")
def create_link(_root, args, _info) do
  # TODO: add detailed error message handling later
  case News.create_link(args) do
    {:ok, link} ->
      {:ok, link}
    _error ->
      {:error, "could not create link"}
  end
end
```

Note that in this case you need to access the arguments that were passed with the mutation. The second resolver parameter is exactly what you need for this, not only for mutations but for any other time you want to access this data (such as for queries with arguments, which you'll also build later).

The generator you used earlier created a function for you `Community.News.create_link/1` that will insert a news article in the DB. In this resolver you can simply hand off all database or business specific concerns to that function, and let the resolver handle anything that might be GraphQL specific. Although this indirection may seem unnecessary now it becomes incredibly useful as your app grows and other parts of it also need to create links.

### Testing with Playground

To test, just restart the server again and use the new mutation with GraphiQL:

```graphql
mutation {
  createLink(
    url: "http://npmjs.com/package/graphql-tools",
    description: "Best Tools!",
  ) {
    id
    url
    description
  }
}
```

![](http://i.imgur.com/pHNRZlG.png)

If you run your `allLinks` query again you'll now see we have a new link.

### More content coming soon!
