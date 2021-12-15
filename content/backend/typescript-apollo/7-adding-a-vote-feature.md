---
title: Adding a Vote Feature 
pageTitle: 'Adding a Vote Feature'
description: 'Learn how to implement a voting feature for a Hackernews Clone with Apollo Server, Nexus and Prisma.'
question: 'When should you use an implicit many-to-many relation in Prisma?'
answers: ['When the relation has additional information attached', 'When there is no additional information attached to the relation', 'Personal preference', 'When you need faster queries']
correctAnswer: 1
---


In this chapter, you will add a voting feature that lets your users _upvote_ certain links. Along the way, you will learn about representing many-to-many relationships using Prisma. 

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

```json
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