---
title: Queries
---

### Defining the Schema

Let's get to work on our schema. The GraphQL API is how we're going to expose our data to the web, so we're going to place the code for the schema in the web context of our application. Let's get that started by placing the following code in `lib/community/web/schema.ex`

```elixir(path=".../graphql-elixir/lib/community/web/schema.ex")
defmodule Community.Web.Schema do
  use Absinthe.Schema

  alias Community.{Web, News}

  query do
    # this is the query entry point to our app
  end
end
```

This is a bare bones skeleton of a GraphQL schema with Absinthe. We're defining a module, using the Absinthe.Schema module to give us some macros for schema building, and then setting out an empty root query object. Let's see it all at work by building out the ability to get all links.

### Query for returning links

The first simple thing to handle is getting all the available links. We'll add `:link` object to the schema, and an `:all_links` field to the root query object. No need to add arguments right now, we'll do that once we start handling filtering and pagination.

```elixir(path=".../graphql-elixir/lib/community/web/schema.ex")
defmodule Community.Web.Schema do
  use Absinthe.Schema

  alias Community.{Web, News}

  object :link do
    field :id, non_null(:id)
    field :url, non_null(:string)
    field :description, non_null(:string)
  end

  query do
    field :all_links, non_null(list_of(non_null(:link)))
  end
end
```

If you're coming from a different implementation you may be surprised to see the snake case field `:all_links`. Don't worry, GraphQL documents with `allLinks` will still work! One of Absinthe's goals is to help developers write code that is both idiomatic for GraphQL as well as idiomatic for Elixir. To help with that, Absinthe has some built in (and configurable) adapter utilities that transform camel case input to snake case schema identifiers.

Absinthe Schemas are also type checked at compile time. If you refer to a type that doesn't exist, Absinthe will catch it for you as soon as possible!

### Query Resolver

The query is now defined, but the server still doesn't know how to handle it. To do that you will now write your first **resolver**. Resolvers are just functions mapped to GraphQL fields, with their actual behavior. You specify the field for a resolver by using the resolve macro and passing it a function:

```elixir(path=".../graphql-elixir/lib/community/web/schema.ex")
field :all_links, non_null(list_of(non_null(:link))) do
  resolve &Web.NewsResolver.all_links/3
end
```


If you aren't super familiar with Elixir `&Web.NewsResolver.all_links/3`  is just a reference to the 3 arity function `all_links` found in the `Community.Web.NewsResolver` module. Neither this function nor this module exist yet though so let's get that fixed by putting this code in `lib/community/web/resolvers/news_resolver.ex`.

```elixir(path=".../graphql-elixir/lib/community/web/resolvers/news_resolver.ex")
defmodule Community.Web.NewsResolver do
  alias Community.News

  def all_links(_root, _args, _info) do
    links = News.list_links()
    {:ok, links}
  end
end
```

That's it! We have a working schema. All we need to do now is setup our HTTP server with GraphiQL.

### Testing with playground

It's time to test what you've done so far! For this you'll use [GraphiQL](https://github.com/graphql/graphiql), which we'll need to route to from within the router generated for us by Phoenix. Replace the contents of `lib/community/web/router.ex` with:

```elixir(path=".../graphql-elixir/lib/community/web/router.ex")
defmodule Community.Web.Router do
  use Community.Web, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/" do
    pipe_through :api

    forward "/graphiql", Absinthe.Plug.GraphiQL,
      schema: Community.Web.Schema,
      interface: :simple,
      context: %{pubsub: Community.Web.Endpoint}
  end

end
```

That's it! Let's start our server with `iex -S mix phx.server` and open your browser at [localhost:4000/graphiql](http://localhost:3000/graphiql).

![](http://i.imgur.com/EZIVYxP.png)

Click on the **Docs** link at the upper right to see a generated documentation of your schema. You'll see the `Query` type there, and clicking it will show you the new `allLinks` field, exactly as you've defined it. The documentation in GraphiQL is generated automatically based on your schema. This works thanks to a mechanism called [Introspection](http://graphql.org/learn/introspection/).

![](http://i.imgur.com/yEut1gg.png)

Try it out! On the left-most text box, type a simple query for listing all links and hit the **Play** button. This is what you'll see:
```graphql
{
  allLinks {
    id
    url
    description
  }
}
```

![](http://i.imgur.com/W7gpVvV.png)

You can play around as much as you want with this tool. It makes testing GraphQL APIs so fun and easy, you'll never want to live without it any more.
