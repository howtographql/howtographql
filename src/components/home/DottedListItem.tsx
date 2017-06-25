import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  children?: JSX.Element
  light?: boolean
  first?: boolean
}

const DottedListItem = ({ children, light, first }: Props) => {
  return (
    <div className={cn('dotted-list-item', { light, first })}>
      <style jsx={true}>{`
        .dotted-list-item::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -7px;
          top: 20px;
          width: 8px;
          height: 8px;
        }
        .dotted-list-item.first::after {
          @p: .db, .absolute;
          content: '';
          height: 30px;
          left: -2px;
          top: 11px;
          background-image: linear-gradient(
            to top,
            rgba(225, 225, 225, 0.2),
            $pink
          );
          width: 2px;
        }
        .dotted-list-item.first {
          @p: .pt0;
        }
        .dotted-list-item.first::before {
          top: 0;
        }
        .dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative, .bl, .bWhite20, .bw2;
        }
        .dotted-list-item.light::before {
          @p: .bgWhite;
        }
        .dotted-list-item.light::before, .dotted-list-item.light {
          @p: .bBlack20;
        }
        .dotted-list-item.light.first::before {
          border-color: $pink;
        }
        .dotted-list-item.light :global(a) {
          @p: .darkBlue;
        }
        .dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
        .dotted-list-item.first :global(a) {
          @p: .relative, .pink;
          top: -3px;
        }
      `}</style>
      {children}
    </div>
  )
}

export default DottedListItem
