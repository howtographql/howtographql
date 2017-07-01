import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import Link from 'gatsby-link'

export default function Header() {
  return (
    <div className="header">
      <style jsx={true}>{`
        .header {
          @p: .flex, .bb, .bDarkBlue10, .justifyBetween, .fixed, .left0, .right0, .top0, .z999, .bgWhite;
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
        .right {
          @p: .flex;
        }
        .element {
          @p: .bl, .bDarkBlue10, .f14, .ph25, .darkBlue60, .pointer, .itemsCenter, .flex;
        }
        .element:hover {
          @p: .darkBlue;
        }
        .triangle {
          @p: .f14, .ml6;
        }
        .element.github {
          @p: .ph25, .flex, .itemsCenter, .pv0;
        }
        @media (max-width: 1050px) {
          div.right {
            display: none;
          }
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

      <div className="right">
        <div className="element">
          <span>GraphQL</span>
          <span className="triangle">▾</span>
        </div>
        <div className="element">
          <span>Frontend</span>
          <span className="triangle">▾</span>
        </div>

        <div className="element">
          <span>Backend</span>
          <Link to="/tutorials/success">
            <span className="triangle">▾</span>
          </Link>
        </div>
        <a
          className="element github"
          href="https://github.com/howtographql/howtographql"
        >
          <Icon
            src={require('graphcool-styles/icons/fill/github.svg')}
            color={$v.gray30}
            width={32}
            height={32}
          />
        </a>
      </div>
    </div>
  )
}
