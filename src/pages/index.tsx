import * as React from 'react'
import Chooser from '../components/home/Chooser'
import Intro from '../components/home/Intro'
import App from '../components/App'
import { extractSteps } from '../utils/graphql'
import WhatWeBuild from '../components/home/WhatWeBuild'
import LandingPlayground from '../components/home/LandingPlayground'
import Team from '../components/home/Team'
import ContentOverview from '../components/home/ContentOverview'
import Footer from '../components/home/Footer'
import { MarkdownRemark, RelayConnection } from '../types'
import CustomHelmet from '../components/CustomHelmet'
import { Banner } from '../components/Banner'

interface Props {
  data: {
    mds: RelayConnection<MarkdownRemark>
  }
  location: any
  history: any
}

export default (props: Props) => {
  const steps = extractSteps(props.data.mds)
  const title = 'How to GraphQL - The Fullstack Tutorial for GraphQL'
  const overrideDescription =
    'Fullstack GraphQL Tutorial to go from zero to production covering all basics and advanced concepts. Includes tutorials for Apollo, Relay, React and NodeJS.'
  const description =
    'Fullstack GraphQL Tutorial to go from zero to production covering all basics and advanced concepts.'
  return (
    <App history={props.history} steps={steps} location={props.location}>
      <CustomHelmet
        title={title}
        description={description}
        overrideDescription={overrideDescription}
      />
      <Intro steps={steps} location={props.location} />
      <Chooser mds={steps} location={props.location} history={props.history} />
      <WhatWeBuild />
      <LandingPlayground />
      <Team />
      <ContentOverview location={props.location} steps={steps} />
      <Footer />
      <Banner />
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
            duration
            videoId
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
