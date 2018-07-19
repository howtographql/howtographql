---
title: Routing
pageTitle: "React Router with GraphQL & Apollo Tutorial"
description: "Learn how to use react-router 4 together with GraphQL and Apollo Client to implement navigation in a React app. Each route will be represented as a `Link`."
question: What's the role of the Link component that you added in this chapter?
answers: ["It renders a link that was posted by a user", "It renders the input form for users to create new links", "It lets you navigate to a different URL", "It links your root component with all its children"]
correctAnswer: 2
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how to use the [react-router](https://github.com/ReactTraining/react-router) library with Apollo to implement some navigation functionality!

### Install dependencies

First add the required dependencies to the app. Open a terminal, navigate to your project directory and type:

<Instruction>

```bash(path=".../hackernews-react-apollo")
yarn add react-router react-router-dom
```

</Instruction>

### Create a Header

Before moving on to configure the different routes for your application, you need to create a `Header` component that users can use to navigate between the different parts of your app.

<Instruction>

Create a new file in `src/components` and call it `Header.js`. Then paste the following code inside of it:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

class Header extends Component {
  render() {
    return (
      <div className="flex pa1 justify-between nowrap orange">
        <div className="flex flex-fixed black">
          <div className="fw7 mr1">Hacker News</div>
          <Link to="/" className="ml1 no-underline black">
            new
          </Link>
          <div className="ml1">|</div>
          <Link to="/create" className="ml1 no-underline black">
            submit
          </Link>
        </div>
      </div>
    )
  }
}

export default withRouter(Header)
```

</Instruction>

This simply renders two `Link` components that users can use to navigate between the `LinkList` and the `CreateLink` components.

> Don't get confused by the "other" `Link` component that is used here. The one that you're using in the `Header` has nothing to do with the `Link` component that you wrote before, they just happen to have the same name. This [Link](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md) stems from the `react-router-dom` package and allows you to navigate between routes inside of your application.

### Setup routes

You'll configure the different routes for the app in the project's root component: `App`.

<Instruction>

Open the corresponding file `App.js` and update `render` to include the `Header` as well as `LinkList` and the `CreateLink` components under different routes:

```js(path=".../hackernews-react-apollo/src/components/App.js")
render() {
  return (
    <div className="center w85">
      <Header />
      <div className="ph3 pv1 background-gray">
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
        </Switch>
      </div>
    </div>
  )
}
```

</Instruction>

For this code to work, you need to import the required dependencies of `react-router-dom`.

<Instruction>

Add the following statement to the top of the file:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import Header from './Header'
import { Switch, Route } from 'react-router-dom'
```

</Instruction>

Now you need to wrap the `App` with `BrowserRouter` so that all child components of `App` will get access to the routing functionality.

<Instruction>

Open `index.js` and add the following import statement to the top:

```js(path=".../hackernews-react-apollo/src/index.js")
import { BrowserRouter } from 'react-router-dom'
```

</Instruction>

<Instruction>

Now update `ReactDOM.render` and wrap the whole app with the `BrowserRouter`:

```js{2,6}(path=".../hackernews-react-apollo/src/index.js")
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
```

</Instruction>

That's it. If you run the app again, you can now access two URLs. `http://localhost:3000/` will render `LinkList` and `http://localhost:3000/create` renders the `CreateLink` component you just wrote in the previous section.

![](https://imgur.com/X9bmkQH.png)

### Implement navigation

To wrap up this section, you need to implement an automatic redirect from the `CreateLink` to `LinkList` after a mutation was performed.

<Instruction>

Open `CreateLink.js` and update `<Mutation />` component to look as follows:

```js{4}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
<Mutation
  mutation={POST_MUTATION}
  variables={{ description, url }}
  onCompleted={() => this.props.history.push('/')}
>
  {postMutation => <button onClick={postMutation}>Submit</button>}
</Mutation>
```

</Instruction>

After the mutation was performed, `react-router-dom` will now navigate back to the `LinkList` component that's accessible on the root route: `/`.
