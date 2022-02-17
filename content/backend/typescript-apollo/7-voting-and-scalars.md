---
title: Voting and Custom GraphQL Scalars
pageTitle: 'Voting and Custom GraphQL Scalars'
description: 'Learn how to implement a voting feature and use custom scalars for a Hackernews Clone with Apollo Server, Nexus and Prisma.'
question: 'When should you use an implicit many-to-many relation in Prisma?'
answers: ['When the relation has additional information attached', 'When there is no additional information attached to the relation', 'Personal preference', 'When you need faster queries']
correctAnswer: 1
---


In this chapter, you will add a voting feature that lets your users _upvote_ certain links. Along the way, you will learn about representing many-to-many relationships using Prisma. Then you will learn about custom scalar types and how to add a `DateTime` scalar to your GraphQL API. Finally you are going to use the `DateTime` scalar to add a new `createdAt` field to the `Link` type. 


You will start with the voting feature. 


### Updating the Prisma schema

The first step here is to extend your Prisma data model to represent votes in the database.

<Instruction>

Open `prisma/schema.prisma` and make the following adjustments:

```graphql{6,8,16-17}(path=".../hackernews-node/prisma/schema.prisma")
model Link {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String
  url         String
  postedBy    User?    @relation(name: "PostedBy", fields: [postedById], references: [id])  // 2
  postedById  Int?
  voters      User[]   @relation(name: "Votes")  // 1
}

model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  links    Link[] @relation(name: "PostedBy")  // 2
  votes    Link[] @relation(name: "Votes")  // 1
}
```

</Instruction>

Let's go through the numbered comments to understand the changes: 

1. The `Link` model has a new `voters` relation field which is connected to _multiple_ `User` records. Similarly, the `User` model has a new `votes` relation field which is connected to _multple_ `Link` records. This kind of relation is called _many-to-many_ in relational database terminology. To represent such a relation in the database, a separate table is needed, which is often called the _join table_ or _relation table_. However, Prisma abstracts this away for you and manages this table under the hood (without you having to worry about it), so it's not visible in the Prisma schema. 

2. You can see there's a new attribute in the relation annotation called `name`. Notice that now there is more than one relation between the `User` and `Link` model (A _one-to-many_ `PostedBy` relation and a _many-to-many_ `Votes` relation). As a result, the `name` attribute needs to be specified in the relation annotation so that Prisma can identify the relation a field is referencing. 

> **Note:** The many-to-many relation where Prisma manages the relation table is called an _implicit_ many-to-many relation. Alternatively, you can choose to define the relation table inside your Prisma schema _explicitly_. This is called an _explicit_ many-to-many relation. Your use-case will determine which of the two you should use. When you don't need to attach additional information to the relation (as is the case for your vote relation), it's easier to use an implicit many-to-many relation. In cases where there is additional data associated with the relation itself, you will need to use an explicit many-to-many relation. You can optionally read more about this in the [Prisma documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/many-to-many-relations#relational-databases). 

<Instruction>

Now migrate your database schema with the following command:

```bash(path=".../hackernews-typescript")
npx prisma migrate dev --name "add-vote-relation"
```

</Instruction>

Just like before, the Prisma Client API will automatically be updated to reflect the changes to your schema. 


### Adding a `vote` mutation 

Now that your database model has been updated, it's time to implement the `vote` mutation, which any logged in user can call to cast a vote for a particular link. Note that this application will only support upvotes, and only logged in users will be allowed to vote on a link. 

You will start by creating a `Vote.ts` file.

<Instruction>

Create a new `Vote.ts` file inside the `src/graphql` directory: 

```bash(path=".../hackernews-typescript/")
touch src/graphql/Vote.ts
```

</Instruction>


Before creating the vote mutation you will also need to define its return type. 


<Instruction>

Create the `vote` mutation and the `Vote` type in `src/graphql/Vote.ts`:


```typescript(path="../hackernews-typescript/src/graphql/Vote.ts")
import { objectType, extendType, nonNull, intArg } from "nexus";

export const Vote = objectType({  // 1
    name: "Vote",
    definition(t) {
        t.nonNull.field("link", { type: "Link" });
        t.nonNull.field("user", { type: "User" });
    },
});

export const VoteMutation = extendType({  // 2
    type: "Mutation",
    definition(t) {
        t.field("vote", {
            type: "Vote",
            args: {
                linkId: nonNull(intArg()),
            },
            
        })
    }
})

```

</Instruction>

This code follows the same pattern you have used in the last few chapters. Let's take a look:

1. The `Vote` type is a union of two things: the link in question and the user who just cast the vote. 

2. The `vote` mutation will return an instance of `Vote` type. The caller will also provide the `linkId` argument which identifies the link in question. The `userId` does not need to be provided as an argument because it can be decoded from the Authentication header.

To incorporate these changes to your GraphQL schema, there's something else you need to do.

<Instruction>

Add the `src/graphql/Vote.ts` exports to `src/graphql/index.ts` so Nexus can generate the new mutations:

```typescript{4}(path="../hackernews-typescript/src/graphql/index.ts")
export * from "./Link";
export * from "./User";
export * from "./Auth";
export * from "./Vote";

```

</Instruction>


This is what the updated GraphQL schema will look like:

```graphql{5,8-12}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Mutation {
  login(email: String!, password: String!): AuthPayload!
  post(description: String!, url: String!): Link!
  signup(email: String!, name: String!, password: String!): AuthPayload!
  vote(linkId: Int!): Vote
}

type Vote {
  link: Link!
  user: User!
}
```
<Instruction>

Implement the `resolve` function for the `vote` mutation: 

```typescript{2,12-38}(path="../hackernews-typescript/src/graphql/Vote.ts")
import { objectType, extendType, nonNull, intArg } from "nexus";
import { User } from "@prisma/client";

export const VoteMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.field("vote", {
            type: "Vote",
            args: {
                linkId: nonNull(intArg()),
            },
            async resolve(parent, args, context) {
                const { userId } = context;
                const { linkId } = args;

                if (!userId) {  // 1 
                    throw new Error("Cannot vote without logging in.");
                }

                const link = await context.prisma.link.update({  // 2
                    where: {
                        id: linkId
                    },
                    data: {
                        voters: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                })

                const user = await context.prisma.user.findUnique({ where: { id: userId } });

                return {  // 3
                    link,
                    user: user as User
                };
            },
        })
    }
})

```
</Instruction>

Let's understand what's happening in the resolver:

1. If the user provides a valid JWT token, then the `userId` variable will be available in the `context` argument. This check prevents users that are not logged in from trying to vote.

2. The `voters` field for the link needs to be updated with a new user. The update query has two parts: the `where` option specifies which link to update, and the `data` option specifies the update payload. In this case, we simply want to attach a new user to the _many-to-many_ relation represented by the `voters` field. This can be done using the `connect` option.

3. The resolver will return an object of `Vote` type, which contains the user and link in question. The typecasting (`user as User`) is necessary as the type returned by `prisma.user.findUnique` is `User | null`, whereas the type expected from the resolve function is `User`.  

Now you will update the definition of the `Link` type in your GraphQL schema to add the `voters` field. 

<Instruction>

Update the `Link` type to add the new `voters` field:

```typescript{15-21}(path="../hackernews-typescript/src/graphql/Link.ts")
export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {  // 1
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        })  
    },
});

```

</Instruction>

1. The definition of the `voters` field in the GraphQL schema is similar to that of the Prisma data model you updated earlier. The syntax of the `resolve` function is also very similar to the previous `resolve` function written for the `postedBy` field. 


You also need to update the `User` type.

<Instruction>

Add the `votes` field in the `User` type:

```typescript{15-21}(path="../hackernews-typescript/src/graphql/Link.ts")
export const User = objectType({
    name: "User",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("links", {
            type: "Link",
            resolve(parent, args, context) {
                return context.prisma.user
                    .findUnique({ where: { id: parent.id } })
                    .links();
            },
        });
        t.nonNull.list.nonNull.field("votes", {
            type: "Link",
            resolve(parent, args, context) {
                return context.prisma.user
                    .findUnique({ where: { id: parent.id } })
                    .votes();
            }
        })
    },
});

```


</Instruction>

All right, that’s it! Now let's test the implementation of the `vote` mutation! When executing the following instruction, make sure the `Authorization` header is enabled and has a valid token. 


<Instruction>

Go to Apollo Studio Explorer and execute the following mutation:

```graphql
mutation {
  vote(linkId: _LINK_ID_) {
    link {
      url
      description
    }
    user {
      name
      email
    }
  }
}
```

</Instruction>

You should see an output similar to the following: 

```json(nocopy)
{
  "data": {
    "vote": {
      "link": {
        "url": "nexusjs.org",
        "description": "Code-First GraphQL schemas for JavaScript/TypeScript"
      },
      "user": {
        "name": "alice",
        "email": "alice@prisma.io"
      }
    }
  }
}
```

![Vote mutation](https://i.imgur.com/oIIXH9C.png)


Awesome! Now it's time to learn about GraphQL scalars. 


### What are GraphQL scalars? 

As mentioned before, scalars are the basic types in a GraphQL schema, similar to the primitive types in programming languages. While doing this tutorial, you have used a few of the built-in scalar types, notably `String` and `Int`. 

While the built-in scalars support most of the common use-cases, your application might need support for other custom scalars. For example, currently in our application, the `Link.url` field has a `String` scalar type. However, you might want to create an `Url` scalar to add custom validation logic and reject invalid urls. The benefit of scalars is that they simultaneously define the _representation_ and _validation_ for the primitive data types in your API. 



### Custom scalars with Nexus

Nexus allows you to create custom scalars for your GraphQL schema using a standardized interface. To do this, you will need to provide the functions that _serialize_ and _deserialize_ data for that scalar. It's important to note that under the hood Nexus uses the `GraphQLScalarType` class from the `graphql` library. Most applications in the node ecosystem uses this class when defining custom scalars. As a result scalars defined across different libraries in the node ecosystem are often compatible with each other. 

The [`graphql-scalars`](https://github.com/Urigo/graphql-scalars) library provides a large set of custom scalars for creating precise type-safe GraphQL schemas. You are going to import and use the `DateTime` scalar from this library in your GraphQL API. 

### Adding the `DateTime` scalar

Start by adding the `graphql-scalars` library to your application. 

<Instruction>

Install `graphql-scalars` using npm: 

```bash(path=".../hackernews-typescript/")
npm install graphql-scalars@^1.14.1
```

</Instruction>

You will create a new subfolder inside the `graphql` folder for your custom scalars.

<Instruction>

Create a new `scalars` subfolder inside `graphql` and add a `Date.ts` file:

```bash(path=".../hackernews-typescript/")
mkdir src/graphql/scalars
touch src/graphql/scalars/Date.ts
```

</Instruction>


Now let's add a new DateTime scalar to your API. 

<Instruction>

Inside of `Date.ts`, export the `GraphQLDateTime` scalar to your application:

```typescript(path="../hackernews-typescript/src/graphql/scalars/Date.ts")
import { asNexusMethod } from "nexus";
import { GraphQLDateTime } from "graphql-scalars"; // 1

export const GQLDate = asNexusMethod(GraphQLDateTime, "dateTime");  // 2
```

</Instruction>

Let's understand what you did here: 

1. The `GraphQLDateTime` is a pre-built custom scalar from the `graphql-scalars` library. It uses the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) specification, which is also used by Prisma for its own `DateTime` type. 

2. The `asNexusMethod` allows you to expose a custom scalar as a Nexus type. It takes two arguments: A custom scalar and the name for the Nexus type. 


To enable the new `DateTime` scalar, you will need to pass it to your Nexus `makeSchema` call. This can easily be done at `src/graphql/index.ts`.

<Instruction>

Add a new export in `src/graphql/index.ts`:

```typescript{5}(path="../hackernews-typescript/src/graphql/index.ts")
export * from "./Link";
export * from "./User";
export * from "./Auth";
export * from "./Vote";
export * from "./scalars/Date";
```

</Instruction>

Once your server restarts, you should see a new type in `schema.graphql`:

```graphql{1-10}(path="../hackernews-typescript/schema.graphql"&nocopy)
""""
A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
""""
scalar DateTime
```


Alright! It's time to put this new scalar to use in the `Link` type. Note that you usually update your database model before making changes to the GraphQL type definition. However the `createdAt` field _already exists_ in the `Link` Prisma model. 


<Instruction>

Add a new `createdAt` field to the `Link` type definition:

```typescript{7}(path="../hackernews-typescript/src/graphql/Link.ts")
export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");  // 1
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            },
        });
    },
});
```

</Instruction>


1. The `dateTime` field should automatically be available when defining any type using Nexus, thanks to the `asNexusMethod` call. This field will get resolved automatically during queries as the `Link` model inside Prisma already has a `createdAt` field. 

The updated `Link` type definition should be as follows:

```graphql{2}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Link {
  createdAt: DateTime!
  description: String!
  id: Int!
  postedBy: User
  url: String!
  voters: [User!]!
}
```

That's it! You can now access the `createdAt` field in any `Link` type. You can test this using the `feed` query and adding `createdAt` to the selection set like this: 


```graphql
query {
  feed {
    createdAt
    description
    id
    url
  }
}
```

Your result should look similar to the following:

```json(nocopy)
{
  "data": {
    "feed": [
      {
        "createdAt": "2021-12-14T23:21:52.620Z",
        "description": "Code-First GraphQL schemas for JavaScript/TypeScript",
        "id": 1,
        "url": "nexusjs.org"
      },
      {
        "createdAt": "2021-12-15T04:20:33.616Z",
        "description": "Next-generation Node.js and TypeScript ORM",
        "id": 2,
        "url": "www.prisma.io"
      }
    ]
  }
}
```

> **Note:** If you want to learn more about custom GraphQL scalars in the context of the Node ecosystem, [this article](https://medium.com/@alizhdanov/lets-understand-graphql-scalars-3b2b016feb4a) is worth reading. You can also check out the [Nexus docs](https://nexusjs.org/docs/api/scalar-type#exposing-scalar-as-method) for understanding how to create and use custom scalars with Nexus. 
