# Frontent - Apollo

**Example:** Simple Hackernews Clone

## Structure

1. Movtivation: Intro
    - Motivation / Demo
    - Why a GraphQL client?
    - Apollo vs Relay
    - Apollo overview
2. Setup: Getting Started
    - Backend
        - Create Graphcool backend 
        - Add initial data (CLI) (add note to verify in Playground)
    - Frontend
        - Create app with: `create-react-app`
        - Install dependencies
        - Configure Apollo
        - Send first query (`client.query(...)`)
3. Queries: Display list of links
    - Define query in Playground
    - Load & display with `graphql` HOC
    - Render results
4. Authentication (Email + PW)
    - Enable Auth Provider
    - Implement login + signup
    - [Set permissions for creating and deleting links]
5. Mutations: Creating new links
    - Define mutation in Playground
    - Mutation with `graphql` HOC
    - Refetch
    - Update store with `updateQuery`
6. Mutations: Voting on links
    - Mutation with `graphql` HOC
    - Update store with `updateQuery`
7. Routing
    - Add route for search 
    - Setup routes for login, display link list, create link, link details
8. Advanced queries: Search 
    - Implement query with filters 
9. Pagination
    - Limit/Offset vs Cursor 
    - Load chunks of lists
10. Subscriptions
    - Subscribe to new links + votes
12. Summary 
13. Bonus: Comments


## HN Example

### Features

- display list of links (incl pagination)
- user login
- posting new links
- up- / downvoting links
- adding comments


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
  comments: [Comment!]! @relation(name: "UsersComments")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Comment {
  text: String!
  author: User! @relation(name: "UsersComments")
  link: Link! @relation(name: "UsersComments")
}

type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

## Questions

- Should provide "starter/final"-code for each step (similar to LA)?
- How to deal with styling?
- Gamification? Actual questions / problems users need to solve?
- How to deal with different platforms?


## Backend TODO

- CLI imports
- authentication based on project.graphcool / authenticable types
- relation constraints (at most 1 vote)
- include relational meta info in subscription: https://github.com/graphcool/api-bugs/issues/96




