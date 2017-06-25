import * as React from 'react'
import { Step } from '../../types'
import Link from 'gatsby-link'

interface Props {
  steps: { [key: string]: Step[] }
  tutorialName: string
}

export default function Sidebar({ steps, tutorialName }: Props) {
  const selectedSteps = steps[tutorialName]
  return (
    <div className="sidebar">
      <style jsx={true}>{`
        .sidebar {
          @p: .bgBlack04, .flexFixed, .pa16, .bbox;
          max-height: calc(100vh - 72px);
          width: 300px;
        }
        .sidebar :global(a) {
          @p: .mt16, .db;
        }
      `}</style>
      {selectedSteps.map(step => <Link to={step.link}>{step.title}</Link>)}
    </div>
  )
}
