import * as React from 'react'
import { Step } from '../../types'
import Link from 'gatsby-link'
import OptionalDottedListItem from './OptionalDottedListItem'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import Duration from '../Duration'
import * as cn from 'classnames'

interface Props {
  steps: Step[]
  small?: boolean
  showDuration?: boolean
  location: any
}

interface State {
  collapsed: boolean
}

export default class OptionalSteps extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      collapsed: true,
    }
  }

  render() {
    const { steps, small } = this.props
    const { collapsed } = this.state

    const visibleSteps = collapsed ? steps.slice(0, 2) : steps
    const count = visibleSteps.length === 2 ? 2 : visibleSteps.length - 1
    const n = count * 52

    const showDuration = typeof this.props.showDuration !== 'undefined'
      ? this.props.showDuration
      : true

    return (
      <div className={cn('optional-steps', { small })}>
        <style jsx={true}>{`
          .optional-steps {
            @p: .flex, .bl, .bw2, .bBlack20, .pb25;
          }
          p {
            @p: .black30;
          }
          .list-item {
            @p: .itemsCenter, .flex;
          }
          .time {
            @p: .ttu, .black30, .ml10, .itemsCenter, .flex, .fw6, .relative;
            font-size: 15px;
          }
          .time img {
            width: 15px;
            height: 15px;
          }
          .time span {
            @p: .ml6;
          }
          .time.first {
            top: -3px;
          }
          .st0 {
            fill: none;
            stroke: #ccc;
            stroke-width: 2;
            stroke-linecap: square;
            stroke-miterlimit: 10;
            stroke-dasharray: 10, 10;
          }
          .steps {
            @p: .mt60;
          }
          .more {
            @p: .flex, .itemsCenter, .mt12, .pointer;
          }
          .more span {
            @p: .f20, .black30, .ml4;
          }
          .small .more span {
            @p: .f16;
            margin-left: -12px;
          }
          .plus {
            @p: .bBlack20,
              .ba,
              .br100,
              .flex,
              .itemsCenter,
              .justifyCenter,
              .bw2,
              .bgWhite,
              .relative;
            left: -19px;
            width: 28px;
            height: 28px;
          }
          .line {
            @p: .relative;
            left: -2px;
          }
        `}</style>
        <div className="line">
          {/*
          <svg width="32px" height="363px" viewBox="0 0 32 363">
            <path className="st0" d="M1,362c0-48.98,30-48.98,30-97c0-32.01,0-167,0-167C31,49.98,1,49.98,1,1"/>
          </svg>
           */}
          <svg
            width="32px"
            height={`${n + 196}px`}
            viewBox={`0 0 32 ${n + 196}`}
          >
            <path
              className="st0"
              d={`M1,${n +
                195}c0-48.98,30-48.98,30-97c0-32.01,0-${n},0-${n}C31,49.98,1,49.98,1,1`}
            />
          </svg>
        </div>
        <div className="steps">
          {visibleSteps.map(step =>
            <OptionalDottedListItem
              key={step.title}
              small={this.props.small}
              active={step.link === this.props.location.pathname}
            >
              <div className="list-item">
                <Link to={step.link}>
                  {step.title}
                </Link>
                {showDuration && <Duration duration={step.time || 0} />}
              </div>
            </OptionalDottedListItem>,
          )}
          {collapsed &&
            <div className="more" onClick={this.toggleCollapse}>
              <div className="plus">
                <Icon
                  src={require('graphcool-styles/icons/stroke/addFull.svg')}
                  color={'#ccc'}
                  stroke={true}
                  strokeWidth={8}
                  width={16}
                  height={16}
                />
              </div>
              <span>+{steps.length - 2} more chapters</span>
            </div>}
        </div>
      </div>
    )
  }

  private toggleCollapse = () => {
    this.setState(state => ({ collapsed: !state.collapsed }))
  }
}
