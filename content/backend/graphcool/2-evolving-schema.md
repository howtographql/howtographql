---
title: Evolving the Schema with the CLI
pageTitle: "GraphQL Schema Migrations with the Graphcool CLI Tutorial"
description: "Learn best practices for using the Graphcool CLI and how it can be used to evolve to the GraphQL schema."
---

In this chapter, you'll evolve the schema of the Graphcool project by adding the additional types and relations that you need for the Hackernews clone.

Note that all the actions that you can do with the CLI, you can also perform using the web-based console. In this tutorial, we focus on the CLI so you learn how to manage your Graphcool project with a local workflow.

### Adding new type definitions to the schema

The first thing you have to do is update the schema of your project. You can do that by simply making changes to your project file: `project.graphcool`.

<Instruction>

Open `project.graphcool`, first add the `Vote` type and subsequently update the `User` and `Link` types to look as follows:

```graphql
type User implements Node {
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link implements Node {
  createdAt: DateTime!
  description: String!
  id: ID! @isUnique
  updatedAt: DateTime!
  url: String!
  postedBy: User @relation(name: "UsersLinks")
  votes: [Vote!] @relation(name: "VotesOnLink")
}

type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```

</Instruction> 

All you do here is adding the types to get the full schema that we introduced in the previous chapter.


### Syncing with the remote schema

For these changes to take effect, you now need to "sync" with the schema that's still stored on the server. You can use the `graphcool push` command for that.

> Before you're performing `graphcool push`, you can also run the `graphcool status` command that will output the list of potential changes without actually performing them.

<Instruction>

In the terminal, navigate to the directory where `project.graphcool` is located and execute the following command:

```bash
graphcool push
```

</Instruction>

The CLI output will provide the information about all changes that were applied to the schema on the server-side:

```bash(nocopy)
$ graphcool push
 ✔ Your schema was successfully updated. Here are the changes: 

  | (+)  A new type with the name `Vote` is created.
  |
  | (*)  The type `User` is updated.
  ├── (+)  A new field with the name `name` and type `String!` is created.
  |
  | (+)  The relation `UsersVotes` is created. It connects the type `User` with the type `Vote`.
  |
  | (+)  The relation `UsersLinks` is created. It connects the type `User` with the type `Link`.
  |
  | (+)  The relation `VotesOnLink` is created. It connects the type `Link` with the type `Vote`.

Your project file project.graphcool was updated. Reload it in your editor if needed.
```

If you want to verify that your project's schema was actually updated, you can open the schema editor in the [Graphcool Console](https://console.graph.cool) and check if the new types and relations are now actually available:

![](http://imgur.com/tZYEBCj.png)



