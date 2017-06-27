import * as React from 'react'
import { Step } from '../../types'
import StepComponent from './Step'

interface Props {
  steps: Step[]
  small?: boolean
  showDuration?: boolean
  location: any
}

export default function Steps({
  steps,
  small,
  showDuration = true,
  location,
}: Props) {
  return (
    <div>
      {steps.map((step, index) =>
        <StepComponent
          step={step}
          index={index}
          small={small}
          showDuration={showDuration}
          location={location}
        />,
      )}
    </div>
  )
}
