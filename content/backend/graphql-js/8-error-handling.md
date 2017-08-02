---
title: Error Handling
pageTitle: "Error Handling with GraphQL & Java Tutorial"
description: "Learn best practices for validation of input arguments and implementing error handling in GraphQL with Java."
question: How can you change the contents of error messages sent to GraphQL clients?
answers: ["Using the `formatError` option in the server call", "Extending a special error class from `graphql-tools`", "You need to catch the errors yourself and change their contents", "That's not allowed"]
correctAnswer: 0
---

### Schema Validation errors

Any good server should be able to handle errors well, otherwise it becomes harder and harder to maintain. Thankfully, the tools we've been using also help on this area.

In fact, if you try right now to send an invalid request to the server, such as a request with a field that doesn't exist, you'll already get a pretty good error message back. For example:

![](https://i.imgur.com/Br8oZzr.png)

This can be very helpful when building apps, as this automatic schema validation can easily help the developer find out what's wrong with his/her request.

### Application errors

Some errors will be specific to the application though. For example, let's say that `createLink` is called with the `url` field as a string, as specified by the schema, but its content doesn't follow an expected url format. You'll need to throw an error yourself in this case.

Lucky for you, all you need to do is to detect the problem and throw the error. `graphql-js` will automatically catch it and format it in the expected way for your GraphQL response.

<Instruction>

Try it out by adding this to the `createLink` resolver:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
const {URL} = require('url');

function assertValidLink ({url}) {
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Link validation error: invalid url.');
  }
}

module.exports = {
  // ...
  Mutation: {
    createLink: async (root, data, {mongo: {Links}, user}) => {
      assertValidLink(data);
      const newLink = Object.assign({postedById: user && user._id}, data)
      const response = await Links.insert(newLink);
      return Object.assign({id: response.insertedIds[0]}, newLink);
    },
  },
}
```

</Instruction>

<Instruction>

Restart the server and try creating a link with an invalid url now. You should get the error you've just created:
![](https://i.imgur.com/9Av5Flx.png)

</Instruction>

### Extra error data

Sometimes just providing an error message is not enough though. It may be useful to offer some more structured data about the error as well. Imagine a web app with a form for creating links, trying to show the error message next to the invalid field. It's hard and brittle to do that by just analyzing the message.

How about having the server also provide an object indicating the name of the field (or fields) that was invalid?

<Instruction>

First, you need to change your error object to know about this data as well, so go back to the resolver file:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

function assertValidLink ({url}) {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Link validation error: invalid url.', 'url');
  }
}
```

</Instruction>

Now you just need include your extra data in the final error response.

<Instruction>

You can do that by setting an option called `formatError` in that `graphqlExpress` call:

```js{1-1,13-13}(path=".../hackernews-graphql-js/src/index.js")
const formatError = require('./formatError');

// ...

const buildOptions = async (req, res) => {
  const user = await authenticate(req, mongo.Users);
  return {
    context: {
      dataloaders: buildDataloaders(mongo),
      mongo,
      user
    },
    formatError,
    schema,
  };
};
```

</Instruction>

<Instruction>

Now create your own `formatError` function like this:

```js(path=".../hackernews-graphql-js/src/formatError.js")
const {formatError} = require('graphql');

module.exports = error => {
  const data = formatError(error);
  const {originalError} = error;
  data.field = originalError && originalError.field;
  return data;
};
```

</Instruction>

This just calls the default `formatError` from `graphql` and adds the `field` key when present in the original error instance.

<Instruction>

Restart the server again and create another link with an invalid url. You should see the `field` key in the error data now:
![](https://i.imgur.com/z19TbWS.png)

</Instruction>