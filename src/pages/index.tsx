import * as React from 'react';
import Chooser from '../components/home/Chooser';
import Intro from '../components/home/Intro';
import App from '../components/App';
import { extractSteps } from '../utils/graphql';
import WhatWeBuild from '../components/home/WhatWeBuild';
// import LandingPlayground from '../components/home/LandingPlayground'
import Team from '../components/home/Team';
import ContentOverview from '../components/home/ContentOverview';
import Footer from '../components/home/Footer';
import { MarkdownRemark, RelayConnection } from '../types';
import CustomHelmet from '../components/CustomHelmet';
import { Banner } from '../components/Banner';

interface Props {
  data: {
    mds: RelayConnection<MarkdownRemark>;
  };
  location: any;
  history: any;
}

export default (props: Props) => {
  const steps = extractSteps(props.data.mds);
  const title = 'How to GraphQL - The Fullstack Tutorial for GraphQL';
  const overrideDescription =
    'Fullstack GraphQL Tutorial to go from zero to production covering all basics and advanced concepts. Includes tutorials for Apollo, Relay, React and NodeJS.';
  const description =
    'Fullstack GraphQL Tutorial to go from zero to production covering all basics and advanced concepts.';
  return (
    <App history={props.history} steps={steps} location={props.location}>
      <CustomHelmet
        title={title}
        description={description}
        overrideDescription={overrideDescription}
        location={props.location}
      />
      <Banner
        type="GRAPHQL_MEETUP"
        title={
          <span>
            Join us for <span className="bold">GraphQL Berlin Meetup #24</span>{' '}
            on November 16, 2021
          </span>
        }
        link="https://www.meetup.com/en-AU/graphql-berlin/events/281735333/"
      />
      <Intro steps={steps} location={props.location} />
      <Chooser mds={steps} location={props.location} history={props.history} />
      <WhatWeBuild />
      {/*  The Playground is based on Graphcool and therefore (temporarily) removed */}
      {/*  <LandingPlayground /> */}
      <Team />
      <ContentOverview location={props.location} steps={steps} />
      <Footer />
    </App>
  );
};

export const pageQuery = graphql`
  query markdowns {
    mds: allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            duration
            videoId
          }
          fields {
            slug
          }
        }
      }
    }
  }
`;
