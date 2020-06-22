---
title: Adding a Database
pageTitle: "Creating a Prisma Database Service Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: Why is a second GraphQL API (defined by the application schema) needed in a GraphQL server architecture with Prisma?
answers: ["To increase performance of the server", "When using two APIs, the GraphQL server can be scaled better", "The Prisma API only is an interface to the database, but doesn't allow for any sort of application logic which is needed in most apps", "It is required by the GraphQL specification"]
correctAnswer: 2
---

In this section, you're going to setup Prisma 1 along with a connected database to be used by your GraphQL server.

> **Note**: This tutorial uses [Prisma 1](https://v1.prisma.io/docs/1.34) to connect to the database and to query it. It will be updated soon to use the recently released [Prisma 2](https://www.prisma.io/blog/announcing-prisma-2-n0v98rzc8br1/).

### Why Prisma

By now, you already understand the basic mechanics of how GraphQL servers work under the hood - surprisingly simple right? That's part of the beauty of GraphQL, that it actually only follows a few very simple rules. The statically typed schema and the GraphQL engine that's resolving the queries inside the server are taking away major pain points commonly dealt with in API development.

So, what's then the difficulty in building GraphQL servers?

Well, in real-world applications you're likely to encounter many scenarios where implementing the resolvers can become extremely complex. Especially because GraphQL queries can be nested multiple levels deep, the implementation often becomes tricky and can easily lead to performance problems.

Most of the time, you also need to take care of many additional workflows such as authentication, authorization (permissions), pagination, filtering, realtime, integrating with 3rd-party services or legacy systems...

Typically, when implementing resolvers and connecting to the database, you have two options - both of which are not very compelling:

- Access the database directly (by writing SQL or using another NoSQL database API)
- Use an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) that provides an abstraction for your database and lets you access it directly from your programming language

The first option is problematic since dealing with SQL in resolvers is complex and quickly gets out-of-hand. Another issue is that SQL queries are commonly submitted to the database as plain _strings_. Strings don't adhere to any structure, they're just raw sequences of characters. Therefore, your tooling won't be able to help you find any issues with them or provide additional perks like autocompletion in editors. Writing SQL queries is thus tedious and error-prone.

The second option is to use an ORM which might seem like a good solution at first. However, this approach usually falls short as well. ORMs typically have the problem that they're implementing rather simple solutions for database access, which when using GraphQL won't work due to the complexities of queries and the various edge cases that can arise.

Prisma solves this problem by providing you with a convenient data access layer which is taking care of resolving queries for you. When using Prisma, you're implementing your resolvers such that they're simply forwarding incoming queries to the underlying Prisma engine which in turn resolves the query against the actual database. Thanks to the [Prisma client](https://www.prisma.io/docs/prisma-client/), this is a straightforward process where most resolvers can be implemented as simple one-liners.

### Architecture

Here's an overview of the architecture that's used when building GraphQL servers with Prisma:

![](https://imgur.com/OyIQQxF.png)

> **Note**: This architecture depicts the architecture with Prisma 1. With the new [Prisma 2](https://www.prisma.io/blog/announcing-prisma-2-n0v98rzc8br1/), the standalone Prisma server is not required any more. Learn more about Prisma 2 with GraphQL in the [docs](https://www.prisma.io/docs/understand-prisma/prisma-in-your-stack/graphql).

The Prisma server provides the _data access layer_ in your application architecture, making it easy for your API server to talk to the database through Prisma. The API of the Prisma server is consumed by the Prisma client inside your _API server_ implementation (similar to an ORM). The API server is what you've started building throughout the previous chapters using `graphql-yoga`.

In essence, Prisma lets you easily connect the GraphQL resolvers in your API server with your database.

### Setting up Prisma with a demo database

In this tutorial, you're going to build everything entirely from scratch! For your Prisma configuration, you're going to start with the most minimal setup that's possible.

The first thing you need to do is create two files, which you're going to put into a new directory called `prisma`.

<Instruction>

First, create the `prisma` directory and then two files called `prisma.yml` and `datamodel.prisma` by running the following commands in your terminal:

```bash(path=".../hackernews-node/")
mkdir prisma
touch prisma/prisma.yml
touch prisma/datamodel.prisma
```

</Instruction>

[`prisma.yml`](https://www.prisma.io/docs/-5cy7/) is the main configuration file for your Prisma setup. `datamodel.prisma` on the other hand contains the definition of your [datamodel](https://www.prisma.io/docs/understand-prisma/data-modeling). The Prisma datamodel defines your application's _models_. Each model will be mapped to a table in the underlying database.

So far, the datamodel for your Hacker News app only contains one data type: `Link`. Because Prisma uses [GraphQL SDL](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) for model definitions, you can basically copy the existing `Link` definition from `schema.graphql` into `datamodel.prisma`.

<Instruction>

Open `datamodel.prisma` and add the following code:

```graphql{2,3}(path=".../hackernews-node/prisma/datamodel.prisma")
type Link {
  id: ID! @id
  createdAt: DateTime! @createdAt
  description: String!
  url: String!
}
```

</Instruction>

There are two main differences compared to the previous `Link` version from `schema.graphql`.

First, you're adding the `@id` directive to the `id: ID!` field. This means Prisma will auto-generate and store globally unique IDs for the `Link` records in the database on the `id` field.

Second, you're adding a new field called `createdAt: DateTime! @createdAt`. Thanks to the `@createdAt` directive, this field is also managed by Prisma and will be read-only in the API. It stores the time for when a specific `Link` was created. You can also annotate a field with the `@updatedAt` directive to track when a record was last updated.

Now, let's see what you need to do with `prisma.yml`.

<Instruction>

Add the following contents to `prisma.yml`:

```graphql(path=".../hackernews-node/prisma/prisma.yml")
# The HTTP endpoint for your Prisma API
endpoint: ''

# Points to the file that contains your datamodel
datamodel: datamodel.prisma

# Specifies language & location for the generated Prisma client
generate:
  - generator: javascript-client
    output: ../src/generated/prisma-client
```

</Instruction>

To learn more about the structure of `prisma.yml`, feel free to check out the [documentation](https://www.prisma.io/docs/-5cy7#reference).

Here's a quick explanation of each property you see in that file:

- `endpoint`: The HTTP endpoint for your Prisma API.
- `datamodel`: Points to the datamodel file which is the foundation for the Prisma client API that you'll use in your API server.
- `generate`: Specifies in which language the Prisma client should be generated and where it will be located.

Before deploying the service, you need to install the Prisma CLI.

<Instruction>

To install the Prisma CLI globally with Yarn, use the following command:

```bash
yarn global add prisma
```

</Instruction>

All right, you're finally ready to deploy your Prisma datamodel and the database that comes along! 🙌 Note that for this tutorial, you'll use a free _demo database_ ([AWS Aurora](https://aws.amazon.com/de/rds/aurora/)) that's hosted in Prisma Cloud. If you want to learn more about setting up Prisma locally or with your own database, you can check the documentation [here](https://www.prisma.io/docs/-a002/).

<Instruction>

Now run [`prisma deploy`](https://www.prisma.io/docs/-xcv9/):

```bash(path=".../hackernews-node/")
prisma deploy
```

</Instruction>

The `prisma deploy` command starts an interactive process: 

<Instruction>

First select the **Demo server**. When the browser opens, **register with Prisma Cloud** and go back to your terminal.

</Instruction>

<Instruction>

Then you need to select the **region** for your Demo server. Once that's done, you can just hit enter twice to use the suggested values for **service** and **stage**.

</Instruction>

> **Note**: [Prisma is open-source](https://github.com/prisma/prisma). You can deploy it with [Docker](http://docker.com/) to a cloud provider of your choice (such as Digital Ocean, AWS, Google Cloud, ...).

Once the command has finished running, the CLI writes the endpoint for the Prisma API to your `prisma.yml`. It will look similar to this: `https://eu1.prisma.sh/john-doe/hackernews-node/dev`.

The last step is to generate the Prisma client for your datamodel. The Prisma client is an auto-generated client library that lets you read and write data in your database through the Prisma API. You can generate it using the `prisma generate` command. This command reads the information from `prisma.yml` and generates the Prisma client accordingly.

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-node/prisma")
prisma generate
```

</Instruction>

The Prisma client is now generated and located in `hackernews-node/src/generated/prisma-client`. To use the client, you can import the `prisma` instance that's exported from the generated folder. Here's some sample code that you could use in a simple Node script:

```js(nocopy)
const { prisma } = require('./generated/prisma-client')

async function main() {

  // Create a new link
  const newLink = await prisma.createLink({ 
    url: 'www.prisma.io',
    description: 'Prisma replaces traditional ORMs',
  })
  console.log(`Created new link: ${newLink.url} (ID: ${newLink.id})`)

  // Read all links from the database and print them to the console
  const allLinks = await prisma.links()
  console.log(allLinks)
}

main().catch(e => console.error(e))
```

Notice that the generated directory also contains a file with TypeScript definitions (`index.d.ts`). This file is there so that your IDE (i.e. Visual Studio Code) can help you with auto-completion when reading and writing data using the Prisma client:

![](https://imgur.com/kwGNPN4.png)

In the next chapters, you will evolve the API or your GraphQL server and use the Prisma client to access the database inside your resolver functions.
