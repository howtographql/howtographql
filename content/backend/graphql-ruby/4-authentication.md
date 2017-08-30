---
title: Authentication
pageTitle: "Server-side Authentication with GraphQL & Ruby Tutorial"
description: "Learn best practices for implementing email-password authentication on a GraphQL Server written in Ruby."
---

### Creating Users

So far you've been working only with the `Link` type, but it's time to include `User` as well so that the app can show who posted a link and who voted on it.

You'll need some registered users for this, so start by implementing the mutation for creating them.

<Instruction>

You already know the process for this, but let's go through each step again.

```bash
rails generate model User name email password_digest
rails db:migrate
```

</Instruction>

This generates a `user.rb` file in `app/models`.

<Instruction>

Update the user model contents to:

```ruby(path=".../graphql-ruby/app/models/user.rb")
class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
end
```

</Instruction>

Now we have users, which are required to have `name` and `email`.

They also have a [secure password](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html#method-i-has_secure_password). But in order for [has_secure_password](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html#method-i-has_secure_password), [bcrypt](https://rubygems.org/gems/bcrypt) gem. It used encrypting and verifying user passwords.

<Instruction>

Add `Gemfile` the following line:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'bcrypt', '~> 3.1.7'
```

</Instruction>

<Instruction>

Then run:

```bash
bundle update
```

</Instruction>

<Instruction>

Now, lets create GraphQL type for representing an user:

```ruby(path=".../graphql-ruby/app/graphql/types/user_type.rb")
Types::UserType = GraphQL::ObjectType.define do
  name 'User'

  field :id, !types.ID
  field :name, !types.String
  field :email, !types.String
end
```

</Instruction>

Now when we have our user model and its GraphQL type. We need a way to create users. Users would be created by `name`, `email` and `password`.

<Instruction>

Create a type for the authentication provider [input type](http://graphql.org/graphql-js/mutations-and-input-types/):

```ruby(path=".../graphql-ruby/app/graphql/types/auth_provider_email_input.rb")
Types::AuthProviderEmailInput = GraphQL::InputObjectType.define do
  name 'AUTH_PROVIDER_EMAIL'

  argument :email, !types.String
  argument :password, !types.String
end
```

</Instruction>

<Instruction>

Then create an mutation for creating an user:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/create_user.rb")
class Resolvers::CreateUser < GraphQL::Function
  AuthProviderInput = GraphQL::InputObjectType.define do
    name 'AuthProviderSignupData'

    argument :email, Types::AuthProviderEmailInput
  end

  argument :name, !types.String
  argument :authProvider, !AuthProviderInput

  type Types::UserType

  def call(_obj, args, _ctx)
    User.create!(
      name: args[:name],
      email: args[:authProvider][:email][:email],
      password: args[:authProvider][:email][:password]
    )
  end
end
```

</Instruction>

<Instruction>

And add it to mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  field :createLink, function: Resolvers::CreateLink.new
  field :createUser, function: Resolvers::CreateUser.new
end
```

</Instruction>

Now, you can create a new user using [GraphiQL](https://github.com/graphql/graphiql):

![](http://i.imgur.com/SVg4T6z.png)

<Instruction>

Here is how the unit test for your mutation is going to look like:

```ruby(path=".../graphql-ruby/test/graphql/resolvers/create_user_test.rb")
require 'test_helper'

class Resolvers::CreateUserTest < ActiveSupport::TestCase
  def perform(args = {})
    Resolvers::CreateUser.new.call(nil, args, nil)
  end

  test 'creating new user' do
    user = perform(
      name: 'Test User',
      authProvider: {
        email: {
          email: 'email@example.com',
          password: '[omitted]'
        }
      }
    )

    assert user.persisted?
    assert_equal user.name, 'Test User'
    assert_equal user.email, 'email@example.com'
  end
end
```

</Instruction>

### Sign in Mutation

Now that you have users, how would you sign them in using GraphQL? With a new mutation, of course! Mutations are a way for the client to talk to the server whenever it needs an operation that isn't just about fetching data.

For this first time signing users in through GraphQL you'll be using a simple email/password login method, returning a token that can be used in subsequent requests for authentication.

> Note that this is **NOT** supposed to be a production-ready authentication feature, but just a small functioning prototype to show the basic concept. In a real app, you should make sure to encrypt passwords properly before passing them around and use a good token generation method, such as [JWT](https://jwt.io/).


Again, the workflow for adding this mutation will be very similar to the ones we've done before:

<Instruction>

Create a resolver for the mutation:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/sign_in_user.rb")
class Resolvers::SignInUser < GraphQL::Function
  argument :email, !Types::AuthProviderEmailInput

  # defines inline return type for the mutation
  type do
    name 'SigninPayload'

    field :token, types.String
    field :user, Types::UserType
  end

  def call(_obj, args, _ctx)
    input = args[:email]

    # basic validation
    return unless input

    user = User.find_by email: input[:email]

    # ensures we have the correct user
    return unless user
    return unless user.authenticate(input[:password])

    # use Ruby on Rails - ActiveSupport::MessageEncryptor, to build a token
    crypt = ActiveSupport::MessageEncryptor.new(Rails.application.secrets.secret_key_base.byteslice(0..31))
    token = crypt.encrypt_and_sign("user-id:#{ user.id }")

    OpenStruct.new({
      user: user,
      token: token
    })
  end
end
```

</Instruction>

<Instruction>

Add the resolver for the mutation to the mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  field :createLink, function: Resolvers::CreateLink.new
  field :createUser, function: Resolvers::CreateUser.new
  field :signinUser, function: Resolvers::SignInUser.new
end
```

</Instruction>

Now, you can get the token by using [GraphiQL](https://github.com/graphql/graphiql):

![](http://i.imgur.com/jmMofgT.png)

<Instruction>

Here is how the unit test for your mutation is going to look like:

```ruby(path=".../graphql-ruby/test/graphql/resolvers/sign_in_user_test.rb")
require 'test_helper'

class Resolvers::SignInUserTest < ActiveSupport::TestCase
  def perform(args = {})
    Resolvers::SignInUser.new.call(nil, args, { cookies: {}})
  end

  setup do
    @user = User.create! name: 'test', email: 'test@email.com', password: 'test'
  end

  test 'creates a token' do
    result = perform(
      email: {
        email: @user.email,
        password: @user.password
      }
    )

    assert result.present?
    assert result.token.present?
    assert_equal result.user, @user
  end

  test 'handling no credentials' do
    assert_nil perform
  end

  test 'handling wrong email' do
    assert_nil perform(email: { email: 'wrong' })
  end

  test 'handling wrong password' do
    assert_nil perform(email: { email: @user.email, password: 'wrong' })
  end
end
```

</Instruction>

### Authenticating requests

With the token that the `signinUser` mutation provides, apps can authenticate subsequent requests. There are couple of ways this can be done. In this tutorial we are just going to use the build-in **session**, since this doesn't add any requirements to the client application. The GraphQL server should be able to get the token from the session header on each request, detect what user it relates to, and pass this information down to the resolvers.

The best place to put data shared between resolvers is in the context object.
You'll need that object to be different in every request now though, since each one may be from a different user.

<Instruction>

Thankfully, the [graphql gem](https://rubygems.org/gems/graphql) allows that you'll just have to change the auto-generated `graphql_controller.rb` to accomplish this:

```ruby(path=".../graphql-ruby/app/controllers/graphql_controller.rb")
class GraphqlController < ApplicationController
  def execute
    variables = ensure_hash(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]
    context = {
      # we need to provide session and current user
      session: session,
      current_user: current_user
    }
    result = GraphqlTutorialSchema.execute(query, variables: variables, context: context, operation_name: operation_name)

    render json: result
  end

  private

  # gets current user from token stored in session
  def current_user
    # if we want to change the sign-in strategy, this is the place todo it
    return unless session[:token]

    crypt = ActiveSupport::MessageEncryptor.new(Rails.application.secrets.secret_key_base.byteslice(0..31))
    token = crypt.decrypt_and_verify session[:token]
    user_id = token.gsub('user-id:', '').to_i
    User.find_by id: user_id
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    nil
  end

  # Handle form data, JSON body, or a blank value
  def ensure_hash(ambiguous_param)
    # ...code
  end
end
```

</Instruction>

<Instruction>

We also need to update our `signinUser` resolver, so it also stores the `token` in `session`:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/sign_in_user.rb")
class Resolvers::SignInUser < GraphQL::Function
  # ...code

  def call(_obj, args, ctx)
    # ...code

    crypt = ActiveSupport::MessageEncryptor.new(Rails.application.secrets.secret_key_base.byteslice(0..31))
    token = crypt.encrypt_and_sign("user-id:#{ user.id }")

    ctx[:session][:token] = token

    # ...code
  end
end
```

</Instruction>

This is pretty straightforward since the generated token is so simple. Like was said before, make sure to check out a different token method out there when building a real world application though, such as [JWT](https://jwt.io/).


### Linking User to Created Links

Your server can now detect the user that triggered each GraphQL request. This could be useful in many situations. For example, the authenticated user should be exactly the one that posted a link being created with the `createLink` mutation. You can now store this information for each link.

First run `rails generate migration add_user_id_link`.

It generates a [database migration](http://edgeguides.rubyonrails.org/active_record_migrations.html).

<Instruction>

Change its contents to:

```ruby
class AddUserIdLink < ActiveRecord::Migration[5.1]
  def change
    change_table :links do |t|
      t.references :user, foreign_key: true
    end
  end
end
```

</Instruction>

<Instruction>

This connects the  `users` and `links` tables in the database. Then you need to update the `Link` model:

```ruby(path=".../graphql-ruby/app/models/link.rb")
class Link < ApplicationRecord
  belongs_to :user
end
```

</Instruction>

<Instruction>

Also you have to update the `LinkType`:

```ruby(path=".../graphql-ruby/app/graphql/types/link_type.rb")
Types::LinkType = GraphQL::ObjectType.define do
  name 'Link'

  field :id, !types.ID
  field :url, !types.String
  field :description, !types.String
  # add postedBy field to Link type
  # - "-> { }": helps against loading issues between types
  # - "property": remaps field to an attribute of Link model
  field :postedBy, -> { Types::UserType }, property: :user
end
```

</Instruction>

<Instruction>

And update `CreateLink` resolver:

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
  end
end
```

</Instruction>

Done! Now when you post links, they will be attached to your user, so you have to run  `signinUser` beforehand.

![](http://i.imgur.com/9ma8r8u.png)

