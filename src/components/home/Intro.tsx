import * as React from 'react'
import IntroSteps from './IntroSteps'
import { Step } from '../../types'
import Link from 'gatsby-link'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default class Intro extends React.Component<Props, null> {
  render() {
    return (
      <section className="intro">
        <style jsx={true}>{`

          h1 {
            @p: .tc;
            font-size: 54px;
          }

          p {
            @p: .mt25, .mb10, .center, .tc;
            max-width: 800px;
          }
          .watch-overview {
            @p: .black40,
              .f16,
              .fw6,
              .mt38,
              .ttu,
              .flex,
              .itemsCenter,
              .pointer;
          }
          .watch-overview span {
            @p: .ml16;
          }
          .center-container {
            @p: .flex, .justifyCenter;
          }

          @media (max-width: 500px) {

            .intro {
              padding: 30px 30px 0;
            }

            h1 {
              font-size: 32px;
              text-align: left !important;
            }

            p {
              text-align: left !important;
            }

            .center-container {
              justify-content: flex-start !important;
            }

            .btn {
              font-size: 20px;
            }
          }


        `}</style>
        <h1>The Fullstack Tutorial for GraphQL</h1>
        <p>
          The free and open-source tutorial for you to learn about GraphQL from zero to production. After a basic
          introduction, you’ll build a Hackernews clone with Javascript or any other technology of your choice.
        </p>
        <div className="center-container">
          <div className="watch-overview">
            <img src={require('../../assets/icons/play.svg')} />
            <span>
              Watch Overview
            </span>
          </div>
        </div>
        <div className="center-container">
          <Link to="/tutorials/graphql/basics/0-introduction/">
            <div className="btn">Start with Introduction</div>
          </Link>
        </div>
        <IntroSteps steps={this.props.steps} location={this.props.location} />
      </section>
    )
  }
}
