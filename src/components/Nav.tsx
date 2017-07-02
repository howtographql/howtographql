import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import Link from 'gatsby-link'
import { $v } from 'graphcool-styles'
import { Step } from '../types'
import { getBackendTutorials, getFrontendTutorials } from '../utils/tutorials'
import Stack from './Steps/Stack'

interface Props {
  steps: { [key: string]: Step[] }
  location: any
}

export default class Nav extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { steps, location } = this.props
    const frontendTutorials = getFrontendTutorials(steps)
    const backendTutorials = getBackendTutorials(steps)
    return (
      <div className="right">
        <style jsx={true}>{`
          .right {
            @p: .flex;
          }
          .element {
            @p: .f14, .ph25, .darkBlue60, .pointer, .itemsCenter, .flex, .relative;
          }
          .element:hover {
            @p: .darkBlue;
          }
          .element:hover :global(.dropdown) {
            @p: .o100;

            pointer-events: all;
          }
          .triangle {
            @p: .f14, .ml6;
          }
          .element.github {
            @p: .ph25, .flex, .itemsCenter, .pv0;
          }
          @media (max-width: 1050px) {
            div.right {
              display: none;
            }
          }
          .graphql {
            @p: .flex;
          }
        `}</style>
        <div className="element">
          <span>GraphQL</span>
          <span className="triangle">▾</span>
          <Dropdown>
            <div className="graphql">
              <Stack
                name="GraphQL Theory"
                steps={steps.basics}
                location={location}
              />
              <Stack
                name="Advanced GraphQL"
                steps={steps.advanced}
                location={location}
              />
            </div>
          </Dropdown>
        </div>
        <div className="element">
          <span>Frontend</span>
          <Link to="/swipe">
            <span className="triangle">▾</span>
          </Link>
          <Dropdown>
            <Stack
              name="All Frontend Tutorials"
              steps={frontendTutorials}
              location={location}
              showLines={false}
            />
          </Dropdown>
        </div>

        <div className="element">
          <span>Backend</span>
          <Link to="/tutorials/success">
            <span className="triangle">▾</span>
          </Link>
          <Dropdown>
            <Stack
              name="All Backend Tutorials"
              steps={backendTutorials}
              location={location}
              showLines={false}
            />
          </Dropdown>
        </div>
        <a
          className="element github"
          href="https://github.com/howtographql/howtographql"
        >
          <Icon
            src={require('graphcool-styles/icons/fill/github.svg')}
            color={$v.gray30}
            width={32}
            height={32}
          />
        </a>
      </div>
    )
  }
}

interface DropdownProps {
  children?: JSX.Element
}

function Dropdown({ children }: DropdownProps) {
  return (
    <div className="dropdown">
      <style jsx={true}>{`
        .dropdown {
          @p: .absolute, .o0, .z999;
          transition: opacity ease-in-out 0.1s;
          pointer-events: none;
          right: 0;
          top: 67px;
        }
        .big-triangle {
          @p: .absolute;
          right: 48px;
          top: -16px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 13px 16px 13px;
          border-color: transparent transparent #E5E5E5 transparent;
        }
        .small-triangle {
          @p: .absolute;
          right: 51px;
          top: -13px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 10px 12.5px 10px;
          border-color: transparent transparent #ffffff transparent;
        }
        .content {
          @p: .relative, .bgWhite, .pa38, .ba, .bw2, .br2, .bBlack10;
        }
      `}</style>
      <div className="content">
        <div className="big-triangle" />
        <div className="small-triangle" />
        {children}
      </div>
    </div>
  )
}
