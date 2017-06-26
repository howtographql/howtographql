import * as React from 'react'
import LeftColumn from './LeftColumn'
import DottedListItem from './DottedListItem'
import Link from 'gatsby-link'
import * as cn from 'classnames'
import OptionalSteps from './OptionalSteps'

export default function IntroSteps() {
  return (
    <div className="intro-steps">
      <style jsx={true}>{`
        .intro-steps {
          @p: .mt38;
        }
        .steps-content {
          @p: .flex;
        }
        .steps-content :global(.steps-description) h3 {
          @p: .mt0;
        }
        .advanced-graphql {
          margin-top: 76px;
        }
        .steps-list {
          @p: .w50;
        }
        p {
          @p: .black30;
        }
        .list-item {
          @p: .itemsCenter, .flex;
        }
        .time {
          @p: .ttu, .black30, .ml10, .itemsCenter, .flex, .fw6, .relative;
          font-size: 15px;
        }
        .time img {
          width: 15px;
          height: 15px;
        }
        .time span {
          @p: .ml6;
        }
        .time.first {
          top: -3px;
        }
        .steps-content :global(.steps-description) .time {
          @p: .justifyEnd, .pr38, .mt16;
        }
      `}</style>
      <div className="steps-content">
        <LeftColumn className="steps-description" light={true}>
          <div>
            <h3>GraphQL Basics</h3>
            <div className="time">
              <img src={require('../../assets/icons/play.svg')} alt="" />
              <span>12 MIN TOTAL</span>
            </div>
            <p>
              In the first chapter, we’ll learn the core concepts of GraphQL. In
              the first chapter we’ll learn the core concepts of GraphQL.{' '}
            </p>
          </div>
          <div className="advanced-graphql">
            <h3>Advanced GraphQL (optional)</h3>
            <div className="time">
              <img src={require('../../assets/icons/play.svg')} alt="" />
              <span>19 MIN TOTAL</span>
            </div>
            <p>
              This chapter is optional, but a good
              foundation for a true understanding
              of GraphQL
            </p>
          </div>
        </LeftColumn>
        <div className="steps-list fade-before">
          {steps.map((step, index) =>
            <DottedListItem key={step.title} light={true} first={index === 0}>
              <div className="list-item">
                <Link to={step.link}>
                  {step.title}
                </Link>
                <div className={cn('time', { first: index === 0 })}>
                  <img src={require('../../assets/icons/play.svg')} alt="" />
                  <span>
                    {step.time} MIN
                  </span>
                </div>
              </div>
            </DottedListItem>,
          )}
          <OptionalSteps steps={optionalSteps} />
        </div>
      </div>
    </div>
  )
}

const steps = [
  {
    link: '/',
    time: 1.5,
    title: 'Introduction',
  },
  {
    link: '/',
    time: 3,
    title: 'Big Picture (Architecture)',
  },
  {
    link: '/',
    time: 3,
    title: 'GraphQL concepts',
  },
]

const optionalSteps = [
  {
    link: '/',
    time: 3,
    title: 'Clients',
  },
  {
    link: '/',
    time: 4,
    title: 'Server',
  },
  {
    link: '/',
    time: 20,
    title: 'Tooling and Ecosystem',
  },
  {
    link: '/',
    time: 1,
    title: 'More GraphQL Concepts',
  },
  {
    link: '/',
    time: 1,
    title: 'Common Questions',
  },
]
