---
title: Getting Started
question: Which of the following packages allows converting a string in the GraphQL Schema Definition Language into a schema object?
answers: ["body-parser", "graphql-tools", "apollo-server-express", "express"]
correctAnswer: 1
description: Setup your GraphQL server and run it for the first time
---

### Defining the Schema

You'll start by defining the schema. As in previous sections, you'll do that by using the  [GraphQL Schema Definition Language](https://www.graph.cool/docs/faq/graphql-sdl-schema-definition-language-kr84dktnp0/), which is generally a much simpler and flexible approach than manually building the schema objects yourself (though you can certainly do that if you want as well!).

Here you're going to build the backend for a [Hackernews](https://news.ycombinator.com/) clone, so start with the most important piece of data: the `Link` type.

```
type Link {
  id: ID!
  url: String!
}
```

> **Note:** If you've followed the frontend tutorials, you may notice that now you have to manually specify the `id` fields, since Graphcool won't automatically generate them anymore. You'll also not use directives such as `@relation` and `@isUnique` now, as those are specific to Graphcool as well. This time it will be just plain GraphQL.



> **Bonus**: there's a super useful [](https://raw.githubusercontent.com/sogko/graphql-shorthand-notation-cheat-sheet/master/graphql-shorthand-notation-cheat-sheet.png)[GraphQL Cheat Sheet](https://github.com/sogko/graphql-schema-language-cheat-sheet) for building schemas. Check it out!

### Install Dependencies

It's time to start creating your project.


<Instruction>

**Step 1**: First, you'll need is to have Node.js installed on your machine. If you don't yet, make sure to do it [now](https://nodejs.org/en/). Note that the code samples here assume the latest versions of Node.js, with ES6 support, so it's best if that's what you have as well.

</Instruction>

<Instruction>

**Step 2**: Setup your **package.json** by typing `npm init -y` in the terminal, inside the folder of your choice.

</Instruction>

<Instruction>

**Step 3**: Install the following dependencies:

```bash(path=".../hackernews-graphql-js")
npm install -save express body-parser apollo-server-express graphql-tools graphql
```

</Instruction>

Don't worry if you're unfamiliar with some of these packages, we'll explain what each of them are as we use them.

### Setup Server

<Instruction>

Start by creating a file at `src/schema/index.js` for your schema definition, like this:

```js(path=".../hackernews-graphql-js/src/schema/index.js")
const {makeExecutableSchema} = require('graphql-tools');

// Define your types here.
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
  }
`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({typeDefs});
```

</Instruction>

The [graphql-tools](http://npmjs.com/package/graphql-tools) package, as the name indicates, provides several tools that help build GraphQL servers. The one you're using here is `makeExecutableSchema,` which takes a string in the schema definition language and returns a complete `GraphQLSchema` object to be used by your server.

<Instruction>

Now create the main server file at `src/index.js`, with the following content:

```js(path=".../hackernews-graphql-js/src/index.js")
const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress} = require('apollo-server-express');

const schema = require('./schema');

var app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Hackernews GraphQL server running on port ${PORT}.`)
});
```

</Instruction>

<Instruction>

You can try running the server now with:

```bash(path=".../hackernews-graphql-js")
node ./src/index.js
```

</Instruction>

If you do this, you'll actually get an error saying: `Must provide schema definition with query type or a type named Query`. That's because you've defined a type in your schema, but no queries yet. 
