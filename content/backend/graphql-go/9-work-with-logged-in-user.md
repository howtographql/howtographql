#### Completing Our app <a name="completing-our-app"></a>
Our CreateLink mutation left incomplete because we could not authorize users back then, so let's get back to it and complete the implementation.
With what we did in authentication middleware we can retrieve user in resolvers using ctx argument. so in CreateLink function add these lines:

`resolver.go`:
```go
func (r *mutationResolver) CreateLink(ctx context.Context, input NewLink) (*Link, error) {
	// 1
	user := auth.ForContext(ctx)
	if user == nil {
		return &Link{}, fmt.Errorf("access denied")
	}
	.
	.
	.
	// 2
	link.User = user
	linkId := link.Save()
	grahpqlUser := &User{
		ID:   user.ID,
		Name: user.Username,
	}
	return &Link{ID: strconv.FormatInt(linkId, 10), Title:link.Title, Address:link.Address, User:grahpqlUser}, nil
}
```
Explanation:
* 1: we get user object from ctx and if user is not set we return error with message access denied.
* 2: then we set user of that link equal to the user is requesting to create the link.

And edit the links query to get user from db too.

`resolver.go`:
```go
func (r *queryResolver) Links(ctx context.Context) ([]*Link, error) {
	var resultLinks []*Link
	var dbLinks []links.Link
	dbLinks = links.GetAll()
	for _, link := range dbLinks{
		grahpqlUser := &User{
			ID:   link.User.ID,
			Name: link.User.Username,
		}
		resultLinks = append(resultLinks, &Link{ID:link.ID, Title:link.Title, Address:link.Address, User:grahpqlUser})
	}
	return resultLinks, nil
}
```


The part that is left here is our database operation for creating link, We need to create foreign key from the link we inserting to that user.

`internal/links/links.go`:
In our Save method from links changed the query statement to:
```go
statement, err := database.Db.Prepare("INSERT INTO Links(Title,Address, UserID) VALUES(?,?, ?)")
```
and the line that we execute query to:
```go
res, err := statement.Exec(link.Title, link.Address, link.User.ID)
```
Then when we query for users we also fill the `User` field for Link, so we need to join Links and Users table in our `GetAll` functions to fill the User field.
If you are not familiar with join checkout [this link](https://www.w3schools.com/sql/sql_join_inner.asp).

`internal/links/links.go`:
```go
func GetAll() []Link {
	stmt, err := database.Db.Prepare("select L.id, L.title, L.address, L.UserID, U.Username from Links L inner join Users U on L.UserID = U.ID") // changed
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
	var username string
	var id string
	for rows.Next() {
		var link Link
		err := rows.Scan(&link.ID, &link.Title, &link.Address, &id, &username) // changed
		if err != nil{
			log.Fatal(err)
		}
		link.User = &users.User{
			ID:       id,
			Username: username,
		} // changed
		links = append(links, link)
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	return links
}
```

and Our app is finally complete.
