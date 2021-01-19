---
title: Pagination
pageTitle:
  'Pagination with GraphQL, React and Apollo Tutorial'
description:
  'Learn how to implement limit-offset pagination with
  GraphQL and Apollo Client in a React app. The Prisma API
  exposes the required arguments for lists.'
question:
  "What's the difference between the 'query' and 'readQuery'
  methods on the 'ApolloClient'?"
answers:
  [
    "'readQuery' always fetches data over the network while
    'query' can retrieve data either from the cache or
    remotely",
    "'readQuery' can only be used to reading data while
    'query' can also be used to write data",
    "'readQuery' was formerly called 'query' and the
    functionality of both is identical",
    "'readQuery' always reads data from the local cache
    while 'query' might retrieve data either from the cache
    or remotely"
  ]
correctAnswer: 3
videoId: ''
duration: 0
videoAuthor: ''
---

The last topic that we'll cover in this tutorial is
pagination. We'll implement a simple pagination approach so
that users are able to view the links in smaller chunks
rather than having an extremely long list of `Link`
elements.

## Preparing the React Components

Once more, we first need to prepare the React components for
this new functionality. In fact, we'll make a slight
adjustment to the current routing setup. The idea is that
the `LinkList` component will be used for two different
purposes (and routes). The first one is to display the top
ten voted links and the second use case is to display new
links in a list separated into multiple pages that the user
can navigate through.

<Instruction>

Open `App.js` and adjust the component to look like this:

```js{20-24}(path=".../hackernews-react-apollo/src/components/App.js")
const App = () => (
  <div className="center w85">
    <Header />
    <div className="ph3 pv1 background-gray">
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Redirect to="/new/1" />}
        />

        <Route
          exact
          path="/create"
          component={CreateLink}
        />
        <Route exact path="/login" component={Login} />
        <Route exact path="/search" component={Search} />
        <Route exact path="/top" component={LinkList} />
        <Route
          exact
          path="/new/:page"
          component={LinkList}
        />
      </Switch>
    </div>
  </div>
);
```

</Instruction>

Let's be sure to import the `Redirect` component so we don't
get any errors.

<Instruction>

Update the router import on the top of the file:

```js{}(path=".../hackernews-react-apollo/src/components/App.js")
import { Redirect, Route, Switch } from 'react-router-dom';
```

</Instruction>

We've now added two new routes: `/top` and `/new/:page`. The
latter reads the value for `page` from the url so that this
information is available inside the component that's
rendered. For this route that's `LinkList`.

The main route `/` now redirects to the first page of the
route where new posts are displayed.

Before moving on, quickly add a new navigation item to the
`Header` component that brings the user to the `/top` route.

<Instruction>

Open `Header.js` and add the following lines _between_ the
`/` and the `/search` routes:

```js(path=".../hackernews-react-apollo/src/components/Header.js")
<Link to="/top" className="ml1 no-underline black">
  top
</Link>
<div className="ml1">|</div>
```

</Instruction>

We also need to add some logic to the `LinkList` component
to account for the two different responsibilities it now
has.

<Instruction>

Open `LinkList.js` and add three arguments to the
`FeedQuery` by replacing the `FEED_QUERY` definition with
the following:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const FEED_QUERY = gql`
  query FeedQuery(
    $take: Int
    $skip: Int
    $orderBy: LinkOrderByInput
  ) {
    feed(take: $take, skip: $skip, orderBy: $orderBy) {
      id
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;
```

</Instruction>

The query now accepts arguments that we'll use to implement
pagination and ordering. `skip` defines the _offset_ where
the query will start. For example, if we passed a value of
**10** for this argument, it means that the first 10 items
of the list will not be included in the response. `take`
then defines the _limit_ or _how many_ elements we want to
load from that list. If we pass in `10` for `skip` and `5`
for `first`, we'll receive items 10 to 15 from the list.
`orderBy` defines how the returned list should be sorted.

But how can we pass the variables when using the `useQuery`
hook which is fetching the data under the hood? The key is
that we need to pass these variables in when we make the
call to `useQuery`.

<Instruction>

Still in `LinkList.js`, adjust the `useQuery` hook to accept
the variables we want to pass to the query.

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { useHistory } from 'react-router';

// ...

const LinkList = () => {
  const history = useHistory();
  const isNewPage = history.location.pathname.includes(
    'new'
  );
  const pageIndexParams = history.location.pathname.split(
    '/'
  );
  const page = parseInt(
    pageIndexParams[pageIndexParams.length - 1]
  );

  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE : 0;

  const {
    data,
    loading,
    error,
    subscribeToMore
  } = useQuery(FEED_QUERY, {
    variables: getQueryVariables(isNewPage, page)
  });

  // ...
};
```

</Instruction>

We're passing in an object as the second argument to
`useQuery`, right after we pass in the `FEED_QUERY`
document. We can use this object to modify the behavior of
the query in various ways. One of the most common things we
do with it is to provide `variables`.

<Instruction>

The `variables` key points to a function call that will
retrieve the variables. Let's implement the
`getQueryVariables` function.

</Instruction>

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { LINKS_PER_PAGE } from '../constants';

// ...

const getQueryVariables = (isNewPage, page) => {
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
  const take = isNewPage ? LINKS_PER_PAGE : 100;
  const orderBy = { createdAt: 'desc' };
  return { take, skip, orderBy };
};
```

<Instruction>

The `getQueryVariables` function is responsible for
returning values for `skip`, `take`, and `orderBy`. For
`skip`, we first check whether we are currently on the
`/new` route. If so, the value for `skip` is the current
page (subtracting `1` to handle the index) multiplied by the
`LINKS_PER_PAGE` contstant. If we're not on the `/new`
route, the value for `skip` is `0`. We use the same
`LINKS_PER_PAGE` constant to determine how many links to
`take`.

</Instruction>

We're now passing `take, skip, orderBy` values as
`variables` based on the current page.

Also note that we're including the ordering attribute
`{ createdAt: 'desc' }` for the `new` page to make sure the
newest links are displayed first. The ordering for the
`/top` route will be calculated manually based on the number
of votes for each link.

We also need to define the `LINKS_PER_PAGE` constant and
then import it into the `LinkList` component.

<Instruction>

Open `src/constants.js` and add the following definition:

```js(path=".../hackernews-react-apollo/src/constants.js")
export const LINKS_PER_PAGE = 5;
```

</Instruction>

### Implementing Navigation

Next, we need functionality for the user to switch between
the pages. First add two `button` elements to the bottom of
the `LinkList` component that can be used to navigate back
and forth.

<Instruction>

Open `LinkList.js` and update the returned JSX to look as
follows:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
return (
  <>
    {loading && <p>Loading...</p>}
    {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
    {data && (
      <>
        {getLinksToRender(isNewPage, data).map(
          (link, index) => (
            <Link
              key={link.id}
              link={link}
              index={index + pageIndex}
            />
          )
        )}
        {isNewPage && (
          <div className="flex ml4 mv3 gray">
            <div
              className="pointer mr2"
              onClick={() => {
                if (page > 1) {
                  history.push(`/new/${page - 1}`);
                }
              }}
            >
              Previous
            </div>
            <div
              className="pointer"
              onClick={() => {
                if (
                  page <=
                  data.feed.count / LINKS_PER_PAGE
                ) {
                  const nextPage = page + 1;
                  history.push(`/new/${nextPage}`);
                }
              }}
            >
              Next
            </div>
          </div>
        )}
      </>
    )}
  </>
);
```

</Instruction>

<Instruction>

Now adjust the import statement from `../constants` in
`LinkList.js` to also include the new constant:

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
import { LINKS_PER_PAGE } from '../constants';
```

</Instruction>

Since the setup is slightly more complicated now, we are
going to calculate the list of links to be rendered in a
separate method.

<Instruction>

Still in `LinkList.js`, add the following method
implementation:

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
const getLinksToRender = (isNewPage, data) => {
  if (isNewPage) {
    return data.feed.links;
  }
  const rankedLinks = data.feed.links.slice();
  rankedLinks.sort(
    (l1, l2) => l2.votes.length - l1.votes.length
  );
  return rankedLinks;
};
```

</Instruction>

For the `newPage`, we simply return all the links returned
by the query. That's logical since here we don't have to
make any manual modifications to the list that is to be
rendered. If the user loaded the component from the `/top`
route, we'll sort the list according to the number of votes
and return the top 10 links.

Let's have a closer look at the logic for the **Next** and
**Previous** links.

```js{}(path=".../hackernews-react-apollo/src/components/LinkList.js")
{
  isNewPage && (
    <div className="flex ml4 mv3 gray">
      <div
        className="pointer mr2"
        onClick={() => {
          if (page > 1) {
            history.push(`/new/${page - 1}`);
          }
        }}
      >
        Previous
      </div>
      <div
        className="pointer"
        onClick={() => {
          if (page <= data.feed.count / LINKS_PER_PAGE) {
            const nextPage = page + 1;
            history.push(`/new/${nextPage}`);
          }
        }}
      >
        Next
      </div>
    </div>
  );
}
```

We start by retrieving the current page from the URL and
doing a sanity check to make sure that it makes sense to
paginate back or forth. We then calculate the next page and
tell the router where to navigate to next. The router will
then reload the component with a new `page` in the URL that
will be used to calculate the right chunk of links to load.

Run the app by typing `yarn start` in a terminal and use the
new buttons to paginate through the list of links!

### Final Adjustments

Through the changes that we made to the `FEED_QUERY`, we'll
notice that the `update` functions of the mutations don't
work any more. That's because `readQuery` now also expects
to get passed the same variables that we defined before.

> **Note**: `readQuery` essentially works in the same way as
> the `query` method on the `ApolloClient` that we used to
> implement the search. However, instead of making a call to
> the server, it will simply resolve the query against the
> local store! If a query was fetched from the server with
> variables, `readQuery` also needs to know the variables to
> make sure it can deliver the right information from the
> cache.

<Instruction>

With that information, open `Link.js` and update the
`update` function on the `useMutation` hook:

```js{5-7, 16-20, 40-44}(path=".../hackernews-react-apollo/src/components/Link.js")
import { AUTH_TOKEN, LINKS_PER_PAGE } from '../constants';

// ...

const take = LINKS_PER_PAGE;
const skip = 0;
const orderBy = { createdAt: 'desc' };

const [vote] = useMutation(VOTE_MUTATION, {
  variables: {
    linkId: link.id
  },
  update(cache, { data: { vote } }) {
    const { feed } = cache.readQuery({
      query: FEED_QUERY,
      variables: {
        take,
        skip,
        orderBy
      }
    });

    const updatedLinks = feed.links.map((feedLink) => {
      if (feedLink.id === link.id) {
        return {
          ...feedLink,
          votes: [...feedLink.votes, vote]
        };
      }
      return feedLink;
    });

    cache.writeQuery({
      query: FEED_QUERY,
      data: {
        feed: {
          links: updatedLinks
        }
      },
      variables: {
        take,
        skip,
        orderBy
      }
    });
  }
});
```

</Instruction>

We have now added a simple pagination system to the app,
allowing users to load links in small chunks instead of
loading them all up front.
