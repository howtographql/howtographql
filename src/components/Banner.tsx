import * as React from 'react'
import GraphQLConf from '../assets/icons/GraphQLConf'
import LinkArrow from '../assets/icons/LinkArrow'

export const Banner = () =>
  <a className="banner" href="https://www.graphqlconf.org/" target="_blank">

    <style jsx={true}>
      {`
        .banner {
          transform: translateX(-50%);
          background: rgb(244, 244, 244);
          border-radius: 20px;
          padding: 8px 15px;
          display: flex;
          align-items: center;
          position: absolute;
          top: 105px;
          left: 50%;
          color: black;
        }
        .title {
          font-size: 16px;
          margin-left: 8px;
        }
        .bold {
          font-weight: 600;
        }
        .link-arrow-wrapper {
          margin-left: 12px;
        }
      `}
    </style>
    <GraphQLConf />
    <span className="title">
      Tickets are now available for <span className="bold">GraphQL Conf!</span>
    </span>
    <span className="link-arrow-wrapper">
      <LinkArrow />
    </span>
  </a>
