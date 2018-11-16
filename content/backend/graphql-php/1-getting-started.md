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

> You can download the source code for this tutorial at https://github.com/nuwave/lighthouse-tutorial

## Installation

Create a new Laravel project. You can use an existing project if you like,
but you may have to adapt as we go along. Read more about [installing Laravel](https://laravel.com/docs/#installing-laravel).

<Instruction>

Create a new Laravel project from scratch

```bash
laravel new lighthouse-tutorial
```

</Instruction>

In this tutorial we will use [Laravel GraphQL Playground](https://github.com/mll-lab/laravel-graphql-playground)
as an IDE for GraphQL queries. It's like Postman for GraphQL, but with super powers. Of course, we will use Lighthouse as the GraphQL Server.

<Instruction>

Install basic packages:

```bash
# lighthouse 
composer require nuwave/lighthouse 

# playground
composer mll-lab/laravel-graphql-playground
```

</Instruction>    

<Instruction>    

Then publish the configuration and the default schema:

```bash
# lighthouse
php artisan vendor:publish --provider="Nuwave\Lighthouse\Providers\LighthouseServiceProvider"

# playground
php artisan vendor:publish --provider="MLL\GraphQLPlayground\GraphQLPlaygroundServiceProvider"
```

</Instruction>

The default schema was published to `routes/graphql/schema.graphql`.
Let's make sure everything is working.

<Instruction>    

Change the default namespaces for Models in  `config/lighthouse.php` to the Laravel default.

```php
'namespaces' => [
        'models' => 'App', 
        ...
],
```

</Instruction>    

Consult the [Laravel docs on database configuration](https://laravel.com/docs/5.7/database#configuration)
and ensure you have a working database set up.

<Instruction>  

Run database migrations to create the default built-in `users` table:

```bash
php artisan migrate
```    

</Instruction>  


<Instruction>  

Then, seed the database with some fake users:

```bash
# open tinker
php artisan tinker

# seed with fake data, then exit
factory('App\User', 10)->create();
```
</Instruction>  

<Instruction>  

Finally you are ready to start your server. You can use [Homestead](https://laravel.com/docs/5.7/homestead), [Valet](https://laravel.com/docs/5.7/valet) or the Laravel buit-in server:

```bash
php artisan serve
```    

</Instruction>      

<Instruction>      

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

</Instruction>      

Now, let's move on and create a GraphQL API for our Blog.
