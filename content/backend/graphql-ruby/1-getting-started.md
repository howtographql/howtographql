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

First, you'll need to have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) installed on your system. If that's not the case, make sure to install it [now](https://www.ruby-lang.org/en/documentation/installation/).

<Instruction>

Then follow these steps to create the project for your application:

```bash
gem install bundler
gem install rails
rails new graphql-tutorial
cd graphql-tutorial
rails server
```

</Instruction>

This will install and start a new [Ruby On Rails](http://rubyonrails.org/) project. When you visit [http://localhost:3000](http://localhost:3000/) in a browser, you should see:

![](http://i.imgur.com/RLFWuiq.jpg)

### Setup Server

Now, let's add GraphQL to the server. First, stop the server.

> Usually you don't need to restart [Ruby On Rails](http://rubyonrails.org/), but when you are adding new gems(libraries), this is required.

<Instruction>

Open `Gemfile` and add the following dependency to it:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'graphql'
```

</Instruction>

<Instruction>

Then run:

```bash
bundle update
rails generate graphql:install
```

</Instruction>

This will install all the necessary dependencies you need to get started with GraphQL and Ruby.

