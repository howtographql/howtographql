---
title: Authentication & Permissions with Graphcool
pageTitle: "Authentication & Authorization in GraphQL Tutorial"
description: "Learn best practices for implementing email-password authentication and defining permission / authorization rules on a GraphQL server with Graphcool." 
---

Authentication and data access permissions are critical features for every production application. In this chapter, you'll learn how you can enable authentication in your project and leverage the powerful Graphcool permission system to specify data access rules.

Here's a list of the requirements that we have for the app:

- Only authenticated should be able to create new links
- Only the user who posted a link should be able to update or delete it; in the case of updating, only the `description` of a link can be changed - not the `url`
- Only authenticated users can vote on links
- Only a user who submitted a vote can revoke (i.e. delete) that vote

Let's see how you can implement these!

### Enabling Email-and-Password authentication

To enable `Email-and-Password` authentication in your Graphcool project you have to use the Graphcool Console.

<Instruction>

Open a terminal window and navigate to the directory where `project.graphcool` is located. Then type the following command:

```bash
graphcool console
```

</Instruction>

All this does is open up the Console for the project that's represented by `project.graphcool`.

<Instruction>

In the console, select the **Integrations**-tab in the left side-menu. 

</Instruction>

![](http://imgur.com/FkyzuuM.png)

<Instruction>

Then click on the tile that says **Email-Password Auth**. In the popup that appears, click **Enable**.

</Instruction>

![](http://imgur.com/HNdmas3.png)


Having the `Email-and-Password` auth provider enabled adds two new mutations to the project's API:

```graphql(nocopy)
# 1. Create new user
createUser(authProvider: { email: { email, password } }): User

# 2. Login existing user
signinUser(email: { email, password }): SignInUserPayload

# SignInUserPayload bundles information about the `user` and `token`
type SignInUserPayload {
  user: User
  token: String
}
```

Furthermore, this auth provider also extended your project's schema and now added two new fields to the `User` type: `email` and `password`. You can verify this by checking the selecting the **Schema** tab in the left side-menu.

### Updating the Project File

You're now in a situation again where your local Project File and the remote schema are out of sync. However, in contrast to before, this time that's because the remote schema contains changes that are not yet reflect in your local version of it.

This can also happen when you're working with multiple developers on the same project and one developer changes the remote schema.

In these situations, you need to update your local Project File with the changes that have been performed remotely. This can be done using the `graphcool pull` command.

<Instruction>

In a terminal, navigate to the directory where `project.graphcool` is located and execute the following command:

```bash
graphcool pull
```

</Instruction>

Before the remote schema gets fetched, you will be asked to confirm that you want to override the current project file. You can confirm by typing `y`. 

After you confirmed, the terminal output will look as follows:

```bash(nocopy)
 ✔ Your project file (project.graphcool) was successfully updated. Reload it in your editor if needed. 
 The new schema version is 3.
```

This schema `version` was bumped to `3` and the `User` type was updated to now also include the `email` and `password` fields:

```{8-9}graphql(nocopy)
type User implements Node {
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
  email: String @isUnique
  password: String
}
```

> Note: The `graphcool pull` command can also be used to initially download the Project File for one of your projects instead of updating an existing one. In these cases, you need to pass the `--project` (or short `-p`) option and specify the project ID as an argument. For example: `graphcool pull -p cj4n6xatsgiv50118b7d6nyre`.


### Configuring Permissions

The [Grapghcool permission system](https://www.graph.cool/blog/2017-04-25-graphql-permission-queries-oolooch8oh/) follows a _whitelist_ approach. This means that all operations that can be performed on a type need to be _explicitly allowed_ (i.e. _whitelisted_).

There are four different kinds of operations per type:

- _reading_ items of that type
- _creating_ items of that type
- _updating_ items of that type
- _deleting_ items of that type

When you're creating a new type in a Graphcool project, there will be permissions generated for you that allow _everyone_ to perform all of these operations! So, with every app that you want to put into production, it's your responsibility to properly update these permissions to make sure only the right users can actually perform them. Otherwise, everyone who knows the endpoint for your API (or simply the project ID) will have full access to the data in your database!

<Instruction>

In the Graphcool Console, select the **Permissions**-tab in the left side-menu.

</Instruction>

![](http://imgur.com/nU1rNhj.png)

As mentioned before, there are permissions for all of your types that currently allow _everyone_ to perform all four possible operations.

Go ahead and change that and update the permissions as required. You'll start with the easy ones to configure that only authenticated users can create links and cast votes.

<Instruction>

Select the **Create** permission on the `Link` type  

</Instruction>

In the popup that appears, you can now configure the rules to specify which users should be able to perform this operation.

The first tab of the popup requires you to select a number of fields of that type. That is so that you can configure the rules even on a field- not only on a type-level. This will allow you, for example, to specify certain users can only read the `description` and `url` fields of a `Link` - but not the `id` and the other system fields.

<Instruction>

By default, the whole model is selected which is exactly right for your current permission. Simply click on **Define Rules** in the bottom-right corner of the popup and move on to the next tab.

</Instruction>

![](http://imgur.com/iubdj9e.png)

<Instruction>

In the second tab, all you need to do is check the **Authentication required** checkbox and then click on **Update Permission**.

</Instruction>

![](http://imgur.com/Sua9q6H.pngß)

Awesome! You just prevented attackers from being able to randomly create links in your database. In fact, you can verify the actually works in a Playground!

To do so, you need to grab the endpoint for the `Simple API` and paste it into the address bar of a browser.

<Instruction>

In the Graphcool Console, click the **Endpoints**-button in the bottom-left corner. Then copy the endpoint for the `Simple API` and paste it into the address bar of your browser.

</Instruction> 

![](http://imgur.com/CRfVo94.png)

This will open up a Playground. 

<Instruction> 

Try to create a new `Link` by pasting the following mutation into the editor:

```graphql
mutation {
  createLink(
    description: "A flexible GraphQL client",
    url: "www.apollodata.com") {
    id
  }
}
```

</Instruction> 


The server will return the following response in the right pane:

```js(nocopy)

{
  "data": {
    "createLink": null
  },
  "errors": [
    {
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "createLink"
      ],
      "code": 3008,
      "message": "Insufficient permissions for this mutation",
      "requestId": "cj4nagibjb1l20164tsjececr"
    }
  ]
}
```

The server tells you that you can't perform this operation since you're not authenticated and would thus violate the permission rule that you just configured.

> If you want to learn more about the error format the server uses, you can read up on it [here](https://facebook.github.io/graphql/#sec-Errors).

All right, go ahead and repeat the same process for the `Vote` type.

<Instruction> 

Select the **Create Permission** on the `Vote` type, navigate to the second tab in the popup and check the **Authentication required** checkbox.

</Instruction> 

That's it - you just protected your voting system. 💪

Now on to the more complicated requirements, only the `User` who created a link should be able to update it later on. Plus, only the description can actually be changed.

<Instruction> 

Select the **Update** operation on the `Link` type. Then, in the popup, remove the `url` from the selection so the popup looks as follows:

</Instruction> 

![](http://imgur.com/ReBHSYD.png)

<Instruction> 

Now, move on to the next tab by clicking the **Define Rules** button. This time, check the **Authentication required** checkbox as well as the **Use Permission Query** checkbox.

Now, paste the following code into the editor:

```graphql
query ($user_id: ID!, $node_id: ID!) {
  SomeLinkExists(
    filter: {
      id: $node_id,
      postedBy: {
        id: $user_id
      }
    }
  )
}
```

</Instruction> 

All right, what's going on here?

You just wrote your first [permission query](https://www.graph.cool/docs/reference/auth/permission-queries-iox3aqu0ee/). Permission queries are a mechanism that allow to describe data access rules by means of a GraphQL query.

A permission query always returns `true` or `false`. It's executed right before the actual operation is performed on the database. But where do the `$user_id` and `$node_id` arguments come from?

The `$user_id` represents the `User` that wants to perform an operation. The `$node_id` on the other hand identifies the element (in this case a `Link`) that the operation is to be performed on!

So, in effect, what you're expressing with this query is that the `createLink` operation can only be executed if:

- there is a `Link` element in the database that is identified by `link_id`
- the `User` who  is trying to perform the mutation has initially posted that `Link`, since the `id` of the `postedBy` field needs to be the same as the `User` that's identified by `user_id`

Easy as pie! 🍰

The permission query that you can use for the **Delete** operation is identical to the one from the **Update** operation.

At this point, we'll leave the permission query for the `createVote` and `deleteVote` mutations as an exercise to you.



