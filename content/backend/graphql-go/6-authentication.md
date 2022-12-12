---
title: Authentication
pageTitle: "Building a GraphQL Server with Go Backend Tutorial | Authentication"
description: "Implement authentication in gqlgen with jwt"
---

One of the most common layers in a web applications is the authentication layer. Our app is no exception. For authentication, we are going to use JWT tokens as the way to authenticate users. Let's see how it works.

## JWT <a name="jwt"></a>
[JWT](https://jwt.io/) or Json Web Token is a string containing a hash that helps us authenticate users. Every token is constructed of 3 parts, like `xxxxx.yyyyy.zzzzz`. These three parts are: Header, Payload, and Signature. We won't go into these three parts, because this is more about JWT and less about our application. You can read more about this [here](https://jwt.io/introduction/).
Whenever a user logs in into our application, the server generates a token. Usually, the server includes information, like the username, in the token to be able to recognize the user later on. These tokens get signed by a secret key, so only the issuer (our application) can read the contents of the token.
We are going to implement this behavior in our application.

### Setup <a name="setup"></a>
In our app, we need to be able to generate a token for users when they sign up or login. We also need to create some middleware to authenticate users by the given token, so we know who's connected to our server. We will be using the `github.com/dgrijalva/jwt-go` library to generate and parse JWT tokens.

### Generating and Parsing JWT Tokens <a name="generating-and-parsing-jwt-tokens"></a>
We'll create a new directory called ``pkg`` in the root of our application. You have seen that we've used ``internal`` for what we want to only be internally used within our app. The ``pkg`` directory is for files that could be imported anywhere in our application. JWT generation and validation scripts files like this.

There is a concept called "claims". We'll see more about it in rest of the section.

<Instruction>

`pkg/jwt/jwt.go`:
```go
package jwt

import (
	"github.com/dgrijalva/jwt-go"
	"log"
	"time"
)

// secret key being used to sign tokens
var (
	SecretKey = []byte("secret")
)

// GenerateToken generates a jwt token and assign a username to it's claims and return it
func GenerateToken(username string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	/* Create a map to store our claims */
	claims := token.Claims.(jwt.MapClaims)
	/* Set token claims */
	claims["username"] = username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		log.Fatal("Error in Generating key")
		return "", err
	}
	return tokenString, nil
}

// ParseToken parses a jwt token and returns the username in it's claims
func ParseToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return SecretKey, nil
	})
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		username := claims["username"].(string)
		return username, nil
	} else {
		return "", err
	}
}
```

</Instruction>


Let's talk about what the code above does:
* GenerateToken function will be used whenever we want to generate a token for a user. We save username in the token claims and set the token expiration time to 24 Hours later.
* ParseToken function will be used whenever we receive a token and want to know who sent the request.

## User SignUp and Login Functionality <a name="user-signup-and-login-functionality"></a>
Now we can generate a token for each user. Before generating a token for every user, we need to make sure the user exists in our database. 
To do this, we just need to query the database to match the user with the given username and password.
When a user tries to register we need to insert the username and password in our database.

<Instruction>

`internal/users/users.go`:
```go
package users

import (
	"database/sql"
	"github.com/glyphack/go-graphql-hackernews/internal/pkg/db/mysql"
	"golang.org/x/crypto/bcrypt"

	"log"
)

type User struct {
	ID       string `json:"id"`
	Username     string `json:"name"`
	Password string `json:"password"`
}

func (user *User) Create() {
	statement, err := database.Db.Prepare("INSERT INTO Users(Username,Password) VALUES(?,?)")
	print(statement)
	if err != nil {
		log.Fatal(err)
	}
	hashedPassword, err := HashPassword(user.Password)
	_, err = statement.Exec(user.Username, hashedPassword)
	if err != nil {
		log.Fatal(err)
	}
}

//HashPassword hashes given password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

//CheckPassword hash compares raw password with it's hashed values
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
```

</Instruction>

The Create function is much like the CreateLink function we saw earlier. Let's break down the Authenticate code:
* First we have a query to select the password from users table where username is equal to the username we got from the resolver.
* We use QueryRow instead of Exec we used earlier; The difference is `QueryRow()` will return a pointer to a `sql.Row`.
* Using `.Scan` method we fill the hashedPassword variable with the hashed password from database. Obviously you don't want to [save raw passwords](https://security.blogoverflow.com/2011/11/why-passwords-should-be-hashed/) in your database.
* then we check if any user with the given username exists or not. If there isn't a match, we return `false`. If we found a match, we check the user hashedPassword with the raw password given.(Notice that we save hashed passwords not raw passwords in database in line 23)

In the next part, we gather the tools we have to detect which user is using the app.

## Authentication Middleware <a name="authentication-middleware"></a>
Every time a request comes to our resolver, we need to know which user is sending the request. To accomplish this, we have to write middleware that's executed before the request reaches the resolver. This middleware resolves the user from the incoming request and passes this on to the resolver.

<Instruction>

`internal/users/users.go`:
```go
//GetUserIdByUsername check if a user exists in database by given username
func GetUserIdByUsername(username string) (int, error) {
	statement, err := database.Db.Prepare("select ID from Users WHERE Username = ?")
	if err != nil {
		log.Fatal(err)
	}
	row := statement.QueryRow(username)

	var Id int
	err = row.Scan(&Id)
	if err != nil {
		if err != sql.ErrNoRows {
			log.Print(err)
		}
		return 0, err
	}

	return Id, nil
}
```

</Instruction>

We use this function to get user object with username in the authentication middeware.

And now let's create our auth middleware. For more information visit [gql authentication docs](https://github.com/99designs/gqlgen/blob/master/docs/content/recipes/authentication.md).

<Instruction>

`internal/auth/middleware.go`:
```go
package auth

import (
	"context"
	"net/http"
	"strconv"

	"github.com/glyphack/go-graphql-hackernews/internal/users"
	"github.com/glyphack/go-graphql-hackernews/pkg/jwt"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

func Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")

			// Allow unauthenticated users in
			if header == "" {
				next.ServeHTTP(w, r)
				return
			}

			//validate jwt token
			tokenStr := header
			username, err := jwt.ParseToken(tokenStr)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusForbidden)
				return
			}

			// create user and check if user exists in db
			user := users.User{Username: username}
			id, err := users.GetUserIdByUsername(username)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			user.ID = strconv.Itoa(id)
			// put it in context
			ctx := context.WithValue(r.Context(), userCtxKey, &user)

			// and call the next with our new context
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

// ForContext finds the user from the context. REQUIRES Middleware to have run.
func ForContext(ctx context.Context) *users.User {
	raw, _ := ctx.Value(userCtxKey).(*users.User)
	return raw
}
```

</Instruction>

Now we can use the middleware we created in our server:

<Instruction>

`server/server.go`:
```go
package main

import (
	"github.com/glyphack/go-graphql-hackernews/internal/auth"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/handler"
	hackernews "github.com/glyphack/go-graphql-hackernews"
	"github.com/glyphack/go-graphql-hackernews/internal/pkg/db/mysql"
	"github.com/go-chi/chi"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	router := chi.NewRouter()

	router.Use(auth.Middleware())

	database.InitDB()
	database.Migrate()
	server := handler.NewDefaultServer(hackernews.NewExecutableSchema(hackernews.Config{Resolvers: &hackernews.Resolver{}}))
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", server)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
```

</Instruction>
