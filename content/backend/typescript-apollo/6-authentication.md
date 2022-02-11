---
title: Authentication 
pageTitle: 'Implementing Authentication in a GraphQL server with TypeScript'
description: 'Learn best practices for implementing authentication and authorization with TypeScript, Apollo Server & Prisma.'
question: 'Which HTTP header field carries the authentication token?'
answers: ['Cache-Control', 'Token', 'Authorization', 'Authentication']
correctAnswer: 2
---

In this section, you're going to implement signup and login functionality that allows users to authenticate against your GraphQL server.

### Adding a `User` model

The first thing you need is a way to represent user data in the database. To do so, you can add a `User` type to your Prisma data model.

You'll also want to add a _relation_ between the `User` and the existing `Link` type to express that `Link`s are _posted_ by `User`s.

<Instruction>

Open `prisma/schema.prisma` and add the `User` model, making sure to also update your existing `Link` model accordingly:

```graphql{6-7,10-16}(path=".../hackernews-node/prisma/schema.prisma")
model Link {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String
  url         String
  postedBy    User?    @relation(fields: [postedById], references: [id])
  postedById  Int?
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  links     Link[]
}
```

</Instruction>

Here, you can further see how Prisma helps you to reason about your data in a way that is more aligned with how it is represented in the underlying database.

### Understanding relation fields

Notice how you're adding a new _relation field_ called `postedBy` to the `Link` model that points to a `User` instance. The `User` model then has a `links` field that's a list of
`Link`s.

To do this, we need to also define the relation by annotating the `postedBy` field with
[the `@relation` attribute](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#the-relation-attribute). This is required for every relation field in
your Prisma schema, and all you're doing is defining what the foreign key of the related table will be. So in this case, we're adding an extra field to store the `id` of the `User`
who posts a `Link`, and then telling Prisma that `postedById` will be equal to the `id` field in the `User` table.

If this is quite new to you, don't worry! We're going to be adding a few of these relational fields and you'll get the hang of it as you go! For a deeper dive on relations with
Prisma, check out these [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations).

### Updating your Prisma Client

This is a great time to refresh your memory on the workflow we described for your project at the end of [Chapter 4](../4-adding-a-database/).

After every change you make to the data model, you need to migrate your database and re-generate Prisma Client. 

<Instruction>

In the root directory of the project, run the following command:

```bash(path=".../hackernews-typescript")
npx prisma migrate dev --name "add-user-model"
```

</Instruction>

This command has now generated your second migration inside of `prisma/migrations`, and you can start to see how this becomes a historical record of how your database evolves over
time.

You will notice once again that Prisma Client gets regenerated automatically when you run a migration. Your database structure and Prisma Client has both been updated to reflect the changes for the newly added `User` model – woohoo! 🎉


### Extending the GraphQL schema with the `User` type 

Now that you have a `User` data model in your database schema, it's time to add a `User` type to your GraphQL schema. To keep your codebase modular and readable, you are going to put the Nexus definitions and resolver code in a separate `src/graphql/User.ts` file. 

<Instruction>

Create a `User.ts` file for the `User` type:

```bash(path=".../hackernews-typescript")
touch src/graphql/User.ts
```

</Instruction>

Now just like you did with `Link`, you are going to write the Nexus type definition for the `User` type using the `objectType` function. 

<Instruction>

Type in the following code in `src/graphql/User.ts` to define the `User` type:

```typescript(path="../hackernews-typescript/src/graphql/User.ts")
import { objectType } from "nexus";

export const User = objectType({
    name: "User",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("links", {    // 1
            type: "Link",
            resolve(parent, args, context) {   // 2
                return context.prisma.user  // 3
                    .findUnique({ where: { id: parent.id } })
                    .links();
            },
        }); 
    },
});
```

The field worth discussing is the one called `links`: 

1. The `links` field is a non-nullable array of `Link` type objects. It represents all the `links` that have been posted by that particular user.  

2. The `links` field needs to implement a resolve function. Previously, you only needed to implement resolvers for fields in `Query` and `Mutation`. Since the resolver for the `links` field is non-trivial, meaning GraphQL can't infer it automatically as the `User` object returned from your database does not automatically contain the `links` type. So unlike the other fields in the `User` type, you need to explcitly define the `links` resolver. 

3. This is the Prisma query that returns the associated `user.links` for a certain user from your database. You are using the `parent` argument which contains the all the fields of the user that you are trying to resolve. Using the `parent.id` you can fetch the appropriate user record from your database and return the relevant `links` by chaining in the `links()` call. 

> **Note:** If you're having a hard time understanding the theory behind the `parent` argument and non-trivial resolvers, you should review the topic at the end of [Chapter 2](../2-a-simple-query/).

<Instruction>

Add `User.ts` to Nexus by exporting it in `index.ts`:


```typescript{2}(path="../hackernews-typescript/src/graphql/index.ts")
export * from "./Link"; 
export * from "./User"
```

</Instruction>

Now, the `makeSchema` function in `schema.ts` will pick up on the new `User` type automatically. If your server is running in `dev` mode, your `schema.graphql` should be immidiately updated with the `User` type. You can also run `npm run generate` at any time to do this. This is what the type should look like: 

```graphql(path="../hackernews-typescript/schema.graphql"&nocopy)
type User {
  email: String!
  id: Int!
  links: [Link!]!
  name: String!
}
```
</Instruction>

> **Note:** You might have noticed the definition of `links` field in the GraphQL schema is very similar to the definition of the `links` field in the `schema.prisma` file. The Prisma schema language bears a lot of resemblences to the GraphQL SDL, making it easy to reason about the properties of both schema files. 


### Updating the `Link` type

Note that, the relation between `User` and `Link` is bidirectional. A `user` has zero or more `links` that they have created. Similary a single `link` is _optionally_ connected to a `user` who _posted_ the link. To reflect this bidirectional relation, you will add a `postedBy` field to the existing `Link` model definition in
your GraphQL schema. 


<Instruction>

Update the definition of the `Link` type in `src/graphql/Link.ts`:


```typescript{7-14}(path="../hackernews-typescript/src/graphql/Link.ts")
export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
    },
});

```

What are the changes here? Let's take a look 🔎:

1. You are adding a `postedBy` field of type `User`. Notice this field does not have a `nonNull` attached, meaning it is an optional field (it can return `null`). 

2. The implementaiton of the resolver for `postedBy` should feel familiar, as it is very similar to what you did for the `links` field in `User`. In the query, you are fetching the `link` record first using `findUnique({ where: { id: parent.id } })` and then the associated `user` relation who posted the link by chaining `postedBy()`.  

 
> **Note:** This interesting syntax where you can traverse and fetch relation fields by chaining the field name (`findUnique(...).relationFieldName()`) is called the [Fluent API](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#fluent-api) in Prisma. This API has a very interesting batching behavior that is very useful for implementing GraphQL resolvers as it solves a common problem known as the _"N+1 problem"_. This is an advanced optimization topic that we won't cover in this tutorial, but feel free to learn more from [here](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prismas-dataloader). 


The change in your GraphQL schema is pretty minimal. Let's take a look:

```graphql{4}(path="../hackernews-typescript/schema.graphql"&nocopy)
type Link {
  description: String!
  id: Int!
  postedBy: User
  url: String!
}
```

Now that you have defined the `User` type and updated the `Link` type in your GraphQL schema and database models, you're all set to implement authentication! 


### Implementing the `signup` and `login` mutation 

You will be implementing [JWT-based authentication](https://morioh.com/p/79f6f8b073f8) for the API. To do this, you will need to add two new fields to the `Mutation` type, one for `login` and another for `signup`. This is what the final GraphQL API will look like for these two fields:

```graphql(nocopy)
type AuthPayload {  // 1
  token: String!
  user: User!
}


type Mutation {
  signup(email: String!, password: String!, name: String!): AuthPayload   // 2
  login(email: String!, password: String!): AuthPayload   // 3
}
```

1. The `AuthPayload` is a new type and it is very important to our JWT-based authentication scheme. It is the return type for both `signup` and `login` and contains a JWT token in the `token` field. The `user` field returns data for the `user` which initiated the `signup` or `login`. 

2. The `signup` mutation will create a new `user` record in the database as well as generate a `token` that they can use later. The arguments are `email`, `password` and `name`, matching those needed to create a `user` record. 

3. The `login` mutation will check the provided `email` and `password` and login an existing user. 


> **Note:** We did something different this time from the typical workflow we have been following throughout this tutorial. We designed the GraphQL fields and types in SDL _before_ writing the Nexus code for them. For many people, designing the schema outline in SDL _beforehand_ is more intuitive. So feel free to do write the SDL beforehand if you prefer. You can always convert your SDL into valid Nexus types using the [Nexus SDL converter](https://nexusjs.org/converter).

First, you will need a new file for the auth code. You will also need to install a few dependencies. `bcryptjs` is a cryptography library that helps you hash and securely store a password. `jsonwebtoken` is a library to generate and verify JSON Web Tokens.

<Instruction>

Create a new `Auth.ts` file and install the two libraries (along with their types): 

```bash(path=".../hackernews-typescript/")
touch src/graphql/Auth.ts
npm install bcryptjs@~2.4.0 jsonwebtoken@~8.5.0  
npm install --save-dev @types/bcryptjs@~2.4.0  @types/jsonwebtoken@~8.5.0
```

</Instruction>

Now you will define the types related to authentication using Nexus. 

<Instruction>

Define the `AuthPayLoad` type in `Auth.ts`: 

```typescript(path="../hackernews-typescript/src/graphql/Auth.ts")
import { objectType } from "nexus";

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user", {
            type: "User",
        });
    },
});
```

</Instruction>

You should be sufficiently familiar by now with the Nexus syntax to understand what's going on here. Now it's time to implement the `signup` mutation. 


<Instruction>

Add the `signup` mutation and resolver in `Auth.ts` using `extendType` from Nexus:

```typescript{1-43}(path="../hackernews-typescript/src/graphql/Auth.ts")
import { objectType, extendType, nonNull, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";


export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("signup", { // 1
            type: "AuthPayload",  
            args: {  
                email: nonNull(stringArg()), 
                password: nonNull(stringArg()),
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const { email, name } = args;
                // 2
                const password = await bcrypt.hash(args.password, 10);

                // 3
                const user = await context.prisma.user.create({
                    data: { email, name, password },
                });

                // 4
                const token = jwt.sign({ userId: user.id }, APP_SECRET);

                // 5
                return {
                    token,
                    user,
                };
            },
        });
    },
});


```

</Instruction>

Let's use the good ol' numbered comments again to understand what's going on here: 

1. The `signup` mutation field returns an instace of `AuthPayLoad`. It has three arguments,  `email`, `password` and `name`, all of which are mandatory. This is the exact same method signature you saw before for the `signup` mutation. 
2. In the `signup` mutation resolver, the first thing to do is hash the `User`'s password using the `bcryptjs` library.
3. The next step is to use your Prisma Client instance to store the new `User` record in the database.
4. You're then generating a JSON Web Token which is signed with an `APP_SECRET`. The information encoded in the token is the `id` of the newly created user. You still need to create and export this `APP_SECRET`, something we will cover soon.
5. Finally, you return the `token` and the `user` in an object that adheres to the shape of the `AuthPayload` type that you just defined.

You'll notice that your IDE raises a few errors right now, like the `APP_SECRET` import at the top. But these will get fixed soon. Now continue by adding the `login` mutation. To do this you don't need to call `extendType` again, you just add a `login` field alongside the existing `signup` field in the `definition(t)` call inside `AuthMutation`.


<Instruction>

In `Auth.ts`, extend the definition of `mutation` to add a new `login` field: 

```typescript{5-38}(path="../hackernews-typescript/src/graphql/Auth.ts")
export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        
        t.nonNull.field("login", { 
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                // 1
                const user = await context.prisma.user.findUnique({
                    where: { email: args.email },
                });
                if (!user) {
                    throw new Error("No such user found");
                }

                // 2
                const valid = await bcrypt.compare(
                    args.password,
                    user.password,
                );
                if (!valid) {
                    throw new Error("Invalid password");
                }

                // 3
                const token = jwt.sign({ userId: user.id }, APP_SECRET);

                // 4
                return {
                    token,
                    user,
                };
            },
        });

        t.nonNull.field("signup", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const { email, name } = args;

                const password = await bcrypt.hash(args.password, 10);

                const user = await context.prisma.user.create({
                    data: { email, name, password },
                });

                const token = jwt.sign({ userId: user.id }, APP_SECRET);

                return {
                    token,
                    user,
                };
            },
        });
    },
});

```

</Instruction>

You will notice that the signature for the `login` field is quite similar to that of `signup`. Let's go through the numbered comments: 


1. Instead of _creating_ a new `User` object, you're now using your Prisma Client instance to retrieve an existing `User` record by the `email` address that was sent along as an
   argument in the `login` mutation. If no `User` with that email address was found, you're returning a corresponding error.
2. The next step is to compare the provided password with the one that is stored in the database. If the two don't match, you're returning an error as well.
3. You are creating a JWT token, just like `signup`. The information encoded in the token you are issuing contains the `id` of the user trying to log in.  
4. In the end, you're returning `token` and `user` again.

> **Note:** Notice that resolvers for both `login` and `signup` are `async`. This is because you need to perform a few asynchronous operations and make use of the `await` keyword in these resolvers. 


Before these new mutations can work, you need to do a few small things. First add the `graphql/Auth.ts` exports to `index.ts`.

<Instruction>

Add the `graphql/Auth.ts` exports to `index.ts` so Nexus can generate the new mutations:

```typescript{3}(path="../hackernews-typescript/src/graphql/index.ts")
export * from "./Link";
export * from "./User";
export * from "./Auth";
```
</Instruction>


Now create the `src/utils/auth.ts` file and export the `APP_SECRET` constant. 

<Instruction>

Create a `src/utils/auth.ts` file to store some utilities needed for authentication (and authorization):


```bash(path=".../hackernews-node")
mkdir src/utils
touch src/utils/auth.ts
```

</Instruction>

<Instruction>


Export the `APP_SECRET` in the file you just created:

```typescript(path=".../hackernews-typescript/src/utils/auth.ts")
export const APP_SECRET = "GraphQL-is-aw3some";
```

</Instruction>

This `APP_SECRET` is well...a secret! It's used to sign and verify the authenticity of the JWTs generated by your server. Its value can really be anything as long as it is sufficiently long and random so that an attacker can't easily guess what it is. 

> **Note:** It's very important that you protect the value of `APP_SECRET`. If any third party acquires this value they can trivially forge JWTs and break your authentication scheme. Secrets like this should *never* be kept inside the code itself in a production application as you risk leaking it with version control. You could use something like an `.env` file to securely store the value of `APP_SECRET`. However, since this is a tutorial, we decided to keep things simple and not take these measures. 

Whew, the `login` and `signup` mutation is finally complete 🎉. You should see the new mutation updated in your `schema.graphql` file. 

### Verifying client side JWT tokens 

In the last section you implemented the `login` and `signup` mutation, both of which return a valid JWT token of the user (along with data about the user) as a `AuthPayLoad` type object. However, there's one important piece of the puzzle still missing: allowing the server verify a request with a valid JWT token attached to it.

In order to do this, we are going to use the [HTTP Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization). Essentially, any API request from a client with a valid JWT token will include a header called `Authorization` which will contain said token. The server will then verify the JWT token before proceeding with the API request. In case of an invalid token, the server will return an error. 


<Instruction>

Write the following utility function in `src/utils/auth.ts` to decode a JWT token:

```typescript{1,5-17}(path=".../hackernews-typescript/src/utils/auth.ts")
import * as jwt from "jsonwebtoken";

export const APP_SECRET = "GraphQL-is-aw3some";

export interface AuthTokenPayload {  // 1
    userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload { // 2
    const token = authHeader.replace("Bearer ", "");  // 3

    if (!token) {
        throw new Error("No token found");
    }
    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;  // 4
}
```

</Instruction>

Let's understand what is going on here: 

1. `AuthTokenPayload` interface is based on the shape of the JWT token that we issued during `signup` and `login`. When the server decodes an issued token, it should expect a response in this format. 

2. The `decodeAuthHeader` function takes the `Authorization` header and parses it to return the payload of the JWT. 

3. The `Authorization` header, contains the `type` or scheme of authorization followed by the token. In our case, `"Bearer"` represents the authorization scheme. Since the server is only interested in the JWT token itself, you can get rid of the `"Bearer"` and keep only the token. _If you're interested to learn more, here is a nice [stackoverflow question](https://security.stackexchange.com/q/108662) explaining this convention_. 

4. The `jwt.verify()` functions decodes the token. It also needs access to the secret (or a public key) which was used to sign the token. 



There's one more issue to solve. The GraphQL resolvers don't have access to the `request` headers and have no way to get the token from the `Authorization` header. To solve this, you are going to add the `userId` received from the decoded JWT to the  GraphQL `context`, so that every resolver has access to the `userId`. 

<Instruction>

Update `src/context.ts` to add the decoded JWT from the request header:


```typescript{2-3,9,12-22}(path=".../hackernews-typescript/src/context.ts")
import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";   
import { Request } from "express";  

export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    userId?: number;  // 1
}

export const context = ({ req }: { req: Request }): Context => {   // 2
    const token =
        req && req.headers.authorization
            ? decodeAuthHeader(req.headers.authorization)
            : null;

    return {  
        prisma,
        userId: token?.userId, 
    };
};
```

</Instruction>


Let's understand the changes made to `context.ts`: 


1. The context `interface` is updated to have a `userId` type. This is optional because no `userId` will be attached to the `context` when requests are sent without the `Authorization` header. 

2. Instead of being an object, `context` is now a _function_ which needs to be executed to return the actual object of type `Context`. Apollo Server is smart enough to recognize this change from object to function and will execute the function (with some arguments, like the HTTP request) to resolve the final context object. 


### Updating the `post` mutation

Now that there is an authentication scheme in place, you are going to make two changes to the `post` mutation. Firstly you are going to enforce only authenticated users can create a new `Link` record using the `post` mutation. Secondly, in your database, you are going to connect the `Link`  with the `User` who is posting through the `postedBy` relation.

<Instruction>

Update the implementation of the `post` resolver in `src/graphql/Link.ts`:

```typescript{11-26}(path="../hackernews-typescript/src/graphql/Link.ts")

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {   
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {  // 1
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } },  // 2
                    },
                });

                return newLink;
            },
        });
    },
});
```

</Instruction>

Let's go through the two changes: 

1. If the `userId` does not exist in `context`, the resolver raises an error. As a result, only authorized users can add a new `link`.  

2. To connect the `User` with the `Link`, you are specifying a value for the `postedBy` field (which represents this `Link` to `User` relation). The `connect` operator is used by Prisma to specify which `user` the newly created `link` should be associated with. 

At long last, the code for this chapter is complete! This was a pretty long chapter, give yourself a congratulations for finishing it. Now it's time to test the authentication feature. 

### Testing the authentication flow

The very first thing you'll do is test the `signup` mutation and thereby create a new `User` in the database.

<Instruction>

Go to Apollo Studio Explorer at http://localhost:3000/  and send the following mutation to create a new `User`:

```graphql
mutation {
  signup(name: "Alice", email: "alice@prisma.io", password: "graphql") {
    token
    user {
      id
    }
  }
}
```

</Instruction>

You should see a response like this:

```json(nocopy)
{
  "data": {
    "signup": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY0MDM0MDY0NX0.MOcEmbbywdYw3GTNxpdLda1XX4WsyWFZls09E_Ot6D0",
      "user": {
        "id": 1
      }
    }
  }
}

```

<Instruction>

From the server's response, copy the authentication `token`. Now in the `Headers` tab in the bottom middle, add a new header. The name of the header will be `Authorization` and value will be "`Bearer __TOKEN__`", where "`__TOKEN__`" should be replaced with *your* auth token.  Make sure that the header is enabled by clicking the blue tick mark. 


</Instruction>

![Adding Authorization Header](https://imgur.com/rB5glDx.png)


Now whenever you're sending a query/mutation, it will carry the JWT token.

<Instruction>

With the `Authorization` header in place, send the following mutation to your GraphQL server:

```graphql
mutation {
  post(url: "nexusjs.org", description: "Code-First GraphQL schemas for JavaScript/TypeScript") {
    id
    description
    url
    postedBy {
      id
      name
      email
    }
  }
}
```

</Instruction>


When your server receives this mutation, it invokes the `post` resolver and therefore validates the provided JWT. Additionally, the new `Link` that was created is now connected to
the `User` for which you previously sent the `signup` mutation.

<Instruction>

To verify everything worked, you can send the following `login` mutation, which also requests the links created by the user you created just now. Verify that the `links` field contains the link you just created:

```graphql
mutation {
  login(email: "alice@prisma.io", password: "graphql") {
    token
    user {
      email
      links {
        url
        description
      }
    }
  }
}
```

</Instruction>

The response will look similar to this:

```json(nocopy)
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTYzNzU3MDM1N30.LlbzC-vHtvb1kGCpRAf_lQS4TWUyTO5VeaDoBt9lzD8",
      "user": {
        "email": "alice@prisma.io",
        "links": [
          {
            "url": "nexusjs.org",
            "description": "Code-First GraphQL schemas for JavaScript/TypeScript"
          }
        ]
      }
    }
  }
}
```

![Testing Auth Workflow](https://i.imgur.com/c8OkTyM.gif)

Moreover, if you try to create a new `link` with the `Authorization` header absent or disabled, you should get an error like this:

```json(nocopy)
{
  "errors": [
    {
      "message": "Cannot post without logging in.",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "post"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "stacktrace": [
            "Error: Cannot post without logging in.",
            ...  // long stacktrace
          ]
        }
      }
    }
  ],
  "data": null
}

```

> **Note:** These error messages are a bit long. If you want more readable errors for your end users, check out [this article](https://www.apollographql.com/docs/apollo-server/data/errors/#throwing-errors) on throwing errors in the Apollo documentaiton.

### Exploring your data in Prisma Studio

Prisma ships with a powerful database GUI where you can interact with your data: [Prisma Studio](https://github.com/prisma/studio).

Prisma Studio is different from a typical database GUI (such as [TablePlus](https://tableplus.com/)) in that it provides a layer of abstraction which allows you to see your data represented as it is
in your Prisma data model. So not only can you browse, you can _explore the relations_ between different models (tables) as well. You can also filter results as well as create, update and delete data. 

This is one of the several ways that Prisma bridges the gap between how you structure and interact with your data in your application and how it is actually structured and represented in the
underlying database. One major benefit of this is that it helps you to build intuition and understanding of these two linked but separate layers over time.

Let's run Prisma Studio and see it in action!

<Instruction>

Run the following command in your terminal:

```bash(path=".../hackernews-typescript")
npx prisma studio
```

</Instruction>

Running the command should open a tab in your browser automatically (running on `http://localhost:5555`) where you will see the following interface. Notice that you can open multiple tabs and explore both the `Link` and `User` model, along with the relation between them.

<Instruction>

Explore Prisma studio and try out different things. Explore the relation between `Link` and `User` through the data browser. Try creating and deleting records, or modifying existing ones. 

</Instruction>


![Explore Data Prisma Studio](https://i.imgur.com/tmwOCDd.gif)

