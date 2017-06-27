import * as React from 'react'
import LeftColumn from './LeftColumn'
import OptionalSteps from '../Steps/OptionalSteps'
import Duration from '../Duration'
import Steps from '../Steps/Steps'
import { Step } from '../../types'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default function IntroSteps({ steps, location }: Props) {
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
        .basic-graphql {
          @p: .relative;
          top: -3px;
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
        .steps-content :global(.steps-description) .time {
          @p: .justifyEnd, .pr38, .mt16;
        }
        .duration {
          @p: .mt16, .mr38, .flex, .justifyEnd;
        }
      `}</style>
      <div className="steps-content">
        <LeftColumn className="steps-description" light={true}>
          <div className="basic-graphql">
            <h3>GraphQL Basics</h3>
            <div className="duration">
              <Duration duration={12} total={true} />
            </div>
            <p>
              In the first chapter, we’ll learn the core concepts of GraphQL. In
              the first chapter we’ll learn the core concepts of GraphQL.{' '}
            </p>
          </div>
          <div className="advanced-graphql">
            <h3>Advanced GraphQL (optional)</h3>
            <div className="duration">
              <Duration duration={19} total={true} />
            </div>
            <p>
              This chapter is optional, but a good
              foundation for a true understanding
              of GraphQL
            </p>
          </div>
        </LeftColumn>
        <div className="steps-list fade-before">
          <Steps steps={steps.basics} location={location} />
          <OptionalSteps steps={steps.advanced} location={location} />
        </div>
      </div>
    </div>
  )
}
