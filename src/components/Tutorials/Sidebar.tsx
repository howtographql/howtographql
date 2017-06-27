import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import OptionalSteps from '../Steps/OptionalSteps'
import Steps from '../Steps/Steps'
import ChooseTutorialStep from '../Steps/ChooseTutorialStep'
import Theory from '../Steps/Theory'
import { extractGroup } from '../../utils/graphql'

interface Props {
  steps: { [key: string]: Step[] }
  post?: MarkdownRemark
  location: any
}

export default function Sidebar({ steps, post, location }: Props) {
  const group = post ? extractGroup(post.fields.slug) : 'basics'
  const selectedSteps = steps[group]

  return (
    <div className="sidebar">
      <style jsx={true}>{`
        .sidebar {
          @p: .bgBlack04, .flexFixed, .pt25, .bbox, .overflowAuto;
          padding-left: 21px;
          max-height: calc(100vh - 72px);
          width: 300px;
        }
        .sidebar :global(.plus) {
          background-color: #f5f5f5;
        }
        .sidebar :global(.dotted-list-item.first.light::after) {
          @p: .dn;
        }
      `}</style>
      <div className="steps-list fade-before">
        <Theory />
        <Steps
          steps={steps.basics}
          small={true}
          showDuration={false}
          location={location}
        />
        <OptionalSteps
          steps={steps.advanced}
          small={true}
          showDuration={false}
        />
        {['basics', 'advanced'].includes(group)
          ? <ChooseTutorialStep />
          : <Steps
              steps={selectedSteps}
              small={true}
              showDuration={false}
              location={location}
            />}
      </div>
    </div>
  )
}
