---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with React & Apollo Tutorial"
description: "Learn how you can use GraphQL mutations with Apollo Client. Use Apollo's `graphql` higher-order component to define and send mutations."
question: Which of the following statements is true?
answers: ["Only queries can be wrapped with the 'graphql' higher-order component", "'gql' is a higher-order component from the react-apollo package", "When wrapping a component with a mutation using 'graphql', Apollo injects a function into the component's props", "GraphQL mutations never take any arguments"]
correctAnswer: 2
---

In this section, you'll learn how you can send mutations with Apollo. It's actually not that different from sending queries and follows the same three steps that were mentioned before, with a minor (but logical) difference in step 3:

1. write the mutation as a JSava riptconstant using the `gql` parser function
1. use the `graphql` container to wrap your component with the mutation
1. use the mutation function that gets injected into the component's props

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
        <button
          onClick={() => this._createLink()}
        >
          Submit
        </button>
      </div>
    )
  }

  _createLink = async () => {
    // ... you'll implement this in a bit
  }

}

export default CreateLink
```

</Instruction>

This is a standard setup for a React component with two `input` fields where users can provide the `url` and `description` of the `Link` they want to create. The data that's typed into these fields is stored in the component's `state` and will be used in `_createLink` when the mutation is sent.

### Writing the mutation

But how can you now actually send the mutation? Let's follow the three steps from before.

First you need to define the mutation in your JavaScript code and wrap your component with the `graphql` container. You'll do that in a similar way as with the query before.

<Instruction>

In `CreateLink.js`, add the following statement to the bottom of the file (also replacing the current `export default CreateLink` statement):

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
// 1
const POST_MUTATION = gql`
  # 2
  mutation PostMutation($description: String!, $url: String!) {
    post(
      description: $description,
      url: $url,
    ) {
      id
      createdAt
      url
      description
    }
  }
`

// 3
export default graphql(POST_MUTATION, { name: 'postMutation' })(CreateLink)
```

</Instruction>

Let's take a closer look again to understand what's going on:

1. You first create the JavaScript constant called `POST_MUTATION` that stores the mutation.
1. Now you define the actual GraphQL mutation. It takes two arguments, `url` and `description`, that you'll have to provide when calling the mutation.
1. Lastly, you're using the `graphql` container to combine the `CreateLink` component with the `POST_MUTATION`. The specified `name` again refers to the name of the prop that's injected into `CreateLink`. This time, a function will be injected that's called `postMutation` and that you can invoke and pass in the required arguments.

<Instruction>

Before moving on, you need to import the Apollo dependencies. Add the following to the top of `CreateLink.js`:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

Let's see the mutation in action!

<Instruction>

Still in `CreateLink.js`, implement the `_createLink` mutation as follows:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
_createLink = async () => {
  const { description, url } = this.state
  await this.props.postMutation({
    variables: {
      description,
      url
    }
  })
}
```

</Instruction>

As promised, all you need to do is call the function that Apollo injects into `CreateLink` and pass the variables that represent the user input.

<Instruction>

Go ahead and see if the mutation works. To be able to test the code, open `App.js` and change `render` to looks as follows:

```js(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <CreateLink />
  )
}
```

</Instruction>

<Instruction>

Next, import the `CreateLink` component by adding the following statement to the top of `App.js`:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import CreateLink from './CreateLink'
```

</Instruction>

Now, run `yarn start`, you'll see the following screen:

![](http://imgur.com/AJNlEfj.png)

Two input fields and a **submit**-button - not very pretty but functional.

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then click the **submit**-button. You won't get any visual feedback in the UI, but let's see if the query actually worked by checking the current list of links in a Playground.

> At this point, you'll only see the new link after refreshing the page. In chapter six you will take care of updating the UI properly after a mutation was performed.

You can open a Playground again by navigating to `http://localhost:4000` in yout browser. Then send the following query in the **dev** playground in the **database** section:

```graphql
{
  links {
    description
    url
  }
}
```

You'll see the following server response:

```js(nocopy)
{
  "data": {
    "links": [
      {
        "description": "The best learning resource for GraphQL",
        "url": "www.howtographql.com"
      },
      // ...
    ]
  }
}
```

Awesome! The mutation works, great job! 💪
