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
rails generate model Vote link:references user:references
rails db:migrate
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

```ruby(path=".../graphql-ruby/app/graphql/types/vote_type.rb")
Types::VoteType = GraphQL::ObjectType.define do
  name 'Vote'

  field :id, types.ID
  field :user, -> { Types::UserType }
  field :link, -> { Types::LinkType }
end
```

</Instruction>

<Instruction>

Then define the `CreateVote` resolver:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/create_vote.rb")
class Resolvers::CreateVote < GraphQL::Function
  argument :linkId, types.ID

  type Types::VoteType

  def call(_obj, args, ctx)
    Vote.create!(
      link: Link.find_by(id: args[:linkId]),
      user: ctx[:current_user]
    )
  end
end
```

</Instruction>

<Instruction>

Add `CreateVote` to the mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  field :createLink, function: Resolvers::CreateLink.new
  field :createVote, function: Resolvers::CreateVote.new
  field :createUser, function: Resolvers::CreateUser.new
  field :signinUser, function: Resolvers::SignInUser.new
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
  belongs_to :user

  has_many :votes
end
```

</Instruction>

Now every link, have access to its votes. But GraphQL still doesn't know about those votes.

<Instruction>

For that you have to expose votes from `LinkType`:

```ruby(path=".../graphql-ruby/app/graphql/types/link_type.rb")
Types::LinkType = GraphQL::ObjectType.define do
  name 'Link'

  field :id, !types.ID
  field :url, !types.String
  field :description, !types.String
  field :postedBy, -> { Types::UserType }, property: :user
  field :votes, -> { !types[Types::VoteType] }
end
```

</Instruction>

Now you can see all votes for links:

![](http://i.imgur.com/ZqezkWV.png)

### Relating users with their votes

Following these same steps, you could also add a new field to make it easier to find all the votes made by the same user.

<Instruction>

Start with the `User` model:

```ruby(path=".../graphql-ruby/app/model/user.rb")
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
Types::UserType = GraphQL::ObjectType.define do
  name 'User'

  field :id, !types.ID
  field :name, !types.String
  field :email, !types.String
  field :votes, -> { !types[Types::VoteType] }
end
```

</Instruction>

Now you can see all votes for users:

![](http://i.imgur.com/Dhsy92u.png)

