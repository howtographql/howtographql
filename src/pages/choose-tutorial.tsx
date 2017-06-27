import * as React from 'react'
import '../styles/prism-ghcolors.css'
import { MarkdownRemark, RelayConnection } from '../types'
import App from '../components/App'
import Sidebar from '../components/Tutorials/Sidebar'
import { extractSteps } from '../utils/graphql'
// import Youtube from 'youtube-embed-video'
import Footer from '../components/home/Footer'
import Chooser from '../components/home/Chooser'

interface Props {
  data: {
    markdownRemark: MarkdownRemark
    mds: RelayConnection<MarkdownRemark>
  }
  location: any
}

class Tutorials extends React.Component<Props, null> {
  public render() {
    const steps = extractSteps(this.props.data.mds)

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
                <Chooser mds={steps} />
              </div>
            </div>
            <Footer />
          </div>
          <Sidebar steps={steps} />
        </div>
      </App>
    )
  }
}
// {post.frontmatter.videoId &&
// <div className="video">
//   <Youtube
//     videoId={post.frontmatter.videoId}
//     suggestions={false}
//   />
// </div>}

export default Tutorials

export const pageQuery = graphql`
  query chooseTutorialMarkdowns {
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
