import * as React from 'react'
import IntroSteps from './IntroSteps'

export default class Intro extends React.Component<null, null> {
  render() {
    return (
      <div className="intro">
        <style jsx={true}>{`
          .intro {
            @p: .mt96;
          }
          h1 {
            @p: .tc;
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
          .btn {
            @p: .bgPink, .white, .f25, .fw6, .mt38, .dib, .lhTitle;
            padding: 17px 30px 19px;
            border-radius: 6px;
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
      </div>
    )
  }
}
