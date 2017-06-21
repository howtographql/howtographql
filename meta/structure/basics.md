# GraphQL Basics

## Motivation
- APIs are ubiquitous / major part of every application infrastructure
- increasing mobile usage makes efficient data loading a must  

### GraphQL is the better REST
- no more over-/underfetching
- rapid product iterations on the frontend
- thinner clients, complexity is pushed to server
= type system / schema
- insightful analytics on the backend
- more accessible with Playgrounds
- REST is a fuzzy "standard"
- evolving APIs instead of versioning
- one API for variety of clients

### Context & History
- developed for native mobile apps at Facebook (starting 2012)
- open-sourced in 2015
- other companies worked on similar ideas (Netflix, Coursera, Shopify, ...) but decided to hop on GraphQL train
- today used in production by GitHub, Twitter, ...
- mostly picked up by web communities today

### Big Picture (Architecture)
- frontend:
    - framework / platform (React, Angular, Vue,..., iOS, Android)
    - GraphQL client (Relay, Apollo)
- backend: 
    - web server
    - resolvers
    - database

### GraphQL Basics

#### Schema Definition Language (SDL)
- strong type system
- type definitions and fields
- relations
- introspection

#### Queries
- read data
- nesting

#### Mutations
- write and read data
- nesting

#### Subscriptions
- event-based realtime updates

#### Playgrounds
- interactive environment to explore API
- approachable for non-technical audience

