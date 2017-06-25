import * as React from 'react'
import Header from '../components/Header'
import Chooser from '../components/home/Chooser'
import Intro from '../components/home/Intro'
import Link from 'gatsby-link'

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
      {props.data &&
        props.data.mds.edges.map(edge => edge.node).map(node =>
          <div>
            <Link to={`${node.fields.slug}`}>{node.fields.slug}</Link>
          </div>,
        )}
      <Intro />
      <Chooser />
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
