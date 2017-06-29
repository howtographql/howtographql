import * as React from 'react'
import Chooser from '../components/home/Chooser'
import Intro from '../components/home/Intro'
import App from '../components/App'
import { extractSteps } from '../utils/graphql'
import WhatWeBuild from '../components/home/WhatWeBuild'
// import LandingPlayground from '../components/home/LandingPlayground'
import Team from '../components/home/Team'
import ContentOverview from '../components/home/ContentOverview'
import Footer from '../components/home/Footer'
import { MarkdownRemark, RelayConnection } from '../types'

interface Props {
  data: {
    mds: RelayConnection<MarkdownRemark>
  }
  location: any
}

export default (props: Props) => {
  const steps = extractSteps(props.data.mds)
  return (
    <App>
      <Intro steps={steps} location={props.location} />
      <Chooser mds={steps} />
      <WhatWeBuild />
      {/*<LandingPlayground />*/}
      <Team />
      <ContentOverview location={props.location} steps={steps} />
      <Footer />
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
