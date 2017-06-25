import * as React from 'react'
import * as classNames from 'classnames'

interface Props {
  children?: JSX.Element | JSX.Element[]
  className?: string
  light?: boolean
}

const LeftColumn = ({ children, className, light }: Props) => {
  return (
    <div className={classNames('left-column', className, { light })}>
      <style jsx={true}>{`
        .left-column {
          @p: .w50, .tr, .white50, .flex, .itemsEnd, .flexColumn;
        }
        .left-column.light {
          @p: .black30;
        }
        .left-column :global(h3) {
          @p: .f20, .mt16, .pr38;
        }
        .left-column :global(p) {
          @p: .f16, .mt16, .lhCopy, .pr38;
          max-width: 320px;
        }
      `}</style>
      {children}
    </div>
  )
}

export default LeftColumn
