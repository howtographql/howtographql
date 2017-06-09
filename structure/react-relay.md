# Frontend - Relay

**Example:** Simple Hackernews Clone

## Structure

1. Intro
    - Motivation / Demo
    - Why a GraphQL client?
    - Apollo vs Relay
    - Relay overview
        - Build-time optimizations
        - GraphQL Fragments + Query Renderers
2. Getting Started
    - Backend
        - Create Graphcool backend 
        - Add initial data (CLI) (add note to verify in Playground)
    - Frontend
        - Create app with: `create-react-app`
        - Install dependencies
        - `yarn eject`
        - Configure Babel
3. Display list of links
    - React Components + Colocated Fragments
    - `QueryRenderer` at the root
    - Render results
    - Inspect client-server communication
4. Authentication (Email + PW)
    - Enable Auth Provider
    - Implement login + signup mutations
    - [Set permissions for creating and deleting links]
5. Creating new links
    - Define mutation in Playground
    - Write Mutation with Relay
    - Update store with `optimisticUpdater` and `updater` 
6. Voting on links
    - Write Mutation with Relay
    - Update store with `optimisticUpdater` and `updater` 
7. Routing
    - Add route for search 
    - Setup routes for login, display link list, create link, link details
8. Search
    - Queries with filter
9. Pagination
    - Limit/Offset vs Cursor 
    - Load chunks of lists
10. Subscriptions
    - Subscribe to new links + votes
11. Summary 
12. Bonus: Comments


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
