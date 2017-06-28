import * as React from 'react'

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
            .mt38;
        }
        .well-done span {
          @p: .pink, .bgWhite, .ph10, .f14, .fw6, .z2, .ttu;
        }
      `}</style>
      <span>
        Well done, you unlocked chapter {n}!
      </span>
    </div>
  )
}
