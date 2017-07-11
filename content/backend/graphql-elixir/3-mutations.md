---
title: Mutations
---


### Mutation for creating links

Setting up mutations is as easy as queries, following the same process. We'll create a root mutation object in our `lib/community/web/schema.ex` file and add a `:create_link` field to it with a couple of arguments.

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

As before we'll need to actually write the `create_link` function inside the news resolver.

```elixir(path=".../graphql-elixir/lib/community/web/resolvers/news_resolver.ex")
def create_link(_root, args, _info) do
  # we'll add detailed error message handling later
  case News.create_link(args) do
    {:ok, link} ->
      {:ok, link}
    _error ->
      {:error, "could not create link"}
  end
end
```

Note that in this case you need to access the arguments that were passed with the mutation. The second resolver parameter is exactly what you need for this, not only for mutations but for any other time you want to access this data (such as for queries with arguments, which you'll also build later).

The generator we built earlier created a function for us that will insert a news article in the DB, so we can hand off all of the database logic to it. This resolver is a good example of why we have the separate `Community.News` module. It serves as the generic place to handle the internal business logic of building a link, whereas the resolver itself is tasked with dealing with anything that is specific to the GraphQL API itself.

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

[Image: file:///-/blob/IERAAA2R4xK/6b0SQMfg1Wf5gNP6W0IyBQ]

If you run your `allLinks` query again you'll now see we have a new link.

### More content coming soon!
