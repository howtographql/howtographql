---
title: Introduction
pageTitle: 'Fullstack Tutorial with GraphQL, React & Apollo'
description:
  'Learn how to build a Hackernews clone with GraphQL, React
  and Apollo Client. Use create-react-app for the frontend
  and Apollo Server with Prisma for the backend.'
question:
  What's a major benefit of using a GraphQL client library?
answers:
  [
    'It makes it easy to use animations inside your app',
    'A GraphQL client is mainly used to improve security',
    'It saves you from writing infrastructure code for
    networking and caching',
    "GraphQL clients don't provide actual advantages but
    it's always good to use 3rd party libraries"
  ]
correctAnswer: 2
videoId: ''
duration: 0
videoAuthor: ''
---

**Note:** The final project for this tutorial can be found
on [GitHub](https://github.com/howtographql/react-apollo).
You can always use it as a reference whenever you get lost
throughout the course of the following chapters. Also note
that each code block is annotated with a filename. These
annotations directly link to the corresponding file on
GitHub, so you can clearly see where to put the code and
what the end result will look like.

### Overview

In the previous tutorials, we covered the major concepts and
benefits of GraphQL. Now is the time to get our hands dirty
and start out with an actual project!

We're going to build a simple clone of
[Hackernews](https://news.ycombinator.com/). Here's a list
of the features the app will have:

- Display a list of links
- Search the list of links
- Handle user authentication
- Allow authenticated users to create new links
- Allow authenticated users to upvote links (one vote per
  link and user)
- Realtime updates when other users upvote a link or create
  a new one

In this track, we'll use the following technologies for
building the app:

- Frontend:
  - [React](https://facebook.github.io/react/): Library for
    building user interfaces
  - [Apollo Client 3.2](https://github.com/apollographql/apollo-client):
    Production-ready, caching GraphQL client
- Backend:
  - [Apollo Server 2.18](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server):
    Fully-featured GraphQL Server with focus on easy setup,
    performance and great developer experience
  - [Prisma](https://www.prisma.io/): Open-source database
    toolkit that makes it simple to work with relational
    databases

We'll create the React project with
[`create-react-app`](https://github.com/facebook/create-react-app),
a popular command-line tool that gives us a blank project
with all required build configuration already setup.

### Why a GraphQL Client?

In the [Clients](/advanced/0-clients/) section in the
GraphQL part, we already covered the responsibilities of a
GraphQL client on a higher level. It's now time to get more
concrete.

In short, we should use a GraphQL client for tasks that are
repetitive and agnostic to the app we're building. For
example, being able to send queries and mutations without
having to worry about lower-level networking details or
maintaining a local cache. This is functionality we'll want
in any frontend application that's talking to a GraphQL
server. Why build these features yourself when we can use
one of the amazing GraphQL clients out there?

There are several GraphQL client libraries available that
all give us varying degrees of control over ongoing GraphQL
operations and come with different benefits and drawbacks.
For very simple use cases (such as writing scripts),
[`graphql-request`](https://github.com/prisma-labs/graphql-request)
might already be enough for our needs. Libraries like it are
thin layers around sending HTTP requests to our GraphQL API.

Chances are that you're writing a somewhat larger
application where you want to benefit from caching,
optimistic UI updates and other handy features. In these
cases you'll likely want to use a full GraphQL client that
handles the lifecycle of all your GraphQL operations. You
have the choice between
[Apollo Client](https://github.com/apollographql/apollo-client),
[Relay](https://facebook.github.io/relay/), and
[urql](https://github.com/FormidableLabs/urql).

### Apollo vs Relay vs urql

The most common question heard from people that are getting
started with GraphQL on the frontend is which GraphQL client
they should use. We'll try to provide a few hints that'll
help you decide which of these clients is the right one for
your next project!

[Relay](https://facebook.github.io/relay/) is Facebook's
homegrown GraphQL client that they open-sourced alongside
GraphQL in 2015. It incorporates all the learnings that
Facebook gathered since they started using GraphQL in 2012.
Relay is heavily optimized for performance and tries to
reduce network traffic where possible. An interesting
side-note is that Relay itself actually started out as a
_routing_ framework that eventually got combined with data
loading responsibilities. It thus evolved into a powerful
data management solution that can be used in JavaScript apps
to interface with GraphQL APIs.

The performance benefits of Relay come at the cost of a
notable learning curve. Relay is a complex framework and
understanding all of its intricacies does require some time.
The overall situation in that respect has improved with the
release of the 1.0 version, called
[Relay Modern](http://facebook.github.io/relay/docs/en/introduction-to-relay.html),
but if you're looking for something to _just get started_
with GraphQL, Relay might not be the right choice just yet.

[Apollo Client](https://github.com/apollographql/apollo-client)
is a community-driven effort to build an easy-to-understand,
flexible and powerful GraphQL client. Apollo has the
ambition to build one library for every major development
platform that people use to build web and mobile
applications. Right now there is a JavaScript client with
bindings for popular frameworks like
[React](https://github.com/apollographql/react-apollo),
[Angular](https://github.com/apollographql/apollo-angular),
[Ember](https://github.com/bgentry/ember-apollo-client) or
[Vue](https://github.com/Akryum/vue-apollo) as well as early
versions of
[iOS](https://github.com/apollographql/apollo-ios) and
[Android](https://github.com/apollographql/apollo-android)
clients. Apollo is production-ready and has features like
caching, optimistic UI, subscription support and more.

[urql](https://github.com/FormidableLabs/urql) is a more
dynamic approach on GraphQL clients and a newer project
compared to Relay and Apollo. While it's highly focused on
React, at its core it focuses on simplicity and
extensibility. It comes with the barebones to build an
efficient GraphQL client, but gives you full control over
how it processes GraphQL operations and results via
"Exchanges". Together with the first-party exchange
[`@urql/exchange-graphcache`](https://github.com/FormidableLabs/urql-exchange-graphcache)
it is basically equivalent in functionality with Apollo, but
with a smaller footprint and a very focused API.
