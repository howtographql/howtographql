---
title: Introduction
pageTitle: 'Building a GraphQL Server with TypeScript & Apollo'
description:
  'Learn how to build a GraphQL server with Apollo, TypeScript, Nexus & Prisma and best practices for authentication,
  filtering and pagination.'
question: 'What is Apollo Server?'
answers:
  [
    'An IDE to work with a GraphQL API',
    'A library to generate GraphQL schema',
    'A REST client',
    'A GraphQL web server'
  ]
correctAnswer: 3
---

## Overview

GraphQL is a rising star in the domain of API development. It is gaining significant ground over REST as an API design paradigm and is becoming one of the
standards for exposing the data and functionality of a web server.

In this tutorial, you'll learn how to build an _idiomatic_ GraphQL server entirely from scratch. You are going to use
the following technologies:

- [TypeScript](https://www.typescriptlang.org/): Strongly typed superset of JavaScript that can be transpiled back to JavaScript.  TypeScript has enjoyed significant adoption and love in the developer community for the type-safety and improved developer experience it provides. 
- [Apollo Server](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server): Fully-featured GraphQL Server with focus on easy setup, performance and great developer experience.
- [Nexus](https://github.com/graphql-nexus/nexus): A library for creating robust, type-safe GraphQL schemas using JavaScript/TypeScript. 
- [Prisma](https://www.prisma.io/): Next-generation Node.js and TypeScript ORM. You can use Prisma Client to access your database inside of
  GraphQL resolvers.



## What this tutorial will cover

The goal of this tutorial is to build an API for a [Hacker News](https://news.ycombinator.com/) clone. Here is a quick
rundown of what to expect.

You'll start by learning how a GraphQL server works. Then you will define the
[_GraphQL schema_](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e) for your server using [Nexus](https://github.com/graphql-nexus/nexus) and write the
corresponding _resolver functions_. In the beginning, these resolvers will only work with data that's stored in-memory —
so nothing will persist beyond the runtime of the server.

Nobody wants a server that's not able to store and persist data, right? Not to worry! Afterwards, you're going to add a
[SQLite](http://sqlite.org/) database to the project which will be managed with [Prisma](https://www.prisma.io/).

Once you have the database connected, you are going to add more advanced features to the API.

You'll start by implementing signup/login functionality that enables users to authenticate against the API. This will also allow you to check the permissions of your users for certain API operations.

Then, you're going to add a vote feature. 

Afterwards, you're going to learn about custom GraphQL scalars and how to add custom scalars to your application. 

Finally, you'll allow the consumers of the API to constrain the list of items they retrieve from the API by adding sorting, filtering and pagination capabalities to it.

Throughout the tutorial you will learn GraphQL bit by bit, through _theory, writing code and reading external resources_. You'll learn not just the _how_ of various technology choices, but also the _why_, including their pros, cons and tradeoffs. 


## Prerequisites

This tutorial is _beginner friendly_. Nevertheless, some prior knowledge is necessary to follow this tutorial. 

##### Assumed knowledge

This tutorial assumes you have have

- Basic knowledge JavaScript or TypeScript (TypeScript knowledge isn't mandatory, if you know JavaScript that is fine too).
- Basic knowledge of web development (if you've ever built or worked on an API or web server before, you should be good to go).
- Some experience working with databases (we're going to use a relational database but experience with document databases like MongoDB works too). 


##### Assumed tools and setup

Throughout this tutorial, we'll be making a few minor assumptions about your tools you are using: 

- npm as the package manager.
- VSCode as the IDE. 
- Unix shell (like the terminal/shell in linux and **macOS**).

If you're using another set of tools, like Yarn (package manager), Windows (OS) or Webstorm (IDE), that's totally fine and welcome! Just know that you'll occasionally need to adapt minor instructions to your situation.


## Hints and conventions

There are a few conventions and assumptions followed throughout this tutorial that you should know about. While knowing these conventions might help you follow the tutorial, it is still _optional reading_. Feel free to continue to the next chapter if you want to get started immediately. 


##### Annotated code blocks

Most code blocks are explained with annotations. Take the following for example. Immediately following the code block are numbered points. Each corresponds to a line annotated with that number in the code block.

```typescript
const a = 1          // 1
const b: any = 1     // 2
// @ts-ignore        // 3
const c: number = "Not a number";
```
1. TypeScript automatically infers the type of `a` as `number` since it is not explicitly provided. 
2. Use `any` to effectively disable type-checking and allow any type. 
3. Use `// @ts-ignore` before a line to ignore TypeScript compiler errors. 



##### Package installation with fixed major version

_Most_ package installations throughout the tutorial will follow a format similar to this:

```bash
npm install package_name@^version 
```

The `^` indicates to npm to keep the major version intact and update to latest minor and patch version when installing the package. According to [semver rules](https://semver.org/) breaking changes should only be introduced during major version upgrades. Keeping the major version fixed like this ensures there are no breaking changes in any of the packages you install that _unintentionally breaks the tutorial_. 

If you want to upgrade a package to a new major version not instructed in the tutorial, please make sure you know what you are doing. 



##### Copy-pasting code from the tutorial

As you progress you'll be writing code, of course. Often you'll have the chance to copy and paste our code, but we strongly suggest if you're just starting out to **write the code yourself**. This will expose you to the _experience_ of writing code in a TypeScript codebase with type-safety features. This includes things like autocompletion and letting static safety guide your implementations, e.g. inside a GraphQL resolver. Also if you're new to TypeScript getting used to encountering, understanding, and fixing static type errors is essential practice. 

That said at no time should you feel _frustrated_. If things just aren't working, copy-paste our work as needed. Then, once things _are_ working, taking a moment muck around, break things, fix them again, etc. is almost always time well spent.


##### GitHub Repository

Note that there is a GitHub repository at https://github.com/howtographql/typescript-apollo/ containing the finished code you will build in this tutorial. You can always check this out if you get stuck during the tutorial.



Alright, let's get started 🚀
