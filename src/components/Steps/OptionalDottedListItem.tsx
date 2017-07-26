import * as React from 'react'
import * as cn from 'classnames'
import { defaultReaction, QuizReaction, QuizState } from '../../reducers/quiz'
import { connect } from 'react-redux'
import Checkmark from '../Checkmark'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'

interface Props {
  children?: JSX.Element
  small?: boolean
  active?: boolean
  path: string
}

const OptionalDottedListItem = ({
  children,
  small,
  active,
  skipped,
  answeredCorrectly,
}: Props & QuizReaction) => {
  const done = skipped || answeredCorrectly
  return (
    <div className={cn('optional-dotted-list-item', { small, active, done })}>
      <style jsx={true}>{`
        .optional-dotted-list-item:not(.done)::before {
          @p: .bBlack20, .bgWhite, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -9px;
          margin-top: 9px;
          width: 8px;
          height: 8px;
          transition: border-color .15s ease-in-out;
        }
        div.optional-dotted-list-item.active::before {
          border-color: $pink;
        }
        .optional-dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative;
          left: 0px;
          transition: color .15s ease-in-out;
        }
        .optional-dotted-list-item.small {
          @p: .pv12;
          padding-left: 20px;
        }
        .optional-dotted-list-item.small :global(span) {
          @p: .black80, .f16;
        }
        .optional-dotted-list-item.small :global(.list-item) {
          @p: .relative;
          top: -3px;
        }
        .optional-dotted-list-item :global(span) {
          @p: .black80;
        }
        div.optional-dotted-list-item.active :global(span) {
          @p: .pink;
        }
        div.optional-dotted-list-item.small::before {
          margin-top: 3px;
        }
        .done:not(.active) :global(span) {
          color: $pink40 !important;
        }
        .checkmark {
          @p: .absolute, .z2;
          left: -13px;
          margin-top: -1px;
        }
        .optional-dotted-list-item:not(.small) .checkmark {
          margin-top: 4px;
        }

        /* :hover */
        .optional-dotted-list-item:not(.done):hover::before {
          border-color: $pink;
          margin-top: 4px !important;
          left: -13px;
          width: 20px;
          height: 20px;
        }
        .optional-dotted-list-item.small:not(.done):hover::before {
          border-color: $pink;
          margin-top: -2px !important;
          left: -13px;
          width: 20px;
          height: 20px;
        }
        .optional-dotted-list-item :global(span) {
          transition: color .15s ease-in-out;
        }
        .optional-dotted-list-item:hover :global(span) {
          color: $pink !important;
        }
        .small .play {
          margin-top: 5px;
        }
        .play {
          @p: .o0, .absolute, .z3;
          visibility: hidden;
          pointer-events: none;
          transition: opacity .25s ease-in-out;
          left: -5px;
          margin-top: 11px;
        }

        .optional-dotted-list-item:not(.done):hover .play {
          @p: .o100;
          visibility: visible;
          pointer-events: all;
          transition: none;
        }
      `}</style>
      <div className="play">
        <Icon
          src={require('../../assets/icons/video.svg')}
          width={10}
          height={10}
          color={$v.pink}
        />
      </div>
      {done &&
        <div className="checkmark">
          <Checkmark checked={true} />
        </div>}
      {children}
    </div>
  )
}

export default connect(({ quiz }: { quiz: QuizState }, props: Props) => {
  return quiz.quizReactions[props.path] || defaultReaction
})(OptionalDottedListItem)
