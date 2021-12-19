---
title: Connecting The Server and Database with Prisma Client
pageTitle: 'Connecting a Database to a GraphQL Server with Prisma Tutorial'
description: 'Learn how to add a database to your GraphQL server. The database is accessed using Prisma Client.'
question: 'What is the purpose of the context argument in GraphQL resolvers?'
answers: ['It always provides access to a database', 'It carries the query arguments', 'It is used for authentication', 'It lets resolvers communicate with each other']
correctAnswer: 3
---

In this section, you're going to learn how to connect your GraphQL server to your database using [Prisma](https://www.prisma.io), which provides the interface to your database. This connection is
implemented via [Prisma Client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client), which you used last chapter for the `link.findMany()` and `link.create()` queries. 

### Wiring up your GraphQL schema with Prisma Client

The first thing you need to do is import your generated Prisma Client library and wire up the GraphQL server so that you can access the database queries that your new Prisma Client exposes. For this you will use the third argument in a resolver function, the `context` argument. 


Remember how we said earlier that all GraphQL resolver functions _always_ receive four arguments? You've already learned about `parent` and `args`, now it's time to get familiar with the `context` argument!

The `context` argument is a plain JavaScript object that every resolver in the resolver chain can read from and write to. Thus, it is basically a means for resolvers to communicate. A really helpful
feature is that you can already write to the `context` at the moment when the GraphQL server itself is being initialized.

This means that you can attach an instance of Prisma Client to the `context` when initializing the server and then access it from inside our resolvers via the `context` argument!

That's all a bit theoretical, so let's see how it looks in action 💻

### Hooking up `PrismaClient` to the resolver context

For code modularity, you will create a dedicated file for initializing the context. This will be called `context.ts`. 

<Instruction>

In the `src` folder, create the `context.ts` file:

```bash(path=".../hackernews-typescript/")
touch src/context.ts 

```
</Instruction>

Now you will create the `context` object and attach the `PrismaClient` to it. 


<Instruction>

Create the `context` object, along with the `Context` TypeScript interface:

```typescript(path=".../hackernews-typescript/src/context.ts")
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export interface Context {    // 1
    prisma: PrismaClient;
}

export const context: Context = {   // 2
    prisma,
};

```

</Instruction>


You're following a fairly standard TypeScript workflow here of defining a `type` or `interface` and then creating the object. Let's go through the numbered comments: 

1. First you have defined the `Context` interface, which specifies what objects will be attached to the `context` object. Right now it's just an instance of `PrismaClient`, but this can change as the project grows. 

2. You're exporting the `context` object, so that it can be imported and used by the GraphQL server.


Now, you will configure Nexus to know the type of your GraphQL context by adjusting the configuration of `makeSchema` in `src/schema.ts.` 


<Instruction>

In `src/schema.ts` add a new `contextType` object to the `makeSchema` function call:

```typescript{7-9}(path=".../hackernews-typescript/src/schema.ts")
export const schema = makeSchema({
    types,
    outputs: {
        typegen: join(__dirname, "..", "nexus-typegen.ts"), 
        schema: join(__dirname, "..", "schema.graphql"), 
    },
    contextType: {  
        module: join(__dirname, "./context.ts"),  // 1
        export: "Context",  // 2
    },
});
```

The two options you are passing to `contextType` are:

1. Path to the file (also sometimes called a module) where the context interface (or type) is exported.
2. Name of the exported interface in that module.
                                       

Now, Nexus will ensure all `context` arguments match the `Context` interface 👌. There's just one thing left to do, add the context to our server. 

<Instruction>           

Import the `context` and add it to your `ApolloServer` instance in `index.ts`:

```typescript{1,5}(path=".../hackernews-typescript/src/index.ts")    
import { context } from "./context";   

export const server = new ApolloServer({
    schema,
    context,    
});
```

Awesome! Now, the `context` object will be initialized with an instance of `PrismaClient` (as `prisma`) when 
`ApolloServer` is instantiated. So you'll now be able to access Prisma with `context.prisma` in all of your resolvers.        


### Updating the resolver functions to use your database

Finally, it’s time to refactor your resolvers. Again, we encourage you to type these changes yourself so that you can get used to Prisma’s autocompletion and how to leverage that to intuitively figure out on your own what the resolvers should be.

Since you will now be using an actual database, there's no need to keep the `links` array. So you can safely get rid of it. 

<Instruction>

Open `index.js` and remove the `links` array entirely, as well as the `idCount` variable – you don't need those anymore since the data will now be stored in an actual database.

</Instruction>


There are two resolvers that need to be updated, those for the `feed` query as well as the `post` mutation. 

<Instruction> 

Go to `src/graphql/Link.ts` and update the resolvers:

```typescript{1,8,23-30}(path="../hackernews-typescript/src/graphql/Link.ts")
export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context) {  
                return context.prisma.link.findMany();  // 1
            },
        });
    },
});

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
                const newLink = context.prisma.link.create({   // 2
                    data: {
                        description: args.description,
                        url: args.url,
                    },
                });
                return newLink;
            },
        });
    },
});

```

</Instruction>

Let's understand how these new resolvers are working:

1. You find and return all the `Link` records in your database. To do this you are using the `PrismaClient` instance available through `context.prisma`.

2. Similar to the `feed` resolver, you're simply invoking a function on the `PrismaClient` instance. You're calling the `create` method on the `Link` model from your Prisma Client API. As arguments, you're passing the data that the resolvers receive via the `args` parameter.


> *Note:** Prisma queries return [`Promise`](https://nodejs.dev/learn/understanding-javascript-promises) objects as these are asynchronous. So in both resolvers you are returning a `Promise`. This is not a problem as Apollo Server is capable of detecting and automatically resolving any `Promise` object that is returned from resolver functions. 


### Testing the new implementation

With these code changes, you can now go ahead and test if the new implementation with a database works as expected. In Apollo Studio, you can send the same `feed` query and `post` mutation as before. However, the difference is that this time the submitted links will be
persisted in your SQLite database. Therefore, even if you restart the server, the `feed` query will return previously created links.


### Understanding `PrismaClient`


The `PrismaClient` instance has access to _all_ of your database models, effectively allowing you to do all CRUD (create, read, update, delete) operations on the data models you set up in your `schema.prisma`. 

Now, you should be able to imagine the complete system and workflow of a Prisma/GraphQL project, where your Prisma Client API exposes a number of database queries that let you read and write data in
the database. Your GraphQL resolvers will leverage Prisma Client API to perform various `query` and `mutation` operations and return the result of the execution.

So, to summarize, Prisma Client exposes a CRUD API for the models in your schema for you to read and write in your database. These methods are auto-generated based on your model definitions in
`schema.prisma`.
