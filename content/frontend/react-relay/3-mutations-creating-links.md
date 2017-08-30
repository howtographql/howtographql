---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with React & Relay Tutorial"
description: "Learn how to use Relay Modern's new Mutation API to send mutations to a GraphQL server. With Relay Modern you can also update the cache directly after the mutation."
question: What's one of the major changes of Relay Modern compared to Relay Classic?
answers: ["Detailled documentation and many code samples", "An imperative and more predictible mutation API", "Declaring data dependencies as fragments alongisde React components", "Relay Modern also includes a new server component"]
correctAnswer: 1
videoId: eIsctkVmq4Y
duration: 10
---

In this section, you'll learn how you can send mutations with Relay.


### Preparing the React components

Like before, let's start by writing the React component where users will be able to add new links.

<Instruction>

Create a new file in the `src/components` directory and call it `CreateLink.js`. Then paste the following code into it:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import React, { Component } from 'react'

class CreateLink extends Component {

  state = {
    description: '',
    url: ''
  }

  render() {

    return (
      <div>
        <div className='flex flex-column mt3'>
          <input
            className='mb2'
            value={this.state.description}
            onChange={(e) => this.setState({ description: e.target.value })}
            type='text'
            placeholder='A description for the link'
          />
          <input
            className='mb2'
            value={this.state.url}
            onChange={(e) => this.setState({ url: e.target.value })}
            type='text'
            placeholder='The URL for the link'
          />
        </div>
        <div
          className='button'
          onClick={() => this._createLink()}
        >
          submit
        </div>
      </div>
    )

  }

  _createLink = () => {
    // ... you'll implement this in a bit
  }

}

export default CreateLink
```

</Instruction>


This is a standard setup for a React component with two `input` fields where users can provide the `url` and `description` of the `Link` they want to create. The data that's typed into these fields is stored in the component's `state` and will be used in `_createLink` when the mutation is sent.

Great, but how can you now actually implement `_createLink` and send the mutation?

### Writing the Mutation

Mutations were one of the major pain points developers had with Relay Classic. The way that they were implemented was in a declarative and powerful way. However, it was very difficult to actually understand how they worked since there was so much _magic_ going on behind the scenes. As a result, the main concern was that they're not predictable enough and developers had a hard time reasoning about them.

That's why one of the major goals of Relay Modern was also to introduce a new and more approachable mutation API. The Facebook team delivered that and Relay now exposes a more [_imperative_ API](https://facebook.github.io/relay/docs/mutations.html) that allows you to manipulate the local store directly (actually, the manipulation happens through a dedicated _proxy_ object, but it's definitely much more direct than before). You'll learn about this new API to update the cache in a later chapter - for now we're only interested in performing a mutation to create a new link.

<Instruction>

To implement the mutation for adding new links, first create a new directory called `mutations` in `src` and then create a new file called `CreateLinkMutation.js` that you put into that new directory. Then paste the following code into it:

```js(path=".../hackernews-react-relay/src/mutations/CreateLinkMutation.js")
// 1
import {
  commitMutation,
  graphql,
} from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import environment from '../Environment'

// 2
const mutation = graphql`
  mutation CreateLinkMutation($input: CreateLinkInput!) {
    createLink(input: $input) {
      link {
        id
        createdAt
        url
        description
      }
    }
  }
`

// 3
export default (description, url, callback) => {
  // 4
  const variables = {
    input: {
      description,
      url,
      clientMutationId: ""
    },
  }

  // 5
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // 6
      onCompleted: () => {
        callback()
      },
      onError: err => console.error(err),
    },
  )
}
```

</Instruction>


Let's quickly walk through the different things that happen here:

1. First you need to import the right modules from `react-relay` as well as the `environment`.
2. Here you write a simple mutation and tag it with the `graphql` function. This mutation could also be used inside a Playground.
3. The module exports a single function that takes in the post's `description` and `imageUrl` as well as a `callback` that will be called when the mutation is completed.
4. Here you prepare the `input` object for the mutation that wraps the `description` and `imageUrl`. Note that the `clientMutationId` is required in this case because of a minor limitation in the Graphcool API - it has no function.
5. The `commitMutation` function can be used to send a mutation to the server with Relay Modern. You're passing the `variables` that you prepared in the previous steps and execute `commitMutation` once everything is ready.
6. Once the mutation is fully completed, the callback that the caller passed in is invoked.


### Calling the Mutation

With the `CreateLinkMutation` in place, you now need to implement the functionality to actually call it. You'll do that inside the `CreateLink` component.

<Instruction>

Open `CreatLink.js` and implement `_createLink` like so:

```js(path=".../hackernews-react-relay/src/components/CreateLink.js")
_createLink = () => {
  const { description, url } = this.state
  CreateLinkMutation(description, url, () => console.log(`Mutation completed`))
  }
```

</Instruction>

For this code to work you also need to import the `CreateLinkMutation` at the top of the file:

<Instruction>

```js(path=".../hackernews-react-relay/src/components/CreateLink.js")
import CreateLinkMutation from '../mutations/CreateLinkMutation'
```

</Instruction>

To test the mutation, you now need to render the `CreateLink` component inside the app's root component.

<Instruction>

Open `App.js` and first import the `CreateLink` component on top of the file:

```js(path=".../hackernews-react-relay/src/components/App.js")
import CreateLink from './CreateLink'
```

</Instruction>


<Instruction>

Next, still in `App.js`, update `render` to look as follows:

```js(path=".../hackernews-react-relay/src/components/App.js")
render() {
  return (
    <CreateLink />
  )
}
```

</Instruction>

Before you're running the app to test the mutation, you need to invoke the Relay Compiler again.

<Instruction>

In a terminal, navigate to the project's root directory and call the following command:

```bash(path=".../hackernews-react-relay")
relay-compiler --src ./src --schema ./schema.graphql
```

</Instruction>

This time, the `__generated__` directory is created in the `mutations` folder and contains a Javascript representation for the `CreateLinkMutation`.

You can now finally go ahead and test the mutation. Run `yarn start`, you'll be greeted with a very simple screen: Two input fields and a _submit_-button - not very pretty but functional.

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then click the _submit_-button. You won't get any visual feedback in the UI, but if you open the browser's console, you'll see the string from the log statement that you passed as a `callback` being printed: `Mutation completed`.

![](http://imgur.com/T03eeoY.png)

You can validate if the mutation actually worked by checking the current list of links in a Playground.

Type `graphcool playground` into a Terminal and send the following query:

```graphql
{
  allLinks {
    description
    url
  }
}
```

You'll see the following server response:

```js(nocopy)
{
  "data": {
    "allLinks": [
      {
        "description": "The coolest GraphQL backend 😎",
        "url": "https://graph.cool"
      },
      {
        "description": "Highly performant GraphQL client from Facebook",
        "url": "https://facebook.github.io/relay/"
      },
      {
        "description": "The best learning resource for GraphQL",
        "url": "www.howtographql.com"
      }
    ]
  }
}
```

Awesome! The mutation works, great job! 💪
