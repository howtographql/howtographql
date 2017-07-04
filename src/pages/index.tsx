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
import { Helmet } from 'react-helmet'
import { MarkdownRemark, RelayConnection } from '../types'

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
  const description =
    'The free and open-source tutorial for you to learn about GraphQL from zero to production. After a basic introduction, you’ll build a Hackernews clone with Javascript or any other technology of your choice.'
  const image = '/social.png'
  return (
    <App history={props.history} steps={steps} location={location}>
      <Helmet
        title={title}
        meta={[
          { name: 'description', content: title },
          { property: 'og:type', content: 'article' },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:image', content: image },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image', content: image },
        ]}
      />
      <Intro steps={steps} location={props.location} />
      <Chooser mds={steps} />
      <WhatWeBuild />
      <LandingPlayground />
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
