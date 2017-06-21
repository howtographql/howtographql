# Backend - Scala / Sangria


## Structure

1. Introduction
    - Motivation
    - What is a GraphQL Server?
    - Schema-Driven Development
2. Getting Started
    - Defining the Schema
    - Install Dependencies
    - Setup Server
    - Testing with Playgrounds
3. Queries 
    - Query Resolvers
    - Returning Links
4. Mutations
    - Resolvers with Arguments
    - Creating Links
5. Connectors
    - Connecting Mongo DB
    - Using Data Loaders
6. More Mutations
    - Voting for Links
7. Authentication
8. Error Handling
9. Subscriptions
    - Updating the Schema
    - PubSub Events
10. Filtering
11. Pagination
12. Bonus: Comments

## Notes

- 4 major parts: Schema, Resolvers, Models, and Connectors
- [Cheat Sheet](https://raw.githubusercontent.com/sogko/graphql-shorthand-notation-cheat-sheet/master/graphql-shorthand-notation-cheat-sheet.png)


## HN Example

### Features

- Display list of links (incl pagination)
- User login
- Posting new links
- Up- / downvoting links
- [Optional]: Adding comments


### Schema

```graphql
type Query {
  allLinks(filter: LinkFilter, orderBy: LinkOrderBy, skip: Int, first: Int): [Link!]!
  _allLinksMeta: _QueryMeta!
}

type Mutation {
  signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  createUser(name: String!, authProvider: AuthProviderSignupData!): User
  createLink(description: String!, url: String!, postedById: ID): Link
  createVote(linkId: ID, userId: ID): Vote
}

type Subscription {
  Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
  Vote(filter: VoteSubscriptionFilter): VoteSubscriptionPayload
}

interface Node {
  id: ID!
}

type User implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
  email: String @isUnique
  password: String
}

type Link implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  url: String!
  description: String!
  postedBy: User! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Vote implements Node {
  id: ID! @isUnique
  createdAt: DateTime!
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}

input AuthProviderSignupData {
  email: AUTH_PROVIDER_EMAIL
}

input AUTH_PROVIDER_EMAIL {
  email: String!
  password: String!
}

input LinkSubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}

input VoteSubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}

input LinkFilter {
  OR: [LinkFilter!]
  description_contains: String
  url_contains: String
}

type SigninPayload {
  token: String
  user: User
}

type LinkSubscriptionPayload {
  mutation: _ModelMutationType!
  node: Link
  updatedFields: [String!]
}

type VoteSubscriptionPayload {
  mutation: _ModelMutationType!
  node: Vote
  updatedFields: [String!]
}

enum LinkOrderBy {
  createdAt_ASC
  createdAt_DESC
}

enum _ModelMutationType {
  CREATED
  UPDATED
  DELETED
}

type _QueryMeta {
  count: Int!
}

scalar DateTime
```
