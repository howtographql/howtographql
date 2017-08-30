---
title: Error Handling
pageTitle: "Error Handling with GraphQL & Java Tutorial"
description: "Learn best practices for validation of input arguments and implementing error handling in GraphQL with Ruby."
---

### Schema Validation errors

Any good server should be able to handle errors well. Otherwise, it becomes harder and harder to maintain. Thankfully, the tools we've been using before help on this area.

In fact, if you try right now to send an invalid request to the server, such as a request with a field that doesn't exist, you'll already get a pretty good error message back. For example:

![](http://i.imgur.com/wSYcR4S.png)

### Application errors

Some errors will be specific to the application though. For example, let's say that `createLink` is called with the `url` field as a string, as specified by the schema, but its content doesn't follow an expected url format. You'll need to throw an error yourself in this case.

Luckily, all you need to do is to detect the problem and throw the error.

[GraphQL Gem](http://graphql-ruby.org/) provides an exception for just these cases [GraphQL**::**ExecutionError](http://graphql-ruby.org/queries/error_handling.html).

<Instruction>

First add validations to the `Link` model:

```ruby(path=".../graphql-ruby/app/models/link.rb")
class Link < ApplicationRecord
  belongs_to :user

  validates :url, presence: true, length: { minimum: 5 }
  validates :description, presence: true, length: { minimum: 5 }

  has_many :votes
end
```

</Instruction>

Now every link, requires to have a `url` and `description` attributes.

<Instruction>

Then, try to add this to the `createLink` resolver:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/create_link.rb")
class Resolvers::CreateLink < GraphQL::Function
  argument :description, !types.String
  argument :url, !types.String

  type Types::LinkType

  def call(obj, args, ctx)
    Link.create!(
      description: args[:description],
      url: args[:url],
      user: ctx[:current_user]
    )
  rescue ActiveRecord::RecordInvalid => e
    # this would catch all validation errors and translate them to GraphQL::ExecutionError
    GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
  end
end
```

</Instruction>

Now when you try to submit a link with invalid arguments you get an error.

![](http://i.imgur.com/e5ZgK9c.png)


