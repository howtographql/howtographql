import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  children?: JSX.Element
  small?: boolean
  active?: boolean
}

const OptionalDottedListItem = ({ children, small, active }: Props) => {
  return (
    <div className={cn('optional-dotted-list-item', { small, active })}>
      <style jsx={true}>{`
        .optional-dotted-list-item::before {
          @p: .bBlack20, .bgWhite, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -9px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        .optional-dotted-list-item.active::before {
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
      `}</style>
      {children}
    </div>
  )
}

export default OptionalDottedListItem
