import * as React from 'react'
import Header from '../components/Header'
import Chooser from '../components/home/Chooser'
import Intro from '../components/home/Intro'

import '../styles/reset.css'
import '../styles/main.css'

export default props => {
  return (
    <div>
      <style jsx={true} global={true}>{`
        h1 {
          @p: .f38, .lhTitle;
        }
        h2, h3, h4 {
          @p: .fw6;
        }
        p {
          @p: .f20, .darkBlue50, .lhCopy;
        }
      `}</style>
      <Header />
      <Intro />
      <Chooser
        mds={props.data.mds.edges
          .map(edge => edge.node)
          .filter(n => n.frontmatter.title.length > 0)}
      />
    </div>
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
  }`
