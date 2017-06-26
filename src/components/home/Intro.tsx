import * as React from 'react'
import IntroSteps from './IntroSteps'

export default class Intro extends React.Component<null, null> {
  render() {
    return (
      <section className="intro">
        <style jsx={true}>{`
          .intro {
            @p: .mt96;
          }
          h1 {
            @p: .tc;
            font-size: 54px;
          }
          p {
            @p: .mt25, .mb38, .center, .tc;
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
        `}</style>
        <h1>The fullstack tutorial to learn GraphQL</h1>
        <p>
          All you need to know to use GraphQL, we explain the basics first, then
          build a Hackernews clone either focused on the frontend-side or the
          backend-side.
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
          <div className="btn">Start with Introduction</div>
        </div>
        <IntroSteps />
      </section>
    )
  }
}
