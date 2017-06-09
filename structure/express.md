# Backend - Express

**Example:** Simple Hackernews Clone

## Structure

1. Introduction
    - Motivation
    - What is a GraphQL Server?
    - Schema-Driven Development
    - Using `graphql-tools`
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
    - Configuring the `SubscriptionServer`
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
type User {
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  comments: [Comment!]! @relation(name: "UsersComments")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link { 
  url: String!
  postedBy: User! @relation(name: "UsersLinks")
  comments: [Comment!]! @relation(name: "CommentsOnLink")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Comment {
  text: String!
  author: User! @relation(name: "UsersComments")
  link: Link! @relation(name: "CommentsOnLink")
}

type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```
