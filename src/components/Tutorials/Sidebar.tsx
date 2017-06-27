import * as React from 'react'
import { Step } from '../../types'
import OptionalSteps from '../Steps/OptionalSteps'
import Steps from '../Steps/Steps'
import ChooseTutorialStep from '../Steps/ChooseTutorialStep'

interface Props {
  steps: { [key: string]: Step[] }
  tutorialName: string
}

export default function Sidebar({ steps, tutorialName }: Props) {
  // const selectedSteps = steps[tutorialName]
  return (
    <div className="sidebar">
      <style jsx={true}>{`
        .sidebar {
          @p: .bgBlack04, .flexFixed, .pa16, .bbox, .overflowAuto;
          max-height: calc(100vh - 72px);
          width: 300px;
        }
        .sidebar :global(.plus) {
          background-color: #f5f5f5;
        }
      `}</style>
      <div className="steps-list fade-before">
        <Steps steps={steps.basics} small={true} showDuration={false} />
        <OptionalSteps
          steps={steps.advanced}
          small={true}
          showDuration={false}
        />
        <ChooseTutorialStep />
      </div>
    </div>
  )
}
// <Steps steps={selectedSteps} small={true} showDuration={false} />
