import * as React from 'react'

export default function Checkmark() {
  return (
    <div className="checkmark">
      <style jsx={true}>{`
        .checkmark {
          @p: .bgPink, .br100, .white, .flex, .itemsCenter, .justifyCenter;
          height: 20px;
          width: 20px;
        }
      `}</style>
      <img src={require('../assets/icons/check.svg')} alt="" />
    </div>
  )
}
