import * as React from 'react'
import Link from 'gatsby-link'

interface Props {
  href: string
  [key: string]: any
}

export default function A({ href, children, ...rest }: Props) {
  // use gatsby link for internal links
  if (href && typeof href.startsWith === 'function' && !href.startsWith('http')) {
    return <Link to={href} {...rest}>{children}</Link>
  }

  // use normal link component for rest, but open new tab
  return <a href={href} {...rest} target="_blank">{children}</a>
}
