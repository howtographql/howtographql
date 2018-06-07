---
title: Introduction
pageTitle: "Fullstack Tutorial with GraphQL, React & Relay"
description: Learn how to build a production-ready Hackernews clone with GraphQL, React & Relay. You'll use create-react-app for the frontend and Graphcool for the backend.
question: What's a major benefit of using a GraphQL client library?
answers: ["It makes it easy to use animations inside your app", "It saves you from writing infrastructure code for networking and caching", "A GraphQL client is mainly used to improve security", "GraphQL clients don't provide actual advantages but it's always good to use 3rd party libraries"]
correctAnswer: 1
videoId: 9_pIJAnpJQM
duration: 4
---

### Overview

> **NOTE**: This tutorial uses the [legacy](https://www.graph.cool/docs/reference/service-definition/legacy-console-projects-aemieb1aev) version of [Graphcool](https://www.graph.cool/) and will be updated soon to use the new [Graphcool Framework](https://blog.graph.cool/introducing-the-graphcool-framework-d9edab2a7816). The CLI commands mentioned in tutorial are outdated, you can read more about the new CLI [here](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/). If you still want to go through this tutorial, you can install the old version of the CLI using `npm install -g graphcool@0.4`.

In the previous chapter, you learned about major concepts and benefits of GraphQL. Now is the time to get your hands dirty and start out with an actual project!

You're going to build a simple clone of [Hackernews](https://news.ycombinator.com/). Here's a list of the features the app will have:

- Display a list of links
- Users can authenticate
- Authenticated users can create new links
- Authenticated users can upvote links (one vote per link and user)
- Realtime updates when other users upvote a link or create a new one

In this track, you'll use the following technologies for building the app:

- Frontend:
    - [React](https://facebook.github.io/react/): Frontend framework for building user interfaces
    - [Relay](https://facebook.github.io/relay/): Powerful GraphQL client developed by Facebook, heavily optimized for performance
- Backend:
    - [Graphcool](https://www.graph.cool/): Flexible backend platform combining GraphQL + Serverless

You'll create the React project with [`create-react-app`](https://github.com/facebookincubator/create-react-app), a popular command-line tool that gives you a blank project with all required build configuration already setup.


### Why a GraphQL Client?

In the [Clients]() section in the GraphQL part, we already covered the responsibilities of a GraphQL client on a higher level, now it's time to get bit more concrete.

In short, you should use a GraphQL client for tasks that are repetitive and agnostic to the app you're building. For example, being able to send queries and mutations without having to worry about lower-level networking details or maintaining a local cache. This is functionality that you'll want in any frontend application that's talking to a GraphQL server - why build it yourself if you can use one of the amazing GraphQL clients out there?

There are a few GraphQL client libraries available. For very simple use cases (such as writing scripts), [`graphql-request`](https://github.com/graphcool/graphql-request) might already be enough for your needs. However, chances are that you're writing a somewhat larger application where you want to benefit from caching, optimistic UI updates and other handy features. In these cases, you pretty much have the choice between [Apollo Client](https://github.com/apollographql/apollo-client) and [Relay](https://facebook.github.io/relay/).


### Apollo vs Relay

The most common question heard from people that are getting started with GraphQL on the frontend is which GraphQL client they should use. We'll try to provide a few hints that'll help you decide which of these clients is the right one for your next project!

[Relay](https://facebook.github.io/relay/) is Facebook's homegrown GraphQL client that they open-sourced alongside GraphQL in 2015. It incorporates all the learnings that Facebook gathered since they started using GraphQL in 2012. Relay is heavily optimized for performance and tries to reduce network traffic where possible. An interesting side-note is that Relay itself actually started out as a _routing_ framework that eventually got combined with data loading responsibilities. It thus evolved into a powerful data management solution that can be used in Javascript apps to interface with GraphQL APIs.

The performance benefits of Relay come at the cost of a notable learning curve. Relay is a pretty complex framework and understanding all its bits and pieces does require some time to really get into it. The overall situation in that respect has improved with the release of the 1.0 version, called [Relay Modern](https://facebook.github.io/relay/docs/en/new-in-relay-modern.html), but if you're looking for something to _just get started_ with GraphQL, Relay might not be the right choice just yet.

[Apollo Client](https://github.com/apollographql/apollo-client) is a community-driven effort to build an easy-to-understand, flexible and powerful GraphQL client. Apollo has the ambition to build one library for every major development platform that people use to build web and mobile applications. Right now there is a Javascript client with bindings for popular frameworks like [React](https://github.com/apollographql/react-apollo), [Angular](https://github.com/apollographql/apollo-angular), [Ember](https://github.com/bgentry/ember-apollo-client) or [Vue](https://github.com/Akryum/vue-apollo) as well as early versions of [iOS](https://github.com/apollographql/apollo-ios) and [Android](https://github.com/apollographql/apollo-android) clients. Apollo is production-ready and has handy features like caching, optimistic UI, subscription support and many more.

