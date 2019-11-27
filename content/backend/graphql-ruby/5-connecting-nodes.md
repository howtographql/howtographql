---
title: Connecting Nodes
pageTitle: "Advanced Server-side Mutations with GraphQL & Ruby Tutorial"
description: "Learn best practices for implementing advanced GraphQL mutations with Ruby and graphql-ruby. You can test your implementation in a GraphiQL Playground."
---

### Voting for links

There's only one mutation left to be added: allowing users to vote for links. This follows a familiar path:

<Instruction>

Run the following commands to generate the `Vote` model:

```bash
bundle exec rails generate model Vote link:references user:references
bundle exec rails db:migrate
```

</Instruction>


This would create our vote model, which is used to represent an user vote.

```ruby(path=".../graphql-ruby/app/models/vote.rb")
class Vote < ActiveRecord::Base
  belongs_to :user, validate: true
  belongs_to :link, validate: true
end
```

Votes would be created by a mutation and represented by a GraphQL type.

<Instruction>

Add the `VoteType` first:

```bash
bundle exec rails generate graphql:object VoteType id:ID! user:UserType! link:LinkType!
```

</Instruction>

<Instruction>

Then define the `CreateVote` resolver:

```ruby(path=".../graphql-ruby/app/graphql/mutations/create_vote.rb")
module Mutations
  class CreateVote < BaseMutation
    argument :link_id, ID, required: false

    type Types::VoteType

    def resolve(link_id: nil)
      Vote.create!(
        link: Link.find(link_id),
        user: context[:current_user]
      )
    end
  end
end
```

</Instruction>

<Instruction>

Add `CreateVote` to the mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
module Types
  class MutationType < BaseObject
    field :create_user, mutation: Mutations::CreateUser
    field :create_link, mutation: Mutations::CreateLink
    field :create_vote, mutation: Mutations::CreateVote
    field :signin_user, mutation: Mutations::SignInUser
  end
end
```

</Instruction>

Done! Now you can vote on links:

![](http://i.imgur.com/gHIj7ZW.png)

### Relating links with their votes

You can already create votes, but there's currently no way to fetch them yet! A typical use case would be to get votes for each link using the existing `allLinks` query.

For that to work, you just have to change the `LinkType` to have references to its votes.

<Instruction>

First, you need to add votes relationship to `Link` model:

```ruby(path=".../graphql-ruby/app/models/link.rb")
class Link < ApplicationRecord
  belongs_to :user, optional: true # Prevent ActiveRecord::RecordInvalid

  has_many :votes
end
```

</Instruction>

Now every link has access to its votes. But GraphQL still doesn't know about those votes.

<Instruction>

For that you have to expose votes from `LinkType`:

```ruby(path=".../graphql-ruby/app/graphql/types/link_type.rb")
module Types
  class LinkType < BaseObject
    field :id, ID, null: false
    field :url, String, null: false
    field :description, String, null: false
    field :posted_by, UserType, null: false, method: :user
    field :votes, [Types::VoteType], null: false
  end
end
```

</Instruction>

Now you can see all votes for links:

![](http://i.imgur.com/ZqezkWV.png)

### Relating users with their votes

Following these same steps, you could also add a new field to make it easier to find all the votes made by the same user.

<Instruction>

Start with the `User` model:

```ruby(path=".../graphql-ruby/app/models/user.rb")
class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true

  has_many :votes
  has_many :links
end
```

</Instruction>

<Instruction>

Then add "votes" to the `UserType`:

```ruby(path=".../graphql-ruby/app/graphql/types/user_type.rb")
module Types
  class UserType < BaseObject
    field :id, ID, null: false
    field :created_at, DateTimeType, null: false
    field :name, String, null: false
    field :email, String, null: false
    field :votes, [VoteType], null: false
    field :links, [LinkType], null: false
  end
end
```

</Instruction>

Now you can see all votes for users:

![](http://i.imgur.com/Dhsy92u.png)
