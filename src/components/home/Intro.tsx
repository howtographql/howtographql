import * as React from 'react'
import IntroSteps from './IntroSteps'
import { Step } from '../../types'
import Link from 'gatsby-link'
import { connect } from 'react-redux'
import { setOverviewVideoVisible } from '../../actions/ui'
import Particles from 'react-particles-js'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
  setOverviewVideoVisible: (visible: boolean) => void
}

class Intro extends React.Component<Props, null> {
  render() {
    return (
      <section className="intro">
        <div className="particles">
          <Particles
            width={`${window && window.innerWidth || 1000}`}
            params={
              {
                particles: {
                  number: {value: 20, density: {enable: !0, value_area: 800}},
                  color: {value: "#ffc0e5"},
                  shape: {
                    type: "circle",
                    stroke: {width: 4, color: "#fdd7ed"},
                    polygon: {nb_sides: 5}
                  },
                  opacity: {value: .2, random: !1, anim: {enable: !1, speed: 1, opacity_min: .6, sync: !1}},
                  size: {value: 1, random: !0, anim: {enable: !1, speed: 40, size_min: .1, sync: !1}},
                  line_linked: {enable: !0, distance: 150, color: "#ffc0e5", opacity: .15, width: 1},
                  move: {
                    enable: !0,
                    speed: 1,
                    direction: "none",
                    random: !1,
                    straight: !1,
                    out_mode: "out",
                    attract: {enable: !1, rotateX: 600, rotateY: 1200}
                  }
                },
                interactivity: {
                  detect_on: "canvas",
                  events: {onhover: {enable: !1, mode: "repulse"}, onclick: {enable: !0, mode: "push"}, resize: !0},
                  modes: {
                    grab: {distance: 400, line_linked: {opacity: 1}},
                    bubble: {distance: 400, size: 40, duration: 2, opacity: 8, speed: 3},
                    repulse: {distance: 200},
                    push: {particles_nb: 4},
                    remove: {particles_nb: 2}
                  }
                },
              } as any
            }
          />
        </div>
        <style jsx={true}>{`
          .rest {
            @p: .relative, .z2;
          }
          section {
            @p: .relative;
          }
          h1 {
            @p: .tc;
            font-size: 54px;
          }
          p {
            @p: .mt25, .center, .tc;
            max-width: 800px;
          }
          .watch-overview {
            @p: .black40, .f16, .fw6, .mt25, .pa16, .ttu, .flex, .itemsCenter, .pointer;
            transition: color .15s ease-in-out;
          }
          .watch-overview:hover {
            @p: .black60;
          }
          .watch-overview img {
            transition: filter .15s ease-in-out;
          }
          .watch-overview :global(svg) > :global(g) {
            transition: opacity .15s ease-in-out;
          }
          .watch-overview:hover :global(svg) > :global(g) {
            opacity: 0.6;
          }
          .watch-overview span {
            @p: .ml16;
          }
          .center-container {
            @p: .flex, .justifyCenter;
          }
          .particles {
            @p: .absolute, .left0, .top0, .right0, .bottom0, .flex;
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
          .btn-container {
            @p: .mt25;
          }
        `}</style>
        <div className="rest">
          <h1>The Fullstack Tutorial for GraphQL</h1>
          <p>
            The free and open-source tutorial for you to learn about GraphQL from
            zero to production. After a basic
            introduction, you’ll build a Hackernews clone with Javascript or any
            other technology of your choice.
          </p>
          <div className="center-container">
            <div
              className="watch-overview"
              onClick={this.props.setOverviewVideoVisible.bind(null, true)}
            >
              <Icon src={require('../../assets/icons/play.svg')} color={'black'} width={37} height={37} />
              <span>
                Watch Overview
              </span>
            </div>
          </div>
          <div className="center-container btn-container">
            <Link to="/basics/0-introduction/">
              <div className="btn">Start with Introduction</div>
            </Link>
          </div>
          <IntroSteps steps={this.props.steps} location={this.props.location}/>
        </div>
      </section>
    )
  }
}

export default connect(null, {setOverviewVideoVisible})(Intro)
