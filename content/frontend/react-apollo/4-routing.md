---
title: Routing
pageTitle: 'React Router with GraphQL and Apollo Tutorial'
description: 'Learn how to use React Router 5 together with GraphQL and Apollo Client to implement navigation in a React app. Each route will be represented as a `Link`.'
question: What's the role of the Link component that you added in this chapter?
answers:
  [
    'It renders a link that was posted by a user',
    'It renders the input form for users to create new links',
    'It lets you navigate to a different URL',
    'It links your root component with all its children',
  ]
correctAnswer: 2
videoId: ''
duration: 0
videoAuthor: ''
---

In this section, we'll see how to use the [React Router](https://github.com/ReactTraining/react-router) with Apollo to implement navigation!

### Install dependencies

Let's start by adding the dependencies we'll need.

<Instruction>

```bash(path=".../hackernews-react-apollo")
yarn add react-router react-router-dom
```

</Instruction>

### Create a Header

Before moving on to configure the different routes for the app, we need to create a `Header` component that will hold the navigation links.

<Instruction>

Create a new file in `src/components` and call it `Header.js`. Then paste the following code inside of it:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
import React from 'react';
import { useHistory } from 'react-router';
import { Link, withRouter } from 'react-router-dom';

const Header = () => {
  const history = useHistory();
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Hacker News</div>
        <Link to="/" className="ml1 no-underline black">
          new
        </Link>
        <div className="ml1">|</div>
        <Link
          to="/create"
          className="ml1 no-underline black"
        >
          submit
        </Link>
      </div>
    </div>
  );
};

export default Header;
```

</Instruction>

The `Header` component currently just renders two `Link` components that can be used to navigate between the `LinkList` and the `CreateLink` components.

> Don't get confused by the "other" `Link` component that is used here. The one that you're using in the `Header` has nothing to do with the `Link` component that you wrote before, they just happen to have the same name. This [Link](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md) stems from the `react-router-dom` package and allows us to navigate between routes inside of your application.

### Setup routes

Let's configure the different routes for the app in the project's root component: `App`.

<Instruction>

Open up `App.js` and update it to include the `Header` as well as `LinkList` and the `CreateLink` components under different routes:

```js(path=".../hackernews-react-apollo/src/components/App.js")
import React from 'react';
import CreateLink from './CreateLink';
import Header from './Header';
import LinkList from './LinkList';
import { Switch, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="center w85">
      <Header />
      <div className="ph3 pv1 background-gray">
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route
            exact
            path="/create"
            component={CreateLink}
          />
        </Switch>
      </div>
    </div>
  );
};

export default App;
```

</Instruction>

We now need to wrap the `App` with `BrowserRouter` so that all child components of `App` will get access to the routing functionality.

<Instruction>

Open `index.js` and add the following import statement to the top:

```js(path=".../hackernews-react-apollo/src/index.js")
import { BrowserRouter } from 'react-router-dom';
```

</Instruction>

<Instruction>

Now update `ReactDOM.render` and wrap the whole app with `BrowserRouter`:

```js{2,6}(path=".../hackernews-react-apollo/src/index.js")
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
```

</Instruction>

If we run the app again, we can now access two URLs. `http://localhost:3000/` will render `LinkList` and `http://localhost:3000/create` renders the `CreateLink` component we created in the previous section.

![](https://imgur.com/X9bmkQH.png)

### Implement Navigation

To wrap up this section, we need to implement an automatic redirect from the `CreateLink` component to the `LinkList` component after a mutation is performed. To do this, we can use the `onCompleted` function that is provided by Apollo when mutations are performed.

<Instruction>

Open `CreateLink.js` and update it to include the `useHistory` hook from React Router. In the body of the function, create a `history` reference and use it within the `onCompleted` callback. This callback runs after the mutation is completed.

```js{4}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
// ...
import { useHistory } from 'react-router';

const CreateLink = () => {
  const history = useHistory();

  const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url
    },
    onCompleted: () => history.push('/')
  });
  // ...
};
```

</Instruction>

After the mutation completes, React Router will navigate back to the `LinkList` component that's accessible on the root route: `/`.

> **Note**: With our current setup, we won't see the newly created `Link`, we'll just redirect to the main route. We could refresh the page to see the changes made. We'll see how to update the data after the mutation completes in the `More Mutations and Updating the Store` chapter!
