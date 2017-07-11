import * as React from 'react'
import Confetti from 'react-confetti'

interface Props {
  n: number
}

export default function Unlocked({ n }: Props) {
  return (
    <div className="well-done">
      <style jsx={true}>{`
        .well-done {
          @p: .bt,
            .bb,
            .bBlack10,
            .bw2,
            .pa60,
            .bbox,
            .flex,
            .itemsCenter,
            .justifyCenter,
            .mt38,
            .relative,
            .overflowHidden;
          background-color: #fafafa;
        }
        .well-done span {
          @p: .pink, .ph10, .f20, .fw6, .z2, .relative;
        }
        .well-done :global(canvas) {
          top: -2px !important;
        }
      `}</style>
      <span>
        Well done, you unlocked the next chapter!
      </span>
      <Confetti height={'400%'} numberOfPieces={200} />
    </div>
  )
}
