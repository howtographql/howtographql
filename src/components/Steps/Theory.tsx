import * as React from 'react'

export default function Theory() {
  return (
    <div className="theory">
      <style jsx={true}>{`
        .theory {
          @p: .pl16, .mb38;
          margin-left: 4px;
        }
        span {
          @p: .black30, .f14, .ttu, .fw6;
        }
      `}</style>
      <span>
        GraphQL Theory
      </span>
    </div>
  )
}
