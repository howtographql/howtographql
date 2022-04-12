import * as React from 'react';
import GraphQLConf from '../assets/icons/GraphQLConf';
import GraphQLWeekly from '../assets/icons/GraphQLWeekly';
import LinkArrow from '../assets/icons/LinkArrow';

interface BannerProps {
  title: React.ReactNode;
  link: string;
  type: 'GRAPHQL_WEEKLY' | 'GRAPHQL_MEETUP';
}
export const Banner = (props: BannerProps) => (
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
          z-index: 100;
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
    <a className="banner" href={props.link} target="_blank">
      {props.type === 'GRAPHQL_WEEKLY' ? (
        <GraphQLWeekly />
      ) : props.type === 'GRAPHQL_MEETUP' ? (
        <GraphQLConf />
      ) : null}
      <span className="title">
        {props.title}
        <span className="link-arrow-wrapper">
          <LinkArrow />
        </span>
      </span>
    </a>
  </div>
);
