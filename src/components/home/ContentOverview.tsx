import * as React from 'react'
import { Step } from '../../types'
import {
  getBackendTutorials,
  getFrontendTutorials,
} from '../../utils/tutorials'
import Stack from '../Steps/Stack'

interface Props {
  location: any
  steps: { [key: string]: Step[] }
}

export default function ContentOverview({ location, steps }: Props) {
  const frontendTutorials = getFrontendTutorials(steps)
  const backendTutorials = getBackendTutorials(steps)
  return (
    <section>
      <style jsx={true}>{`
        section {
          @p: .pt0;
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
        @media (max-width: 500px) {
          section {
            display: none;
          }
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
