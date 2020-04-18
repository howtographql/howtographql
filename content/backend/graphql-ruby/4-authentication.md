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
bundle exec rails generate model User name email password_digest
bundle exec rails db:migrate
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

They also have a [secure password](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html#method-i-has_secure_password). The [has_secure_password](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html#method-i-has_secure_password) requires the [bcrypt](https://rubygems.org/gems/bcrypt) gem to encrypt and verify user passwords.

<Instruction>

Add the following line to your `Gemfile`:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'bcrypt', '~> 3.1.13'
```

</Instruction>

<Instruction>

Then run:

```bash
bundle update
```

</Instruction>

<Instruction>

Now, lets create GraphQL type for representing a user:

```bash
bundle exec rails generate graphql:object UserType id:ID! name:String! email:String!
```

</Instruction>

Now that we have our user model and its GraphQL type, we need a way to create users. Users will be created by `name`, `email` and `password`.

<Instruction>

Create a type for the authentication provider [input type](http://graphql-ruby.org/type_definitions/input_objects.html):

```ruby(path=".../graphql-ruby/app/graphql/types/auth_provider_credentials_input.rb")
module Types
  class AuthProviderCredentialsInput < BaseInputObject
    # the name is usually inferred by class name but can be overwritten
    graphql_name 'AUTH_PROVIDER_CREDENTIALS'

    argument :email, String, required: true
    argument :password, String, required: true
  end
end
```

</Instruction>

<Instruction>

Then create a mutation for creating a user:

```ruby(path=".../graphql-ruby/app/graphql/mutations/create_user.rb")
module Mutations
  class CreateUser < BaseMutation
    # often we will need input types for specific mutation
    # in those cases we can define those input types in the mutation class itself
    class AuthProviderSignupData < Types::BaseInputObject
      argument :credentials, Types::AuthProviderCredentialsInput, required: false
    end

    argument :name, String, required: true
    argument :auth_provider, AuthProviderSignupData, required: false

    type Types::UserType

    def resolve(name: nil, auth_provider: nil)
      User.create!(
        name: name,
        email: auth_provider&.[](:credentials)&.[](:email),
        password: auth_provider&.[](:credentials)&.[](:password)
      )
    end
  end
end
```

</Instruction>

<Instruction>

And add it to mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
module Types
  class MutationType < BaseObject
    field :create_user, mutation: Mutations::CreateUser
    field :create_link, mutation: Mutations::CreateLink
  end
end
```

</Instruction>

Now, you can create a new user using [GraphiQL](https://github.com/graphql/graphiql):

![](https://i.imgur.com/J3OeMk4.png)

<Instruction>

Here is how the unit test for your mutation is going to look like:

```ruby(path=".../graphql-ruby/test/graphql/mutations/create_user_test.rb")
require 'test_helper'

class Mutations::CreateUserTest < ActiveSupport::TestCase
  def perform(args = {})
    Mutations::CreateUser.new(object: nil, field: nil, context: {}).resolve(args)
  end

  test 'create new user' do
    user = perform(
      name: 'Test User',
      auth_provider: {
        credentials: {
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

You can run the tests with the following command:

```bash
bundle exec rails test
```

</Instruction>

### Sign in Mutation

Now that you have users, how would you sign them in using GraphQL? With a new mutation, of course! Mutations are a way for the client to talk to the server whenever it needs an operation that isn't just about fetching data.

For this first time signing users in through GraphQL you'll be using a simple email/password login method, returning a token that can be used in subsequent requests for authentication.

> Note that this is **NOT** supposed to be a production-ready authentication feature, but just a small functioning prototype to show the basic concept. In a real app, you should make sure to encrypt passwords properly before passing them around and use a good token generation method, such as [JWT](https://jwt.io/).

Again, the workflow for adding this mutation will be very similar to the ones we've done before:

<Instruction>

Create a resolver for the mutation:

```ruby(path=".../graphql-ruby/app/graphql/mutations/sign_in_user.rb")
module Mutations
  class SignInUser < BaseMutation
    null true

    argument :credentials, Types::AuthProviderCredentialsInput, required: false

    field :token, String, null: true
    field :user, Types::UserType, null: true

    def resolve(credentials: nil)
      # basic validation
      return unless credentials

      user = User.find_by email: credentials[:email]

      # ensures we have the correct user
      return unless user
      return unless user.authenticate(credentials[:password])

      # use Ruby on Rails - ActiveSupport::MessageEncryptor, to build a token
      crypt = ActiveSupport::MessageEncryptor.new(Rails.application.credentials.secret_key_base.byteslice(0..31))
      token = crypt.encrypt_and_sign("user-id:#{ user.id }")

      { user: user, token: token }
    end
  end
end
```

</Instruction>

<Instruction>

Add the resolver for the mutation to the mutations list:

```ruby(path=".../graphql-ruby/app/graphql/types/mutation_type.rb")
module Types
  class MutationType < BaseObject
    field :create_user, mutation: Mutations::CreateUser
    field :create_link, mutation: Mutations::CreateLink
    field :signin_user, mutation: Mutations::SignInUser
  end
end
```

</Instruction>

Now, you can get the token by using [GraphiQL](https://github.com/graphql/graphiql):

![](https://i.imgur.com/7wYZXgw.png)

<Instruction>

Here is how the unit test for your mutation is going to look like:

```ruby(path=".../graphql-ruby/test/graphql/mutations/sign_in_user_test.rb")
require 'test_helper'

class Mutations::SignInUserTest < ActiveSupport::TestCase
  def perform(args = {})
    Mutations::SignInUser.new(object: nil, field: nil, context: { session: {} }).resolve(args)
  end

  def create_user
    User.create!(
      name: 'Test User',
      email: 'email@example.com',
      password: '[omitted]',
    )
  end

  test 'success' do
    user = create_user

    result = perform(
      credentials: {
        email: user.email,
        password: user.password
      }
    )

    assert result[:token].present?
    assert_equal result[:user], user
  end

  test 'failure because no credentials' do
    assert_nil perform
  end

  test 'failure because wrong email' do
    create_user
    assert_nil perform(credentials: { email: 'wrong' })
  end

  test 'failure because wrong password' do
    user = create_user
    assert_nil perform(credentials: { email: user.email, password: 'wrong' })
  end
end
```

You can run the tests with the following command:

```bash
bundle exec rails test
```

</Instruction>

### Authenticating requests

With the token that the `SignInUser` mutation provides, apps can authenticate subsequent requests. There are a couple of ways this can be done. In this tutorial, we are just going to use the built-in **session**, since this doesn't add any requirements to the client application. The GraphQL server should be able to get the token from the session header on each request, detect what user it relates to, and pass this information down to the mutations.

The best place to put data shared between mutations is in the context object.
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
  rescue => e
    raise e unless Rails.env.development?
    handle_error_in_development e
  end

  private

  # gets current user from token stored in the session
  def current_user
    # if we want to change the sign-in strategy, this is the place to do it
    return unless session[:token]

    crypt = ActiveSupport::MessageEncryptor.new(Rails.application.credentials.secret_key_base.byteslice(0..31))
    token = crypt.decrypt_and_verify session[:token]
    user_id = token.gsub('user-id:', '').to_i
    User.find user_id
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    nil
  end

  # Handle form data, JSON body, or a blank value
  def ensure_hash(ambiguous_param)
    # ...code
  end

  def handle_error_in_development(e)
    # ...code
  end
end
```

</Instruction>

<Instruction>

We also need to update our `SignInUser` resolver, so it also stores the `token` in `session`:

```ruby(path=".../graphql-ruby/app/graphql/mutations/sign_in_user.rb")
module Mutations
  class SignInUser < BaseMutation
    # ...code

    def resolve(email: nil)
      # ...code

      crypt = ActiveSupport::MessageEncryptor.new(Rails.application.credentials.secret_key_base.byteslice(0..31))
      token = crypt.encrypt_and_sign("user-id:#{ user.id }")

      context[:session][:token] = token

      # ...code
    end
  end
end
```

</Instruction>

This is pretty straightforward since the generated token is so simple. Like was said before, make sure to check out a different token method out there when building a real-world application though, such as [JWT](https://jwt.io/).


### Linking User to Created Links

<Instruction>

Your server can now detect the user that triggered each GraphQL request. This could be useful in many situations. For example, the authenticated user should be exactly the one that posted a link being created with the `createLink` mutation. You can now store this information for each link.

First run the following script:

```bash
bundle exec rails generate migration add_user_id_link
```

It generates a [database migration](http://edgeguides.rubyonrails.org/active_record_migrations.html).

</Instruction>

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

Then run the following script:

```bash
bundle exec rails db:migrate
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
module Types
  class LinkType < BaseObject
    field :id, ID, null: false
    field :url, String, null: false
    field :description, String, null: false
    # `posted_by` is automatically camelcased as `postedBy`
    # field can be nil, because we added users relationship later
    # "method" option remaps field to an attribute of Link model
    field :posted_by, UserType, null: true, method: :user
  end
end
```

</Instruction>

<Instruction>

And update `CreateLink` resolver:

```ruby(path=".../graphql-ruby/app/graphql/mutations/create_link.rb")
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
    end
  end
end
```

</Instruction>

Done! Now when you post links, they will be attached to your user, so you have to run  `SignInUser` beforehand.

![](http://i.imgur.com/9ma8r8u.png)
