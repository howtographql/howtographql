---
title: More Mutations and Updating the Store
pageTitle:
  'Mutations and Caching with GraphQL, React and Apollo
  Tutorial'
description:
  "Learn how to use Apollo's imperative store API to update
  the cache after a GraphQL mutation. The updates will
  automatically be reflected in our React components."
question:
  "What does the 'update' prop of Apollo's <Mutation />
  component do?"
answers:
  [
    'It allows to update your Apollo Client dependency
    locally',
    'It allows to update the local Apollo store in a
    declarative fashion',
    'It allows to update your store based on your mutation’s
    result',
    "It updates the GraphQL schema locally so Apollo Client
    can verify your queries and mutations before they're
    sent to the server"
  ]
correctAnswer: 2
videoId: ''
duration: 0
videoAuthor: ''
---

The next piece of functionality we'll implement is the
voting feature! Authenticated users are allowed to submit a
vote for a link. The most upvoted links will later be
displayed on a separate route!

### Preparing the React Components

Once more, the first step to implement this new feature is
to make our React components ready for the expected
functionality.

</Instruction>

Open `Link.js` and update the returned JSX to look like
this:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { AUTH_TOKEN } from '../constants';
// ...

const Link = (props) => {
  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <div
            className="ml1 gray f11"
            style={{ cursor: 'pointer' }}
            onClick={() => {console.log("Clicked vote button")}}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        {(
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by{' '}
            {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Link;
```

</Instruction>

We're already preparing the `Link` component to render the
number of votes for each link and the name of the user that
posted it. We'll also render the upvote button if a user is
currently logged in - that's what we're using the
`authToken` for. If the `Link` is not associated with a
`User`, the user's name will be displayed as `Unknown`.

Notice that we're also using a function called
`timeDifferenceForDate` that gets passed the `createdAt`
information for each link. The function will take the
timestamp and convert it to a string that's more user
friendly, e.g. `"3 hours ago"`.

Go ahead and implement the `timeDifferenceForDate` function
next so we can import and use it in the `Link` component.

<Instruction>

Create a new file called `utils.js` in the `src` directory
and paste the following code into it:

```js(path=".../hackernews-react-apollo/src/utils.js")
function timeDifference(current, previous) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'just now';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  } else if (elapsed < milliSecondsPerHour) {
    return (
      Math.round(elapsed / milliSecondsPerMinute) +
      ' min ago'
    );
  } else if (elapsed < milliSecondsPerDay) {
    return (
      Math.round(elapsed / milliSecondsPerHour) + ' h ago'
    );
  } else if (elapsed < milliSecondsPerMonth) {
    return (
      Math.round(elapsed / milliSecondsPerDay) + ' days ago'
    );
  } else if (elapsed < milliSecondsPerYear) {
    return (
      Math.round(elapsed / milliSecondsPerMonth) + ' mo ago'
    );
  } else {
    return (
      Math.round(elapsed / milliSecondsPerYear) +
      ' years ago'
    );
  }
}

export function timeDifferenceForDate(date) {
  const now = new Date().getTime();
  const updated = new Date(date).getTime();
  return timeDifference(now, updated);
}
```

</Instruction>

<Instruction>

Back in `Link.js`, import `AUTH_TOKEN` and
`timeDifferenceForDate` on top the file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';
```

</Instruction>

Finally, each `Link` element will also render its position
inside the list, so we have to pass down an `index` from the
`LinkList` component.

<Instruction>

Open `LinkList.js` and update the rendering of the `Link`
component to include the `index`.

```js(path=".../hackernews-react-apollo/src/components/LinkList.js")
return (
  <div>
    {data && (
      <>
        {data.feed.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </>
    )}
  </div>
);
```

</Instruction>

Notice that the app won't run at the moment since the
`votes` are not yet included in the query. We'll fix that
next!

<Instruction>

Open `LinkList.js` and update the definition of `FEED_QUERY`
to include votes. We should also export this query so that
it can be imported in other files.

```js{9-18}(path=".../hackernews-react-apollo/src/components/LinkList.js")
export const FEED_QUERY = gql`
  {
    feed {
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
    }
  }
`;
```

</Instruction>

Here we are including information about the user who posted
a link as well as information about the links' votes in the
query's payload. We can now run the app again and the links
will be properly displayed.

![Links in the query's payload](https://imgur.com/YCv4QGb.png)

> **Note**: If you're not able to fetch the `Links`, restart
> the server and reload the browser. You could also check if
> everything is working as expected on `GraphQL Playground`!

Let's now move on and implement the `vote` mutation!

### Calling the Mutation

<Instruction>

Open `Link.js` and add the following mutation definition to
the top of the file.

```js(path=".../hackernews-react-apollo/src/components/Link.js")
const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;
```

</Instruction>

<Instruction>

Once more, let's use the `useMutation` hook to do the
voting. We'll call the function that runs the mutation
`vote` and will pass the `VOTE_MUTATION` GraphQL mutation to
it. The `vote` function will be called in the `onClick` handler for the `div` with the up caret (▲) calls upvote button. 

```js{2-6,15}(path=".../hackernews-react-apollo/src/components/Link.js")
const Link = (props) => {
  // ...
  const [vote] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id
    }
  });
  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        <div
          className="ml1 gray f11"
          style={{ cursor: 'pointer' }}
          onClick={vote}
        >
          ▲
        </div>
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        {authToken && (
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by{' '}
            {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
};
```

</Instruction>

This step should feel pretty familiar by now. The `onClick`
handler of the `div` with the up caret calls the `vote`
function which runs the mutation to place a vote.

<Instruction>

We need to import `useMutation` and `gql` for the mutation
to work.

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { useMutation, gql } from '@apollo/client';
```

</Instruction>

We can now go and test the implementation! Run `yarn start`
in `hackernews-react-apollo` and click the upvote button on
a link. You're not getting any UI feedback yet, but after
refreshing the page we'll see the added votes.

> **Remember**: We have to be logged in to being able to
> vote links!

In the next section, we'll learn how to automatically update
the UI after each mutation!

### Updating the cache

One of Apollo's biggest value propositions is that it
creates and maintains a client-side cache for our GraphQL
apps. We typically don't need to do much to manage the
cache, but in some circumstances, we do.

When we perform mutations that affect a list of data, we
need to manually intervene to update the cache. We'll
implement this functionality by using the [update callback](https://www.apollographql.com/docs/react/data/mutations/#the-update-function) of `useMutation`.  

<Instruction>

Open `Link.js` and update the mutation to include some
additional behavior in the `update` callback. This runs
after the mutation has completed and allows us to read the
cache, modify it, and commit the changes.

```js{6-31}(path=".../hackernews-react-apollo/src/components/Link.js")
const Link = (props) => {
  // ...
  const [vote] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id
    },
    update: (cache, {data: {vote}}) => {
      const { feed } = cache.readQuery({
        query: FEED_QUERY
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
        }
      });
    }
  });

  // ...
};
```

</Instruction>

In the `update` callback is that we've included with the
mutation, we're calling `cache.readQuery` and passing in the
`FEED_QUERY` document. This allows us to read the exact
portion of the Apollo cache that we need to allow us to
update it. Once we have the cache, we create a new array of
data that includes the vote that was just made. The vote
that was made with the mutation is
[destructured](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
out using `{ data: { vote } }`. Once we have the new list of
votes, we can commit the changes to the cache using
`cache.writeQuery`, passing in the new data.


The last thing we need to do for this to work is import the
`FEED_QUERY` into the `Link` file:

```js(path=".../hackernews-react-apollo/src/components/Link.js")
import { FEED_QUERY } from './LinkList';
```

That's it! The `update` function will now be executed and
make sure that the store gets updated properly after a
mutation was performed. The store update will trigger a
rerender of the component and thus update the UI with the
correct information!

While we're at it, let's also implement `update` for adding
new links!

<Instruction>

Open `CreateLink.js` and following what we did before, add
an `update` callback to the `useMutation` hook to update the
Apollo store.







```js{6-19}(path=".../hackernews-react-apollo/src/components/CreateLink.js")
const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url
    },
    update: (cache, { data: { post } }) => {
      const data = cache.readQuery({
        query: FEED_QUERY,
      });

      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: [post, ...data.feed.links]
          }
        },
      });
    },
    onCompleted: () => navigate("/")
  });
```

</Instruction>

The `update` function works in a very similar way as before.
We first read the current state of the results of the
`FEED_QUERY`. Then we insert the newest link at beginning
and write the query results back to the store. Note that we
need to pass in a set of variables to the `readQuery` and
`writeQuery` functions. It's not enough to simply pass the
`FEED_QUERY` query document in, we also need to specify the
conditions of the original query we're targeting. In this
case, we pass in variables that line up with the initial
variables we passed into the query in `LinkList.js`.

<Instruction>

We need to import the
`FEED_QUERY` into the file. 

```js(path=".../hackernews-react-apollo/src/components/CreateLink.js")
import { FEED_QUERY } from './LinkList';
```

</Instruction>


Awesome, now the store also updates with the right
information after new links are added. The app is getting
into shape 🤓
