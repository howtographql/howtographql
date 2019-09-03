import * as React from 'react'
import GraphQLConf from '../assets/icons/GraphQLConf'
import LinkArrow from '../assets/icons/LinkArrow'

export const Banner = () =>
  <div className="banner-container">
    <style jsx={true}>
      {`
        .banner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 38px 60px 0;
          margin-bottom: -75px;
        }
        @media (max-width: 500px) {
          .banner-container {
            padding: 20px 30px 0;
            margin-bottom: -10px;
          }
        }
        .banner {
          background: rgb(244, 244, 244);
          border-radius: 20px;
          padding: 8px 15px;
          display: flex;
          align-items: center;
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
    <a className="banner" href="https://www.graphqlconf.org/" target="_blank">
      <GraphQLConf />
      <span className="title">
        Tickets are now available for <span className="bold">GraphQL Conf!</span>
      </span>
      <span className="link-arrow-wrapper">
        <LinkArrow />
      </span>
    </a>
  </div>
