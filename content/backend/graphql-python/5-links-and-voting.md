---
title: Links and Voting
description: Enable Users to create Links and to Vote on them
---

### Attaching Users to Links
With sign in power, you can now create you *own* links, posted by you. To make it possible, let's integrate the Links and Users models:

<Instruction>

On the User models file, add the `posted_by` field at the very end:

```python(path="hackernews/links/models.py")
posted_by = models.ForeignKey('users.User', null=True)
```

</Instruction>

<Instruction>

Run the Django commands to reflect the changes on the database:

```bash
python manage.py makemigrations
python manage.py migrate
```

</Instruction>

<Instruction>

On the `CreateLink` mutation, grab the user from the client's session to use it in the new created field:

```python(path="hackernews/links/schema.py")
# ...code
# Add the following imports
from users.schema import get_user, UserType


# ...code
# Change the CreateLink mutation
class CreateLink(graphene.Mutation):
    id = graphene.Int()
    url = graphene.String()
    description = graphene.String()
    posted_by = graphene.Field(UserType)

    class Input:
        url = graphene.String()
        description = graphene.String()

    @staticmethod
    def mutate(root, input, context, info):

        user = get_user(context) or None

        link = Link(
            url=input.get('url'),
            description=input.get('description'),
            posted_by=user,
        )
        link.save()

        return CreateLink(
            id=link.id,
            url=link.url,
            description=link.description,
            posted_by=link.posted_by,
        )
```

</Instruction>

To test it, send a mutation to the server:

![](http://i.imgur.com/9JMnRWf.png)

Neat!

### Adding Votes
One of the Hackernews' features is to vote on links, making ones more popular than others. To create this, you'll need to create a Vote model and a `CreateVote` mutation. Let's begin:

<Instruction>

Add the Vote model on the `links/models.py`:

```python(path="hackernews/links/schema.py")
class Vote(models.Model):
    user = models.ForeignKey('users.User')
    link = models.ForeignKey('links.Link', related_name='votes')
```

</Instruction>

<Instruction>

And reflect the changes on the database:

```bash
python manage.py makemigrations
python manage.py migrate
```

</Instruction>

<Instruction>

Finally, add a new mutation for voting:

```python(path="hackernews/links/schema.py")
# ...code
# In the same import line, add the Vote model
from links.models import Link, Vote


# ...code
# Add the CreateVote mutation
class CreateVote(graphene.Mutation):
    user = graphene.Field(UserType)
    link = graphene.Field(LinkType)

    class Input:
        link_id = graphene.Int()

    @staticmethod
    def mutate(root, input, context, info):
        user = get_user(context) or None
        if not user:
            raise Exception('You must be logged to vote!')

        link = Link.objects.filter(id=input.get('link_id')).first()
        if not link:
            raise Exception('Invalid Link!')

        Vote.objects.create(
            user=user,
            link=link,
        )

        return CreateVote(user=user, link=link)


# ...code
# Add the mutation to the Mutation class
class Mutation(graphene.AbstractType):
    create_link = CreateLink.Field()
    create_vote = CreateVote.Field()
```

</Instruction>

Voting time! Try to vote for the first link:

![](http://i.imgur.com/ih72ZmP.png)

### Relating Links and Votes
You can already vote, but you can't see it! A solution for this is being able to get a list of all the votes and a list of votes from each link. Follow the next steps to accomplish it:

<Instruction>

Add the `VoteType` and a `votes` field to get all votes:

```python(path="hackernews/links/schema.py")
# ...code
# Add after the LinkType
class VoteType(DjangoObjectType):
    class Meta:
        model = Vote
```

</Instruction>

<Instruction>

```python(path="hackernews/links/schema.py")
# ...code
# Add the votes field
class Query(graphene.AbstractType):
    links = graphene.List(LinkType)
    votes = graphene.List(VoteType)

    @graphene.resolve_only_args
    def resolve_links(self):
        return Link.objects.all()

    @graphene.resolve_only_args
    def resolve_votes(self):
        return Vote.objects.all()
```

</Instruction>

Awesome! On GraphiQL, try to fetch the list of votes:

![](http://i.imgur.com/mkb5w1z.png)

To close this chapter, make a query for all the links and see how smoothly the votes become available:

![](http://i.imgur.com/uGMWHxV.png)

Yay!
