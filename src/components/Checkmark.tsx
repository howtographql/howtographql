import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  checked?: boolean
}

export default function Checkmark({ checked = true }: Props) {
  return (
    <div className={cn('checkmark', { checked })}>
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
            .bbox;
          height: 20px;
          width: 20px;
        }
        .checkmark.checked {
          @p: .bgPink, .bw0;
        }
      `}</style>
      {checked && <img src={require('../assets/icons/check.svg')} alt="" />}
    </div>
  )
}
