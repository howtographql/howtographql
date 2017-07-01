import * as React from 'react'
import { getStackName } from '../../utils/getStackName'

interface Props {
  group: string
}

const colors = {
  advanced: 'rgba(0,0,0,.7)',
  basics: '#EB1796',
  graphene: '#db594c',
  'graphql-elixir': '#4e2a8e',
  'graphql-ruby': '#a5152a',
  'react-apollo': '#00A89A',
  'react-relay': '#F96600',
}

export default function GroupBadge({ group }: Props) {
  const stackName = getStackName(group)
  return (
    <div
      className="group-badge"
      style={{ color: colors[group], borderColor: colors[group] }}
    >
      <style jsx={true}>{`
        .group-badge {
          @p: .ttu, .br2, .ba, .dib, .ml10, .relative;
          font-size: 10px;
          padding: 3px 7px;
        }
      `}</style>
      {stackName}
    </div>
  )
}
