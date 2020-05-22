# Create and Retrieve Links
Now we have our database ready we can start implementing our schema!

## CreateLinks
Lets implement CreateLink mutation; first we need a function to let us write a link to database.
Create a folders links and users inside internal folder, these packages are layers between database and our app.

<Instruction>

`internal/users/users.go`:
```go
package users

type User struct {
	ID       string `json:"id"`
	Username     string `json:"name"`
	Password string `json:"password"`
}
```

</Instruction>

<Instruction>

`internal/links/links.go`:
```go
package links

import (
	database "github.com/glyphack/go-graphql-hackernews/internal/pkg/db/mysql"
	"github.com/glyphack/go-graphql-hackernews/internal/users"
	"log"
)

// #1
type Link struct {
	ID      string
	Title   string
	Address string
	User    *users.User
}

//#2
func (link Link) Save() int64 {
	//#3
	statement, err := database.Db.Prepare("INSERT INTO Links(Title,Address) VALUES(?,?)")
	if err != nil {
		log.Fatal(err)
	}
	//#4
	res, err := statement.Exec(link.Title, link.Address)
	if err != nil {
		log.Fatal(err)
	}
	//#5
	id, err := res.LastInsertId()
	if err != nil {
		log.Fatal("Error:", err.Error())
	}
	log.Print("Row inserted!")
	return id
}

```

</Instruction>

In users.go we just defined a `struct` that represent users we get from database, But let me explain links.go part by part:
* 1: definition of struct that represent a link.
* 2: function that insert a Link object into database and returns it's ID.
* 3: our sql query to insert link into Links table. you see we used prepare here before db.Exec, the prepared statements helps you with security and also performance improvement in some cases. you can read more about it [here](https://www.postgresql.org/docs/9.3/sql-prepare.html).
* 4: execution of our sql statement.
* 5: retrieving Id of inserted Link.

Now we use this function in our CreateLink resolver:

<Instruction>

`resolver.go`:
```go
func (r *mutationResolver) CreateLink(ctx context.Context, input NewLink) (*Link, error) {
	var link links.Link
	link.Title = input.Title
	link.Address = input.Address
	linkId := link.Save()
	return &Link{ID: strconv.FormatInt(linkId, 10), Title:link.Title, Address:link.Address}, nil
}
```

</Instruction>

Hopefully you understand this piece of code, we create a link object from input and save it to database then return newly created link(notice that we convert the ID to string with `strconv.FormatInt`).
note that here we have 2 structs for Link in our project, one is use for our graphql server and one is for our database.
run the server and open graphiql page to test what we just wrote:

<Instruction>

```
mutation create{
  createLink(input: {title: "something", address: "somewhere"}){
    title,
    address,
    id,
  }
}
```
```
{
  "data": {
    "createLink": {
      "title": "something",
      "address": "somewhere",
      "id": "1"
    }
  }
}
```

</Instruction>

## links Query <a name="links-query"></a>
Just like how we implemented CreateLink mutation we implement links query, we need a function to retrieve links from database and pass it to graphql server in our resolver.
Create a function named GetAll

<Instruction>

`internal/links/links.go`:
```go
func GetAll() []Link {
	stmt, err := database.Db.Prepare("select id, title, address from Links")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	var links []Link
	for rows.Next() {
		var link Link
		err := rows.Scan(&link.ID, &link.Title, &link.Address)
		if err != nil{
			log.Fatal(err)
		}
		links = append(links, link)
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	return links
}
```

</Instruction>

Return links from GetAll in Links query.

<Instruction>

`resolver.go`:
```go
func (r *queryResolver) Links(ctx context.Context) ([]*Link, error) {
	var resultLinks []*Link
	var dbLinks []links.Link
	dbLinks = links.GetAll()
	for _, link := range dbLinks{
		resultLinks = append(resultLinks, &Link{ID:link.ID, Title:link.Title, Address:link.Address})
	}
	return resultLinks, nil
}
```

</Instruction>

Now query Links at graphiql:
```
query {
  links {
    title
    address
    id
  }
}

```
result:
```
{
  "data": {
    "links": [
      {
        "title": "something",
        "address": "somewhere",
        "id": "1"
      }
    ]
  }
}
```
