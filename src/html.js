import React from 'react'
import PropTypes from 'prop-types'

const Html = props => (
  <html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0 maximum-scale=5.0"
    />
    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" />
  </head>
  <body>
    <div
      id="___gatsby"
      dangerouslySetInnerHTML={{ __html: props.body }}
    />
    {props.postBodyComponents}
  </body>
  </html>
)

Html.propTypes = {
  body: PropTypes.node,
}

Html.defaultProps = {
  body: '',
}

export default Html
