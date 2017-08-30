---
title: Introduction
pageTitle: "Building a GraphQL Server with Graphcool Backend Tutorial"
description: "Learn how to build a GraphQL server with Graphcool and best practices for filters, authentication, pagination and subscriptions. Compatible with Relay & Apollo."
---


In this tutorial, you'll learn how you can use [Graphcool](https://www.graph.cool) to build the backend for a [Hackernews](https://news.ycombinator.com/) clone.

Here's the list of features the backend will expose:

- Returning a list of links
- Providing a filter API so links can be searched
- Users can authenticate
- Authenticated users can create new links
- Authenticated users can vote on links
- Realtime functionality with GraphQL Subscriptions


### What is Graphcool?

Graphcool is a developer platform that combines GraphQL with serverless technologies and to give you everything you need to build highly scalable backends for your applications!

The overarching goal is to provide a new layer of abstraction for backend developers and enable the [Serverless GraphQL Backend Architecture](https://www.graph.cool/docs/blog/introducing-the-serverless-graphql-backend-architecture-ahde7paig2/).

When using Graphcool for your projects, you'll get the following benefits:

- Fully-featured GraphQL server based on a data model that's defined in the a schema
- Different authentication mechanisms, such as [Auth0](https://auth0.com/), [Digits](https://get.digits.com/) (soon [Firebase Phone Authentication](http://get.digits.com/blog/introducing-firebase-phone-authentication)), Email-and-Password or Anonymous Authentication
- A simple and powerful CRUD-style API (called the [Simple API](https://www.graph.cool/docs/reference/simple-api/overview-heshoov3ai/)) for all your model types as well as an additional API that adheres to the server-side requirements from Relay (called [Relay API](https://www.graph.cool/docs/reference/relay-api/overview-aizoong9ah/))
- [Integration of third-party services](https://www.graph.cool/docs/reference/integrations/overview-seimeish6e/) like [Algolia's](https://www.graph.cool/docs/reference/integrations/algolia-emaig4uiki/) realtime search
- A [file management](https://www.graph.cool/docs/reference/file-handling/overview-eer4wiang0/) API
- [Subscriptions](https://www.graph.cool/docs/reference/simple-api/subscriptions-aip7oojeiv/) for realtime functionality based on websockets
- Easy integration of custom business logic with [serverless functions](https://www.graph.cool/docs/reference/functions/overview-boo6uteemo/)
- A nice [web UI](https://www.graph.cool/docs/reference/console/overview-uh8shohxie/) to manage the server-setup as well as a [CLI](https://www.graph.cool/docs/reference/cli/overview-kie1quohli/) to support local developer workflows

> [Learn more](https://www.graph.cool/docs/tutorials/graphcool-features-overview-ped6wohw0o/) about the major features of the Graphcool platform.



