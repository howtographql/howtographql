---
title: A Simple Mutation
pageTitle: 'Implementing Mutations in a GraphQL Server Tutorial'
description:
  'Learn best practices for implementing GraphQL mutations with Nexus and TypeScript. Test your implementation
  in Apollo Studio Explorer.'
question: What is the second argument that's passed into GraphQL resolvers used for?
answers:
  [
    'It carries the return value of the previous resolver execution level',
    'It carries the arguments for the incoming GraphQL operation',
    'It is an object that all resolvers can write to and read from',
    'It carries the AST of the incoming GraphQL operation'
  ]
correctAnswer: 1
---

In this section, you'll learn how to add a mutation to your GraphQL API. This mutation will allow you to _post_ new links
to the server.

### Creating a mutation for adding new links

Like before, you need to start by adding the `post` mutation in Nexus. You will define both the mutation signature along with its resolver. 



<Instruction>

In `src/graphql/Link.ts` extend the `Mutation` type as follows: 

```typescript{1,5-37}(path="../hackernews-typescript/src/graphql/Link.ts")
import { extendType, nonNull, objectType, stringArg } from "nexus";   

// existing code for Link type and feed query. 

export const LinkMutation = extendType({  // 1
    type: "Mutation",    
    definition(t) {
        t.nonNull.field("post", {  // 2
            type: "Link",  
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            
            resolve(parent, args, context) {    
                const { description, url } = args;  // 4
                
                let idCount = links.length + 1;  // 5
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };
                links.push(link);
                return link;
            },
        });
    },
});

```

</Instruction>

Let's see what's going on with the numbered comments: 

1. You're extending the `Mutation` type to add a new root field. You did something similar in the last chapter with the `Query` type.  

2. The name of the mutation is defined as `post` and it returns a (non nullable) `link` object. 

3. Here you define the arguments to your mutation. You can pass arguments to your GraphQL API endpoints (just like in REST). In this case, the two arguments you need to pass are `description` and `url`. Both arguments mandatory (hence the `nonNull()`) because both are needed to create a new `link`.  

4. You're now using the second argument that’s passed into all resolver functions: `args`. Any guesses what it’s used for? ... Correct! 💡 It carries the arguments for the operation – in this case the `url` and `description` of the link to be created.

5. `idCount` serves as a very rudimentary way to generate new `id` values for our `link` objects. Finally, you add your new `link` object to the `links` array and return the newly created object. 

Understand everything? Take some time if you need to. 

After you're ready, try a small experiment: 


> **Experiment:** Change the `return link;` at the end of the `resolve` function to `return null;`. You'll see that your IDE raises an error. This is because you defined the return type of the `post` GraphQL endpoint/field to be a non nullable `link` object. Return anything else except a `link` object in the resolver, and the Nexus generated types will immediately catch the violation! 

### Testing the mutation 

Let's head over to Apollo Studio to test the new API operation. Here is a simple mutation you can send to test things out: 

```graphql
mutation {
  post(url: "www.prisma.io", description: "Next-generation Node.js and TypeScript ORM") {
    id
  }
}
```

The server response should look as follows:
```json(nocopy)
{
  "data": {
    "post": {
      "id": 1
    }
  }
}
```

With every mutation you send, the `idCount` will increase and the following IDs for created links will be `4`, `5`, and so forth…

To verify that your mutation worked, you can send the feed query from before again — it now returns the additional Link that you created with the mutation:

![Test post mutation](https://i.imgur.com/frPk28Z.gif)

However, once you kill and restart the server, you'll notice that the previously added links are now gone and you need
to add them again. This is because the links are only stored _in-memory_, in the `links` array. In the next sections,
you will learn how to add a _database_ to the GraphQL server in order to persist the data beyond the runtime of the
server.



 > **Note:** When a GraphQL query or mutation has arguments (like the `post` mutation you just executed), you will need to pass concrete values for the arguments. There are two ways of reading values from the client. The first is the inlined method, where you pass the variable data directly in the query (this is what you just used). The other method involves passing data through variables. In this method the API call and the data are _separated_ from each other. The above `post` mutation, rewritten to use variables, would look like this: 

> ```graphql(nocopy)
mutation($description: String!, $url: String!) {
  post(description: $description, url: $url) {
    id
  }
}
```

> With the variables being passed separately like this: 

> ```json(nocopy)
{
  "description": "www.prisma.io",
  "url": "Next-generation Node.js and TypeScript ORM"
}
```

> Apollo Studio tends to prefer the variable method. It supports code completion through variables and has a separate **Variables** tab in the bottom to define the variables. However, for copy-pasting convenience, this tutorial will follow the inline method. If you're manually typing up the commands, feel free to use the method which is most convenient for you.

### Exercise

If you want to practice writing more code with Nexus and implementing GraphQL resolvers, here's an _optional_ challenge for you. Based on your
current implementation, extend the GraphQL API with full CRUD functionality for the `Link` type. In particular,
implement the queries and mutations that have the following definitions:

```graphql(nocopy)
type Query {
  # Fetch a single link by its `id`
  link(id: ID!): Link
}

type Mutation {
  # Update a link
  updateLink(id: ID!, url: String, description: String): Link!

  # Delete a link
  deleteLink(id: ID!): Link!
}
```

The [Nexus documentation](https://nexusjs.org/docs/) might come in handy when attempting this excercise. 
