import * as React from 'react'
import LeftColumn from './LeftColumn'
import OptionalSteps from '../Steps/OptionalSteps'
import Duration from '../Duration'
import Steps from '../Steps/Steps'
import { Step } from '../../types'
import { getTotalDuration } from '../../utils/getTotalDuration'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default function IntroSteps({ steps, location }: Props) {
  const basicsDuration = getTotalDuration(steps.basics)
  const advancedDuration = getTotalDuration(steps.advanced)
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
        @media (max-width: 500px) {
          .steps-content :global(.steps-description) {
            display: none;
          }
          div.steps-list {
            @p: .w100;
          }
        }
      `}</style>
      <div className="steps-content">
        <LeftColumn className="steps-description" light={true}>
          <div className="basic-graphql">
            <h3>GraphQL Fundamentals</h3>
            <div className="duration">
              <Duration duration={basicsDuration} total={true} />
            </div>
            <p>
              In the first chapter, you’ll learn about
              the core concepts of GraphQL. {' '}
            </p>
          </div>
          <div className="advanced-graphql">
            <h3>Advanced GraphQL (optional)</h3>
            <div className="duration">
              <Duration duration={advancedDuration} total={true} />
            </div>
            <p>
              Read this chapter to get a broader
              understanding of the GraphQL ecosystem.
            </p>
          </div>
        </LeftColumn>
        <div className="steps-list fade-before">
          <Steps
            steps={steps.basics}
            location={location}
            highlightFirst={true}
            showLast={false}
          />
          <OptionalSteps steps={steps.advanced} location={location} />
        </div>
      </div>
    </div>
  )
}
