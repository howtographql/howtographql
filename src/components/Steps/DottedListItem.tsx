import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  children?: JSX.Element
  light?: boolean
  first?: boolean
  small?: boolean
  active?: boolean
  done?: boolean
}

const DottedListItem = ({ children, light, first, small }: Props) => {
  return (
    <div className={cn('dotted-list-item', { light, first, small })}>
      <style jsx={true}>{`
        .dotted-list-item::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -7px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        .dotted-list-item.first.light::after {
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
        .dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative, .bl, .bWhite20, .bw2;
        }
        .dotted-list-item.small {
          @p: .f16, .pv12;
          padding-left: 20px;
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
        .dotted-list-item.light.first::before {
          border-color: $pink;
          margin-top: 0 !important;
        }
        .dotted-list-item.light.first.small::before {
          margin-top: 14px;
        }
        .dotted-list-item:not(.light).first {
          @p: .pt60;
        }
        .dotted-list-item.light :global(a) {
          @p: .black80;
        }
        .dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
        .dotted-list-item.first.light :global(a) {
          @p: .relative, .pink;
          top: -3px;
        }
      `}</style>
      {children}
    </div>
  )
}

export default DottedListItem
