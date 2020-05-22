### Authentication <a name="authentication"></a>
One of most common layers in web applications is authentication system, our app is no exception. For authentication we are going to use jwt tokens as our way to authentication users, lets see how it works.

##### JWT <a name="jwt"></a>
[JWT](https://jwt.io/) or Json Web Token is a string containing a hash that helps us verify who is using application. Every token is constructed of 3 parts like `xxxxx.yyyyy.zzzzz` and name of these parts are: Header, Payload and Signature. Explanation about these parts are more about JWT than our application you can read more about them [here](https://jwt.io/introduction/).
whenever a user login to an app server generates a token for user, Usually server saves some information like username about the user in token to be able to recognize the user later using that token.This tokens get signed by a key so only the issuer app can reopen the token.
We are going to implement this behavior in our app. 

##### Setup <a name="setup"></a>
In our app we need to be able to generate a token for users when they sign up or login and a middleware to authenticate users by the given token, then in our views we can know the user interacting with app. We will be using `github.com/dgrijalva/jwt-go` library to generate and prase JWT tokens.
###### Generating and Parsing JWT Tokens <a name="generating-and-parsing-jwt-tokens"></a>
We create a new directory pkg in the root of our application, you have seen that we used internal for what we want to only be internally used withing our app, pkg directory is for files that we don't mind if some outer code imports it into itself and generation and validation jwt tokens are this kinds of code.
There is a concept named claims it's not only limited to JWT We'll see more about it in rest of the section.

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

//GenerateToken generates a jwt token and assign a username to it's claims and return it
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

//ParseToken parses a jwt token and returns the username it it's claims
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
Let's talk about what above code does:
* GenerateToken function is going to be used whenever we want to generate a token for user, we save username in token claims and set token expire time to 5 minutes later also in claims.
* ParseToken function is going to be used whenever we receive a token and want to know who sent this token.

###### User SignUp and Login Functionality <a name="user-signup-and-login-functionality"></a>
Til now we can generate a token for each user but before generating token for every user, we need to assure user exists in our database. Simply we need to query database to match the user with given username and password.
Another thing is when a user tries to register we insert username and password in our database.

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
The Create function is much like the CreateLink function we saw earlier but let's break down the Authenticate code:
* first we have a query to select password from users table where username is equal to the username we got from resolver.
* We use QueryRow instead of Exec we used earlier; the difference is `QueryRow()` will return a pointer to a `sql.Row`.
* Using `.Scan` method we fill the hashedPassword variable with the hashed password from database. Obviously you don't want to [save raw passwords](https://security.blogoverflow.com/2011/11/why-passwords-should-be-hashed/) in your database.
* then we check if any user with given username exists or not, if there is not any we return `false`, and if we found any we check the user hashedPassword with the raw password given.(Notice that we save hashed passwords not raw passwords in database in line 23)

In the next part we set the tools we have together to detect the user that is using the app.
###### Authentication Middleware <a name="authentication-middleware"></a>
Every time a request comes to our resolver before sending it to resolver we want to recognize the user sending request, for this purpose we have to write a code before every resolver, but using middleware we can have a auth middleware that executes before request send to resolver and does the authentication process. to read more about middlewares visit.


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
We use this function to get user object with username in authentication middeware.

And now let's create our auth middleware, for more information visit [gql authentication docs](https://github.com/99designs/gqlgen/blob/master/docs/content/recipes/authentication.md).

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

Now we use the middleware we declared in our server:

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
	server := handler.GraphQL(hackernews.NewExecutableSchema(hackernews.Config{Resolvers: &hackernews.Resolver{}}))
	router.Handle("/", handler.Playground("GraphQL playground", "/query"))
	router.Handle("/query", server)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
```
