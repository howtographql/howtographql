import * as React from 'react'
import '../styles/prism-ghcolors.css'
import { MarkdownRemark, RelayConnection } from '../types'
import App from '../components/App'
import Sidebar from '../components/Tutorials/Sidebar'
import Markdown from '../components/Tutorials/Markdown'
import { extractSteps } from '../utils/graphql'
// import Youtube from 'youtube-embed-video'
import TutorialChooser from '../components/TutorialChooser'
import Quiz from '../components/Quiz/Quiz'

interface Props {
  data: {
    markdownRemark: MarkdownRemark
    mds: RelayConnection<MarkdownRemark>
  }
  location: any
}

class Tutorials extends React.Component<Props, null> {
  public render() {
    const post = this.props.data.markdownRemark

    const steps = extractSteps(this.props.data.mds)
    const isTutorialChooser = this.props.location.pathname.includes('choose')

    return (
      <App>
        <div className="tutorials">
          <style jsx={true}>{`
            .tutorials {
              @p: .flex;
            }
            .content {
              @p: .pa38, .bbox;
            }
            .left-container {
              @p: .overflowAuto, .bbox, .flexAuto;
              height: calc(100vh - 72px);
            }
            .left {
              @p: .center;
              max-width: 960px;
              min-height: calc(100vh - 72px - 220px);
            }
            h1 {
              @p: .f38;
            }
            .video {
              @p: .relative;
              height: 0;
              padding-top: 25px;
              padding-bottom: 56.25%;
            }
            .video :global(iframe) {
              @p: .absolute, .top0, .left0, .right0, .bottom0, .w100, .h100;
            }
          `}</style>
          <div className="left-container">
            <div className="left">
              <div className="content">
                <h1>{post.frontmatter.title}</h1>
                <Markdown html={post.html} />
                {isTutorialChooser && <TutorialChooser markdownFiles={steps} />}
                <Quiz
                  question={question}
                  answers={answers}
                  correctAnswerIndex={2}
                  nextChapter={steps['react-apollo'][1]}
                />
              </div>
            </div>
          </div>
          <Sidebar steps={steps} post={post} location={this.props.location} />
        </div>
      </App>
    )
  }
}

const question = 'How would you fetch multiple GraphQL Types?'
const answers = [
  'I would use one fragment for each type',
  'I would have one request for each type',
  'I would use one big interleaved request',
  "It's not possible to fetch multiple types at the same time",
]

// {post.frontmatter.videoId &&
// <div className="video">
//   <Youtube
//     videoId={post.frontmatter.videoId}
//     suggestions={false}
//   />
// </div>}

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
      }
    }
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
