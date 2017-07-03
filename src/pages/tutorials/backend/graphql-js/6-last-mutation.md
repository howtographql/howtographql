---
title: More Mutations
---

### Voting for links

There's only one mutation left to be added: allowing users to vote for links. Update the schema definition to add it like this:

```
type Mutation {
  createLink(url: String!, description: String!): Link
  createVote(linkId: ID!): Vote
  createUser(name: String!, authProvider: AuthProviderSignupData!): User
  signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
}
```

Note that the only argument it needs is the id of the link to receive the vote. The user voting should be the currently authenticated user, which is already included in the request information, so there's no need to pass it again here.

You also need to define the `Vote` type, containing the voting user and the voted link:

```
type Vote {
  id: ID!
  user: User!
  link: Link!
}
```

Don't forget to add a new MongoDB collection in the connector file:

```
module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),
  };
}
```

Now add the resolver for this mutation:

```
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

Finally, add resolvers to fetch the full user and link data from MongoDB's `userId` and `linkId` fields.

```
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

As always, restart the server to test the new mutation via GraphiQL.
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/MV-sakMGJke_ekiDLKcw9A]
### Relating links with their votes

You can already create votes, but there's currently no way to fetch them yet! A common use case would be to fetch votes for each link using the existing `allLinks` query. For that to work you just have to change the `Link` type to have references to its votes. The final schema for `Link` should become:

```
type Link {
  id: ID!
  url: String!
  description: String!
  postedBy: User
  votes: [Vote!]!
}
```

Can you guess what comes next? A resolver for this new field! 

```
Link: {
  // ...

  votes: async ({_id}, data, {mongo: {Votes}}) => {
    return await Votes.find({linkId: _id}).toArray();
  },
},
```

If you restart your server and run `allLinks` again you should be able to access votes data for each link, for example:
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/GwnXMOTYtFjy3yGmDbnjfg]

### Relating Users with their votes

Following these same steps, you could also add a new field to make it easier to find all the votes made by the same user. Start again by the schema definition:

```
type User {
  id: ID!
  name: String!
  email: String
  password: String
  votes: [Vote!]!
}
```

Now add the resolver for this new field:

```
User: {
  // ...

  votes: async ({_id}, data, {mongo: {Votes}}) => {
    return await Votes.find({userId: _id}).toArray();
  },
},
```

And there it is! You can test it with GraphiQL again:
[Image: https://vtex.quip.com/-/blob/MYYAAAFJyue/h5A1ZYjbAKQJwe5KoZ3P4Q]