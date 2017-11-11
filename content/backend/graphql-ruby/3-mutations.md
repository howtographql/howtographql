---
title: Mutations
pageTitle: "Implementing Mutations with a Ruby GraphQL Server Tutorial"
description: "Learn best practices for implementing GraphQL mutations with Ruby and graphql-ruby. You can test your implementation in a GraphiQL Playground."
---

### Mutation for Creating Links

Setting up mutations is as easy as queries, following a very similar process.

All [GraphQL mutations](http://graphql.org/learn/queries/#mutations) start from a root type called **Mutation**.

This type is auto generated in the file `app/graphql/types/mutation_type.rb`:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  # TODO: Remove me
  field :testField, types.String do
    description "An example field added by the generator"
    resolve ->(obj, args, ctx) {
      "Hello World!"
    }
  end
end
```

This type is a placeholder for all GraphQL mutations.

To prevent any error when you first start your GraphQL project, it is generated with a dummy `testField` field.  
You will be able to remove it as soon as you add your own mutation below.

The mutation type is automatically exposed in your schema:

```ruby(path=".../graphql-ruby/app/graphql/graphql_tutorial_schema.rb")
GraphqlTutorialSchema = GraphQL::Schema.define do
  query(Types::QueryType)
  mutation(Types::MutationType)
end
```

### Resolvers with Arguments

Now add a resolver for `createLink`.

For this purpose, you'll use [GraphQL::Function](http://graphql-ruby.org/fields/function.html), as mentioned earlier.

<Instruction>

Create a new file - `app/graphql/resolvers/create_link.rb`:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/create_link.rb")
class Resolvers::CreateLink < GraphQL::Function
  # arguments passed as "args"
  argument :description, !types.String
  argument :url, !types.String

  # return type from the mutation
  type Types::LinkType

  # the mutation method
  # _obj - is parent object, which in this case is nil
  # args - are the arguments passed
  # _ctx - is the GraphQL context (which would be discussed later)
  def call(_obj, args, _ctx)
    Link.create!(
      description: args[:description],
      url: args[:url],
    )
  end
end
```

</Instruction>

<Instruction>

Then expose this mutation in `app/graphql/types/mutation_type.rb`:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  field :createLink, function: Resolvers::CreateLink.new
end
```

</Instruction>

### Testing with Playground

To test, just restart the server again and use the new mutation with GraphiQL:

![](http://i.imgur.com/pHNRZlG.png)

### Testing with Unit Test

It's a good practice in Ruby to unit test your resolver objects.

Here is an example of `Resolvers::CreateLink` test:

```ruby(path=".../graphql-ruby/test/graphql/resolvers/create_link_test.rb")
require 'test_helper'

class Resolvers::CreateLinkTest < ActiveSupport::TestCase
  def perform(args = {})
    Resolvers::CreateLink.new.call(nil, args, {})
  end

  test 'creating new link' do
    link = perform(
      url: 'http://example.com',
      description: 'description',
    )

    assert link.persisted?
    assert_equal link.description, 'description'
    assert_equal link.url, 'http://example.com'
  end
end
```

