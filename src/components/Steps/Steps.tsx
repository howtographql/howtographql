import * as React from 'react'
import { Step } from '../../types'
import DottedListItem from './DottedListItem'
import Duration from '../Duration'
import Link from 'gatsby-link'
import * as cn from 'classnames'

interface Props {
  steps: Step[]
  small?: boolean
  showDuration?: boolean
  location: any
  highlightFirst?: boolean
  showLines?: boolean
}

export default function Steps({
  steps,
  small,
  showDuration = true,
  location,
  highlightFirst = false,
  showLines = true,
}: Props) {
  return (
    <div>
      {steps.map((step, index) =>
        <DottedListItem
          key={step.title}
          light={true}
          first={index === 0}
          last={index === steps.length - 1}
          small={small}
          active={step.link === location.pathname}
          highlightFirst={highlightFirst}
          showLine={showLines}
          path={step.link}
        >
          <style jsx={true}>{`
            .list-item {
              @p: .itemsCenter, .flex;
            }
            :global(.first-duration-up) {
              @p: .relative;
              top: -3px;
            }
            .active :global(a) {
              color: $pink !important;
            }
          `}</style>
          <div
            className={cn('list-item', {
              active: step.link === location.pathname,
            })}
          >
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
