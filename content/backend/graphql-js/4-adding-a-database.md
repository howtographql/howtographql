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

Prisma's unique data model bridges the gap to help you reason about your data in a way that maps very well to the underlying database, while still providing an abstraction that allows you to be productive with type safety and auto-completion.

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

Take a look at the `prisma` directory in your project's file system now. You'll see that there is now a `/migrations` directory that was created for you when running `npx prisma migrate save --experimental`. 

For now, the important thing to understand is that we have told Prisma with our data model, "I want create a `Link` table to store Link data, and here's what that data will look like. Prisma then generates the necessary migration and packages it into a dedicated directory with its own `README.md` file containing detailed information about the specific migration. This is then put inside that `prisma/migrations` directory, which becomes a historical reference of how your database evolves over time with each individual migration you make!

Check out the [Prisma Migrate docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate) for a deeper dive on this.

Now you just need to run one more command to actually *execute* the migration against your database:

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node/")
npx prisma migrate up --experimental
```

</Instruction>

Boom! You now have a database with a `Link` table! 🎉

### Generating Prisma Client

It's time to generate *Prisma Client* based on your data model!

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node/")
npx prisma generate
```

</Instruction>

It's as simple as that! You now have `/node_modules/@prisma/client` which can be imported and used in your code.

Let's write your first query with Prisma Client and break everything down.

<Instruction>

Create a new file in the `src/` directory called `script.js` and add the following code:

```js(path=".../hackernews-node/src/script.js")
// 1
const { PrismaClient } = require("@prisma/client")
// 2
const prisma = new PrismaClient()
//3
async function main() {
  const allLinks = await prisma.link.findMany()
  console.log(allLinks)
}
//4
main()
  .catch(e => {
    throw e
  })
  // 5
  .finally(async () => {
    await prisma.disconnect()
  })
```

</Instruction>

Let's break down what's going on here:
1. Import the `PrismaClient` constructor from the `@prisma/client` node module
1. Instantiate `PrismaClient`
1. Define an `async` function called `main` to send queries to the database. You will write all your queries insite this function.
1. Call the `main` function
1. Close the database connections when the script terminates

Take a moment to re-type the query line and notice the helpful autocompletion you get after typing `prisma.` and `prisma.link.` which lets us see all of the possible models we can access and operations we can use to query that data:

![](https://i.imgur.com/Zrrqwmo.png)

So now let's see things in action.

<Instruction>

Run your new code with the following command:

```bash(path=".../hackernews-node/")
node src/script.js
```

</Instruction>

You successfully queried the database with Prisma Client! Of course, we got an empty array back since the database is empty, so now let's add a mutation to create a new link.

<Instruction>

Type out the following lines of code yourself inside of the `main` function right above the `allLinks` query and pay close attention to the incredibly helpful autocompletion. First, it helps us understand that `.create()` is the operation we need (just scroll through the options) and then it actually shows us exactly how to construct the mutation!

```js(path=".../hackernews-node/src/script.js")
const newLink = await prisma.link.create({
    data: {
      description: 'Fullstack tutorial for GraphQL',
      url: 'www.howtographql.com',
    },
  })
```

</Instruction>

![](https://i.imgur.com/AUAtnxZ.png)

Great! You should now see your newly created link print in the terminal output!

### Summary of your workflow

To recap, this is the typical workflow you will follow when updating your data:

1. Manually adjust your Prisma data model.
2. Migrate your database using the `prisma migrate` CLI commands we covered.
3. (Re-)generate Prisma Client
4. Use Prisma Client in your application code to access your database.

In the next chapters, you will evolve the API of your GraphQL server and use Prisma Client to access the database from inside your resolver functions.
