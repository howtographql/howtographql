import * as React from 'react'

export default class Intro extends React.Component<null, null> {
  render() {
    return (
      <div className="intro">
        <style jsx={true}>{`
          .intro {
            @p: .mv96;
          }
          h1 {
            @p: .tc;
          }
          p {
            @p: .mt25, .mb38, .center, .tc;
            max-width: 800px;
          }
        `}</style>
        <h1>The fullstack tutorial to learn GraphQL</h1>
        <p>
          All you need to know to use GraphQL, we explain the basics first, then
          build a Hackernews clone either focused on the frontend-side or the
          backend-side.
        </p>
      </div>
    )
  }
}
