import * as React from 'react'
import Link from 'gatsby-link'
import Nav from './Nav'
import { Step } from '../types'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default function Header({ steps, location }: Props) {
  return (
    <div className="header">
      <style jsx={true}>{`
        .header {
          @p: .flex,
            .bb,
            .bDarkBlue10,
            .bw2,
            .justifyBetween,
            .fixed,
            .left0,
            .right0,
            .top0,
            .z999,
            .bgWhite;
          transform: translate3d(0, 0, 0);
        }
        .logo {
          @p: .flex, .ttu, .fw6, .itemsCenter, .pink;
          font-size: 17px;
        }
        .logo img {
          @p: .mr10;
        }
        .logo span {
          @p: .flexFixed;
        }
        img {
          width: 40px;
          height: 35px;
        }
        .left {
          @p: .flex, .pa16, .itemsCenter;
        }
      `}</style>
      <div className="left">
        <Link to="/">
          <div className="logo">
            <img src={require('../assets/icons/howtographql.svg')} alt="" />
            <span>How to GraphQL</span>
          </div>
        </Link>
      </div>

      <Nav steps={steps} location={location} />
    </div>
  )
}
