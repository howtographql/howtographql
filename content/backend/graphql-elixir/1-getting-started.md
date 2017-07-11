---
title: Getting Started
---

### Install Dependencies

It's time to start creating your project. The First you'll need to have Elixir and Erlang installed on your machine. See https://elixir-lang.org/install.html

Unlike some frameworks, Phoenix works within the ordinary structure of a regular Elixir application. It does however bring its own generator to add in some basic Phoenix code to get you going.

<Instruction>

We'll add this generator, and make our project:

```
mix local.hex --force && \
mix local.rebar --force && \
mix archive.install https://github.com/phoenixframework/archives/raw/master/phx_new.ez
```

</Instruction>

We're also going to use Postgres as our database for this app. See here for installing postgres on your OS: https://wiki.postgresql.org/wiki/Detailed_installation_guides

For OS X users it should be as simple as `brew install postgres`.

### Setting up your App

We're going to build an app called Community, and you can think of it as a miniature version of Hacker News, Slashdot, or any other site that displays content on the basis of user submissions and votes.

<Instruction>

We'll use the `phx.new` generator:

```
mix phx.new community --no-brunch --no-html
```

</Instruction>

Say `y` to the question about fetching and installing dependencies, and then cd into news app. We have the `--no-brunch --no-html `flags on there because since we're doing this as purely a backend we don't need a JS build system nor html rendering dependencies.

From there all we need to do to add GraphQL to our brand new Elixir app is add the absinthe dependencies in the mix.exs file. They go inside the list found within the `defp deps do` function:

```elixir(path=".../graphql-elixir/mix.exs")
{:absinthe_ecto, "~> 0.1.0"},
{:absinthe_plug, "~> 1.3.0"},
```

Then run `mix deps.get`.

We're also gonna generate some of the database tables and seed data now so that we're all set for the rest of the tutorial.

```
mix phx.gen.context News Link links url:string description:text
```

Add the following lines to `priv/repo/seeds.exs` that will act as seed data for us:

```elixir(path=".../graphql-elixir/priv/repo/seeds.exs")
alias Community.News.Link
alias Community.Repo

%Link{url: "http://graphql.org/", description: "The Best Query Language"} |> Repo.insert!
%Link{url: "http://dev.apollodata.com/", description: "Awesome GraphQL Client"} |> Repo.insert!
```

Now just run `mix ecto.setup` to have the database tables created and seed data run. If at any point you want to clear everything out you can just run `mix ecto.reset`. If you get postgres connection issues be sure to double check your database credentials inside `config/dev.exs`.
