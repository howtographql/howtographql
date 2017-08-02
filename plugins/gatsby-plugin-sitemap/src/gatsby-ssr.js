import React from "react"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {

  setHeadComponents([
    <link
      key={`gatsby-plugin-sitemap`}
      rel="sitemap"
      type="application/xml"
      href="/sitemap.xml"
    />,
  ])
}
