---
title: The Models
pageTitle: "Building a GraphQL Server with PHP using Laravel Framework"
description: "Learn how to build a GraphQL server with PHP using Laravel Framework. Setup the models."
---

On the previous chapter we have create a project from scratch. Now it is time to setup our classes.

For our simple blog API, one user can publish many posts, and each post has many comments from anonymous users.

<img src="https://raw.githubusercontent.com/nuwave/lighthouse-docs/master/docs/assets/tutorial/model.png">  

This first part is pure Laravel, we will add the GraphQL part afterwards. We will define models and migrations 

<Instruction>      

Create the `Post` model:

```bash
php artisan make:model -m Post
```

</Instruction>      

<Instruction>      

Create the `Comment` model:

```bash
php artisan make:model -m Comment
```

</Instruction>


<Instruction>

Setup the relationships for `Post` model:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
```

</Instruction>


<Instruction>       

Setup relationships for `Comment` model:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

</Instruction>


<Instruction>

Setup the migration file for `Post`:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostsTable extends Migration
{
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->string('title');
            $table->string('content');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('posts');
    }
}
```

</Instruction>          


<Instruction>

Setup the migration file for `Comment`:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('post_id');
            $table->string('reply');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
}
```

</Instruction>          

<Instruction>          

Remember to run the migrations:

```bash
php artisan migrate
```

</Instruction>      

<Instruction>          

Finally, add the `posts` relation to `app/Users.php`

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

</Instruction>          


On the next chappter we will setup the GraphQL schema and wire it up with the app.