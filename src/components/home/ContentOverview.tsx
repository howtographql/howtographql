import * as React from 'react'

export default function ContentOverview() {
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
      <h2>Content Overview</h2>
      <p>All tutorials are structured to make it as accessible as possible. </p>
    </section>
  )
}
