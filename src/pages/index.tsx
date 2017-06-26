import * as React from 'react'
import Chooser from '../components/home/Chooser'
import Intro from '../components/home/Intro'
import App from '../components/App'
import { extractSteps } from '../utils/graphql'

export default props => {
  return (
    <App>
      <Intro />
      <Chooser mds={extractSteps(props.data.mds)} />
    </App>
  )
}

export const pageQuery = graphql`
  query markdowns {
    mds: allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
