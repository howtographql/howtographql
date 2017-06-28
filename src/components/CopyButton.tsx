import * as React from 'react'
import Copy from './Copy'
import { $v } from 'graphcool-styles'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  return (
    <Copy text={text}>
      <Icon
        src={require('graphcool-styles/icons/fill/copy.svg')}
        color={$v.gray30}
        width={38}
        height={38}
      />
    </Copy>
  )
}
