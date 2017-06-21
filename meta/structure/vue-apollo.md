# Frontent - Vue + Apollo

**Example:** Simple Hackernews Clone

## Structure

1. Introduction
    - Motivation
    - Why a GraphQL client?
    - Apollo vs Relay
    - Apollo Overview
2. Getting Started
    - Backend
        - Create Graphcool Backend 
        - Populate Database
    - Frontend
        - Create Project 
        - Install Dependencies
        - Configure Apollo
        - The `ApolloClient`
3. Queries
    - Query: Fetching Links
    - Queries with Apollo
    - Rendering Query Results
4. Mutations
    - Mutation: Creating Links
    - Mutations with Apollo
    - Updating the Cache
5. Authentication
    - Backend Setup
    - Signup & Login
6. Routing
    - `react-router` with Apollo
7. Mote Mutations
    - Mutation: Vote for Links
    - Mutations with Apollo
    - Updating the Cache
8. Filtering
    - Search Links
9. Subscriptions
    - Subscribe to new Links
    - Subscribe to new Votes
10. Pagination
    - Limit/Offset vs Cursor 
    - Load Chunks of Links
11. Summary 
12. Bonus: Comments


## HN Example

### Features

- Display list of links (incl pagination)
- User login
- Posting new links
- Voting for links
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


