---
title: Filtering
pageTitle: "Server-side Filtering with GraphQL & Ruby Tutorial"
description: "Learn best practices for implementing filters in a GraphQL API using query arguments with a Ruby GraphQL server."
---

Another important [Hackernews](https://news.ycombinator.com/) feature is searching the links, so you're going to be adding support for that now. You already know that it's possible to pass input data to mutations, via arguments. Now you're going to use this same concept to apply optional filters to the existing `allLinks` query.

For this part of the tutorial, we are going to use [SearchObject::Plugin::GraphQL](https://github.com/rstankov/SearchObjectGraphQL), gem used for making more advanced GraphQL search/filter resolvers.

<Instruction>

Add the following lines to your `Gemfile`:

```ruby(path=".../graphql-ruby/Gemfile")
gem 'search_object_graphql', '0.3.1'
```

</Instruction>

<Instruction>

Then run:

```bash
bundle install
```

</Instruction>

<Instruction>

And restart the server.

</Instruction>

This would install [SearchObject](https://github.com/rstankov/SearchObjectGraphQL) and you can use it.

<Instruction>

Create a search resolver:

```ruby(path=".../graphql-ruby/app/graphql/resolvers/links_search.rb")
require 'search_object'
require 'search_object/plugin/graphql'

class Resolvers::LinksSearch
  # include SearchObject for GraphQL
  include SearchObject.module(:graphql)

  # scope is starting point for search
  scope { Link.all }

  type types[Types::LinkType]

  # inline input type definition for the advanced filter
  class LinkFilter < ::Types::BaseInputObject
    argument :OR, [self], required: false
    argument :description_contains, String, required: false
    argument :url_contains, String, required: false
  end

  # when "filter" is passed "apply_filter" would be called to narrow the scope
  option :filter, type: LinkFilter, with: :apply_filter

  # apply_filter recursively loops through "OR" branches
  def apply_filter(scope, value)
    branches = normalize_filters(value).reduce { |a, b| a.or(b) }
    scope.merge branches
  end

  def normalize_filters(value, branches = [])
    scope = Link.all
    scope = scope.where('description LIKE ?', "%#{value[:description_contains]}%") if value[:description_contains]
    scope = scope.where('url LIKE ?', "%#{value[:url_contains]}%") if value[:url_contains]

    branches << scope

    value[:OR].reduce(branches) { |s, v| normalize_filters(v, s) } if value[:OR].present?

    branches
  end
end
```

</Instruction>

This resolver contains all logic related to find links. Over time you can add more rules.

[SearchObject](https://github.com/rstankov/SearchObjectGraphQL) can be used as a [GraphQL::Schema::Resolver](https://graphql-ruby.org/api-doc/1.10.2/GraphQL/Schema/Resolver.html).

<Instruction>

Use `LinksSearch` for finding links:

```ruby(path=".../graphql-ruby/app/graphql/types/query_type.rb")
module Types
  class QueryType < BaseObject
    field :all_links, resolver: Resolvers::LinksSearch
  end
end
```

</Instruction>

Try your new filter out now:

![Try your new filter out](https://i.imgur.com/9DCu9VL.png)

You can even do more complicated searches:

![You can even do more complicated searches](https://i.imgur.com/8oBkRfJ.png)

<Instruction>

Here is the unit test for `LinksSearch`:

```ruby(path=".../graphql-ruby/test/graphql/resolvers/links_search_test.rb")
require 'test_helper'

module Resolvers
  class LinksSearchTest < ActiveSupport::TestCase
    def find(args)
      ::Resolvers::LinksSearch.call(nil, args, nil)
    end

    # those helpers should be handled with something like `factory_bot` gem
    def create_user
      User.create name: 'test', email: 'test@example.com', password: '123456'
    end

    def create_link(**attributes)
      Link.create! attributes.merge(user: create_user)
    end

    test 'filter option' do
      link1 = create_link description: 'test1', url: 'http://test1.com'
      link2 = create_link description: 'test2', url: 'http://test2.com'
      link3 = create_link description: 'test3', url: 'http://test3.com'
      link4 = create_link description: 'test4', url: 'http://test4.com'

      result = find(
        filter: {
          description_contains: 'test1',
          OR: [{
            url_contains: 'test2',
            OR: [{
              url_contains: 'test3'
            }]
          }, {
            description_contains: 'test2'
          }]
        }
      )

      assert_equal result.map(&:description).sort, [link1, link2, link3].map(&:description).sort
    end
  end
end
```

You can run the tests with the following command:

```bash
bundle exec rails test
```

</Instruction>
