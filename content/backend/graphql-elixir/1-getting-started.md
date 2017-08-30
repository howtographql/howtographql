---
title: Getting Started
pageTitle: "Getting Started with GraphQL & Elixir Tutorial"
description: "Learn how to setup a GraphQL server with Elixir & Absinthe as well as best practices for defining the GraphQL schema."
---

### Install Dependencies

It's time to start creating your project. The First you'll need to have Elixir and Erlang installed on your machine. See https://elixir-lang.org/install.html

Unlike some frameworks, Phoenix works within the ordinary structure of a regular Elixir application. It does however bring its own generator to add in some basic Phoenix code to get you going.

<Instruction>

Install this generator:

```bash
mix local.hex --force && \
mix local.rebar --force && \
mix archive.install https://github.com/phoenixframework/archives/raw/master/phx_new.ez
```

</Instruction>

This tutorial also uses Postgres as the database for this app. See here for installing postgres on your OS: https://wiki.postgresql.org/wiki/Detailed_installation_guides

For OS X users it should be as simple as `brew install postgres`.

### Setting up your App

You're going to build an app called Community, and you can think of it as a miniature version of Hacker News, Slashdot, or any other site that displays content on the basis of user submissions and votes.

<Instruction>

Use the `phx.new` generator (confirm with `y` when prompted):

```bash
mix phx.new community --no-brunch --no-html
```

</Instruction>

Say `y` to the question about fetching and installing dependencies, and then cd into the application directory.

In order to support GraphQL your application needs some additional dependencies which are configured in the `mix.exs` file. They go inside the list found within the `defp deps do` function:

```elixir(path=".../graphql-elixir/mix.exs")
{:absinthe_ecto, "~> 0.1.0"},
{:absinthe_plug, "~> 1.3.0"},
```

<Instruction>

Then run

```bash
mix deps.get
```

</Instruction>

<Instruction>

You're also going to generate some of the database tables and seed data now so that you're all set for the rest of the tutorial.

```bash
mix phx.gen.context News Link links url:string description:text
```

</Instruction>

Add the following lines to `priv/repo/seeds.exs` so that you have some basic seed data:

```elixir(path=".../graphql-elixir/priv/repo/seeds.exs")
alias Community.News.Link
alias Community.Repo

%Link{url: "http://graphql.org/", description: "The Best Query Language"} |> Repo.insert!
%Link{url: "http://dev.apollodata.com/", description: "Awesome GraphQL Client"} |> Repo.insert!
```

<Instruction>

Now just run

```bash
mix ecto.setup
```

</Instruction>

At this point the database tables created, and the migrations and the have been run. If at any point you want to clear everything out you can just run `mix ecto.reset`. If you get postgres connection issues be sure to double check your database credentials inside `config/dev.exs`.
