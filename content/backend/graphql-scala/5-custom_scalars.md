---
title: Custom Scalars
pageTitle: "Add Date to the Link model, make the DB and Sangria to understand this type"
description: "In this chapter Link model will get additional field to store date and time. You will learn how to handle such custom types and use scalars."
question: "What is a main advantage of defining custom scalar type?"
answers: ["It adds bells and whistles to your code.", "It makes possible parse values to your type","It's only alias for basic types, there is nothing more than improving readability", "You can store data in type not supported by database." ]
correctAnswer: 1

---

### Goal for this chapter

To align to the Schema we proposed at the beginning, we have to extend a `Link` model with additional field: `createdAt`. This field will store information about date and time. The problem is that `H2` database understand only timestamp. Similar limitation has Sangria - it supports only basic types. Our goal is to store it in database and present in out in human friendly format.


### Extend a Link model

The type for storing date and time I chose is `akka.http.scaladsl.model.DateTime`. It fits to our example because it has implemented ISO Format converters. (I know it's internal model that I want to use in API, but it covers all my needs without any additional work. So I chose it, but in real, production application avoid this if you can. Java has dedicated package for date and time and it consist many classes you can use.)

<Instruction>

Change the content of `Link.scala`:

```scala
import akka.http.scaladsl.model.DateTime

case class Link(id: Int, url: String, description: String, createdAt: DateTime)
```

</Instruction>

### Fix the databases

In `DbSchema` we're storing few links in database, we have to add additional field now.

<Instruction>

Add `createdAt` field in `Link` models for populated example data in `DBSchema`. Change `databaseSetup` function into following code:

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

Add column mapper for our `DateTime` type in `DBSchema` object.

```scala
implicit val dateTimeColumnType = MappedColumnType.base[DateTime, Timestamp](
    dt => new Timestamp(dt.clicks),
    ts => DateTime(ts.getTime)
)
```

</Instruction>

This mapper will convert `DateTime` into used internally by database `Long` type which is a primitive recognized by H2.

The last thing is to add `createdAt` column definition in table declaration.

<Instruction>

Add following code inside `LinksTable` class. Replace current `*` function with the following one.

```scala
def createdAt = column[DateTime]("CREATED_AT")

def * = (id, url, description, createdAt) <> ((Link.apply _).tupled, Link.unapply)
```

</Instruction>


### Define custom scalar for DateTime

Sangria supports all standard GraphQL scalars like `String`, `Int`, etc. In addition you can find scalars for types like `Long`, `BigInt` or `BigDecimal`. There are a lot of them, but you might encounter situations where custom or unsupported types should be used.
Like in our example, we're using `DateTime` type, and there are no built-in scalar for such type.
To add support for our case, we will use the same trick as with H2. We will define conversions from the type we want to type Sangria understands and the back again to our type. For our use case we will use String as the underlying type.

Let's write a scalar that converts `String` and `DateTime`. In both ways.

<Instruction>

In `GraphQLSchema` add following code:

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
1. `coerceOutput` converts our type to a String. It will be used to produce output data.
1. `coerceInput` needs partial function with `Value` as single argument. Such value could be of many types. In our case we're parsing only from `StringValue`. Of course nothing stops you from defining few conversions. If you define more cases for coerceInput users will have freedom to provide input in more ways.
1. `coerceUserInput` converts Literal which almost always is a String. While this function should cover basic types, `coerceInput` and `coerceOutput` should always be a value that the GraphQL grammar supports.

Both functions `coerceInput` and `coerceUserInput` should responds with `Either`. The correct (right) value should consists object of expected type. In case of failure, left value should contain `Violation` subtype. Sangria provides many `Violation` subtypes, but in the code above you can see I've used `DateTimeCoerceViolation`.
Let's implement this.

<Instruction>

In `GraphQLSchema` file add following definition:

```scala
  case object DateTimeCoerceViolation extends Violation {
    override def errorMessage: String = "Error during parsing DateTime"
  }

```

</Instruction>

Now when you'll add `createAt` field to the query, you should get proper response. For example on query:

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
