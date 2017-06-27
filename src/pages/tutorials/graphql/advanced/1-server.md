---
title: Server
---


### Resolver Functions to Process Requests

In the first section, you learned that GraphQL types have _fields_. Each field of a GraphQL type corresponds to a so-called _resolver_ function in the GraphQL server implementation.

When a query is received on the backend, the server will gather the requested data by calling all resolver functions. If a query is _nested_, the resolvers will be called in the order that's specified in the query to obtain the right information. The execution completes once a field has a scalar type for which a concrete piece of data can be returned. GraphQL queries always end at scalar values (like a string, number or boolean value). 


### Integrating Legacy Infrastructures with GraphQL

GraphQL not only is valuable tool for _greenfield_ projects. It can also be used to unify existing APIs behind a thin GraphQL layer that will then take care of actually calling the underlying systems and collecting the data.
