import * as React from 'react'
import Link from 'gatsby-link'

export default () =>
  <div className="index">
    <style jsx={true}>{`
      .index {
        @p: .pa60;
      }
      .index :global(a) {
        display: block;
      }
    `}</style>
    <Link to="/chooser">chooser</Link>
    <Link to="/tracks/frontend/react-apollo">React Apollo Markdown</Link>
  </div>

const a = 5
