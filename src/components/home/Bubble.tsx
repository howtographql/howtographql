import * as React from 'react'
import Info from '../Info'

interface Props {
  avatar: string
  children?: JSX.Element
  diameter?: number
  x?: number
  y?: number
  name?: string
  description?: string
}

export default function Bubble({
  avatar,
  children,
  diameter = 150,
  x = 0,
  y = 0,
  name,
  description,
}: Props) {
  return (
    <div
      className="bubble"
      style={{ width: diameter, height: diameter, top: y, left: x }}
    >
      <style jsx={true}>{`
        .bubble {
          @p: .relative, .mr25;
        }
        img {
          @p: .br100;
          width: 100%;
          height: auto;
        }
        h3 {
          @p: .tc, .nowrap;
        }
        div {
          @p: .mt10, .tc, .lhCopy;
        }
      `}</style>
      <Info customTip={<img src={avatar} />}>
        <h3>{name}</h3>
        <div>{description}</div>
      </Info>
    </div>
  )
}
