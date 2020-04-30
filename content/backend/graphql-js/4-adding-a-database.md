---
title: Adding a Database
pageTitle: "Creating a Prisma Database Service Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: Why is a second GraphQL API (defined by the application schema) needed in a GraphQL server architecture with Prisma?
answers: ["To increase performance of the server", "When using two APIs, the GraphQL server can be scaled better", "The Prisma API only is an interface to the database, but doesn't allow for any sort of application logic which is needed in most apps", "It is required by the GraphQL specification"]
correctAnswer: 2
---

In this section, you're going to set up Prisma along with a connected database to be used by your GraphQL server. You'll be using [SQLite](https://www.sqlite.org/index.html) for the database.

## So, what is Prisma?

Prisma is an [open source](https://github.com/prisma/prisma) database toolkit that makes it easy for developers to reason about their data and how they access it, by providing a clean and type-safe API for submitting database queries.

It mainly consists of three parts:

- **Prisma Client**: An auto-generated and type-safe query builder for Node.js & TypeScript
- **Prisma Migrate** (experimental): A declarative data modeling & migration system
- **Prisma Studio** (experimental): A GUI to view and edit data in your database

In this tutorial, you will be seting everything up from scratch and taking full advantage of these three features. We want to get you building stuff right away, so explanations of Prisma concepts will be kept light but we have included links to [Prisma docs](https://www.prisma.io/docs/) in case you want to dive deeper on any particular concept.

### Why Prisma?

You've now understood the basic mechanics of how GraphQL servers work under the hood and the beauty of GraphQL itself - it actually only follows a few very simple rules. The statically typed schema and the GraphQL engine that resolves the queries inside the server take away major pain points commonly dealt with in API development.

Well, in real-world applications you're likely to encounter many scenarios where implementing the resolvers can become extremely complex. Especially because GraphQL queries can be nested multiple levels deep, the implementation often becomes tricky and can easily lead to performance problems.

Most of the time, you also need to take care of many additional workflows such as authentication, authorization (permissions), pagination, filtering, realtime, integrating with 3rd-party services or legacy systems, and so on.

Prisma is focused on addressing that and [making developers more productive](https://www.prisma.io/docs/understand-prisma/why-prisma#prisma-makes-developers-productive) when working with databases.

Speaking of being productive and building awesome stuff, let's jump in and continue with our HackerNews Clone! 🏎💨

### Setting up our project with Prisma and SQLite 

<Instruction>

First, let's install the Prisma CLI by running the following command in your terminal:

```bash(path=".../hackernews-node/")
npm install @prisma/cli --save-dev
```

</Instruction>

Then, update your project structure.

<Instruction>

Create the `prisma` directory and then a file called `schema.prisma` by running the following commands in your terminal:

```bash(path=".../hackernews-node/")
mkdir prisma
touch prisma/schema.prisma
```

</Instruction>

Remember the GraphQL schema that you've been working with until now? Well, Prisma has a schema, too! You can think of the `prisma.schema` file as a *database schema*. It has three components:

1. **Data source**: Specifies your database connection.
1. **Generator**: Indicates that you want to genenerate Prisma Client.
1. **Data model**: Defines your application *models*. Each model will be mapped to a table in the underlying database.

Prisma's unique data model bridges the gap to help you reason about your data in a way that maps very well to the underlying database, while still providing an abstraction that allows you to be productive with type safety and superb auto-completion.

Let's see it in action with your project!

<Instruction>

Open `schema.prisma` and add the following code:

```graphql{2,3}(path=".../hackernews-node/prisma/schema.prisma")
// 1
datasource db {
  provider = "sqlite" 
  url      = "file:./dev.db"
}

// 2
generator client {
  provider = "prisma-client-js"
}

// 3
model Link {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String
  url         String
}
```

</Instruction>

Let's break down the three parts:

1. **Data source**: Tells Prisma you'll be using SQLite for your database connection.
1. **Generator**: Indicates that you want to genenerate Prisma Client. 
1. **Data model**: Here, we have written out our `Link` as a model.

You may notice that this `Link` *model* looks very similar to the `Link` *type* in the GraphQL Schema. It's important to quickly discuss how the two schemas are different.

// explain how they are different


It's finally time to actually create our SQLite database, which Prisma can do for us right out of the box with a simple command!

<Instruction>

From the root directory of your project, create your first *migration* by running the following command in your terminal:

```bash(path=".../hackernews-node/")
npx prisma migrate save --experimental
```

You will get a prompt asking if you would like to create a new database. Select "Yes", and type "Init DB" for the `Name of migration`.

</Instruction>
