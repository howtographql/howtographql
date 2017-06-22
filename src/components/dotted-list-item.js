import React from 'react'

const DottedListItem = ({ children }) => {
  return (
    <div className="dotted-list-item">
      <style jsx={true}>{`
        div.dotted-list-item::before {
          @p: .bWhite20, .bgDarkBlue, .absolute, .ba, .bw2;
          content: '';
          left: -7px;
          top: 20px;
          border-radius: 50%;
          width: 8px;
          height: 8px;
        }
        div.dotted-list-item {
          @p: .pv16, .f20, .pl38, .relative, .bl, .bWhite20, .bw2;
        }
        div.dotted-list-item :global(a) {
          @p: .white, .noUnderline;
        }
      `}</style>
      {children}
    </div>
  )
};

export default DottedListItem;
