---
title: Routing
---

In this section, you'll learn how to use the [`react-router`](https://github.com/ReactTraining/react-router) library with Apollo to implement some nagivation functionality!


### Install Dependencies

First add the dependency to the app. Open a Terminal, navigate to your project directory and and type: 

```sh
yarn add react-router-dom
```

### Setup routes

You'll configure the different routes for the app in the project's root component: `App`. Open the correspdonding file `App.js` and update `render` to include the `LinkList` and the `CreateLink` components in different routes:

```js
render() {
  return (
    <Switch>
      <Route exact path='/create' component={CreateLink}/>
      <Route exact path='/' component={LinkList}/>
    </Switch>
  )
}
```

For this code to work, you need to import the required dependencies of `react-router`. Add the following statement to the top of the file:

```
import { Switch, Route } from 'react-router-dom'
```

Now you need to wrap the `App` with with `BrowserRouter` so that all child components of `App` will get access to the routing functionality.

Open `index.js` and add the following import statement to the top:

```js
import { BrowserRouter } from 'react-router-dom'
```

Now update `ReactDOM.render` and wrap the whole app with the `BrowserRouter`:

```js
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
```

That's it. If you run `yarn start`, you can now access two URLs. `http://localhost:3000/` will render `LinkList` and `http://localhost:3000/create` renders the `CreateLink` component you just wrote in the previous section.


### Implement navigation

To wrap up this section, you'll implement functionality for the user to be able to switch between routes.

First, add a button to the `LinkList` component that allows the user to navigate to `CreateLink`. 

Open `LinkList.js` and update `render` to return the following:

```js
return (
  <div>
    <button onClick={() => {
      this.props.history.push('/create')
    }}>New Link</button>
    {linksToRender.map(link => (
      <Link key={link.id} link={link}/>
    ))}
  </div>
)
```

Second, you want to navigate back to the previous list after having created the new link with the `createLinkMutation`. 

Open `CreateLink.js` and update `_createLink` to look as follows:

```js
_createLink = async () => {
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url
    }
  })
  this.props.history.push(`/`)
}
```

After the mutation was performed, `react-router` will now navigate back to the `LinkList` component that's accessible on the root route: `/`.

