---
title: Mutations
pageTitle: "Building a GraphQL Server with Go Backend Tutorial"
description: "what are mutations and implementing a mutation in gqlgen"
---

## What Is A Mutation <a name="what-is-a-mutation"></a>
Simply mutations are just like queries but they can cause a data write, Technically Queries can be used to write data too however it's not suggested to use it.
So mutations are like queries, they have names, parameters and they can return data.
## A Simple Mutation <a name="a-simple-mutation"></a>
Let's try to implement the createLink mutation, since we do not have a database set up yet(we'll get it done in the next section) we just receive the link data and construct a link object and send it back for response!
<Instruction>

Open `schema.resolvers.go` and Look at `CreateLink` function:
```go
func (r *mutationResolver) CreateLink(ctx context.Context, input model.NewLink) (*model.Link, error) {
```

</Instruction>

This function receives a `NewLink` with type of `input` we defined NewLink structure in our `schema.graphqls`.

<Instruction>

Try to Construct a `Link` object we defined in our `schema.graphqls`:
```go
func (r *mutationResolver) CreateLink(ctx context.Context, input model.NewLink) (*Link, error) {
	var link Link
	var user User
	link.Address = input.Address
	link.Title = input.Title
	user.Username = "test"
	link.User = &user
	return &link, nil
}
```

</Instruction>

now run server and use the mutation to create a new link:
```
mutation {
  createLink(input: {title: "new link", address:"http://address.org"}){
    title,
    user{
      name
    }
    address
  }
}
```
and you will get:
```
{
  "data": {
    "createLink": {
      "title": "new link",
      "user": {
        "name": "test"
      },
      "address": "http://address.org"
    }
  }
}
```
Nice now we know what are mutations and queries we can setup our database and make these implementations more practical.
