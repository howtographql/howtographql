import * as React from 'react'

export default function Team() {
  return (
    <section>
      <style jsx={true}>{`
        section {
          @p: .center;
          max-width: 960px;
        }
        p {
          @p: .tc, .mt38;
        }
      `}</style>
      <h2>For the community by the community</h2>
      <p>
        How to GraphQL was created by Graphcool and many amazing contributors.
      </p>
    </section>
  )
}
