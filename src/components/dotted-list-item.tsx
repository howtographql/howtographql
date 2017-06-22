import * as React from 'react'

interface Props {
  children?: JSX.Element
}

const DottedListItem = ({ children }: Props) => {
  return (
    <div className="dotted-list-item">
      <style jsx={true}>{`
        .dotted-list-item::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2, .br100;
          content: '';
          left: -7px;
          top: 20px;
          width: 8px;
          height: 8px;
        }
        .dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative, .bl, .bWhite20, .bw2;
        }
        .dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
      `}</style>
      {children}
    </div>
  )
};

export default DottedListItem;
