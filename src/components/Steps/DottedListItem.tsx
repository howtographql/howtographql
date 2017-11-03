import * as React from 'react'
import * as cn from 'classnames'
import { connect } from 'react-redux'
import { defaultReaction, QuizReaction, QuizState } from '../../reducers/quiz'
import Checkmark from '../Checkmark'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'

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
  watched,
}: Props & QuizReaction) => {
  const done = skipped || answeredCorrectly || watched
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
        .dotted-list-item:not(.done)::before {
          @p: .bWhite20, .absolute, .bgDarkBlue, .ba, .bw2, .br100, .z2;
          background: rgba(224, 0, 130, 0);
          content: '';
          left: -7px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
          transition: border-color .15s ease-in-out;
        }
        .dotted-list-item {
          transition: color .15s ease-in-out;
        }
        .dotted-list-item:not(.done):hover {
          color: $pink !important;
        }
        .dotted-list-item:not(.done):hover::before {
          border-color: $pink;
          margin-top: -2px !important;
          left: -13px;
          width: 20px;
          height: 20px;
        }
        .play {
          @p: .o0, .absolute, .z3;
          visibility: hidden;
          pointer-events: none;
          transition: opacity .25s ease-in-out;
          left: -5px;
          margin-top: 5px;
        }

        .dotted-list-item:not(.done):hover .play {
          @p: .o100;
          visibility: visible;
          pointer-events: all;
          transition: none;
        }

        div.dotted-list-item:not(.done).first:hover::before {
          margin-top: -4px !important;
        }
        .dotted-list-item:not(.done).first:hover .play {
          margin-top: 3px;
        }

        .dotted-list-item:not(.done).first.small:hover::before {
          margin-top: -4px !important;
        }
        .dotted-list-item:not(.done).first.small:hover .play {
          margin-top: 3px;
        }

        .dotted-list-item:not(.done).last.small:hover::before {
          bottom: -5px;
        }
        .dotted-list-item:not(.done).last.small .play {
          bottom: 2px;
        }

        .checkmark {
          @p: .absolute, .z2;
          left: -11px;
          margin-top: -1px;
        } /* first rules */
        .dotted-list-item.light.first:not(.small)::before,
        .dotted-list-item.active::before {
          border-color: $pink !important;
        }
        .dotted-list-item.light.first::before {
          margin-top: 0 !important;
        }
        .dotted-list-item.light.first.small::before {
          margin-top: 0 !important;
        }
        .dotted-list-item.light.first.small::before {
          margin-top: 14px;
        }
        .dotted-list-item.first {
          padding-top: 0 !important;
        }
        .dotted-list-item.first.light:not(.small) :global(.list-item) {
          @p: .pink;
        }
        .first .checkmark {
          margin-top: -5px;
        }
        .last .checkmark {
          bottom: 0;
        }
        .dotted-list-item.first.light.highlightFirst::after,
        .dotted-list-item.first.light.done::after {
          @p: .db, .absolute;
          content: '';
          height: 38px;
          margin-top: -18px;
          left: -2px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.0),
            $pink
          );
          width: 2px;
        }
        .dotted-list-item.first.highlightFirst.small::after,
        .dotted-list-item.first.done.small::after {
          height: 30px;
          margin-top: -9px;
        }
        /* last rules */
        .dotted-list-item.last::before {
          margin-top: auto;
          bottom: 0;
        }
        .dotted-list-item.last {
          padding-bottom: 0 !important;
        } /* middle rules */
        .dotted-list-item.small::before {
          margin-top: 2px;
        }
        .dotted-list-item.light::before {
          @p: .bgWhite;
        }
        div.dotted-list-item.light::before, .dotted-list-item.light {
          border-color: $gray20;
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
        .dotted-list-item.small.last {
          padding-top: 0;
        }
        .dotted-list-item:not(.light).first {
          padding-top: 18px !important;
        }
        .dotted-list-item.light :global(a) {
          @p: .black80, .relative;
        }
        .dotted-list-item :global(.list-item) {
          @p: .relative;
        }
        .dotted-list-item.first.light:not(.small) :global(.list-item) {
          top: -8px;
        }
        .dotted-list-item.first.light:not(.small).done :global(.list-item) {
          top: -9px;
        }
        .dotted-list-item.small :global(.list-item) {
          top: -4px;
        }
        .dotted-list-item.small.first :global(.list-item) {
          top: -6px;
        }
        .dotted-list-item.small.last :global(.list-item) {
          top: 5px;
        }
        .dotted-list-item.small.last.done :global(.list-item) {
          top: 2px;
        }
        .dotted-list-item:not(.small) :global(.list-item) {
          top: -5px;
        }
        .dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
        .done:not(.active) :global(.title) {
          color: #EB7BBC !important;
        }
        .dotted-list-item:not(.first) .before-glow {
          @p: .db, .absolute;
          height: 100%;
          top: -23px;
          left: -2px;
          background-image: linear-gradient(
            to top,
            $pink 20%,
            rgba(225, 225, 225, 0.0)
          );
          width: 2px;
        }
        .dotted-list-item:not(.first).small .before-glow {
          height: 100%;
          top: -21px;
        }
        .dotted-list-item.last.small .before-glow {
          height: 100%;
          top: -12px;
        }
        .dotted-list-item .after-glow {
          @p: .db, .absolute;
          height: 100%;
          left: -2px;
          top: 33px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.0),
            $pink 80%
          );
          width: 2px;
        }
        div.dotted-list-item:not(.small).first .after-glow {
          @p: .dn;
        }
        .dotted-list-item.small.first .after-glow {
          height: calc(100% - 10px);
          top: 12px;
        }
        .dotted-list-item.small .after-glow {
          height: calc(100% - 10px);
          top: 50%;
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
      {showLine && (done || active) && <div className="before-glow" />}
      {children}
      {showLine && (done || active) && !last && <div className="after-glow" />}
    </div>
  )
}

export default connect(({ quiz }: { quiz: QuizState }, props: Props) => {
  return quiz.quizReactions[props.path] || defaultReaction
})(DottedListItem)
