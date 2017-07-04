const {request} = require('graphql-request')
const algoliasearch = require('algoliasearch')
//
// const query = `{
// 	allMarkdownRemark {
//     edges {
//       node {
//         frontmatter {
//           title
//         }
//         fields {
//           slug
//         }
//         excerpt(pruneLength: 1000)
//       }
//     }
//   }
// }`
//
// request('http://localhost:8000/___graphql', query)
//   .then(data => {
//   })

module.exports = {
  syncToAlgolia: function syncToAlgolia(data) {
    const client = algoliasearch('EGOD51Z7AV', '6c8ed811f9c39a0aeca852b94d897f2e')
    const index = client.initIndex('howtographql')

    const objects = data.allMarkdownRemark.edges
      .map(edge => edge.node)
      .map(node => ({
        title: node.frontmatter.title,
        objectID: node.fields.slug,
        body: node.excerpt
      }))

    index.saveObjects(objects, (err, content) => {
      if (!err) {
        console.log(`Successfully synced ${objects.length} items to Algolia`)
      } else {
        console.error(`Error while syncing to Algolia`, err)
      }
    })
  }
}
