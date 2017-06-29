# Writing Guidelines for HowToGraphQL Tutorial Tracks

This document describes writing guidelines and best practices for the HTG tutorial tracks (frontend + backend).

## Writing Process & Feedback

Please use [Quip](https://www.quip.com) to write your tutorials. This allows others to easily access your document and provide feedback with comments.

Once there is a finalized version in quip, you can _export_ your document to Markdown. The exporter generally works well, but has a few flaws so that you'll probably have to do some finetuning on the Markdown here and there. 

## Custom Formatting Rules

### Instruction Block

In your tutorials, you should always speak very directly to the reader. Particularly you have to make it very clear when the reader actually has to do something to move forward with the example project. That's what you're using the concept of an **Instruction Block** for.

Instruction blocks will be visually highlighted on the website. This has two advantages:

1. Fast readers who are only interested in moving forward with the code don't have to spend unnessessary time reading explanations since it's very clear when in the tutorial they're required to perform an action
2. It's less likely that a reader will accidentally miss a part where they were required to do something

You'll use the `<Instruction>` tag to mark a sentence or a paragraph as an instruction. Notice that the **opening and closing tags need to have one line break in between the content**. This is what a simple example looks like:

```
<Instruction>

To get access to this endpoint, open up a terminal and navigate to the directory where `project.graphcool` is located. Then type the `graphcool endpoints` command. Now copy the endpoint for the `Subscriptions API` and replace the placeholder with it. 

</Instruction>
```

Often times, you'll want to combine a short instruction with a code block that the user has to copy into their project:

![](http://imgur.com/4SrSHHu.png)

This is what a rendered instruction block (including code block) will look like: 

![](http://imgur.com/pMeAkpB.png)


### Code Blocks

For code blocks, you should include special annotations that provide more context to the reader. This is a list of the possible annotations:

1. adding the filename where that snippet is located (or the directory in the terminal where a command should be executed)
2. adding a "copy"-button (**on by default**) so that the user can easily copy the snippet rather than having to select+copy it
3. highlighting lines in the snippet

This is the syntax for the different annotations:

#### Adding a filename

When adding a filename to indicate that this code can be found as such in a file in the example project, use the following syntax:

<pre><code>```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`
```
</code></pre>

This information will be displayed on top of the code block and will link to the actual file on GitHub:

![](http://imgur.com/VyyZk5v.png)

#### Adding a directory path a terminal command

<pre><code>```bash(path=".../hackernews-react-apollo")
yarn add react-apollo
```
</code></pre>

![](http://imgur.com/yeCfsk6.png)

#### Adding / Hiding the "Copy"-button to a code block

Most of the code blocks in your tutorial will have to be copied by the reader, so a "Copy"-button
 is displayed by default. However, that copy button also _communicates_ that the user should be doing something with this code block. Sometimes, when you don't want the user to do something with a code block because you only include it for illustration purposes, you should remove the "Copy"-button to make it very clear that this code does not belong into the project.

You can use the following syntax for that:

<pre><code>```graphql(nocopy)
type User {
  name: String!
  links: [Link!]! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "UsersVotes")
}

type Link { 
  url: String!
  postedBy: User! @relation(name: "UsersLinks")
  votes: [Vote!]! @relation(name: "VotesOnLink")
}

type Vote {
  user: User! @relation(name: "UsersVotes")
  link: Link! @relation(name: "VotesOnLink")
}
```
</code></pre>


#### Highlighting lines in the snippet

You're also able to highlight individual lines inside of a code block to put emphasis on certain parts. Simply include the line numbers in curly braces right after the language statement:

<pre><code>```js{6-7,9-12,14-17}(path="src/index.js")
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
// 1
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'

// 2
const networkInterface = createNetworkInterface({
  uri: '__SIMPLE_API_ENDPOINT__'
})

// 3
const client = new ApolloClient({
  networkInterface
})
</code></pre>


## Style

### Include every step

HTG contains detailled step-by-step tutorials where readers start from scratch and work towards the expected outcome. It's important the every single instruction is listed for the reader. You should aim to separate paragraphs with explanatory or illustrative content from those that actually contain instructions since instructions will be visually highlighted.

### Use You/Your/You'll & Command the reader

In many tutorials, authors express instructions by using 1st person plural pronouns like "We", "Us" or "Our". For example: "We will define the GraphQL query next" or "Let's define the GraphQL query next". In the tutorial tracks, you should take a more direct approach where you command and instruct the reader to accomplish a certain task: "You will define the GraphQL query next".

### Use screenshots 

Screenshots are a great way to reassure the reader that they're on the right track. After a set of instructions, it's helpful to include a screenshot with the expected outcome.

### Link to other resources

You might not be able to cover all the topics that are relevant to your tutorial track in absolute depth since that would exceed the scope of the tutorial (which should be concise and instructive). To make sure the reader still is able to get further information and dive deeper on specific topics, you should link to related articles and tutorials. 

### Explain what's going on in a code block

When you're showing a code block to the reader, make sure to explain what's going on in there. A nice approach approach is to put numbers on different parts inside the code block and then explain each step with 1 or 2 short sentences. For example:

![](http://imgur.com/LLRqPgT.png)

### Write short paragraphs

Your tutorial should be structured in an easily consumable way. Paragraphs should be kept short and contain between one and three sentences. 

### Prefer bullet lists

When you need to explain two or more related concepts, prefer to write them in a bullet list rather than in consecutive full sentences. This improves readability and _scannability_ of the whole tutorial.

### Avoid passive voice

Try to be clear _who_ or _what_ is performing a certain action. For example, write "The `QueryRenderer` composes the query at the root of the Relay container tree" instead of "The query is composed at the root of the Relay tree".


