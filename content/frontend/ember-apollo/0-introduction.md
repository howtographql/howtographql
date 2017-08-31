---
title: "Introduction"
pageTitle: "Fullstack Tutorial with GraphQL, Ember & Apollo"
description: "Learn how to build a Hackernews clone with GraphQL, Ember, and Apollo Client. You'll use Ember and ember-apollo-client for the frontend and Graphcool for the backend."
question: "What's a major benefit of using a GraphQL client library?"
answers: ["It makes it easy to use animations inside your app", "A GraphQL client is mainly used to improve security", "It saves you from writing infrastructure code for networking and caching", "GraphQL clients don't provide actual advantages but it's always good to use 3rd party libraries"]
correctAnswer: 2
---

### Overview

In the previous tutorials, you learned about major concepts and benefits of GraphQL. Now is the time to get your hands dirty and start out with an actual project!

You’re going to build a simple clone of [Hackernews](https://news.ycombinator.com/). Here’s a list of the features the app will have:

* Display a list of links
* Search the list of links
* Users can authenticate
* Authenticated users can create new links
* Authenticated users can upvote links (one vote per link and user)

In this track, you’ll use the following technologies for building the app:

* Frontend:
    * [Ember](https://emberjs.com/): A framework for creating ambitious web applications.
    * [Apollo Client](http://dev.apollodata.com/): Fully-featured, production ready caching GraphQL client.
* Backend:
    * [Graphcool](https://www.graph.cool/): Flexible backend platform combining GraphQL + Serverless

You’ll create the Ember project with `[ember-cli](http://ember-cli.com/)`, the command line interface for ambitious web applications. `ember-cli` will start you off with a blank project with all required build configuration already setup.

### Why a GraphQL Client?

In the [Clients](https://www.howtographql.com/advanced/0-clients/) section in the GraphQL part, you already covered the responsibilities of a GraphQL client on a higher level, now it’s time to get bit more concrete.

In short, you should use a GraphQL client for tasks that are repetitive and agnostic to the app you’re building. For example, being able to send queries and mutations without having to worry about lower-level networking details or maintaining a local cache. This is functionality that you’ll want in any frontend application that’s talking to a GraphQL server - why build it yourself if you can use one of the amazing GraphQL clients out there?

There are a few GraphQL client libraries available. For very simple use cases (such as writing scripts), [`graphql-request`](https://github.com/graphcool/graphql-request) might already be enough for your needs. However, chances are that you’re writing a somewhat larger application where you want to benefit from caching, optimistic UI updates, and other handy features. In these cases, [Apollo Client](http://dev.apollodata.com/) is the only solution that currently works with Ember.

### Apollo Client

[Apollo Client](http://dev.apollodata.com/) is a community-driven effort to build an easy-to-understand, flexible and powerful GraphQL client. Apollo has the ambition to build one library for every major development platform that people use to build web and mobile applications. Right now there is a JavaScript client with bindings for popular frameworks like [React](https://github.com/apollographql/react-apollo), [Angular](https://github.com/apollographql/apollo-angular), [Ember](https://github.com/bgentry/ember-apollo-client), and [Vue](https://github.com/Akryum/vue-apollo) as well as early versions of [iOS](https://github.com/apollographql/apollo-ios) and [Android](https://github.com/apollographql/apollo-android). Apollo is production-ready and has handy features like caching, optimistic UI, subscription support and many more.

### `ember-apollo-client`

This tutorial will use the [`ember-apollo-client`](https://github.com/bgentry/ember-apollo-client) library which is an `ember-cli` add-on that exposes a service to interact with Apollo. `ember-apollo-client` is still in it’s infancy so not all Apollo features have been implemented. The most notable feature of which is subscriptions. This tutorial will be updated as features are added to the library, so continually check back for new sections!