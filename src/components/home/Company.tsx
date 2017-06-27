import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface Props {
  color: string
  src: string
  x?: number
  y?: number
}

export default function Company({ color = 'black', src, x = 0, y = 0 }: Props) {
  return (
    <div
      className="company"
      style={{ backgroundColor: color, left: x, top: y }}
    >
      <style jsx={true}>{`
        .company {
          @p: .br100, .flex, .justifyCenter, .itemsCenter, .mr25, .relative;
          width: 118px;
          height: 118px;
        }
      `}</style>
      <Icon src={src} width={57} height={57} color="white" />
    </div>
  )
}
