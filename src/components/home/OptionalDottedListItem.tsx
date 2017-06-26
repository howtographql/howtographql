import * as React from 'react'

interface Props {
  children?: JSX.Element
}

const OptionalDottedListItem = ({ children }: Props) => {
  return (
    <div className="optional-dotted-list-item">
      <style jsx={true}>{`
        .optional-dotted-list-item::before {
          @p: .bBlack20, .bgWhite, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -9px;
          margin-top: 3px;
          width: 8px;
          height: 8px;
        }
        .optional-dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative;
          left: 0px;
        }
        .optional-dotted-list-item :global(a) {
          @p: .darkBlue;
        }
      `}</style>
      {children}
    </div>
  )
}

export default OptionalDottedListItem
