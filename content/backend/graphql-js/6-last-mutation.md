---
title: More Mutations
pageTitle: "Advanced Server-side Mutations with GraphQL, Javascript & NodeJS"
question: What's usually the first thing you do when you need to add a new GraphQL type or field?
answers: ["Create a new endpoint", "Update the schema definition", "Add a new resolver", "Create a new version of the API to avoid conflicts"]
correctAnswer: 1
description: Add the remaining mutation needed for your Hackernews app
---

### Voting for links

There's only one mutation left to be added: allowing users to vote for links.

<Instruction>

Update the schema definition to add it like this:

```graphql{3-3}(path=".../hackernews-graphql-js/src/schema/index.js")
type Mutation {
  createLink(url: String!, description: String!): Link
  createVote(linkId: ID!): Vote
  createUser(name: String!, authProvider: AuthProviderSignupData!): User
  signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
}
```

</Instruction>

Note that the only argument it needs is the id of the link to receive the vote. The user voting should be the currently authenticated user, which is already included in the request information, so there's no need to pass it again here.

<Instruction>

You also need to define the `Vote` type, containing the voting user and the voted link:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type Vote {
  id: ID!
  user: User!
  link: Link!
}
```

</Instruction>

<Instruction>

Don't forget to add a new MongoDB collection in the connector file:

```js{6-6}(path=".../hackernews-graphql-js/src/mongo-connector.js")
module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),
  };
}
```

</Instruction>

<Instruction>

Now add the resolver for this mutation:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
const {ObjectID} = require('mongodb')

module.exports = {
  // ...

  Mutation: {
    // ...

    createVote: async (root, data, {mongo: {Votes}, user}) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      };
      const response = await Votes.insert(newVote);
      return Object.assign({id: response.insertedIds[0]}, newVote);
    },
  },
}
```

</Instruction>

<Instruction>

Finally, add resolvers to fetch the full user and link data from MongoDB's `userId` and `linkId` fields.

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
Vote: {
  id: root => root._id || root.id,

  user: async ({userId}, data, {mongo: {Users}}) => {
    return await Users.findOne({_id: userId});
  },

  link: async ({linkId}, data, {mongo: {Links}}) => {
    return await Links.findOne({_id: linkId});
  },
},
```

</Instruction>

<Instruction>

As always, restart the server to test the new mutation via GraphiQL.
![](http://i.imgur.com/hRusO4K.png)

</Instruction>

### Relating links with their votes

You can already create votes, but there's currently no way to fetch them yet! A common use case would be to fetch votes for each link using the existing `allLinks` query. For that to work you just have to change the `Link` type to have references to its votes. 

<Instruction>

The final schema for `Link` should become:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type Link {
  id: ID!
  url: String!
  description: String!
  postedBy: User
  votes: [Vote!]!
}
```

</Instruction>

<Instruction>

Can you guess what comes next? A resolver for this new field! 

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
Link: {
  // ...

  votes: async ({_id}, data, {mongo: {Votes}}) => {
    return await Votes.find({linkId: _id}).toArray();
  },
},
```

</Instruction>

If you restart your server and run `allLinks` again you should be able to access votes data for each link, for example:
![](https://i.imgur.com/vnXA6ws.png)

### Relating Users with their votes

Following these same steps, you could also add a new field to make it easier to find all the votes made by the same user.

<Instruction>

Start again by the schema definition:

```graphql(path=".../hackernews-graphql-js/src/schema/index.js")
type User {
  id: ID!
  name: String!
  email: String
  password: String
  votes: [Vote!]!
}
```

</Instruction>

<Instruction>

Now add the resolver for this new field:

```js(path=".../hackernews-graphql-js/src/schema/resolvers.js")
User: {
  // ...

  votes: async ({_id}, data, {mongo: {Votes}}) => {
    return await Votes.find({userId: _id}).toArray();
  },
},
```

</Instruction>

And there it is! You can test it with GraphiQL again:
![](https://i.imgur.com/0H2t8zH.png)