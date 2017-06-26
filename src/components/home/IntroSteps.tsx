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
        .steps-content :global(.steps-description) {
          margin-top: 48px;
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
      `}</style>
      <div className="steps-content">
        <LeftColumn className="steps-description" light={true}>
          <h3>GraphQL Basics</h3>
          <p>
            In the first chapter, we’ll learn the core concepts of GraphQL. In
            the first chapter we’ll learn the core concepts of GraphQL.{' '}
          </p>
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
