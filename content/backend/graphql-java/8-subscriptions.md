---
title: Subscriptions
pageTitle: "GraphQL Realtime Subscriptions with Java Tutorial"
description: "Learn how to implement server-side GraphQL subscriptions with Java to add realtime functionality to an app."
question: Can a GraphQL asynchronously push data to the client?
answers: ["Not yet, this feature is still only a proposal", "Yes, all servers and clients are required to support this feature", "Yes, but not all servers and clients support it", "No"]
correctAnswer: 2
---

As you learned in the intro tutorial, GraphQL specification defines a mechanism for real-time push-style updates, called *subscriptions*. While `graphql-java` does parse subscription requests, [its support at the moment](https://github.com/graphql-java/graphql-java/pull/358) unfortunately stops there, and thus isn't very useful without significant manual effort that is beyond the scope of this tutorial.

Expect an update to this chapter as soon as the situation changes.