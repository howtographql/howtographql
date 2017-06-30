import * as React from 'react'
import '../styles/prism-ghcolors.css'
import { MarkdownRemark, RelayConnection } from '../types'
import App from '../components/App'
import Sidebar from '../components/Tutorials/Sidebar'
import Chapter from '../components/Tutorials/Chapter'
import Success from '../components/Success/Success'
import { extractSteps } from '../utils/graphql'

interface Props {
  data: {
    markdownRemark: MarkdownRemark
    mds: RelayConnection<MarkdownRemark>
  }
  location: any
}

class Tutorials extends React.Component<Props, null> {
  private ref: any

  componentDidUpdate(oldProps: Props) {
    if (oldProps.location.key !== this.props.location.key) {
      this.scrollUp()
    }
  }

  public render() {
    const post = this.props.data.markdownRemark

    const showSuccess = this.props.location.pathname.includes('/success')
    const steps = extractSteps(this.props.data.mds)

    return (
      <App>
        <div className="tutorials">
          <style jsx={true}>{`
            .tutorials {
              @p: .flex;
            }
            .left-container {
              @p: .overflowAuto, .bbox, .flexAuto;
              height: calc(100vh - 72px);
            }
          `}</style>
          <div
            className="left-container"
            id="tutorials-left-container"
            ref={this.setRef}
          >
            {showSuccess
              ? <Success post={post} />
              : <Chapter
                  post={post}
                  location={this.props.location}
                  steps={steps}
                />}
          </div>
          <Sidebar steps={steps} post={post} location={this.props.location} />
        </div>
      </App>
    )
  }

  private setRef = ref => {
    this.ref = ref
  }

  private scrollUp = () => {
    // TODO scroll up and not down
    // scrolling down just for development
    if (this.ref) {
      this.ref.scrollTop = 0
    }
  }
}

export default Tutorials

export const pageQuery = graphql`
  query ChapterBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug }}) {
      html
      fields {
        slug
      }
      frontmatter {
        title
        videoId
        videoAuthor
        parent
        question
        answers
        correctAnswer
        description
      }
    }
    mds: allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
