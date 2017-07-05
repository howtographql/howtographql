const path = require('path')
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin')
const xmldom = require('xmldom')
const {syncToAlgolia} = require('./algoliasync')

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  let slug
  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)
    const splittedDir = parsedFilePath.dir.split('/')
    // remove /backend /frontend /graphql
    if (splittedDir.length === 2) {
      slug = `/${splittedDir[1]}/${parsedFilePath.name}/`
    } else if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
    } else if (parsedFilePath.dir === ``) {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }

    // Add slug as a field on the node.
    createNodeField({ node, fieldName: `slug`, fieldValue: slug })
  }
}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const pages = []
    const tutorials = path.resolve('src/templates/Tutorials.tsx')
    // Query for all markdown "nodes" and for the slug we previously created.
    resolve(
      graphql(
        `{
          allMarkdownRemark {
            edges {
              node {
                frontmatter {
                  title
                }
                fields {
                  slug
                }
                excerpt(pruneLength: 1000)
              }
            }
          }
        }
      `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        result.data.allMarkdownRemark.edges.forEach(edge => {
          createPage({
            path: edge.node.fields.slug, // required
            component: tutorials,
            context: {
              slug: edge.node.fields.slug,
            },
          })
        })

        if (process.env.NODE_ENV === 'production') {
          syncToAlgolia(result.data)
        }

        return
      })
    )
  })
}

exports.modifyWebpackConfig = function modifyWebpackConfig({config, stage}) {
  config.removeLoader('md')
  config.loader('md', {
    test: /\.md$/,
    loader: 'babel-loader!reactdown/webpack'
  })

  if (stage === 'build-html') {
    const pages = config._config.plugins[0].paths
    config._config.plugins[0] = new StaticSiteGeneratorPlugin({
      entry: `render-page.js`,
      paths: pages,
      globals: {
        DOMParser: xmldom.DOMParser,
        NodeList: xmldom.NodeList,
        atob: function atob(str) {
          return new Buffer(str, 'base64').toString('binary');
        },
        location: {
          pathname: ''
        },
        document: {
          addEventListener: () => null,
          removeEventListener: () => null
        }
      }
    })
  }

  return config
}
