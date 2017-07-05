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
  showLast?: boolean
  onClickLink?: () => void
  stepsActive?: boolean
}

export default function Steps({
  steps,
  small,
  showDuration = true,
  location,
  highlightFirst = false,
  showLines = true,
  showLast = true,
  stepsActive = false,
  onClickLink,
}: Props) {
  return (
    <div>
      {steps.map((step, index) =>
        <DottedListItem
          key={step.title}
          light={true}
          first={index === 0}
          last={showLast ? index === steps.length - 1 : false}
          small={small}
          active={step.link === location.pathname || stepsActive}
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
            <Link to={step.link} onClick={onClickLink}>
              {step.title}
            </Link>
            {showDuration &&
              step.duration &&
              <Duration duration={step.duration || 0} link={step.link} />}
          </div>
        </DottedListItem>,
      )}
    </div>
  )
}
