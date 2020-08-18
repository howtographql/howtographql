---
title: Database
pageTitle: "Building a GraphQL Server with Go Backend Tutorial"
description: "Setup mysql db with migrations in golang"
---

Before we jump into implementing GraphQL schema we need to setup database to save users and links, This is not supposed to be tutorial about databases in go but here is what we are going to do:
* Setup MySQL
* Create MySQL database
* Define our models and create migrations

## Setup MySQL <a name="setup-mysql"></a>
If you have docker you can run [Mysql image]((https://hub.docker.com/_/mysql)) from docker and use it.

<Instruction>

`docker run -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=dbpass -e MYSQL_DATABASE=hackernews -d mysql:latest`
now run `docker ps` and you should see our mysql image is running:
```
CONTAINER ID        IMAGE                                                               COMMAND                  CREATED             STATUS              PORTS                  NAMES
8fea71529bb2        mysql:latest                                                        "docker-entrypoint.s…"   2 hours ago         Up 2 hours          3306/tcp, 33060/tcp    mysql

```

## Create MySQL database <a name="create-mysql-database"></a>
You have already started `mysql` instance in the previous step. Now we will need to create our `hackernews` database in that instance.
To create the database run these commands.

<Instruction>

`docker exec -it mysql bash`

It will open the bash terminal inside `mysql` instance.


In the next step we will open `mysql` repl as the root user:

`mysql -u root -p`


It will ask you for root password, enter `dbpass` and enter.

Now we are inside `mysql` repl. To create the database, run this command:

`CREATE DATABASE hackernews;`

</Instruction>

## Models and migrations <a name="models-and-migrations"></a>
We need to create migrations for our app so every time our app runs it creates tables it needs to work properly, we are going to use [golang-migrate](https://github.com/golang-migrate/migrate) package.
Create a folder structure for our database files in the project root directory:
```
go-graphql-hackernews
--internal
----pkg
------db
--------migrations
----------mysql
```
Install go mysql driver and golang-migrate packages then create migrations:

<Instruction>

```
go get -u github.com/go-sql-driver/mysql
go build -tags 'mysql' -ldflags="-X main.Version=1.0.0" -o $GOPATH/bin/migrate github.com/golang-migrate/migrate/v4/cmd/migrate/
cd internal/pkg/db/migrations/
migrate create -ext sql -dir mysql -seq create_users_table
migrate create -ext sql -dir mysql -seq create_links_table
```

</Instruction>

migrate command will create two files for each migration ending with .up and .down; up is responsible for applying migration and down is responsible for reversing it.
open `000001_create_users_table.up.sql` and add table for our users:

<Instruction>

```sql
CREATE TABLE IF NOT EXISTS Users(
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    Username VARCHAR (127) NOT NULL UNIQUE,
    Password VARCHAR (127) NOT NULL,
    PRIMARY KEY (ID)
)
```

</Instruction>

in `000002_create_links_table.up.sql`:

<Instruction>

```sql
CREATE TABLE IF NOT EXISTS Links(
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    Title VARCHAR (255) ,
    Address VARCHAR (255) ,
    UserID INT ,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ,
    PRIMARY KEY (ID)
)
```

</Instruction>

We need one table for saving links and one table for saving users, Then we apply these to our database using migrate command. Run this command in your project root directory.

```bash
  migrate -database mysql://root:dbpass@/hackernews -path internal/pkg/db/migrations/mysql up
```

Last thing is that we need a connection to our database, for this we create a mysql.go under mysql folder(We name this file after mysql since we are now using mysql and if we want to have multiple databases we can add other folders) with a function to initialize connection to database for later use.

<Instruction>

`internal/pkg/db/mysql/mysql.go`:
```go
package database

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/mysql"
	_ "github.com/golang-migrate/migrate/source/file"
	"log"
)

var Db *sql.DB

func InitDB() {
	// Use root:dbpass@tcp(172.17.0.2)/hackernews, if you're using Windows.
	db, err := sql.Open("mysql", "root:dbpass@tcp(localhost)/hackernews")
	if err != nil {
		log.Panic(err)
	}

	if err = db.Ping(); err != nil {
 		log.Panic(err)
	}
	Db = db
}

func Migrate() {
	if err := Db.Ping(); err != nil {
		log.Fatal(err)
	}
	driver, _ := mysql.WithInstance(Db, &mysql.Config{})
	m, _ := migrate.NewWithDatabaseInstance(
		"file://internal/pkg/db/migrations/mysql",
		"mysql",
		driver,
	)
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal(err)
	}

}
```

</Instruction>

`InitDB` Function creates a connection to our database and `Migrate` function runs migrations file for us.
In `Migrate function we apply migrations just like we did with command line but with this function your app will always apply the latest migrations before start.

Then call `InitDB` and `Migrate`(Optional) In main func to create database connection at the start of the app:

<Instruction>

`server.go`:
```go

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	router := chi.NewRouter()

	database.InitDB()
	database.Migrate()
	server := handler.GraphQL(hackernews.NewExecutableSchema(hackernews.Config{Resolvers: &hackernews.Resolver{}}))
	router.Handle("/", handler.Playground("GraphQL playground", "/query"))
	router.Handle("/query", server)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

```

</Instruction>
