import * as React from 'react'
import { Step } from '../../types'
import Link from 'gatsby-link'
import OptionalDottedListItem from './OptionalDottedListItem'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import Duration from '../Duration'
import * as cn from 'classnames'
import { extractGroup } from '../../utils/graphql'
import { CSSTransitionGroup } from 'react-transition-group'

interface Props {
  steps: Step[]
  small?: boolean
  showDuration?: boolean
  location: any
  mainPink?: boolean
  onClickLink?: () => void
}

interface State {
  collapsed: boolean
  n: number
  group: string
}

export default class OptionalSteps extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    const group = extractGroup(props.location.pathname)

    const count = group === 'advanced' ? props.steps.length : 2

    this.state = {
      collapsed: true,
      group,
      n: this.getN(count),
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.location.key !== this.props.location.key) {

      const group = extractGroup(nextProps.location.pathname)
      const isAdvanced = group === 'advanced'

      const count = isAdvanced ? nextProps.steps.length : 2

      this.setState(state => ({...state, group, n: this.getN(count), collapsed: !isAdvanced}))
    }
  }

  getN(count: number) {
    if (this.props.small) {
      return count * 36 + 16
    }
    return count * 52 + 16
  }

  render() {
    const { steps, small, mainPink, onClickLink } = this.props
    const { collapsed, n, group } = this.state
    const reallyCollapsed = collapsed && group !== 'advanced'

    const visibleSteps = reallyCollapsed ? steps.slice(0, 2) : steps

    const showDuration = typeof this.props.showDuration !== 'undefined'
      ? this.props.showDuration
      : true

    return (
      <div className={cn('optional-steps', { small, mainPink })}>
        <style jsx={true}>{`
          .optional-steps {
            @p: .flex, .bl, .bw2, .bBlack20, .pb25, .relative, .bbox;
          }
          .optional-steps.mainPink::before {
            @p: .absolute, .top0, .bottom0, .bgPink, .z999;
            content: "";
            left: -2px;
            width: 2px;
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
          .steps-svg-class {
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
        <style jsx={true} global={true}>{`
          .optional-enter {
            opacity: 0.01;
          }
          .optional-enter.optional-enter-active {
            opacity: 1;
            transition: opacity 400ms ease-in;
            transition-delay: 100ms;
          }
          .optional-leave {
            opacity: 1;
          }
          .optional-leave.optional-leave-active {
            opacity: 0.01;
            transition: opacity 300ms ease-in;
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
              className="steps-svg-class"
              d={`M1,${n +
                195}c0-48.98,30-48.98,30-97c0-32.01,0-${n},0-${n}C31,49.98,1,49.98,1,1`}
            />
          </svg>
        </div>
        <div className="steps">
          <CSSTransitionGroup
            transitionName="optional"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
            transitionAppear={true}
          >
            {visibleSteps.map(step =>
              <Link to={step.link} onClick={onClickLink}>
                <OptionalDottedListItem
                  key={step.title}
                  small={this.props.small}
                  active={step.link === this.props.location.pathname}
                  path={step.link}
                >
                  <div className="list-item">
                    <span>
                      {step.title}
                    </span>
                    {showDuration &&
                      step.duration &&
                      <Duration duration={step.duration} />}
                  </div>
                </OptionalDottedListItem>
              </Link>
            )}
          </CSSTransitionGroup>
          {reallyCollapsed &&
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
    this.setState(state => ({ collapsed: !state.collapsed }), this.tweenN)
  }

  private tweenN() {
    const count = this.props.steps.length

    const animate = () => {
      if (this.state.n < this.getN(count)) {
        this.setState(state => ({n: state.n + 15}))
        requestAnimationFrame(animate)
      }
    }

    animate()
  }
}
