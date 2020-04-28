---
title: Adding a Database
pageTitle: "Creating a Prisma Database Service Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: Why is a second GraphQL API (defined by the application schema) needed in a GraphQL server architecture with Prisma?
answers: ["To increase performance of the server", "When using two APIs, the GraphQL server can be scaled better", "The Prisma API only is an interface to the database, but doesn't allow for any sort of application logic which is needed in most apps", "It is required by the GraphQL specification"]
correctAnswer: 2
---

In this section, you're going to set up Prisma along with a connected database to be used by your GraphQL server.

## So, what is Prisma?

Prisma is an [open source](https://github.com/prisma/prisma) database toolkit that makes it easy for developers to reason about their data and how they access it, by providing a clean and type-safe API for submitting database queries.

It mainly consists of three parts:

- **Prisma Client**: An auto-generated and type-safe query builder for Node.js & TypeScript
- **Prisma Migrate** (experimental): A declarative data modeling & migration system
- **Prisma Studio** (experimental): A GUI to view and edit data in your database

In this tutorial, we will be focusing on the [Prisma Client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/api), but we will also cover [Prisma Migrate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate) and Prisma Studio in bonus chapters at the end if you would like to learn more about the Prisma ecosystem.

### Why Prisma?

You've now understood the basic mechanics of how GraphQL servers work under the hood and the beauty of GraphQL itself - it actually only follows a few very simple rules. The statically typed schema and the GraphQL engine that resolves the queries inside the server take away major pain points commonly dealt with in API development.

Well, in real-world applications you're likely to encounter many scenarios where implementing the resolvers can become extremely complex. Especially because GraphQL queries can be nested multiple levels deep, the implementation often becomes tricky and can easily lead to performance problems.

Most of the time, you also need to take care of many additional workflows such as authentication, authorization (permissions), pagination, filtering, realtime, integrating with 3rd-party services or legacy systems, and so on.

Let's have a quick look at some other common solutions for implementing resolvers and connecting to databases:

1. **Raw SQL**: Full control, low productivity
1. **SQL Query Builders**: High control, medium productivity
1. **ORMs**: Less control, better productivity

With **Raw SQL**, you have full control over your database operations, but sending plain SQL strings to the database can quickly get out of hand. You won't get any type safety or auto-completion in your editor, making it incredibly error-prone, and there is a lot of overhead with repetitive boilerplate and manual connection handling.

**SQL Query Builders** like [knex.js](knexjs.org) retain a high level of control while improving your productivity by providing a programmatic layer of abstraction to construct SQL queries. The issue here is that you still need to think about your data in terms of SQL and know exactly what you're doing with your queries.

**ORMs** provide an abstraction from the SQL layer and allow you to think about your data in terms of application models, represented as classes with methods you can call to read and write data. Unfortunately, this causes a mismatch of mental models - known as the [object-relational impedance mismatch](https://en.wikipedia.org/wiki/Object-relational_impedance_mismatch) - where application developers think of data in terms of objects while in an SQL database, for example, data exists in tables. For a deeper dive into the topic, we recommend reading Ted Neward's [The Vietnamese of Computer Science](http://blogs.tedneward.com/post/the-vietnam-of-computer-science/).

So with all of that in mind, we're choosing Prisma today because it seeks to solve the above problems by providing a simple data access layer which takes care of resolving queries for you. Prisma's unique data model bridges the gap to help you reason about your data in a way that maps well to the underlying database, while still providing an abstraction that allows you to be productive with type safety and superb auto-completion.

Great news! All your new found knowledge of GraphQL schemas will transfer directly over to Prisma's schema, which just has a few additional simple but powerful features to learn about. Then, we'll see how to use the Prisma Client to implement our resolvers, all while building out the rest of our HackerNews clone.

Phew, that was a lot of theory. Let's jump in and write some code! 🏎💨

### Setting up our project with Prisma and a demo database

First, let's update our basic project structure.

<Instruction>

Create the `prisma` directory and then a file called `schema.prisma` by running the following commands in your terminal:

```bash(path=".../hackernews-node/")
mkdir prisma
touch prisma/schema.prisma
```

</Instruction>

Next, let's convert our old GraphQL schena to a Prisma Schema at take a look at the differences!

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

The Prisma Schema consists of three components, which we can already see with the numbered comments:

1. **Data source**: Specifies your database connection.
1. **Generator**: Indicates that you want to genenerate Prisma Client. 
1. **Data model**: Defines your application model. Here, we have written our existing `Link` model. Each model will be mapped to a table in the underlying database.

You'll notice that a Prisma `model` is very similar to a `type` in our old GraphQL schema! Let's take a closer look at the differences.

First, you have these `@` 'directives' which allow you to describe certain fields in a way that Prisma understands and can help you. By adding the `@id` directive to the `id: ID!` field, you're telling Prisma that this field is a unique identifier or 'primary key' for each record in the `Link` table in the underlying database. You're also providing a default value with the `@default()` directive.

Second, you're adding a new field called `createdAt: DateTime @default(now())`, setting the default value to be the moment in time a specific `Link` record is created. You can also annotate a field with the `@updatedAt` directive to track when a record was last updated.

### Generating the Prisma Client

Now that you have your new Prisma Schema written, let's see how you can generate your first Prisma Client and start using it!


