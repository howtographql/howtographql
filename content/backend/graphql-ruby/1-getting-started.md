---
title: Getting Started
pageTitle: "Getting Started Building a GraphQL Server with Ruby Tutorial"
description: "Learn how to setup a GraphQL server with graphql-ruby and best practices for defining the GraphQL schema."
---

### Defining the Scope

In this tutorial, you will implement the backend for a [Hackernews](https://news.ycombinator.com/) clone that has the following features:

* show a list of links
* authentication system
* users can create new links
* users can vote for links

### Install Dependencies

It's time for you to create your project!

First, you'll need to have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) installed on your system. If that's not the case, make sure to install it [now](https://www.ruby-lang.org/en/documentation/installation/). This tutorial requires version 2.3.0 or higher.

<Instruction>

Then follow these steps to create the project for your application:

```bash
gem install bundler
gem install rails -v 5.2.2
rails new graphql-tutorial
cd graphql-tutorial
bundle exec rails db:create
bundle exec rails server
```

</Instruction>

If you see the following error:

```
LoadError: Error loading the 'sqlite3' Active Record adapter. Missing a gem it depends on? can't activate sqlite3 (~> 1.3.6), already activated sqlite3-1.4.0. Make sure all dependencies are added to Gemfile.`. Go to and replace the SQLite version:
```

Open `Gemfile` and change the following line:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'sqlite3'
```

```ruby(path=".../graphql-ruby/Gemfile")
gem 'sqlite3', '~> 1.3', '< 1.4'
```

And run:

```bash
bundle update --source=sqlite
bundle exec rails db:create
```


This will install and start a new [Ruby On Rails](http://rubyonrails.org/) project. When you visit [http://localhost:3000](http://localhost:3000/) in a browser, you should see:

![](http://i.imgur.com/RLFWuiq.jpg)

### Setup Server

Now, let's add GraphQL to the server. First, stop the server.

> Usually you don't need to restart [Ruby On Rails](http://rubyonrails.org/), but when you are adding new gems(libraries), this is required.

<Instruction>

Open `Gemfile` and add the following dependency to it:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'graphql', '1.8.13'
```

</Instruction>

<Instruction>

Then run:

```bash
bundle update
bundle exec rails generate graphql:install
```

</Instruction>

<Instruction>

Open `Gemfile` and change the following line:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'graphiql-rails', group: :development
```

To:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'graphiql-rails', '1.5.0', group: :development
```

And run:

```
bundle update
```

</Instruction>

This will install all the necessary dependencies you need to get started with GraphQL and Ruby.

