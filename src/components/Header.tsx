import * as React from 'react'
import Search from './Search'

export default function Header() {
  return (
    <div className="header">
      <style jsx={true}>{`
        .header {
          font-family: 'Open Sans' !important;
          @p: .flex, .bb, .bDarkBlue10, .pa16, .justifyBetween;
        }
        .logo {
          @p: .flex, .ttu, .fw6, .itemsCenter, .pink;
          font-size: 17px;
        }
        .logo img {
          @p: .mr10;
        }
        .left {
          @p: .flex;
        }
        .right {
          @p: .flex;
        }
      `}</style>
      <div className="left">
        <div className="logo">
          <img src={require('../assets/icons/howtographql.svg')} alt="" />
          <span>How to GraphQL</span>
        </div>
        <Search />
      </div>
      <div className="right" />
    </div>
  )
}
