---
title: Summary
pageTitle: "Fullstack GraphQL, React & urql Tutorial with create-react-app"
description: "In this Fullstack GraphQL Tutorial with React & urql you learned how to build a production-ready Hackernews clone using create-react-app & Prisma."
question: Did you find this tutorial useful?
answers: ["What tutorial?", "Yes, I learned something!", "No, I even forgot what I knew before!", "Smoked Meats!"]
correctAnswer: 1
---

In this tutorial, you learned how to build a fully-featured Hackernews clone with React and [urql](https://github.com/FormidableLabs/urql). You implemented several features, such as displaying a list of links, signup and authentication, creating new links, voting on links, pagination as well as realtime updates with GraphQL subscriptions.

Feel free to extend this app, start a new one, or play around more with urql! If you have any closing questions or need some help, you can [reach out to the urql community & team on Spectrum](https://spectrum.chat/urql)!

Both `urql` and `@urql/exchange-graphcache` are powerful yet minimal tools that have a lot more to offer than what we've shown you in this tutorial! If you'd like to learn more, maybe check out some of these links:

- [urql Architecture](https://formidable.com/open-source/urql/docs/architecture/): More information on how urql works internally and how it's structured
- [urql Guides](https://formidable.com/open-source/urql/docs/guides/): If you now want to write your own exchanges to extend urql, these are some useful guides to get started!
- [`@urql/exchange-graphcache`](https://github.com/FormidableLabs/urql-exchange-graphcache): Graphcache supports more than what you've seen! It can do optimistic updates, cache resolvers, and more!

**Thank you for following along and congratulations on learning how to use React, urql, and GraphQL!**

### Node.js Server

To learn how to build the backend that you used for this tutorial, check out the [Node.JS tutorial](https://www.howtographql.com/graphql-js/0-introduction/).

The backend was powered by [`graphql-yoga`](https://github.com/prisma/graphql-yoga), a fast and simple GraphQL server library built on top of [Express.js](https://expressjs.com/). It comes with several features, such as out-of-the-box support for [GraphQL Playground](https://github.com/prisma/graphql-playground) and realtime GraphQL subscriptions.

The resolvers of your GraphQL server are implemented using the Prisma client that's responsible for database access.

If you want to dive deeper and become part of the awesome GraphQL community, here are a few resource and community recommendations for you:

- [Prisma Blog](https://prisma.io/blog): The blog regularly features new and interesting content about GraphQL, from community news to technical deep dives and various tutorials.
- [GraphQL Weekly](https://graphqlweekly.com): A weekly GraphQL newsletter with news from the GraphQL ecosystem
- [GraphQL Conf](https://www.graphqlconf.org): The world's biggest gathering of GraphQL enthusiasts happening in the heart of Berlin
- [Prisma Slack](https://slack.prisma.io): A Slack team with vivid discussions around everything GraphQL & Prisma
