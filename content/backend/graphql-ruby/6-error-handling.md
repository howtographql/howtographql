---
title: Error Handling
pageTitle: "Error Handling with GraphQL & Ruby Tutorial"
description: "Learn best practices for validation of input arguments and implementing error handling in GraphQL with Ruby."
---

### Schema Validation errors

Any good server should be able to handle errors well. Otherwise, it becomes harder and harder to maintain. Thankfully, the tools we've been using before help on this area.

In fact, if you try right now to send an invalid request to the server, such as a request with a field that doesn't exist, you'll already get a pretty good error message back. For example:

![](http://i.imgur.com/wSYcR4S.png)

### Application errors

Some errors will be specific to the application though. For example, let's say that `createLink` is called with the `url` field as a string, as specified by the schema, but its content doesn't follow an expected url format. You'll need to throw an error yourself in this case.

Luckily, all you need to do is to detect the problem and throw the error.

[GraphQL Gem](http://graphql-ruby.org/) provides an exception for just these cases [GraphQL**::**ExecutionError](http://graphql-ruby.org/mutations/mutation_errors.html#raising-errors).

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
module Mutations
  class CreateLink < BaseMutation
    argument :description, String, required: true
    argument :url, String, required: true

    type Types::LinkType

    def resolve(description: nil, url: nil)
      Link.create!(
        description: description,
        url: url,
        user: context[:current_user]
      )
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Invalid input: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
```

</Instruction>

Now when you try to submit a link with invalid arguments you get an error.

![](http://i.imgur.com/e5ZgK9c.png)


*You can learn more about GraphQL errors [here](http://blog.rstankov.com/graphql-mutations-and-form-errors/).*


