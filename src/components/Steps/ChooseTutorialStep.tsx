import * as React from 'react'
import Link from 'gatsby-link'

export default function ChooseTutorialStep() {
  return (
    <div className="choose-tutorial-step">
      <style jsx={true}>{`
        .choose-tutorial-step {
          @p: .bl, .bBlack20, .pb38, .pl25, .relative, .bw2;
        }
        a {
          @p: .black80;
        }
        a:before {
          @p: .bBlack20, .absolute, .ba, .bw2, .br100;
          background: #f5f5f5;
          content: '';
          left: -7px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        h3 {
          @p: .black30, .f14, .ttu, .fw6, .mb25;
        }
        p {
          @p: .f14, .black30, .lhCopy, .mt25;
        }
      `}</style>
      <Link to="/tutorials/choose">
        <h3>Practical Tutorial</h3>
        <a href="">Choosing the right tutorial</a>
        <p>
          We got 10 Tutorials prepared,
          covering all major frontend and
          backend technologies you can
          use with GraphQL, such as
          React, Relay, Apollo, NodeJS
          and many more.
        </p>
      </Link>
    </div>
  )
}
