import * as React from 'react'
import CopyButton from '../CopyButton'
import { $v } from 'graphcool-styles'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { extractGroup } from '../../utils/graphql'

interface Props {
  children?: JSX.Element
  path?: string
  className?: string
}

export default function Pre({ children, path, className, ...rest }: Props) {
  const isBash = className ? className.includes('bash') : false
  return (
    <div className="pre-container">
      <style jsx={true}>{`
        .pre-container {
          @p: .mt38, .relative;
        }
        pre {
          @p: .bDarkBlue10, .ba, .br2, .pa16, .bgDarkBlue04, .overflowAuto;
        }
        .copy-button {
          @p: .absolute, .right0, .bottom0, .pa10, .z999, .pointer;
        }
        .copy-button :global(svg) {
          transition: $duration fill;
        }
        .copy-button:hover :global(svg) {
          fill: $gray60 !important;
        }
        .path {
          @p: .flex, .itemsCenter;
        }
        .path span {
          @p: .black40, .fw6, .f12;
        }
        .path-sh {
          @p: .mono, .flex, .itemsCenter;
        }
        .path-sh svg {
          @p: .mr6;
          margin-left: 2px;
        }
        .path :global(i) {
          @p: .mr6;
        }
      `}</style>
      {path &&
        <div className="path">
          {isBash
            ? <span className="path-sh">
                <span>$</span>
                <svg
                  width="4"
                  height="12"
                  viewBox="0 0 4 12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="rgba(0,0,0,0.2)"
                >
                  <rect x="0" y="0" width="4" height="12" />
                </svg>
              </span>
            : <Icon
                src={require('graphcool-styles/icons/fill/github.svg')}
                color={$v.gray30}
                width={14}
                height={14}
              />}
          <span>{path}</span>
        </div>}
      <pre className={className} {...rest}>
        {children}
        <span className="copy-button">
          <CopyButton text={childrenToString(children)} />
        </span>
      </pre>
    </div>
  )
}

export function childrenToString(children): string {
  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'undefined') {
    return ''
  }

  return children
    .map(el => {
      if (typeof el === 'string') {
        return el
      } else if (el.type === 'img') {
        return el.props.src
      } else {
        return childrenToString(el.props.children)
      }
    })
    .join('')
}
