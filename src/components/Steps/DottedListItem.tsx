import * as React from 'react'
import * as cn from 'classnames'
import { connect } from 'react-redux'
import { defaultReaction, QuizReaction, QuizState } from '../../reducers/quiz'
import Checkmark from '../Checkmark'

interface Props {
  children?: JSX.Element
  light?: boolean
  first?: boolean
  last?: boolean
  small?: boolean
  active?: boolean
  done?: boolean
  highlightFirst?: boolean
  showLine?: boolean
  path: string
}

const DottedListItem = ({
  children,
  light,
  first,
  small,
  active,
  highlightFirst,
  showLine = true,
  last,
  skipped,
  answeredCorrectly,
}: Props & QuizReaction) => {
  const done = skipped || answeredCorrectly
  return (
    <div
      className={cn('dotted-list-item', {
        active,
        done,
        first,
        highlightFirst,
        last,
        light,
        showLine,
        small,
      })}
    >
      <style jsx={true}>{`
        /* ::before rules */
        .dotted-list-item:not(.done)::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2, .br100, .z2;
          content: '';
          left: -7px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        .checkmark {
          @p: .absolute, .z2;
          left: -11px;
          margin-top: -1px;
        }
        .first .checkmark {
          margin-top: -5px;
        }
        .dotted-list-item.small::before {
          margin-top: 2px;
        }
        .dotted-list-item.light::before {
          @p: .bgWhite;
        }
        div.dotted-list-item.light::before, .dotted-list-item.light {
          border-color: $gray20;
        }
        .dotted-list-item.light.first:not(.small)::before,
        .dotted-list-item.active::before {
          border-color: $pink !important;
        }
        .dotted-list-item.light.first.small::before {
          margin-top: 0 !important;
        }
        .dotted-list-item.light.first.small::before {
          margin-top: 14px;
        }
        /* end ::before rules */
        .dotted-list-item.last::before {
          margin-top: auto;
          bottom: 0;
        }
        .dotted-list-item.first.light.highlightFirst::after,
        .dotted-list-item.first.light.done::after {
          @p: .db, .absolute;
          content: '';
          height: 30px;
          left: -2px;
          margin-top: -8px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.0),
            $pink
          );
          width: 2px;
        }
        .dotted-list-item:not(.first) .before-glow {
          @p: .db, .absolute;
          height: 30px;
          left: -2px;
          top: -7px;
          background-image: linear-gradient(
            to top,
            $pink,
            rgba(225, 225, 225, 0.0)
          );
          width: 2px;
        }
        .dotted-list-item:not(.first) .after-glow {
          @p: .db, .absolute;
          height: 30px;
          left: -2px;
          margin-top: -3px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.0),
            $pink
          );
          width: 2px;
        }
        .dotted-list-item.first {
          padding-top: 0 !important;
        }
        .dotted-list-item.last {
          padding-bottom: 0 !important;
        }
        .dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative, .bWhite20;
        }
        .dotted-list-item.showLine {
          @p: .bl, .bw2;
        }
        .dotted-list-item.small {
          @p: .f16, .pv12, .pl25;
        }
        .dotted-list-item:not(.light).first {
          padding-top: 60px !important;
        }
        .dotted-list-item.light :global(a) {
          @p: .black80;
        }
        .dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
        .dotted-list-item.first.light :global(a) {
          @p: .relative;
          top: -3px;
        }
        .dotted-list-item.first.light:not(.small) :global(a) {
          @p: .pink;
        }
        .done:not(.active) :global(a) {
          color: $pink40 !important;
        }
      `}</style>
      {done &&
        <div className="checkmark">
          <Checkmark checked={true} />
        </div>}
      {(done || active) && <div className="before-glow" />}
      {children}
      {(done || active) && !last && <div className="after-glow" />}
    </div>
  )
}

export default connect((state: QuizState, props: Props) => {
  return state.quizReactions[props.path] || defaultReaction
})(DottedListItem)
