---
title: Queries
pageTitle: "Building a GraphQL Server with Go Backend Tutorial"
description: "what are queries and implementing a query in gqlgen"
---

In the previous section we setup up the server, Now we try to implement a Query that we defined in `schema.grpahqls`.

## What Is A Query <a name="what-is-a-query"></a>
a query in graphql is asking for data, you use a query and specify what you want and graphql will return it back to you.

## Simple Query <a name="simple-query"></a>

<Instruction>

open `schema.resolvers.go` file and take a look at Links function,
```go
func (r *queryResolver) Links(ctx context.Context) ([]*model.Link, error) {
```

</Instruction>

Notice that this function takes a Context and returns slice of Links and an error(if there are any).
ctx argument contains the data from the person who sends request like which user is working with app(we'll see how later), etc.

Let's make a dummy response for this function, for now.

<Instruction>

`schema.resolvers.go`:
```go
func (r *queryResolver) Links(ctx context.Context) ([]*model.Link, error) {
  var links []*model.Link
  dummyLink := model.Link{
    Title: "our dummy link",
    Address: "https://address.org",
    User: &model.User{Name: "admin"},
  }
	links = append(links, &dummyLink)
	return links, nil
}
```

</Instruction>

now run the server with `go run server.go` and send this query in Graphiql:
```
query {
	links{
    title
    address,
    user{
      name
    }
  }
}
```
And you will get:
```
{
  "data": {
    "links": [
      {
        "title": "our dummy link",
        "address": "https://address.org",
        "user": {
          "name": "admin"
        }
      }
    ]
  }
}
```
Now you know how we generate response for our graphql server. But this response is just a dummy response we want be able to query all other users links, In the next section we setup database for our app to be able to save links and retrieve them from database.
