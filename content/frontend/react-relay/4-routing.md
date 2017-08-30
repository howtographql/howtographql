---
title: Routing
pageTitle: "React Router with GraphQL & Relay Tutorial"
descriptions: "Learn how to use react-router 4 together with GraphQL and Relay Modern to implement navigation in a React app. Each route will be represented as a `Link`."
videoId: xmaDSTXeN54
duration: 5
question: What's the role of the Link component that you added in this chapter?
answers: ["It renders a link that was posted by a user", "It renders the input form for users to create new links", "It lets you navigate to a different URL", "It links your root component with all its children"]
correctAnswer: 2
---

In this section, you'll learn how to use the [`react-router`](https://github.com/ReactTraining/react-router) library with Relay to implement some navigation functionality!

### Routing in Relay

An interesting note about Relay is that it actually started out as a routing framework that eventually also got connected with data loading responsibilities. This was particularly visible in the design of Relay Classic, where [`Relay.Route`](https://facebook.github.io/relay/docs/api-reference-relay-route.html) was a core component. However with Relay Modern, the idea is to move away from having routing as an integral part of Relay and make it more flexible to work with different routing solutions.

Since we're in the early days of Relay Modern, there's not really much advise or conventions to build upon. The Facebook team delivers a [few suggestions](https://facebook.github.io/relay/docs/routing.html) how this can be handled. But it will certainly take some time until best practices and appropriate tools around this topic evolve!

So, to keep it simple in this tutorial, we'll use [`react-router`](https://github.com/ReactTraining/react-router) which is a popular routing solution in the React ecosystem. 

### Install Dependencies

The first thing you need to do is install the corresponding dependency.

<Instruction>

Open a terminal, navigate to your project directory and and type: 

```bash(path=".../hackernews-react-relay")
yarn add react-router-dom
```

</Instruction>


### Create a Header

Before you're moving on to configure the different routes for your application, you need to create a `Header` component that users can use to navigate to between the different parts of your app.

Create a new file in `src/components` and call it `Header.js`. Then paste the following code inside of it:

```js
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

class Header extends Component {

  render() {
    return (
      <div className='flex pa1 justify-between nowrap orange'>
        <div className='flex flex-fixed black'>
          <div className='fw7 mr1'>Hacker News</div>
          <Link to='/' className='ml1 no-underline black'>new</Link>
          <div className='ml1'>|</div>
          <Link to='/create' className='ml1 no-underline black'>submit</Link>
        </div>
      </div>
    )
  }

}

export default withRouter(Header)
```

This simply renders two `Link` components that users can use to navigate between the `LinkList` and the `CreateLink` components. 

> Don't get confused by the "other" `Link` component that is used here. The one that you're using in the `Header` has nothing to do with the `Link` component that you wrote before, they just happen to have the same name. This [`Link`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md) stems from the `react-router-dom` package and allows you to navigate between routes inside of your application.

### Setup routes

You'll configure the different routes for the app in the project's root component: `App`. 

<Instruction>

Open the corresponding file `App.js` and update `render` to include the `Header` as well as `LinkList` and the `CreateLink` components in different routes:

```js(path=".../hackernews-react-relay/src/components/App.js")
render() {
  return (
    <div className='center w85'>
      <Header />
      <div className='ph3 pv1 background-gray'>
        <Switch>
          <Route exact path='/' component={LinkListPage}/>
          <Route exact path='/create' component={CreateLink}/>
         </Switch>
      </div>
    </div>
  )
}
```

</Instruction>


For this code to work, you need to import the required dependencies of `react-router`. 

<Instruction>

Add the following statement to the top of the file:

```js(path=".../hackernews-react-relay/src/components/App.js")
import Header from './Header'
import { Switch, Route } from 'react-router-dom'
```

</Instruction>

Now you need to wrap the `App` with `BrowserRouter` so that all child components of `App` will get access to the routing functionality.

<Instruction>

Open `index.js` and add the following import statement to the top:

```js(path=".../hackernews-react-relay/src/index.js")
import { BrowserRouter } from 'react-router-dom'
```

</Instruction>

<Instruction>

Finally, still in `index.js` update `ReactDOM.render` and wrap the whole app with the `BrowserRouter`:

```js
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)
```

</Instruction>

That's it. If you run `yarn start`, you can now access two URLs. `http://localhost:3000/` will render `LinkListPage` and `http://localhost:3000/create` renders the `CreateLink` component you just wrote in the previous section.

![](http://imgur.com/I16JzwW.png)

### Implement navigation

To wrap up this section, you need to implement an automatic redirect from the `CreateLink` to `LinkList` after a mutation was performed.

<Instruction>

Open `CreateLink.js` and update `_createLink` to look as follows:

```js(path=".../hackernews-react-relay/src/components/CreateLink.js")
_createLink = () => {
  const { description, url } = this.state
  CreateLinkMutation(description, url, () => this.props.history.push('/'))
}
```

<Instruction>

All you do here is update the `callback` that's passed into `CreateLinkMutation` to navigate back to the app's root router after mutation was completed, replacing the logging statement that you used to print before.

Awesome, you're all set to build authentication functionality for the app!
