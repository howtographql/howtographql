import * as React from 'react'
import Link from 'gatsby-link'

interface Lol {
  a: string
}

const lol: Lol = {
  a: 'hi'
}

export default () => (
  <div>
    <div>Helloooo</div>
    <Link to='/page'>go to page ${lol.a}</Link>
    <style jsx>{`
      div {
        background: green;
      }
    `}</style>
  </div>
)
