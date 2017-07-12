import * as React from 'react'
import Nav from './Nav'
import { Step } from '../types'
import Logo from './Logo'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default function Header({ steps, location }: Props) {
  return (
    <div className="header">
      <style jsx={true}>{`
        .header {
          @p: .flex, .bb, .bDarkBlue10, .bw2, .justifyBetween, .fixed, .left0, .right0, .top0, .bgWhite;
          z-index: 1000;
          transform: translate3d(0, 0, 0);
        }
        .header-logo {
          @p: .o0;
        }
        @media (min-width: 1051px) {
          div.header-logo {
            @p: .o100;
          }
        }
      `}</style>
      <div className="header-logo">
        <Logo />
      </div>
      <Nav steps={steps} location={location} />
    </div>
  )
}
