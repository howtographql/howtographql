import * as React from 'react'
import * as cn from 'classnames'
import { defaultReaction, QuizReaction, QuizState } from '../../reducers/quiz'
import { connect } from 'react-redux'
import Checkmark from '../Checkmark'

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
          margin-top: 3px;
          width: 8px;

          height: 8px;
        }
        div.optional-dotted-list-item.active::before {
          border-color: $pink;
        }
        .optional-dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative;
          left: 0px;
        }
        .optional-dotted-list-item.small {
          @p: .pv12;
          padding-left: 20px;
        }
        .optional-dotted-list-item.small :global(a) {
          @p: .black80, .f16;
        }
        .optional-dotted-list-item :global(a) {
          @p: .black80;
        }
        div.optional-dotted-list-item.active :global(a) {
          @p: .pink;
        }
        .optional-dotted-list-item.small::before {
          margin-top: 3px;
        }
        .done:not(.active) :global(a) {
          color: $pink40 !important;
        }
        .checkmark {
          @p: .absolute, .z2;
          left: -13px;
          margin-top: -1px;
        }
      `}</style>
      {done &&
        <div className="checkmark">
          <Checkmark checked={true} />
        </div>}
      {children}
    </div>
  )
}

export default connect((state: QuizState, props: Props) => {
  return state.quizReactions[props.path] || defaultReaction
})(OptionalDottedListItem)
