import * as React from 'react'
import { Step } from '../../types'
import Steps from '../Steps/Steps'

interface StackProps {
  name: string
  steps: Step[]
  location: any
  showLines?: boolean
}

export default function Stack({
  name,
  steps,
  location,
  showLines = true,
}: StackProps) {
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
