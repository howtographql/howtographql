---
title: Test
---

## Setting up the Scripts

Since this is a frontend track, we don't want to spend too much time setting up the backend. This is why we use [Graphcool](https://www.graph.cool/), a service that provides a production-ready GraphQL API out-of-the-box.


## Test + Code

<Instruction>

Hallo do this and that `and/put/it/here`

```js{2-4}(path="./src/index.js")
console.log('hi');
class asd extend React.Component {
    render() {
        return <div></div>
    }
}
```

</Instruction>


## 1 Instruction

<Instruction>

Hallo do this and that `and/put/it/here`

</Instruction>

## Multiple Instructions

<Instruction>

Hallo do this and that `and/put/it/here`

Hallo do this and that `and/put/it/here`

Hallo do this and that `and/put/it/here`


</Instruction>

## Creating the GraphQL Server

For starting out, we're not going to use the full data model that you saw above. That's becasue we want to evolve the schema when it becomes necessary for the features that we implement.

For now, we're just going use the `Link` type to create our backend.

The first thing you need to do is install the Graphcool CLI with npm. Open up a terminal window and type the following:
