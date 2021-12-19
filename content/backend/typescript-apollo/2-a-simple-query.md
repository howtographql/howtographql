---
title: A Simple Query
pageTitle: 'Resolving Queries with a GraphQL Server Tutorial'
description:
  'Learn how to define a GraphQL schema with Nexus, implement query resolvers and test your queries in Apollo Studio Explorer'
question: How are GraphQL queries resolved?
answers:
  [
    'With schema-driven development',
    'By invoking all available resolver functions',
    'By invoking the resolver function of the root field',
    'By invoking the resolver functions for the fields contained in the query'
  ]
correctAnswer: 3
---

In this section, you are going to implement the first API operation that provides the functionality of a Hacker News
clone: querying a feed of _links_ that were posted by other users.


### Understanding the code-first approach to GraphQL API development

Now that you understand GraphQL schemas a bit better, let's talk about the workflow you will be using when adding a new feature to the API. When working with a code-first tool like Nexus, the process will look like this:

1. Define the components of your schema (`types`, `fields`, `root` object types, etc) using Nexus. 

2. Generate the GraphQL SDL and types. 

3. Implement the corresponding _resolver functions_ for the added fields.


> **Note**: Sometimes step 1 and 2 might be iterative instead of linear. During the design and brainstorming process, it is easier to think in terms of the final GraphQL SDL than Nexus code. To convert an SDL to Nexus code, you can always use the [Nexus SDL converter](https://nexusjs.org/converter).

### Extending the schema definition with the `Link` type

Now that you know the workflow, let's write some code! Your goal is to implement a `feed` query that allows you to retrieve an array of `Link` elements. 

You will start by creating the `graphql` module to organize all your Nexus code.

<Instruction>

Open your terminal and create the `graphql` directory and the `Link.ts` and `index.ts` file inside it:

```bash(path=".../hackernews-typescript/")
mkdir src/graphql 
touch src/graphql/Link.ts
touch src/graphql/index.ts

```

</Instruction>

Now, you will define the `Link` [type](https://graphql.org/graphql-js/object-types/). To do this, you will use the `objectType` function from the `nexus` library. 

<Instruction>

Write the following code inside `src/graphql/Link.ts`:

```typescript{}(path="../hackernews-typescript/src/graphql/Link.ts")
import { objectType } from "nexus";

export const Link = objectType({
    name: "Link", // 1 
    definition(t) {  // 2
        t.nonNull.int("id"); // 3 
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5 
    },
});
```

</Instruction>

`objectType` is used to create a new `type` in your GraphQL schema. Let's dig into the syntax:

1. The `name` option defines the name of the type
2. Inside the `definition`, you can add different fields that get added to the type
3. This adds a field named `id` of type `Int`
4. This adds a field named `description` of type `String`
5. This adds a field named `url` of type `String`

Pretty straightforward, right? You’re defining a new `Link` type that represents the links that can be posted to Hacker News. Each Link has an `id`, a `description`, and a `url`. Additionally, you defined all of these fields to be not `nullable`. 

Now that you have defined the type, you need to hook it up to the `makeSchema` function that you created previously. You could import `Link` directly from `src/graphql/Link.ts`, but since there will be more types to add soon, let's create a proper module structure. This is where `index.ts` comes in. 

<Instruction>

Write the following export in `graphql/index.ts`:

```typescript{1}(path="../hackernews-typescript/src/graphql/index.ts")
export * from "./Link"; 
```

</Instruction>

Since `index.js` or `index.ts` is accepted as the default entry point to a folder/module in Node.js, you can export everything from the `graphql` folder here. You can learn more about this behavior in the [Node.js docs](https://nodejs.org/api/modules.html#folders-as-modules).

Now update `makeSchema` to use all the imports coming in from the `src/graphql` module. 

<Instruction>

Import `src/graphql` in `src/schema.ts`:

```typescript{3,6}(path="../hackernews-typescript/src/schema.ts")
import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./graphql";   // 1

export const schema = makeSchema({
    types,   // 2
    outputs: {
        typegen: join(__dirname, "..", "nexus-typegen.ts"), 
        schema: join(__dirname, "..", "schema.graphql"), 
    },
});
```

</Instruction>

Let's go through the changes marked with comments:

1. You are importing the `graphql` model which exports the `Link` object type through `index.ts`. The import is named `types`. 

2. You are passing `types` to the `makeSchema` function. Nexus will do its thing to generate the SDL from this. 

Now let's take a look at what has changed in `schema.graphql`: 

```graphql{1-5}(path=".../hackernews-typescript/schema.graphql"&nocopy)
type Link {
  description: String!
  id: Int!
  url: String!
}

type Query {
  ok: Boolean!
}

```


> **Note**: If you have a terminal running with `npm run dev`, your schema should get updated automatically. Otherwise, you can always run `npm run generate` to make Nexus regenerate your schema. 

If you take a look at `nexus-typegen.ts`, you will see that it has a new `Link` interface as well. This is really convenient because the interface signature is identical to that of the `Link` type in your GraphQL schema. 

```typescript{2-6}(path=".../hackernews-typescript/nexus-typegen.ts"&nocopy)
export interface NexusGenObjects {
  Link: { // root type
    description: string; // String!
    id: number; // Int!
    url: string; // String!
  }
  Query: {};
}
```

> **Note**: One of the major advantages of the code-first approach is that you don't have to worry about having your GraphQL types and your TypeScript types going out of sync. Since Nexus is the source of truth that generates both, there is no risk of the two mismatching. 

### Implementing the feed query

Now that the `Link` type is ready, you will create a `feed` query to return all the created `link` objects. 

<Instruction>

Make the following changes to implement the `feed` query in `src/graphql/Link.ts`:

```typescript{1-2,13-37}(path="../hackernews-typescript/src/graphql/Link.ts")
import { extendType, objectType } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";  

export const Link = objectType({
    name: "Link", // <- Name of your type
    definition(t) {
        t.nonNull.int("id"); 
        t.nonNull.string("description"); 
        t.nonNull.string("url"); 
    },
});

let links: NexusGenObjects["Link"][]= [   // 1
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",
            resolve(parent, args, context, info) {    // 4
                return links;
            },
        });
    },
});
```

</Instruction>


Alright, a lot of things are happening here. Let's go through the numbered comments to understand what's going on: 

1. The `links` variable is used to store the links at runtime. For now, everything is stored only _in-memory_ rather than being persisted in a database. You're also using the `Link` interface generated by Nexus to define the type of the `links` variable as an array of `Link` objects.

2. You are extending the `Query` _root type_ and adding a new _root field_ to it called `feed`.  

3. You define the return type of the `feed` query as a _not nullable_ array of link type objects (In the SDL the return type will look like this: `[Link!]!`). 

4. `resolve` is the name of the _resolver function_ of the `feed` query. A resolver is the _implementation_ for a GraphQL field. Every field on each _type_ (including the _root types_) has a _resolver function_ which is executed to get the return value when fetching that _type_. For now, our resolver implementation is very simple, it just returns the `links` array. The resolve function has four arguments, `parent`, `args`, `context` and `info`. We will get to these later.

> **Note**: You might be wondering why you don't have to implement resolvers for `id`, `description` and `url` field for the `Link` type. This will be clarified at the end of the chapter. 

Let's check out the changes in the GraphQL schema:

```graphql{8}(path=".../hackernews-typescript/schema.graphql"&nocopy)
type Link {
  description: String!
  id: Int!
  url: String!
}

type Query {
  feed: [Link!]!
}
```

The `Query` _root type_ has two changes. There is a new `feed` field. Now that you have added a custom field to the `Query` type, Nexus is no longer providing a default `ok` field, so that has been removed. 


In Apollo Studio's documentation window, you should see the feed query as well. 

Try out the code you wrote by sending the following query:

```graphql
query {
  feed {
    id
    url
    description
  }
}
```

Awesome, the server responds with the data you defined in `links`:


```json(nocopy)
{
  "data": {
    "feed": [
      {
        "id": 1,
        "description": "Fullstack tutorial for GraphQL",
        "url": "www.howtographql.com"
      },
      {
        "id": 2,
        "description": "GraphQL official website",
        "url": "graphql.org"
      }
    ]
  }
}
```

![Apollo Studio Feed Query](https://i.imgur.com/AokalnP.png)


### The query resolution process

Let's now quickly talk about how a GraphQL server actually resolves incoming queries. As you already saw, a GraphQL
query consists of a number of _fields_ that have their source in the type definitions of the GraphQL schema.

Let's consider the query from above again:

```graphql(nocopy)
query {
  feed {
    id
    url
    description
  }
}
```

All four fields specified in the query (`feed`, `id`, `url`, and `description`) can also be found inside the schema
definition. Now, you also learned that _every_ field inside the schema definition is backed by one resolver function
whose responsibility it is to return the data for precisely that field.

Can you imagine what the query resolution process looks like now? Effectively, all the GraphQL server has to do is
invoke all resolver functions for the fields that are contained in the query and then package up the response according
to the query's shape. Query resolution thus merely becomes a process of orchestrating the invocation of resolver
functions!


It's important to note that every GraphQL resolver function actually receives _four_ input arguments. The first argument, commonly called `parent` (or sometimes `root`) is the result of the previous _resolver execution
level_. Hang on, what does that mean? 🤔

Well, as you already saw, GraphQL queries can be _nested_. Each level of nesting (i.e. nested curly braces) corresponds
to one resolver execution level. The above query therefore has two of these execution levels.

On the first level, it invokes the `feed` resolver and returns the entire data stored in `links`. For the second
execution level, the GraphQL server is smart enough to invoke the resolvers of the `Link` type (because thanks to the
schema, it knows that `feed` returns a list/array of `Link` elements) for each element inside the list that was returned on
the previous resolver level. Therefore, in the resolvers for the three fields in the `Link` type  (`id`, `description` and `url`), the incoming `parent` object is the
element inside the `links` array.

> **Note 1:** The word `list` and `array` are being used fairly interchangeably. 

> **Note 2:** If you're having a hard time wrapping your head around the GraphQL execution  process and order of execution, a nice example is available [here](https://www.howtographql.com/advanced/1-server/).

#### Understanding trivial resolvers

One thing that's still a bit weird in the implementation right now is the lack of resolvers for the fields in the `Link` type, namely `id`, `description` and `url`.

The reason that these fields do not need explicit resolver implementations is that the GraphQL type system is smart enough to automatically infer these resolvers. For example, the GraphQL server knows that the `Link` type contains the `id` field. So it will automatically resolve this field with the `id` variable available to each object in the `link` array.

In fact, many other GraphQL libraries will also let you omit _trivial resolvers_ and will just assume that if a resolver isn't provided for a field, that a property of the same name should be read and returned.

> **Note:** To learn more about trivial resolvers, check out the [GrahQL docs](https://graphql.org/learn/execution/#trivial-resolvers).

