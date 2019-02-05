import * as React from 'react'
import Link from 'gatsby-link'
import * as cn from 'classnames'
import DottedListItem from '../Steps/DottedListItem'
import LeftColumn from './LeftColumn'
import data from '../../data/stacks'
import StackChooser from '../StackChooser'
import SwipeableViews from 'react-swipeable-views'
import { CSSTransitionGroup } from 'react-transition-group'

import { Step } from '../../types'
import Duration from '../Duration'
import NewsletterSignup from '../NewsletterSignup'
import { getTotalDuration } from '../../utils/getTotalDuration'
import Steps from '../Steps/Steps'

interface Props {
  width?: number
  mds: { [key: string]: Step[] }
  light?: boolean
  location: any
  history: any
}

interface State {
  selectedIndex: number
  selectedCategoryIndex: number
}

export const FRONTEND_TUTORIALS_COUNT = data.filter(tutorial => tutorial.type === 'frontend').length-1
const CATEGORIES = ['Frontend', 'Backend']
const FRONTEND_INDEX = 0
const BACKEND_INDEX = 1

export default class Chooser extends React.Component<Props, State> {
  state = {
    selectedCategoryIndex: BACKEND_INDEX,
    selectedIndex: FRONTEND_TUTORIALS_COUNT+1,
  }

  render() {
    const { mds, light } = this.props
    const { selectedIndex, selectedCategoryIndex } = this.state

    const tutorials = data.map(tutorial => {
      return {
        ...tutorial,
        steps: mds[tutorial.key],
      }
    })
    const selected = tutorials[selectedIndex]
    // const widthElement = 140 + 20
    // const widthElementSelected = 140 + 80
    //
    // const translateWidth = (fixedWidth > 0 ? fixedWidth : width) || 1
    // const translateX =
    //   translateWidth / 2 - widthElement * selectedIndex - widthElementSelected / 2
    const selectedDuration = getTotalDuration(selected.steps)

    return (
      <div className={cn('steps-container', { light })}>
        <style jsx={true}>{`
          div.steps-container {
            @p: .white, .bgDarkBlue, .pb60;
          }
          .steps-content {
            @p: .flex;
          }
          .steps-content :global(.steps-description) {
            margin-top: 48px;
          }
          .steps-list {
            @p: .w50, .relative;
          }
          .steps-list::after {
            content: '';
            display: block;
            height: 48px;
            background-image: linear-gradient(
              to bottom,
              rgba(225, 225, 225, 0.2),
              #172a3a
            );
            width: 2px;
          }
          p {
            @p: .white;
          }
          h3 {
            @p: .fw6;
          }
          div h3.first-h3 {
            margin-top: 60px;
          }
          .steps-container :global(.steps-description) p {
            @p: .white30;
          }
          .duration {
            @p: .mt16, .mr38;
          }
          .mobile-line-bend, .mobile-line-bend-bottom {
            display: none;
          }
          .fade-before-element {
            @p: .db;
            content: '';
            height: 48px;
            background-image: linear-gradient(
              to top,
              rgba(225, 225, 225, 0.2),
              #172a3a
            );
            width: 2px;
          }
          .steps-list-top :global(.dotted-list-item:not(.light).first) {
            padding-top: 60px !important;
          }
          @media (max-width: 500px) {
            div.fade-before-element {
              @p: .dn;
            }
            h3.first-h3 {
              display: none;
            }
            .steps-content {
              padding: 0 30px;
            }

            .steps-content :global(.left-column) {
              display: none;
            }
            div.steps-list {
              @p: .w100;
            }
            .bottom-chooser {
              @p: .relative;
              padding-top: 48px;
            }
            .steps-list-top::after {
              content: '';
              display: block;
              height: 48px;
              width: 48px;
              background: none;
              border-left: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom-left-radius: 500px;
            }
            .steps-list-top::before {
              content: '';
              position: absolute;
              width: calc(50% - 99px);
              bottom: 0;
              left: 50px;
              height: 2px;
              background: rgba(225, 225, 225, 0.2);
            }
            .bottom-chooser::after {
              content: '';
              top: -2px;
              left: 30px;
              position: absolute;
              display: block;
              height: 48px;
              width: 48px;
              background: none;
              border-top: 2px solid rgba(225, 225, 225, 0.2);
              border-left: 2px solid rgba(225, 225, 225, 0.2);
              border-top-left-radius: 500px;
            }
            .bottom-chooser::before {
              content: '';
              position: absolute;
              width: calc(50% - 128px);
              top: -2px;
              left: 80px;
              height: 2px;
              background: rgba(225, 225, 225, 0.2);
            }
            .mobile-line-bend {
              @p: .db, .center, .relative;
              height: 48px;
              width: 48px;
              border-right: 2px solid rgba(225, 225, 225, 0.2);
              border-top: 2px solid rgba(225, 225, 225, 0.2);
              border-top-right-radius: 500px;
              left: -24px;
              top: -2px;
            }
            .mobile-line-bend:after {
              content: "";
              @p: .absolute, .bottom0, .left0;
              right: -2px;
              height: 48px;
              background: linear-gradient(
                to bottom,
                rgba(23, 42, 58, 0),
                rgba(23, 42, 58, 1)
              );
            }
            .mobile-line-bend-bottom {
              @p: .db, .center, .relative;
              height: 48px;
              width: 48px;
              border-right: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom-right-radius: 500px;
              left: -23px;
              top: 0px;
            }
            .mobile-line-bend-bottom:after {
              content: "";
              @p: .absolute, .bottom0, .left0;
              right: -2px;
              height: 48px;
              background: linear-gradient(
                to top,
                rgba(23, 42, 58, 0),
                rgba(23, 42, 58, 1)
              );
            }
          }
          .list-item {
            @p: .flex, .itemsCenter;
          }
          .steps-container :global(.dotted-list-item) {
            @p: .white;
          }
          .coming-soon {
            @p: .pb96, .pt38;
          }
          .coming-soon p {
            @p: .white70, .mb16;
          }
          .category-chooser {
            @p: .flex, .justifyCenter, .mt16;
          }
          .category {
            @p: .f14, .fw6, .white30, .ttu, .pointer, .tc;
          }
          .category.active {
            @p: .white70;
          }
          .steps-container :global(.stacks-item:not(.active)) :global(.graphql-elixir-1) {
            filter: grayscale(100%) brightness(1500%) !important;
          }
          .steps-container :global(.stacks-item.active) :global(.graphql-elixir-1) {
            filter: brightness(450%) !important;
          }
          .steps-container :global(.stacks-item:not(.active)) :global(.graphql-elixir-2),
          .steps-container :global(.stacks-item:not(.active)) :global(.graphql-ruby-2) {
            filter: grayscale(100%) brightness(1000%) !important;
          }
          .steps-container :global(.stacks-item.active) :global(.graphql-elixir-2),
          .steps-container :global(.stacks-item.active) :global(.graphql-ruby-2) {
            filter: brightness(180%) !important;
          }
          .center-container {
            @p: .flex, .justifyCenter;
          }
          .link {
            @p: .flex, .itemsCenter;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .chooser-enter {
            opacity: 0.01;
          }
          .chooser-enter.chooser-enter-active {
            opacity: 1;
            transition: opacity 500ms ease-in;
          }
          .chooser-leave {
            opacity: 1;
          }
          .chooser-leave.chooser-leave-active {
            opacity: 0.01;
            transition: opacity 300ms ease-in;
          }
        `}</style>
        <div className="steps-content">
          <LeftColumn>
            <h3 className="first-h3">Hands-on tutorials</h3>
          </LeftColumn>
          <div className="steps-list steps-list-top">
            <DottedListItem first={true} path={'/tutorials/choose'}>
              <div className="list-item">
                <Link to={'/choose/'}>
                  <span>
                    Choose your favorite technology
                  </span>
                </Link>
              </div>
            </DottedListItem>
          </div>
        </div>
        <div className="mobile-line-bend" />
        <div className="category-chooser">
          <SwipeableViews
            enableMouseEvents={true}
            style={{
              overflow: 'visible',
              width: 90,
            }}
            slideStyle={{
              overflow: 'hidden'
            }}
            index={selectedCategoryIndex}
            onChangeIndex={this.handleChangeSelectedCategoryIndex}
          >
            {CATEGORIES.map((cat, index) =>
              <div
                className={cn('category', {
                  active: index === selectedCategoryIndex,
                })}
                onClick={this.handleChangeSelectedCategoryIndex.bind(
                  this,
                  index,
                )}
              >
                {cat}
              </div>,
            )}
          </SwipeableViews>
        </div>
        <StackChooser
          stacks={data}
          selectedIndex={this.state.selectedIndex}
          onChangeSelectedIndex={this.selectStack}
          markdownFiles={mds}
          onClickCurrentStack={this.handleClickCurrentStack}
        />
        <CSSTransitionGroup
          transitionName="chooser"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {!selected.comingSoon &&
            <div
              className="mobile-line-bend-bottom"
              key={selected.key + 'bend2'}
            />}
          {!selected.comingSoon
            ? <div className="bottom-chooser" key={'crazy-' + selected.key}>
                <div className="steps-content">
                  <LeftColumn className="steps-description">
                    <h3>{selected.content.title}</h3>
                    {selectedDuration > 0 &&
                      <div className="duration">
                        <Duration
                          duration={selectedDuration}
                          total={true}
                          dark={true}
                        />
                      </div>}
                    <p>{selected.content.description}</p>
                  </LeftColumn>
                  <div className="steps-list">
                    {selected &&
                      <div
                        className="fade-before-element"
                        key={selected.key}
                      />}
                    <Steps steps={selected.steps} location={this.props.location} dark={true} showLast={false} />
                  </div>
                </div>
              </div>
            : <div className="center-container">
                <div className="coming-soon">
                  <NewsletterSignup tutorial={selected.key} />
                </div>
              </div>}
        </CSSTransitionGroup>
      </div>
    )
  }

  private selectStack = index => {
    if (index < 0 || index > Object.keys(this.props.mds).length) {
      return
    }
    const selectedCategoryIndex = index > 5 ? 1 : 0
    this.setState({ selectedIndex: index, selectedCategoryIndex })
  }

  private handleClickCurrentStack = () => {
    const { mds } = this.props
    const { selectedIndex } = this.state

    const tutorials = data.map(tutorial => {
      return {
        ...tutorial,
        steps: mds[tutorial.key],
      }
    })
    const selected = tutorials[selectedIndex]

    if (!selected.comingSoon) {
      const introChapter = selected.steps[0]
      this.props.history.push(introChapter.link)
    }
  }

  private handleChangeSelectedCategoryIndex = index => {
    this.setState(state => {
      let selectedIndex = 0
      if (index === FRONTEND_INDEX) {
        selectedIndex = FRONTEND_TUTORIALS_COUNT
      }
      if (index === BACKEND_INDEX) {
        selectedIndex = FRONTEND_TUTORIALS_COUNT+1
      }
      return { ...state, selectedCategoryIndex: index, selectedIndex }
    })
  }
}
