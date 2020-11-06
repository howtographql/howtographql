# gatsby-plugin-sitemap

Create a sitemap for your Gatsby site.

## Install

`npm install --save gatsby-plugin-sitemap`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [
  {
    resolve: `gatsby-plugin-sitemap`
  }
]
```

Above is the minimal configuration required to have it work, however, note that
the [default
query](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js)
only retrieves nodes of type `MarkdownRemark`. Any parameter in
`defaultOptions` can be overridden.
