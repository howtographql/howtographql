---
title: Getting Started
pageTitle: "Building a GraphQL Server with PHP using Laravel Framework"
description: "Learn how to build a GraphQL server with PHP using Laravel Framework. Install dependencies and make sure the basic setup is working."
---

In this tutorial we will create a GraphQL API for a simple Blog from scratch with:

- Laravel 5.7
- Lighthouse 2.x
- Laravel GraphQL Playground
- MySQL

<br />

> You can download the source code for this tutorial at https://github.com/nuwave/lighthouse-tutorial

<br />

## Installation

Create a new Laravel project. You can use an existing project if you like,
but you may have to adapt as we go along. Read more about [installing Laravel](https://laravel.com/docs/#installing-laravel).

    laravel new lighthouse-tutorial

In this tutorial we will use [Laravel GraphQL Playground](https://github.com/mll-lab/laravel-graphql-playground)
as an IDE for GraphQL queries. It's like Postman for GraphQL, but with super powers. Of course, we will use Lighthouse as the GraphQL Server.

    composer require nuwave/lighthouse mll-lab/laravel-graphql-playground

Then publish the configuration and the default schema.


```bash
# lighthouse
php artisan vendor:publish --provider="Nuwave\Lighthouse\Providers\LighthouseServiceProvider"

# playground
php artisan vendor:publish --provider="MLL\GraphQLPlayground\GraphQLPlaygroundServiceProvider"
```

The default schema was published to `routes/graphql/schema.graphql`.
Let's make sure everything is working.

Change the default namespaces for Models in  `config/lighthouse.php` to the Laravel default.

```php
'namespaces' => [
        'models' => 'App', 
        ...
],
```

Consult the [Laravel docs on database configuration](https://laravel.com/docs/5.7/database#configuration)
and ensure you have a working database set up.

Run database migrations to create the `users` table:

    php artisan migrate

Seed the database with some fake users:

    php artisan tinker
    factory('App\User', 10)->create();

Now you are ready to start your server. Use [Homestead](https://laravel.com/docs/5.7/homestead), [Valet](https://laravel.com/docs/5.7/valet) or:

    php artisan serve

To make sure everything is working, access Laravel GraphQL Playground on http://127.0.0.1:8000/graphql-playground
and try the following query:

```graphql
{
  user(id: 1) {
    id
    name
    email
  }
}
```

Now, let's move on and create a GraphQL API for our Blog.
