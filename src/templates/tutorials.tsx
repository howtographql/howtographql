import * as React from 'react'
import '../styles/prism-ghcolors.css'
import JsxParser from 'react-jsx-parser'

interface IMarkdownRemark {
  html: string
  frontmatter: {
    title: string
  }
}

interface Props {
  data: {
    markdownRemark: IMarkdownRemark
  }
}

class Tutorials extends React.Component<Props, null> {
  public render() {
    const post = this.props.data.markdownRemark

    return (
      <div className="markdown">
        <style jsx={true} global={true}>{`
          .markdown {
            @p: .lhCopy, .pa60;
          }
          .markdown h1, .markdown h2, .markdown h3, .markdown h4 {
            @p: .lhTitle, .darkBlue, .fw6;
          }
          .markdown h1 {
            @p: .f38, .mb25;
          }
          .markdown h2 {
            @p: .f25;
          }
          .markdown h3 {
            @p: .f20;
          }
          .markdown h2 {
            margin-top: 48px; /* 2x mt38 due to vertical line */
          }
          .markdown h3 {
            margin-top: 30px;
          }
          .markdown h4 {
            margin-top: 20px;
          }
          .markdown p, .markdown ul {
            @p: .mt16;
          }
          .markdown pre {
            @p: .mt38,
              .bDarkBlue10,
              .ba,
              .br2,
              .pa16,
              .bgDarkBlue04,
              .overflowAuto;
          }
          .fl {
            @p: .flex;
          }
        `}</style>
        <div className="fl">
          <div>
            <JsxParser
              jsx={`<div>${post.html}</div>`}
              components={{ HELLO: Hello }}
              showWarnings={true}
            />
          </div>
        </div>
      </div>
    )
  }
}

/*<div dangerouslySetInnerHTML={{ __html: post.html }} />*/
export default Tutorials

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug }}) {
      html
      frontmatter {
        title
      }
    }
  }
`

const Hello = ({ children }) => {
  return (
    <div>
      {children}
      <h1>I am a Component</h1>
    </div>
  )
}
