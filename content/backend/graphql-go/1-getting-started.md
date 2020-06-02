---
title: Getting Started
pageTitle: "Building a GraphQL Server with Go Backend Tutorial"
description: "Creating an app with gqlgen"
---

## What are you going to build?
In this tutorial we are going to create a Hackernews clone with Go and gqlgen, So our API will be able to handle registration, authentication, submitting links and getting list of links.

## Project Setup <a name="project-setup"></a>

<Instruction>
Create a directory for project and initialize go modules file:
```bash
go mod init github.com/[username]/hackernews
```

after that use ‍‍gqlgen `init` command to setup a gqlgen project.
```
go run github.com/99designs/gqlgen init
```
</Instruction>

Here is a description from gqlgen about the generated files:
- `gqlgen.yml` — The gqlgen config file, knobs for controlling the generated code.
- `graph/generated/generated.go` — The GraphQL execution runtime, the bulk of the generated code.
- `graph/model/models_gen.go` — Generated models required to build the graph. Often you will override these with your own models. Still very useful for input types.
- `graph/schema.resolvers.go` — This is where your application code lives. generated.go will call into this to get the data the user has requested.
- `server.go` — This is a minimal entry point that sets up an http.Handler to the generated GraphQL server.
  start the server with `go run server.go` and open your browser and you should see the graphql playground, So setup is right!

## Defining Our Schema <a name="defining-out-schema"></a>
Now let's start with defining schema we need for our API.
We have two types Link and User each of them for representing Link and User to client, a `links` Query to return list of Links. an input for creating new links and mutation for creating link. we also need mutations to for auth system which includes Login, createUser, refreshToken(I'll explain them later) then run the command below to regenerate graphql models.
```js
type Link {
  id: ID!
  title: String!
  address: String!
  user: User!
}

type User {
  id: ID!
  name: String!
}

type Query {
  links: [Link!]!
}

input NewLink {
  title: String!
  address: String!
}

input RefreshTokenInput{
  token: String!
}

input NewUser {
  username: String!
  password: String!
}

input Login {
  username: String!
  password: String!
}

type Mutation {
  createLink(input: NewLink!): Link!
  createUser(input: NewUser!): String!
  login(input: Login!): String!
  # we'll talk about this in authentication section
  refreshToken(input: RefreshTokenInput!): String!
}
```

<Instruction>

Now run the following command to regenerate files;
```
go run github.com/99designs/gqlgen generate
```
</Instruction>
After gqlgen generated code for us, we'll have to implement our schema, we do that in ‍‍‍‍`schema.resolvers.go`, as you see there is functions for Queries and Mutations we defined in our schema.
