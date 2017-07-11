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
  pinkBorder?: boolean
  dark?: boolean
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
  pinkBorder = false,
  dark = false,
}: Props) {
  return (
    <div className={cn('steps', { pinkBorder })}>
      <style jsx={true}>{`
        .steps.pinkBorder :global(.dotted-list-item) {
          border-left-color: $pink;
        }
        .list-item {
          @p: .itemsCenter, .flex;
        }
        :global(.first-duration-up) {
          @p: .relative;
          top: -3px;
        }
        div :global(a) {
          @p: .black80, .db, .relative, .z2;
        }
        .active :global(.title) {
          color: $pink !important;
        }
      `}</style>
      {steps.map((step, index) =>
        <Link to={step.link} onClick={onClickLink}>
          <DottedListItem
            key={step.title}
            light={!dark}
            first={index === 0 && steps.length > 1}
            last={showLast ? index === steps.length - 1 : false}
            small={small}
            active={step.link === location.pathname || stepsActive}
            highlightFirst={highlightFirst}
            showLine={showLines}
            path={step.link}
          >
            <div
              className={cn('list-item', {
                active: step.link === location.pathname,
              })}
            >
              <span className="title">
                {step.title}
              </span>
              {showDuration &&
                step.duration &&
                <Duration duration={step.duration || 0} link={step.link} dark={dark} />}
            </div>
          </DottedListItem>
        </Link>,
      )}
    </div>
  )
}
