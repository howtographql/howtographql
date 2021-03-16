---
title: Queries
pageTitle: "Responding to Queries with a Ruby GraphQL Server Tutorial"
description: "Learn how to define the GraphQL schema with graphql-ruby, implement query resolvers in Ruby and use a GraphiQL Playground to test your queries."
---

### Setup Links

In order to be able to show all links, you first need to set up your database so the links can be stored.

<Instruction>

Use the following command to generate the link database model:

```bash
bundle exec rails generate model Link url:string description:text
bundle exec rails db:migrate
```

</Instruction>

This generates a `link.rb` file in `app/models` that will look as follows:

```ruby(path=".../graphql-ruby/app/models/link.rb")
class Link < ApplicationRecord
end
```

This is our `link` model.

<Instruction>

Run `rails console` and then create a couple of dummy Links:

```ruby
Link.create url: 'http://graphql.org/', description: 'The Best Query Language'
Link.create url: 'http://dev.apollodata.com/', description: 'Awesome GraphQL Client'
exit
```

</Instruction>

Awesome! You now have a database table to store the links and a few dummy records setup.

### Query for Returning Links

Now, go ahead and define your [GraphQL Type](http://graphql.org/graphql-js/type/) for links. [GraphQL Ruby](http://graphql-ruby.org/guides) uses a [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) for that.


<Instruction>

Run the following command:

```bash
rails g graphql:object LinkType id:ID! url:String! description:String!
```

</Instruction>

This creates the file `app/graphql/types/link_type.rb` with the following content:

```ruby(path=".../graphql-ruby/blob/master/app/graphql/types/link_type.rb")
module Types
  class LinkType < BaseObject
    field :id, ID, null: false
    field :url, String, null: false
    field :description, String, null: false
  end
end
```

### Query Resolver

The type is now defined, but the server still doesn't know how to handle it. To fix that, you will now write your first **[resolver](http://graphql.org/learn/execution/#root-fields-resolvers)**. Resolvers are functions that the GraphQL server uses to fetch the data for a specific query. Each *field* of your GraphQL types needs a corresponding resolver function. When a query arrives at the backend, the server will call those resolver functions that correspond to the fields that are specified in the query.

All [GraphQL queries](http://graphql.org/learn/queries/) start from a root type called **[Query](http://graphql.org/learn/schema/#the-query-and-mutation-types)**.

When you previously ran `rails generate graphql:install`, it created the root query type in `app/graphql/types/query_type.rb` for you.

<Instruction>

Now update its content to:

```ruby(path=".../graphql-ruby/app/graphql/types/query_type.rb")
module Types
  class QueryType < BaseObject
    # queries are just represented as fields
    # `all_links` is automatically camelcased to `allLinks`
    field :all_links, [LinkType], null: false

    # this method is invoked, when `all_link` fields is being resolved
    def all_links
      Link.all
    end
  end
end
```

</Instruction>

Fields can be resolved in one of two ways:

* method on the type (named as the field), which accepts arguments and can access `object` and `context`
* [GraphQL::Schema::Resolver](https://graphql-ruby.org/api-doc/1.8.13/GraphQL/Schema/Resolver) - we are going to discuss those in the next chapter

### Testing With Playground

It's time to check what you've done so far! For this, you'll use [GraphiQL](https://github.com/graphql/graphiql), an in-browser IDE for running GraphQL queries.

GraphiQL had already been added to your application when you executed `rails generate graphql:install` in the terminal before, but you have to tell the asset pipeline to precompile its assets. Add this at the end of `/app/assets/config/manifest.js`:

```js
//= link graphiql/rails/application.css
//= link graphiql/rails/application.js
```

Open your browser at http://localhost:3000/graphiql

You'll see a nice IDE that looks like this:

![Browser open to localhost:4000/graphiql](http://i.imgur.com/EZIVYxP.png)

Click on the **Docs** link at the upper right to see a generated documentation of your schema. You'll see the `Query` type there, and clicking it will show you the new `allLinks` field, exactly as you've defined it. The documentation in GraphiQL is generated automatically based on your schema. This works thanks to a mechanism called [Introspection](http://graphql.org/learn/introspection/).

![Generated documentation of your schema](http://i.imgur.com/yEut1gg.png)

Try it out! On the left-most text box, type a simple query for listing all links and hit the **Play** button. This is what you'll see:

![GraphQL APIs](http://i.imgur.com/W7gpVvV.png)

You can play around as much as you want with this tool. It makes testing GraphQL APIs so fun and easy, you'll never want to live without it any more. 😎
