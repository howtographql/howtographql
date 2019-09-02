---
title: Routing
pageTitle: "React Router with GraphQL & urql Tutorial"
description: "Learn how to use react-router 5 together with GraphQL and urql to implement navigation in a React app. Each route will be represented as a Link."
question: What's the role of the Link component that you added in this chapter?
answers: ["It renders a link that was posted by a user", "It renders the input form for users to create new links", "It lets you navigate to a different URL", "It links your root component with all its children"]
correctAnswer: 2
videoId: ""
duration: 0		
videoAuthor: ""
---

In this section, you'll learn how to use [react-router 5](https://github.com/ReactTraining/react-router) with urql to add some navigation to your app!

### Install dependencies

First add the required dependencies to the app. Open a terminal, navigate to your project directory and type:

<Instruction>

```bash(path=".../hackernews-react-urql")
yarn add react-router react-router-dom
```

</Instruction>

### Create a Header

Before you'll configure the different routes for your application, you need to create a `Header` component that users can use to navigate between the different parts of your app.

<Instruction>

Create a new file in `src/components` and call it `Header.js`. Then paste the following code inside of it:

```js(path=".../hackernews-react-urql/src/components/Header.js")
import React from 'react'
import { Link } from 'react-router-dom'

const Header = props => (
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

export default Header
```

</Instruction>

This simply renders two of `react-router-dom`'s `Link` components that users can use to navigate between the `LinkList` and the `CreateLink` components.

> Don't get confused by the "other" `Link` component that is used here. The one that you're using in the `Header` has nothing to do with the `Link` component that you wrote before, they just happen to have the same name. This [Link](https://reacttraining.com/react-router/web/api/Link) is exposed by the `react-router-dom` package and allows you to navigate between routes inside of your application.

### Setup routes

Let's set up some routes inside your `App` component! We will create one route for the main `LinkList` at `/`, and one route for `CreateLink` at `/create`.

<Instruction>

Open the `App.js` file and replace it with the following code:

```js(path=".../hackernews-react-urql/src/components/App.js")
import React from 'react'
import { Switch, Route } from 'react-router-dom'

import LoadingBoundary from './LoadingBoundary'
import Header from './Header'
import LinkList from './LinkList'
import CreateLink from './CreateLink'

const App = () => (
  <div className="center w85">
    <Header />
    <div className="ph3 pv1 background-gray">
      <LoadingBoundary>
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
        </Switch>
      </LoadingBoundary>
    </div>
  </div>
)

export default App
```

</Instruction>

You've now added the `/` and `/create` routes to the app, added the `Header` and put the `LoadingBoundary` back to where it was.

Now you'll need to add an additional Provider component around your app for `react-router-dom` to work properly.

<Instruction>

Open `index.js` and add the following, new import statement to the top:

```js(path=".../hackernews-react-urql/src/index.js")
import { BrowserRouter } from 'react-router-dom'
```

</Instruction>

<Instruction>

Then update `ReactDOM.render` at the end and wrap the exiting elements there in `BrowserRouter`:

```js{2,6}(path=".../hackernews-react-urql/src/index.js")
ReactDOM.render(
  <BrowserRouter>
    <Provider value={client}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)
```

</Instruction>

That's it. If you run the app again, you can now access two URLs. `http://localhost:3000/` will render `LinkList` and `http://localhost:3000/create` renders the `CreateLink` component you just wrote in the previous section.

![](https://imgur.com/X9bmkQH.png)

### Add automatic redirects

To wrap up this section, let's also add an automatic redirect to the `CreateLink` component. To do that you can use the `history` prop that `react-router` passes down to all components that are wrapped in a route.

We want to use the `history.push` method to redirect to the `LinkList` route once the mutation has completed. We can do this by using the promise that `executeMutation` returns when it's being called.

<Instruction>

In `CreateLink.js` update the `submit` handler to look as follows:

```js(path=".../hackernews-react-urql/src/components/CreateLink.js")
const submit = React.useCallback(() => {
  executeMutation({ url, description }).then(() => {
    props.history.push('/')
  })
}, [executeMutation, url, description, props.history])
```

</Instruction>

After the mutation was performed, `react-router` will now navigate back to the `LinkList` component that's accessible on the root route: `/`.

> **Note**: The `LinkList` won't display the newly created `Link` after the app redirects to it. For now you can simply refresh to see the changes made. You'll learn how to update the data after the mutation is being triggered in a future chapter!
