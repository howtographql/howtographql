import * as React from 'react'
import { Step } from '../../types'
import DottedListItem from './DottedListItem'
import Duration from '../Duration'
import Link from 'gatsby-link'

interface Props {
  steps: Step[]
  small?: boolean
  showDuration?: boolean
}

export default function Steps({ steps, small, showDuration = true }: Props) {
  return (
    <div>
      <style jsx={true}>{`
        .list-item {
          @p: .itemsCenter, .flex;
        }
        :global(.first-duration-up) {
          @p: .relative;
          top: -3px;
        }
      `}</style>
      {steps.map((step, index) =>
        <DottedListItem
          key={step.title}
          light={true}
          first={index === 0}
          small={small}
        >
          <div className="list-item">
            <Link to={step.link}>
              {step.title}
            </Link>
            {showDuration &&
              <Duration
                duration={step.time || 0}
                className={index === 0 ? 'first-duration-up' : ''}
              />}
          </div>
        </DottedListItem>,
      )}
    </div>
  )
}
