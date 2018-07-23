---
title: Adding a Database
pageTitle: "Creating a Prisma Database Service Tutorial"
description: "Learn how to add a database to your GraphQL server. The database is powered by Prisma and connected to the server via GraphQL bindings."
question: Why is a second GraphQL API (defined by the application schema) needed in a GraphQL server architecture with Prisma?
answers: ["To increase performance of the server", "When using two APIs, the GraphQL server can be scaled better", "The Prisma API only is an interface to the database, but doesn't allow for any sort of application logic which is needed in most apps", "It is required by the GraphQL specification"]
correctAnswer: 2
---

In this section, you're going to setup a Prisma service along with a connected database to be used by the server.

### Why Prisma

By now, you already understand the basic mechanics of how GraphQL servers work under the hood - surprisingly simple right? That's part of the beauty of GraphQL, that it actually only follows a few very simple rules. The strongly typed schema and the GraphQL engine that's resolving the queries inside the server are taking away major pain points commonly dealt with in API development.

So, what's then the difficulty in building GraphQL servers?

Well, in real-world applications you're likely to encounter many scenarios where implementing the resolvers can become extremely complex. Especially because GraphQL queries can be nested multiple levels deep, the implementation often becomes tricky and can easily lead to performance problems.

Most of the time, you also need to take care of many additional workflows such as authentication, authorization (permissions), pagination, filtering, realtime, integrating with 3rd-party services or legacy systems...

Typically, when implementing resolvers and connecting to the database, you have two options - both of which are not very compelling:

- Access the database directly (by writing SQL or using another NoSQL database API)
- Use an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) that provides an abstraction for your database and lets you access it directly from your programming language

The first option is problematic since dealing with SQL in resolvers is complex and quickly gets out-of-hand. Another issue is that SQL queries are commonly submitted to the database as plain _strings_. Strings don't adhere to any structure, they're just raw sequences of characters. Therefore, your tooling won't be able to help you finding any issues with them or provide additional perks like autocompletion in editors. Writing SQL queries is thus tedious and error-prone.

The second option is to use an ORM which might seem like a good solution at first. However, this approach usually falls short as well. ORMs typically have the problem that they're implementing rather simple solutions for database access, which when using GraphQL won't work due to the complexities of queries and the various edge cases that can arise.

Prisma solves this problem by providing you with a _GraphQL query engine_ which is taking care of resolving queries for you. When using Prisma, you're implementing your resolvers such that they're simply _delegating_ incoming queries to the underlying Prisma engine. Thanks to [Prisma bindings](https://github.com/graphcool/prisma-binding), query delegation is a simple process where most resolvers can be implemented as simple one-liners.

> **Note**: Prisma bindings are based on the idea of schema stitching and schema delegation. We're not going to cover these techniques in detail in this tutorial. If you want to learn more about them, you can check out the following two articles:
> - [GraphQL Schema Stitching explained: Schema Delegation](https://blog.graph.cool/graphql-schema-stitching-explained-schema-delegation-4c6caf468405)
> - [Reusing & Composing GraphQL APIs with GraphQL Bindings](https://blog.graph.cool/reusing-composing-graphql-apis-with-graphql-bindings-80a4aa37cff5)

### Architecture

Here's an overview of the architecture that's used when building GraphQL servers with Prisma:

![](https://imgur.com/ik5P7RO.png)

What's important to understand about this architecture that you're dealing with two(!) GraphQL API layers.

#### The application layer

The first GraphQL API is the one that you already started building in the previous sections of this tutorial. This is the GraphQL API for the **application layer**. It defines the API your client applications are going to talk to. Here is where you implement _business logic_, common workflows like _authentication_ and _authorization_ or integrate with _3rd-party services_ (such as Stripe if you want to need to implement a payment process). The API of the application layer is defined by the GraphQL schema in `src/schema.graphql` - we'll therefore from now on refer to this schema as the **application schema**.

#### The database layer

The second GraphQL API is the one that's provided by Prisma and provides the **database layer**. This one basically is a GraphQL-based interface to your database that saves you from the intricacies of writing SQL yourself. So, what does that GraphQL API look like?

The Prisma API is mirroring a database API, so it allows you to perform CRUD operations for certain _data types_. What data types? Well, that's up to you - you are defining those data types using the familiar SDL. You'll learn in a bit how that works.

Typically, these data types represent the _entities of your application domain_. For example, if you're building car dealership software, you're likely going to have data types such as `Car`, `CarDealer`, `Customer` and so on... The entire collection of these data types is referred to as your _data model_.

Once your data model is defined in SDL, Prisma translates it into an according database schema and sets up the underlying database accordingly. When you're then sending queries and mutations to the Prisma GraphQL API, it translates those into database operations and performs these operations for you. Neat, right?

Previously you learned that all GraphQL APIs are backed by a GraphQL schema. So, who is writing the schema for the Prisma GraphQL API? The answer is that it is _automatically generated_ based on the data model you provide. By the way, this schema is called the **Prisma database schema**.

As an example, consider this simple data model with a single `User` type:

```graphql(nocopy)
type User {
  id: ID! @unique
  name: String!
}
```

> **Note**: Don't worry about the `@unique` directive yet, we'll talk about it soon.

Based on this data model, Prisma would generate a GraphQL schema looking like this:

```graphql(nocopy)
type Query {
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  user(where: UserWhereUniqueInput!): User
}

type Mutation {
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteUser(where: UserWhereUniqueInput!): User
}

type Subscription {
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}
```

In fact, the actual schema is quite a bit bigger - for brevity we've only included the three root types and the simple CRUD operations here. But the API also allows for a variety of other operations (such as batched updates and deletes). If you're curious, you can check out the entire schema [here](https://gist.github.com/gc-codesnippets/3f4178ad93c51d03195c92ce119d444c).

#### Why not just use the Prisma GraphQL API directly?

Prisma really only is an interface to a database. If you consumed the Prisma API directly from your frontend or mobile applications, this would be similar as _directly accessing a database_.

In very, very rare cases, this might be an option - but the vast majority of applications do need additional logic that is not covered by CRUD operations (data validation and transformation, authentication, permissions, integration of 3rd-party services or any other sort of custom functionality...).

Another potential concern of directly exposing the Prisma API to your client applications is _security_. GraphQL works in the way that everyone who has access to the endpoint of a GraphQL API can retrieve the _entire_ GraphQL schema from it - this is called [introspection](http://graphql.org/learn/introspection/). If your clients were talking directly to Prisma, it would be simply a matter of checking the network requests to get access to the endpoint of the Prisma API and everyone would be able to see your entire database schema.

> **Note**: It is currently debated whether it should be possible to limit introspection capabilities, but so far it doesn't seem a priority in the development of the GraphQL spec. See [this](https://github.com/graphql/graphql-js/issues/113) GitHub issue for more info.

### Creating a Prisma service with a connected database

In this tutorial, you're going to build everything entirely from scratch! For the Prisma database service, you're going to start with the most minimal setup that's possible.

The first thing you need to do is create two files, which you're going to put into a new directory called `database`.

<Instruction>

First, create the `database` directory and then two files called `prisma.yml` and `datamodel.graphql` by running the following commands in your terminal:

```bash(path=".../hackernews-node/")
mkdir database
touch database/prisma.yml
touch database/datamodel.graphql
```

</Instruction>

[`prisma.yml`](https://www.prisma.io/docs/reference/service-configuration/prisma.yml/overview-and-example-foatho8aip) is the main configuration file for your Prisma database service. `datamodel.graphql` on the other hand contains the definition of your data model which will be the foundation for the GraphQL CRUD API that's generated by Prisma.

So far, the data model for your Hacker News app only contains one data type: `Link`. In fact, you can basically copy the existing `Link` definition from `schema.graphql` into `datamodel.graphql`.

<Instruction>

Open `datamodel.graphql` and add the following code:

```graphql{2,3}(path=".../hackernews-node/database/datamodel.graphql")
type Link {
  id: ID! @unique
  createdAt: DateTime!
  description: String!
  url: String!
}
```

</Instruction>

There are two main differences compared to the previous `Link` version from `schema.graphql`.

First, you're adding the `@unique` directive to the `id: ID!` field. This directive generally tells Prisma that you never want any two `Link` elements in the database that have the same value for that field. In fact, `id: ID!` is a special field in the Prisma data model since Prisma will auto-generate globally unique IDs for the types that have this field.

Second, you're adding a new field called `createdAt: DateTime!`. This field is also managed by Prisma and will be read-only in the API. It stores the time for when a specific `Link` was created. Note that there's another similar field provided by Prisma, called `updatedAt: DateTime` - this one stores the time when a `Link` was last updated.

Now, let's see what you need to do with `prisma.yml`.

<Instruction>

Add the following contents to `prisma.yml`:

```graphql(path=".../hackernews-node/database/prisma.yml")
# The HTTP endpoint for your Prisma API
endpoint: ''

# Points to the file that holds your data model
datamodel: datamodel.graphql

# You can only access the API when providing JWTs that are signed with this secret
secret: mysecret123
```

</Instruction>

To learn more about the structure of `prisma.yml`, feel free to check out the [documentation](https://www.prisma.io/docs/reference/service-configuration/prisma.yml/yaml-structure-ufeshusai8).

Here's a quick explanation of each property you see in that file:

- `endpoint`: The HTTP endpoint for your Prisma API. It is actually required to deploy your Prisma API. It will be gerated when we deploy.
- `datamodel`: This simply points to the _data model_ which is the foundation for the Prisma CRUD API.
- `secret`: You want to protect your Prisma service and require requests against your Prisma API to be authenticated. This _secret is used to sign JWTs_ which need to be included in the `Authorization` header of any HTTP requests made against the API. Read more about that [here](https://www.prisma.io/docs/reference/prisma-api/concepts-utee3eiquo#authentication).

Before deploying the service, you need to install the Prisma CLI which is used to manage the Prisma service.

<Instruction>

To install the Prisma CLI globally with NPM, use the following command:

```bash
npm install -g prisma
```

</Instruction>

All right, you're finally ready to deploy your Prisma service and the database that comes along! 🙌

<Instruction>

Navigate into the `database` directory and run [`prisma deploy`](https://www.prisma.io/docs/reference/cli-command-reference/database-service/prisma-deploy-kee1iedaov):

```bash(path=".../hackernews-node/")
cd database
prisma deploy
```

</Instruction>

The `prisma deploy` command starts an interactive process: 

<Instruction>

First select the **Demo server** from the options provided. When the browser opens, **register with Prisma Cloud** and go back to your terminal.

</Instruction>

<Instruction>

Then you need to select the **region** for your demo server. Once that's done, you can just hit enter twice to use the suggested values for **service** and **stage**.

</Instruction>

> **Note**: Prisma is open-source. It is based on [Docker](http://docker.com/) which means you can deploy it to any cloud provider of your choice (such as Digital Ocean, AWS, Google Cloud, ...). If you don't want to deal with DevOps and the manual configuration of Docker, you can also use [Prisma Cloud](https://blog.graph.cool/introducing-prisma-cloud-a-graphql-database-platform-ed591baa8737) to easily spin up a private cluster to which you can deploy your services. Watch this short [video](https://www.youtube.com/watch?v=jELE4KXJPn4) to learn more about how that works.

Once the command has finished running, the CLI outputs the endpoint for the Prisma GraphQL API. It will look somewhat similar to this: `https://eu1.prisma.sh/public-graytracker-771/hackernews-node/dev`.

Here's how the URL is composed:

- `eu1.prisma.sh`: The domain of your cluster
- `public-graytracker-771`: A randomly generated ID for your service
- `hackernews-node`: The service name from `prisma.yml`
- `dev`: The deployment stage from `prisma.yml`

In future deploys (e.g. after you made changes to the data model), you won't be prompted where to deploy the service any more - the CLI will read the endpoint URL from `prisma.yml`.

### Exploring the Prisma service

To explore the Prisma database API, open the URL that was printed by the CLI.

> **Note**: If you ever lose the endpoint, you can get access to it again by running `prisma info` in the terminal.

Unfortunately, if you do so you will be greeted by an error:

```json(nocopy)
{
  "errors": [
    {
      "message": " Your token is invalid. It might have expired or you might be using a token from a different project.",
      "code": 3015,
      "requestId": "api:api:cjfcbpal10t6w0b91idqif941"
    }
  ]
}
```

Remember how we said that your Prisma API is protected by the `secret` from `prisma.yml`? Well, this is precisely the reason why you're getting the error right now. The Playground is trying to load the GraphQL schema from the endpoint, but its request is not authenticated. Let's go ahead and change that.

Inside the `database` directory, run the following command to generate an authentication token (JWT) that's signed with the `secret` from `prisma.yml`:

```bash(path=".../hackernews-node/database")
prisma token
```

Then copy the token that was printed by the CLI and use it to configure an HTTP header in the Playground. You can do so by opening the **HTTP HEADERS** pane in the bottom-left corner of the Playground - notice that you need to replace the `__TOKEN__` placeholder with the actual token that was printed:

```json
{
  "Authorization": "Bearer __TOKEN__"
}
```

 It will look similar to this:

```json(nocopy)
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJoYWNrZXJuZXdzLW5vZGVAZGV2Iiwicm9sZXMiOlsiYWRtaW4iXX0sImlhdCI6MTUyMjMxNjM2MCwiZXhwIjoxNTIyOTIxMTYwfQ.MUoHGvw61iIq45ZVInOoylcs6_q2ldfD_GjQOVBqEqY"
}
```

After a few seconds, the Playground is going to load the schema and you're able to send authenticated requests to the Prisma API. Open the documentation to check the available API operations.

![](https://imgur.com/CK1xXWq.png)

If you like, you can send the following mutation and query to create a new link and then retrieve the list of links:

Create a new `Link`:

```graphql
mutation {
  createLink(data: {
    url: "www.prisma.io"
    description: "Prisma turns your database into a GraphQL API"
  }) {
    id
  }
}
```

Load all `Link` elements:

```graphql
query {
  links {
    id
    url
    description
  }
}
```

![](https://imgur.com/jq6dOL7.png)
