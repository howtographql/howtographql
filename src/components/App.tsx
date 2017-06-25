import * as React from 'react'
import Header from './Header'

interface Props {
  children?: JSX.Element
}

export default function App({ children }: Props) {
  return (
    <div>
      <style jsx={true}>{`
        .content {
          padding-top: 72px;
        }
      `}</style>
      <Header />
      <div className="content">
        {children}
      </div>
    </div>
  )
}
