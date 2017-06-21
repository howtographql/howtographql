# Writing Guidelines for HowToGraphQL Tutorial Tracks

This document describes a writing guidelines and best practices for the HTG tutorial tracks (frontend + backend).

## Formatting

You'll regular use [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for writing your tutorials.

### Code blocks

You're using _three_ different kinds of code blocks inside yours tutorial track, depending on the context where it's shown:

1. Code is not part of the project, only included to explain something (e.g. an alternative way of achieving something)
1. Code is part of the project (i.e. can be found in some file) and the user is supposed to copy it into the project
1. Code is part of the project (i.e. can be found in some file) but the user is _not_ supposed to copy (maybe you just want to repeat a previous code block for additional explanations) 

The first and second categories will be used most often, the third one will probably only occur in exceptional cases.

For code that is not part of the project (category 1), simply use language indicator on the code block, e.g.:

<pre lang="no-highlight"><code>```graphql
query {
  allMovies {
    id
    title
  }
}
``` 
</code></pre>

For code that is part of the project and that the user needs to copy or type (category 2), use the filename as an additional annotation on the code block:
<pre lang="no-highlight"><code>```js@CreateLink.js
_createLink = async () => {
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url
    }
  })
}
```</code></pre>

For code that is part of the project but that the user should not copy or type at this point (category 2), the filename should be prepended with the `sample` keyword and a dash:

<pre lang="no-highlight"><code>```js@sample-CreateLink.js
_createLink = async () => {
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url
    }
  })
}
```</code></pre>


## Style

### Include every step

HTG contains detailled step-by-step tutorials where readers start from scratch and work towards the expected outcome.

### Write short paragraphs

Your tutorial should be structured in an easily consumable way. Paragraphs should be kept short and contain between one and three sentences. 

### Prefer bullet lists

When you need to explain two or more related concepts, prefer to write them in a bullet list rather than in consecutive full sentences. This improves readability and _scannability_ of the whole tutorial.

### Use You/Your/You'll & Command the reader

In many tutorials, authors express instructions by using 1st person plural pronouns like "We", "Us" or "Our". For example: "We will define the GraphQL query next" or "Let's define the GraphQL query next". In the tutorial tracks, you should take a more direct approach where you command and instruct the reader to accomplish a certain task: "You will define the GraphQL query next".

### Avoid passive voice

Try to be clear _who_ or _what_ is performing a certain action. For example, write "The `QueryRenderer` composes the query at the root of the Relay container tree" instead of "The query is composed at the root of the Relay tree".

### Use screenshots 

Screenshots are a great way to reassure the reader that they're on the right track. After a set of instructions, it's helpful to include a screenshot with the expected outcome.

### Link to other resources

You might not be able to cover all the topics that are relevant to your tutorial track in absolute depth since that would exceed the scope of the tutorial (which should be concise and instructive). To make sure the reader still is able to get further information and dive deeper on specific topics, you should link to related articles and tutorials. 

### Explain what's going on in a code block

When you're showing a code block to the reader, make sure to explain what's going on in there. A nice approach approach is to put numbers on different parts inside the code block and then explain each step with 1 or 2 short sentences. For example:

![](http://imgur.com/LLRqPgT.png)