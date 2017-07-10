---
title: Filtering
description: Use query arguments to filter which links are returned
---

## Filtering

As you have seen in earlier chapters, queries and mutations can take input via arguments. Since arguments have no inherent semantics attached, and mean whatever you define them to mean, you can easily implement common features like filtering by simply designating arguments to be used for this purpose.

You'll now apply this idea to add filtering to the already defined `allLinks` query. Start by add a new argument to its schema definition:

```graphql
type Query {
  allLinks(filter: LinkFilter): [Link]
}

input LinkFilter {
  description_contains: String
  url_contains: String
}
```

Remember that this exact approach is just an example. You might as well implement filtering using any other format.

The corresponding POJO should look something like the following:

```java
import com.fasterxml.jackson.annotation.JsonProperty;

public class LinkFilter {

    private String descriptionContains;
    private String urlContains;

    @JsonProperty("description_contains") //the name must match the schema
    public String getDescriptionContains() {
        return descriptionContains;
    }

    public void setDescriptionContains(String descriptionContains) {
        this.descriptionContains = descriptionContains;
    }

    @JsonProperty("url_contains")
    public String getUrlContains() {
        return urlContains;
    }

    public void setUrlContains(String urlContains) {
        this.urlContains = urlContains;
    }
}
```

Now, update `LinkRespository#getAllLinks` to accept an optional filter:

```java
public List<Link> getAllLinks(LinkFilter filter) {
    Optional<Bson> mongoFilter = Optional.ofNullable(filter).map(this::buildFilter);
    
    List<Link> allLinks = new ArrayList<>();
    for (Document doc : mongoFilter.map(links::find).orElseGet(links::find)) {
        allLinks.add(link(doc));
    }
    return allLinks;
}

//builds a Bson from a LinkFilter
private Bson buildFilter(LinkFilter filter) {
    String descriptionPattern = filter.getDescriptionContains();
    String urlPattern = filter.getUrlContains();
    Bson descriptionCondition = null;
    Bson urlCondition = null;
    if (descriptionPattern != null && !descriptionPattern.isEmpty()) {
        descriptionCondition = regex("description", ".*" + descriptionPattern + ".*", "i");
    }
    if (urlPattern != null && !urlPattern.isEmpty()) {
        urlCondition = regex("url", ".*" + urlPattern + ".*", "i");
    }
    if (descriptionCondition != null && urlCondition != null) {
        return and(descriptionCondition, urlCondition);
    }
    return descriptionCondition != null ? descriptionCondition : urlCondition;
}
```

Finally, update `Query` to add the new argument to the top-level method:

```java
public List<Link> allLinks(LinkFilter filter) {
    return linkRepository.getAllLinks(filter);
}
```

Cool! Check it out in Graph*i*QL!

![](http://i.imgur.com/tL8owju.png)
