---
title: Auth Endpoints
pageTitle: "Building a GraphQL Server with Go Backend Tutorial | Auth Endpoints"
description: "Enable Users to register, login and refresh their token"
---

## CreateUser <a name="createuser"></a>
We continue our implementation of CreateUser mutation with functions we have written in auth section.

<Instruction>

`schema.resolvers.go`:
```go
func (r *mutationResolver) CreateUser(ctx context.Context, input model.NewUser) (string, error) {
	var user users.User
	user.Username = input.Username
	user.Password = input.Password
	user.Create()
	token, err := jwt.GenerateToken(user.Username)
	if err != nil{
		return "", err
	}
	return token, nil
}
```

</Instruction>

In our mutation first we create a user using given username and password and then generate a token for the user so we can recognize the user in requests.
Start the server and try it in graphiql:
query:
```
mutation {
  createUser(input: {username: "user1", password: "123"})
}
```
results:
```
{
  "data": {
    "createUser": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODE0NjAwODUsImlhdCI6MTU4MTQ1OTc4NX0.rYLOM123kSulGjvK5VP8c7S0kgk03WweS2VJUUbAgNA"
  }
}
```
So we successfully created our first user!

## Login <a name="login"></a>
For this mutation, first we have to check if user exists in database and given password is correct, then we generate a token for user and give it back to user.

<Instruction>

`internal/users.go`:
```go
func (user *User) Authenticate() bool {
	statement, err := database.Db.Prepare("select Password from Users WHERE Username = ?")
	if err != nil {
		log.Fatal(err)
	}
	row := statement.QueryRow(user.Username)

	var hashedPassword string
	err = row.Scan(&hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return false
		} else {
			log.Fatal(err)
		}
	}

	return CheckPasswordHash(user.Password, hashedPassword)
}

//CheckPassword hash compares raw password with it's hashed values
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
```

</Instruction>

Explanation:
* we select the user with the given username and then check if hash of the given password is equal to hashed password that we saved in database.

<Instruction>

`schema.resolvers.go`
```go
func (r *mutationResolver) Login(ctx context.Context, input model.Login) (string, error) {
	var user users.User
	user.Username = input.Username
	user.Password = input.Password
	correct := user.Authenticate()
	if !correct {
		// 1
		return "", &users.WrongUsernameOrPasswordError{}
	}
	token, err := jwt.GenerateToken(user.Username)
	if err != nil{
		return "", err
	}
	return token, nil
}
```

</Instruction>

We used the Authenticate function declared above and after that if the username and password are correct we return a new token for user and if not we return error, `&users.WrongUsernameOrPasswordError`, here is implementation for this error:

<Instruction>

`internal/users/errors.go`:
```go
package users

type WrongUsernameOrPasswordError struct{}

func (m *WrongUsernameOrPasswordError) Error() string {
	return "wrong username or password"
}
```

</Instruction>

To define a custom error in go you need a struct with Error method implemented, here is our error for wrong username or password with it's Error() method.
Again you can try login with username and password from the user we created and get a token.

## Refresh Token <a name="refresh-token"></a>
This is the last endpoint we need to complete our authentication system, imagine a user has loggedIn in our app and it's token is going to get expired after minutes we set(when generated the token), now we need a solution to keep our user loggedIn. One solution is to have a endpoint to get tokens that are going to expire and regenerate a new token for that user so that app uses new token.
So our endpoint should take a token, Parse the username and generate a new token for that username.

<Instruction>

`schema.resolvers.go`:
```go
func (r *mutationResolver) RefreshToken(ctx context.Context, input model.RefreshTokenInput) (string, error) {
	username, err := jwt.ParseToken(input.Token)
	if err != nil {
		return "", fmt.Errorf("access denied")
	}
	token, err := jwt.GenerateToken(username)
	if err != nil {
		return "", err
	}
	return token, nil
}
```

</Instruction>

Implementation is pretty straightforward so we skip the explanation for this.
