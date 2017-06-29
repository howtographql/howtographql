import * as React from 'react'
import * as cn from 'classnames'

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
}: Props) => {
  return (
    <div
      className={cn('dotted-list-item', {
        active,
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
        .dotted-list-item::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -7px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        .dotted-list-item.small::before {
          margin-top: 2px;
        }
        .dotted-list-item.light::before {
          @p: .bgWhite;
        }
        .dotted-list-item.light::before, .dotted-list-item.light {
          @p: .bBlack20;
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
        } /* end ::before rules */
        .dotted-list-item.last::before {
          margin-top: auto;
          bottom: 0;
        }
        .dotted-list-item.first.light.highlightFirst::after {
          @p: .db, .absolute;
          content: '';
          height: 30px;
          left: -2px;
          margin-top: -8px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.2),
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
      `}</style>
      {children}
    </div>
  )
}

export default DottedListItem
