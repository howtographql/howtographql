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
}

export default function Steps({
  steps,
  small,
  showDuration = true,
  location,
}: Props) {
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
        .active :global(a) {
          @p: .pink;
        }
      `}</style>
      {steps.map((step, index) =>
        <DottedListItem
          key={step.title}
          light={true}
          first={index === 0}
          small={small}
          active={step.link === location.pathname}
        >
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
