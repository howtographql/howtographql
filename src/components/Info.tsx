import * as React from 'react'
import { ReactNode } from 'react'

interface Props {
  children?: JSX.Element
  customTip?: ReactNode
}

const Info = (props: Props) => {
  return (
    <div className="info">
      <style jsx={true}>{`
        .question-mark {
          @p: .bgBlack10,
            .flex,
            .justifyCenter,
            .itemsCenter,
            .black40,
            .f12,
            .fw6,
            .br100,
            .pointer,
            .ml10;
          width: 18px;
          height: 18px;
        }
        .question-mark.bright {
          @p: .bgBlue, .white;
        }
        .tooltip {
          @p: .dn, .absolute;
          z-index: 999;
          left: 50%;
          transform: translateX(-50%);
          width: auto;
          min-width: 140px;
          padding-top: 9px;
          margin-top: 100%;
        }
        .tooltip-content {
          @p: .br2, .bgWhite, .pa16, .black50, .f14, .fw4, .relative;
          box-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
        }
        .tooltip-content .before {
          @p: .absolute, .bgWhite;
          content: "";
          top: -1px;
          width: 8px;
          height: 8px;
          margin-left: calc(50% - 16px);
          transform: rotate(45deg) translateX(-50%);
        }
        .tooltip.top .tooltip-content .before {
          top: initial;
          bottom: -4px;
          left: 60px;
        }
        .info {
          @p: .relative, .flex, .itemsStart, .justifyCenter;
        }
        .info:not(.manual):hover .tooltip {
          @p: .db;
        }
        .info:not(.manual):hover .question-mark {
          @p: .bgBlue, .white;
        }
        .info.manual.open .tooltip {
          @p: .db;
        }
        .info.manual.open .question-mark {
          @p: .bgBlue, .white;
        }
      `}</style>
      {props.customTip}
      <div className="tooltip">
        <div className="tooltip-content">
          <div className="before" />
          {props.children}
        </div>
      </div>
    </div>
  )
}

export default Info
