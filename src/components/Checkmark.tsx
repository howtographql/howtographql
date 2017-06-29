import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  checked?: boolean
  crossed?: boolean
}

export default function Checkmark({ checked = true, crossed = false }: Props) {
  return (
    <div className={cn('checkmark', { checked, crossed })}>
      <style jsx={true}>{`
        .checkmark {
          @p: .br100,
            .white,
            .flex,
            .itemsCenter,
            .justifyCenter,
            .ba,
            .bBlack30,
            .bw2,
            .relative,
            .bbox;
          height: 20px;
          width: 20px;
        }
        .checkmark.checked {
          @p: .bgPink, .bw0;
        }
        .checkmark.crossed {
          @p: .bBlack20;
          left: -2px;
          width: 24px;
          height: 24px;
        }
        .cross {
          @p: .black20, .fw7, .f20;
        }
      `}</style>
      {checked && <img src={require('../assets/icons/check.svg')} alt="" />}
      {crossed &&
        <div className="cross">
          ×
        </div>}
    </div>
  )
}
