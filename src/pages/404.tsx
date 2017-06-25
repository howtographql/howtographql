import * as React from 'react'
import Link from 'gatsby-link'

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Back to Home</Link>
    </div>
  )
}
