---
title: "React + Apollo"
videoid: "asdasd"
---

```js
_createLink = async () => {
  const postedById = localStorage.getItem(GC_USER_ID)
  if (!postedById) {
    console.error('No user logged in')
    return
  }
  const { description, url } = this.state
  await this.props.createLinkMutation({
    variables: {
      description,
      url,
      postedById
    },
    update: (store, { data: { createLink } }) => {
      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC'
      const data = store.readQuery({
        query: ALL_LINKS_QUERY,
        variables: { first, skip, orderBy }
      })
      data.allLinks.splice(0,0,createLink)
      data.allLinks.pop()
      store.writeQuery({
        query: ALL_LINKS_QUERY,
        data,
        variables: { first, skip, orderBy }
      })
    }
  })
  this.props.history.push(`/new/1`)
}
```
