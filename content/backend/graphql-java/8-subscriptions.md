---
title: Subscriptions
description: Find out more about GraphQL subscriptions in Java
---

As you learned in the intro tutorial, GraphQL specification defines a mechanism for real-time push-style updates, called *subscriptions*. While `graphql-java` does parse subscription requests, [its support at the moment](https://github.com/graphql-java/graphql-java/pull/358) unfortunately stops there, and thus isn't very useful without significant manual effort that is beyond the scope of this tutorial.