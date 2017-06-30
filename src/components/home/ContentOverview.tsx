import * as React from 'react'
import { Step } from '../../types'
import Steps from '../Steps/Steps'
import data from '../../data/stacks'

interface Props {
  location: any
  steps: { [key: string]: Step[] }
}

export default function ContentOverview({ location, steps }: Props) {
  const frontendTutorials = data
    .filter(t => t.type === 'frontend')
    .map(stack => {
      const tutorialSteps = steps[stack.key]
      return {
        ...tutorialSteps[0],
        title: stack.title,
      }
    })
  const backendTutorials = data.filter(t => t.type === 'backend').map(stack => {
    const tutorialSteps = steps[stack.key]
    return {
      ...tutorialSteps[0],
      title: stack.title,
    }
  })
  return (
    <section>
      <style jsx={true}>{`
        section {
          background-color: #fafafa;
        }
        .content-overview {
          @p: .center;
          max-width: 1280px;
        }
        p {
          @p: .tc, .mt38;
        }
        .bordered {
          @p: .bb, .bt, .bBlack10, .bw2, .flex, .mt60;
        }
        .overview {
          @p: .flex;
        }
        .block {
          @p: .pa38;
        }
        .left {
          @p: .bBlack10, .br, .bw2, .flexFixed;
        }
        .right {
          @p: .flexAuto, .flex;
        }
        .advanced {
          @p: .mt38, .pt10;
        }
        .all-tutorials {
          @p: .ml38;
        }
        .all-tutorials :global(.stack) + :global(.stack) {
          @p: .mt38, .pt10;
          margin-left: 0 !important;
        }
      `}</style>
      <div className="content-overview">
        <h2>Content Overview</h2>
        <p>
          All tutorials are structured to make it as accessible as possible.{' '}
        </p>
      </div>
      <div className="bordered">
        <div className="content-overview">
          <div className="overview">
            <div className="block left">
              <Stack
                name="GraphQL Theory"
                steps={steps.basics}
                location={location}
              />
              <div className="advanced">
                <Stack
                  name="Advanced GraphQL"
                  steps={steps.advanced}
                  location={location}
                />
              </div>
            </div>
            <div className="block right">
              <Stack
                name="React + Apollo"
                steps={steps['react-apollo']}
                location={location}
              />
              <Stack
                name="React + Relay"
                steps={steps['react-relay']}
                location={location}
              />
              <Stack
                name="NodeJS"
                steps={steps['graphql-js']}
                location={location}
              />
              <div className="all-tutorials">
                <Stack
                  name="All Frontend Tutorials"
                  steps={frontendTutorials}
                  location={location}
                  showLines={false}
                />
                <Stack
                  name="All Backend Tutorials"
                  steps={backendTutorials}
                  location={location}
                  showLines={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface StackProps {
  name: string
  steps: Step[]
  location: any
  showLines?: boolean
}

function Stack({ name, steps, location, showLines = true }: StackProps) {
  return (
    <div className="stack">
      <style jsx={true}>{`
        .stack {
          max-width: 200px;
        }
        .stack + .stack {
          @p: .ml38;
        }
        h3 {
          @p: .f14, .fw6, .black30, .ttu, .tracked, .nowrap, .relative;
          left: -4px;
          margin-bottom: 32px;
        }
      `}</style>
      <h3>{name}</h3>
      <Steps
        steps={steps}
        small={true}
        location={location}
        showDuration={false}
        showLines={showLines}
      />
    </div>
  )
}
