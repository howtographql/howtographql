import * as React from 'react'
import CopyButton from '../CopyButton'
import { $v } from 'graphcool-styles'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { extractGroup } from '../../utils/graphql'

interface Props {
  children?: JSX.Element
  path?: string
  className?: string
  nocopy?: string
}

function getGithubLink(group: string, path?: string) {
  if (!path) {
    return ''
  }

  // remove all preceding dots and slashes
  const trimmedPath = path.replace(/^[\.\/]*/g, '')

  // we assume that the path always includes the directory of the app itself like follows:
  // .../hackernews-react-apollo/src/styles/index.css
  const firstSlash = trimmedPath.indexOf('/')
  const normalizedPath = trimmedPath.slice(firstSlash + 1, trimmedPath.length)

  return `https://github.com/howtographql/${group}/blob/master/${normalizedPath}`
}

export default function Pre({
  children,
  path,
  className,
  nocopy,
  ...rest,
}: Props) {
  const isBash = className ? className.includes('bash') : false
  const group = extractGroup(location.pathname)
  // console.log('group')
  const showCopy = nocopy ? !(nocopy === 'true') : true
  const link = getGithubLink(group, path)
  return (
    <div className="pre-container">
      <style jsx={true}>{`
        .pre-container {
          @p: .mt16, .relative, .mb38;
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
        <a className="path" href={link} target="_blank">
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
        </a>}
      <pre className={className} {...rest}>
        {children}
        {showCopy &&
          <span className="copy-button">
            <CopyButton text={childrenToString(children)} />
          </span>}
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
      }
      {
        return childrenToString(el.props.children)
      }
    })
    .join('')
}
