import * as React from 'react'
import DottedListItem from './DottedListItem'
import { Step } from '../../types'
import Duration from '../Duration'
import Link from 'gatsby-link'
import * as cn from 'classnames'

interface Props {
  step: Step
  index?: number
  small?: boolean
  active?: boolean
  location: any
  showDuration?: boolean
}

export default function Step({
  step,
  index,
  small,
  location,
  showDuration,
}: Props) {
  return (
    <DottedListItem
      key={step.title}
      light={true}
      first={index === 0}
      small={small}
      active={step.link === location.pathname}
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
    </DottedListItem>
  )
}
