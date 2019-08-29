---
title: "Mutations: Creating Links"
pageTitle: "GraphQL Mutations with React & urql Tutorial"
description: "Learn how you can use GraphQL mutations with urql. Use urql's 'useMutation' hook to define and send mutations."
question: Which of the following statements is true?
answers: ["The 'useQuery' hook is also used for mutations", "The 'useMutation' hook accepts only the mutation and returns its current state and a function that accepts variables", "The 'useMutation' hook accepts both a mutation and variables and returns a function", "GraphQL mutations never take any arguments"]
correctAnswer: 1
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how you can send mutations with urql. It's actually not that different from sending queries and follows the same three steps that were mentioned before, with minor (but logical) differences in the last two steps:

1. write the query as a JavaScript constant using the `gql` parser function
1. use the `useMutation` hook passing the GraphQL mutation as the first argument
1. use the `executeMutation` function passing the variables and receive the result

The different here is that `useMutation` only accepts the mutation as its only
argument. It still returns an array of `[result, executeMutation]`. The `executeMutation`
function accepts variables as its first argument and returns a promise of the
mutation result. The `result` will be updated with the mutation result as well.

### Preparing the React components

Like before, let's start by writing the React component where users will be able to add new links.

<Instruction>

Create a new file in the `src/components` directory and call it `CreateLink.js`. Then paste the following code into it:

```js(path=".../hackernews-react-urql/src/components/CreateLink.js")
import React from 'react'

const CreateLink = () => {
  const [description, setDescription] = React.useState('')
  const [url, setUrl] = React.useState('')

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={e => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <button onClick={`... you'll implement this 🔜`}>
        Submit
      </button>
    </div>
  )
}

export default CreateLink
```

</Instruction>

Here we're writing two `input` fields where users can provide the `url` and `description` of the `Link` they want to create. The data that's typed into these fields is stored in `React.useState` hooks and will be used when the mutation is sent.

### Writing the mutation

But how can you now actually send the mutation to your server? Let's follow the three steps from before.

First you need to define the mutation and add a `useMutation` hook to the `CreateLink` component, much in a similar way as we've added a query to `LinkList` before.

<Instruction>

In `CreateLink.js`, add the following statement to the top of the file:

```js(path=".../hackernews-react-urql/src/components/CreateLink.js")
import gql from 'graphql-tag';
import { useMutation } from 'urql';

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

Then add the `useMutation` hook to the `CreateLink` component and implement a handler:

```js{5,7-9}(path=".../hackernews-react-urql/src/components/CreateLink.js")
const CreateLink = () => {
  const [description, setDescription] = React.useState('')
  const [url, setUrl] = React.useState('')

  const [state, executeMutation] = useMutation(POST_MUTATION)
  
  const submit = React.useCallback(() => {
    executeMutation({ url, description })
  }, [executeMutation, url, description])
  
  // ...
}
```

</Instruction>

Let's take a closer look again to understand what's going on:

1. You've added imports for the `gql` tag and the `useMutation` hook.
1. Then you've defined `POST_MUTATION` which accepts a description and url as variables.
1. You've added the `useMutation` hook which accepts the new mutation and returns you the current state of the mutation and an `executeMutation` function as an array.
1. Lastly you've written a `submit` handler, which calls `executeMutation` with the variables from your input state hooks.

Let's see the mutation in action!

<Instruction>

Still in `CreateLink.js`, replace the `button` element as follows:

```js(path=".../hackernews-react-urql/src/components/CreateLink.js")
<button
  disabled={state.fetching}
  onClick={submit}
>
  Submit
</button>
```

</Instruction>

As you can see, `useMutation` is as simple to use as `useQuery`. All you need to do is pass it a mutation query and call `executeMutatuon` with your variables. It also returns `state`, which we're using here to disable the "Submit" button, while the mutation is executing.

<Instruction>

Go ahead and see if the mutation works. To be able to test the code, open `App.js` and change it to render `CreateLink` instead:

```js(path=".../hackernews-react-urql/src/components/App.js")
// import LinkList from './LinkList'
// import LoadingBoundary from './LoadingBoundary'
import CreateLink from './CreateLink'

const App = () => <CreateLink />

export default App
```

</Instruction>

Now, run `yarn start` and you'll see the following screen:

![](http://imgur.com/AJNlEfj.png)

Two input fields and our "Submit" button - not very pretty but functional.

Enter some data into the fields, e.g.:

- **Description**: `The best learning resource for GraphQL`
- **URL**: `www.howtographql.com`

Then submit. You won't get any visual feedback in the UI apart from the button switching to its disabled state, but let's see if the query actually worked by checking the current list of links in a Playground.

You can open a Playground again by navigating to `http://localhost:4000` in your browser. Then send the following query:

```graphql
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
