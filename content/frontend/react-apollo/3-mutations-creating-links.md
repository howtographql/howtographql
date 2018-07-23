---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with React & Apollo Tutorial"
description: "Learn how you can use GraphQL mutations with Apollo Client. Use Apollo's `<Mutation />` component to define and send mutations."
question: Which of the following statements is true?
answers: ["Only queries can be wrapped with the 'graphql' higher-order component", "'<Mutation />' component allow variables, optimisticResponse, refetchQueries, and update as props", "When wrapping a component with a mutation using 'graphql', Apollo only injects the mutation function into the render prop function", "GraphQL mutations never take any arguments"]
correctAnswer: 1
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how you can send mutations with Apollo. It's actually not that different from sending queries and follows the same three steps that were mentioned before, with minors (but logicals) differences in the last two steps:

1. write the mutation as a JavaScript constant using the `gql` parser function
1. use the `<Mutation />` component passing the GraphQL mutation and variables (if needed) as props
1. use the mutation function that gets injected into the component's `render prop function`

### Preparing the React components

Like before, let's start by writing the React component where users will be able to add new links.

<Instruction>

Create a new file in the `src/components` directory and call it `CreateLink.js`. Then paste the following code into it:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import React, { Component } from 'react'

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  render() {
    const { description, url } = this.state
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button onClick={`... you'll implement this 🔜`}>Submit</button>
      </div>
    )
  }
}

export default CreateLink
```

</Instruction>

This is a standard setup for a React component with two `input` fields where users can provide the `url` and `description` of the `Link` they want to create. The data that's typed into these fields is stored in the component's `state` and will be used when the mutation is sent.

### Writing the mutation

But how can you now actually send the mutation to your server? Let's follow the three steps from before.

First you need to define the mutation in your JavaScript code and wrap your component with the `graphql` container. You'll do that in a similar way as with the query before.

<Instruction>

In `CreateLink.js`, add the following statement to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`
```

</Instruction>

<Instruction>

Also replace the current `button` with the following:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
<Mutation mutation={POST_MUTATION} variables={{ description, url }}>
  {() => (
    <button onClick={`... you'll implement this 🔜`}>
      Submit
    </button>
  )}
</Mutation>
```

</Instruction>

Let's take a closer look again to understand what's going on:

1. You first create the JavaScript constant called `POST_MUTATION` that stores the mutation.
1. Now, you wrap the `button` element as `render prop function` result with `<Mutation />` component passing `POST_MUTATION` as prop.
1. Lastly you pass _description_ and _url_ states as `variables` prop.


<Instruction>

Before moving on, you need to import the Apollo dependencies. Add the following to the top of `CreateLink.js`:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
```

</Instruction>

Let's see the mutation in action!

<Instruction>

Still in `CreateLink.js`, replace `<Mutation />` component as follows:

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
<Mutation mutation={POST_MUTATION} variables={{ description, url }}>
  {postMutation => <button onClick={postMutation}>Submit</button>}
</Mutation>
```

</Instruction>

As promised, all you need to do is call the function that Apollo injects into `<Mutation />` component's `render prop function` inside onClick button's event.

<Instruction>

Go ahead and see if the mutation works. To be able to test the code, open `App.js` and change `render` to looks as follows:

```js(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return <CreateLink />
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

You can open a Playground again by navigating to `http://localhost:4000` in your browser. Then send the following query:

```graphql
# Try to write your query here
{
  feed {
    links {
      description
      url
    }
  }
}
```

You'll see the following server response:

```js(nocopy)
{
  "data": {
    "feed": {
      "links": [
        // ...
        {
          "description": "The best learning resource for GraphQL",
          "url": "www.howtographql.com"
        }
      ]
    }
  }
}
```

Awesome! The mutation works, great job! 💪
