### Motivation <a name="motivation"></a>
[**Go**](https://golang.org/) is a modern general purpose programming language designed by google; best known for it's simplicity, concurrency and fast performance. It's being used by big players in the industry like Google, Docker, Lyft and Uber. If you are new to golang you can start from [golang tour](https://tour.golang.org/) to learn fundamentals.

[**gqlgen**](https://gqlgen.com/) is a library for creating GraphQL applications in Go.


In this tutorial we Implement a Hackernews GraphQL API clone  with *golang* and *gqlgen* and learn about GraphQL fundamentals along the way.
Source code and also this tutorial are available on Github at: https://github.com/howtographql/graphql-golang


#### What is a GraphQL server? <a name="what-is-a-graphql-server"></a>
A GraphQL server is able to receive requests in GraphQL Query Language format and return response in desired form.
GraphQL is a query language for API so you can send queries and ask for what you need and exactly get that piece of data.
In this sample query we are looking for address, title of the links and name of the user who add it:
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
response:
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

#### Schema-Driven Development <a name="schema-driven-development"></a>
In GraphQL your API starts with a schema that defines all your types, queries and mutations, It helps others to understand your API. So it's like a contract between server and the client.
Whenever you need to add a new capability to a GraphQL API you must redefine schema file and then implement that part in your code. GraphQL has it's [Schema Definition Language](http://graphql.org/learn/schema/) for this purpose.
gqlgen is a Go library for building GraphQL servers and has a nice feature that generates code based on your schema definition.
