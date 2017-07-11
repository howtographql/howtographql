import * as React from 'react'
import Checkmark from '../Checkmark'

interface Props {
  remember: boolean
  onChangeRemember: () => void
}

export default function RememberDecision({
  remember,
  onChangeRemember,
}: Props) {
  return (
    <div className="remember-decision" onClick={onChangeRemember}>
      <style jsx={true}>{`
        .remember-decision {
          @p: .bt, .bBlack10, .ph38, .pv25, .flex, .itemsCenter, .pointer;
          background: #fafafa;
        }
        span {
          @p: .ml16, .black50, .f16;
        }
      `}</style>
      <Checkmark checked={remember} />
      <span>Remember my decision. Don't show question in upcoming chapters.</span>
    </div>
  )
}
