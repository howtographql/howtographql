---
title: Pagination
---

As the number of links grow, listing all of them becomes less feasible. It stands to reason you should introduce the ability to only request a number of links and paginate through the result.

Like filtering, pagination can be achieved in any way that makes sense for the underlying storage.


> In this tutorial, you'll implement a simple pagination approach called limit-offset pagination (similar to what you may know from SQL). This approach does not work with Relay on the frontend, since Relay requires cursor-based pagination via the concept of connections. You can read more about pagination in the [GraphQL docs](http://graphql.org/learn/pagination/).  Connections, and the rest of the Relay specification, can be found in the [Relay docs](https://facebook.github.io/relay/docs/graphql-connections.html).


Predictably, you start off from the schema. Add two new arguments to enable the client to specify the number of links they require and what index to start from.

```
type Query {
  allLinks(filter: LinkFilter, skip: Int = 0, first: Int = 0): [Link]
}
```

Update the repository method to take and use these new arguments:

```
public List<Link> getAllLinks(LinkFilter filter, int skip, int first) {
    Optional<Bson> mongoFilter = Optional.ofNullable(filter).map(this::buildFilter);
    
    List<Link> allLinks = new ArrayList<>();
    FindIterable<Document> documents = mongoFilter.map(links::find).orElseGet(links::find);
    for (Document doc : documents.skip(skip).limit(first)) {
        allLinks.add(link(doc));
    }
    return allLinks;
}
```

And, of course, update the top-level method in the `Query` class:

```
public List<Link> allLinks(LinkFilter filter, Number skip, Number first) {
    return linkRepository.getAllLinks(filter, skip.intValue(), first.intValue());
}
```

Note that the parameter type for both *must* be `Number` because `graphql-java-tools` will sometimes try to stuff an `Integer` and sometimes a `BigInteger` into it, depending on the context.

Wasn't that easy? Jump back to Graph*i*QL and paginate away!

[Image: https://quip.com/-/blob/MFcAAALibcr/1jVRUZNlefYwVC9KvSaczw]
[Image: https://quip.com/-/blob/MFcAAALibcr/7VRLJP91X6CUB5l8lq-Aow]

You can still, of course, get all links:

[Image: https://quip.com/-/blob/MFcAAALibcr/9O45HtNjFYdBfMNgoPUBRA]

