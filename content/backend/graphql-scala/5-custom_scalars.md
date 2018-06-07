---
title: Custom Scalars
pageTitle: "Add Date to the Link model, make the DB and Sangria to understand this type"
description: "In this chapter Link model will get an additional field to store date and time. You will learn how to handle such custom types and use scalars."
question: "What is a main advantage of defining a custom scalar type?"
answers: ["It adds bells and whistles to your code.", "It makes it possible to parse values in your type","It's only an alias for basic types, there is nothing more than improving readability", "You can store your data in a type not supported by the database." ]
correctAnswer: 1

---

### Goal for this chapter

To match the schema we proposed at the beginning, we have to extend a `Link` model with an additional field: `createdAt`. This field will store information about date and time. The problem is that `H2` database understands only timestamp. Sangria has a similar limitation - it supports only basic types. Our goal is to store the date an time information in the database and present it in a human friendly format.


### Extend a Link model

The type for storing date and time I chose is `akka.http.scaladsl.model.DateTime`. It fits our example because it has implemented ISO Format converters. (I know it's an internal model that I want to use in API, but it covers all my needs without any additional work. So I chose it, but in real, production application avoid this if you can. Java has dedicated package for date and time and it includes many classes you can use.)

<Instruction>

Change the content of `Link.scala`:

```scala
import akka.http.scaladsl.model.DateTime

case class Link(id: Int, url: String, description: String, createdAt: DateTime)

```

</Instruction>

### Fix the database

In `DbSchema` we're storing a few links in database, we now have to add the additional field.

<Instruction>

Add the `createdAt` field in the `Link` models for populated example data in `DBSchema`. Change the `databaseSetup` function into the following code:

```scala
Links forceInsertAll Seq(
      Link(1, "http://howtographql.com", "Awesome community driven GraphQL tutorial", DateTime(2017,9,12)),
      Link(2, "http://graphql.org", "Official GraphQL web page",DateTime(2017,10,1)),
      Link(3, "https://facebook.github.io/graphql/", "GraphQL specification",DateTime(2017,10,2))
    )
```

</Instruction>

Almost good, but `H2` doesn't know how to store such type in database, so we will instruct it how to store it using built-in types.

<Instruction>

Add column mapper for our `DateTime` type in `DBSchema` object (before the `LinksTable` definition).

```scala
implicit val dateTimeColumnType = MappedColumnType.base[DateTime, Timestamp](
    dt => new Timestamp(dt.clicks),
    ts => DateTime(ts.getTime)
)
```

</Instruction>

This mapper will convert `DateTime` into `Long`, which is a primitive recognized by H2.

The last thing is to add the `createdAt` column definition in the table declaration.

<Instruction>

Add the following code inside `LinksTable` class. Replace the current `*` function with the following one.

```scala
def createdAt = column[DateTime]("CREATED_AT")

def * = (id, url, description, createdAt) <> ((Link.apply _).tupled, Link.unapply)
```

</Instruction>


### Define custom scalar for DateTime

Sangria supports all standard GraphQL scalars like `String`, `Int`, etc. In addition you can find scalars for types like `Long`, `BigInt` or `BigDecimal`. There are a lot of them, but you might encounter situations where custom or unsupported types should be used.
Like in our example, we're using `DateTime` type, and there are no built-in scalar for such type.
To add support for our case, we will use the same trick as with H2. We will define conversions from the type we want to type Sangria understands and then back again to our type. For our use case we will use String as the underlying type.

Let's write a scalar that converts `String` to `DateTime` and vice versa.

<Instruction>

In `GraphQLSchema` add the following code:

```scala
implicit val GraphQLDateTime = ScalarType[DateTime](//1
  "DateTime",//2
  coerceOutput = (dt, _) => dt.toString, //3
  coerceInput = { //4
    case StringValue(dt, _, _ ) => DateTime.fromIsoDateTimeString(dt).toRight(DateTimeCoerceViolation)
    case _ => Left(DateTimeCoerceViolation)
  },
  coerceUserInput = { //5
    case s: String => DateTime.fromIsoDateTimeString(s).toRight(DateTimeCoerceViolation)
    case _ => Left(DateTimeCoerceViolation)
  }
)

```
</Instruction>

1. Use `implicit` because it implicitly has to be in scope
1. `"DateTime"`. The name will be used in schemas.
1. `coerceOutput` converts our type to a String. It will be used to produce the output data.
1. `coerceInput` needs a partial function with `Value` as single argument. Such value could be of many types. In our case we're parsing only from `StringValue`. Of course nothing stops you from defining many conversions. If you define more cases for coerceInput, users will have the freedom to provide input in more ways.
1. `coerceUserInput` converts Literal which almost always is a String. While this function should cover basic types, `coerceInput` and `coerceOutput` should always be a value that the GraphQL grammar supports.

Both functions `coerceInput` and `coerceUserInput` should respond with `Either`. The correct (right) value should consist of an object of expected type. In case of failure, the left value should contain a `Violation` subtype. Sangria provides many `Violation` subtypes, but in the code above you can see I've used `DateTimeCoerceViolation`.
Let's implement this.

<Instruction>

In `GraphQLSchema` file add the following definition:

```scala
  case object DateTimeCoerceViolation extends Violation {
    override def errorMessage: String = "Error during parsing DateTime"
  }

```

Finally, add the new field definition to the `LinkType` object:

```scala
  Field("createdAt", GraphQLDateTime, resolve = _.value.createdAt)

```
</Instruction>


Now when you'll add `createdAt` field to the query, you should get proper response. For example on query:

```graphql
query {

  link(id: 1){
    	id
    	url
    	createdAt
  	}
  }
```

You will get a response:

```JSON
{
  "data": {
    "link": {
      "id": 1,
      "url": "http://howtographql.com",
      "createdAt": "2017-09-12T00:00:00"
    }
  }
}
```

Now you know the basics. In the next chapter you will add additional models. We will extract some common parts as interface to keep them in one place.
