import * as React from 'react'
import Link from 'gatsby-link'
import * as cn from 'classnames'
import withWidth from './withWidth'
import DottedListItem from '../Steps/DottedListItem'
import LeftColumn from './LeftColumn'
import data from '../../data/stacks'
import StackChooser from '../StackChooser'
import SwipeableViews from 'react-swipeable-views'

import { Step } from '../../types'
import Duration from '../Duration'

interface Props {
  width?: number
  mds: { [key: string]: Step[] }
  light?: boolean
}

interface State {
  selectedIndex: number
  selectedCategoryIndex: number
}

class Chooser extends React.Component<Props, State> {
  state = {
    selectedCategoryIndex: 0,
    selectedIndex: 4,
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

    return (
      <div className={cn('steps-container', { light })}>
        <style jsx={true}>{`
          div.steps-container {
            @p: .white, .bgDarkBlue;
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
          .steps-list.fade-before::before {
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
          div h3.first-h3 {
            @p: .mt60;
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
          @media (max-width: 500px) {
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
            .steps-list::after {
              content: '';
              display: block;
              height: 48px;
              width: 48px;
              background: none;
              border-left: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom: 2px solid rgba(225, 225, 225, 0.2);
              border-bottom-left-radius: 500px;
            }
            .steps-list::before {
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
            @p: .flex;
          }
          .coming-soon {
            @p: .pb96, .pt38;
          }
          .coming-soon h1 {
            @p: .fw6, .tc, .center;
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
        `}</style>
        <div className="steps-content">
          <LeftColumn>
            <h3 className="first-h3">Hands-on tutorials</h3>
          </LeftColumn>
          <div className="steps-list">
            <DottedListItem first={true} path={'/tutorials/choose'}>
              <Link to={'/tutorials/choose'}>
                <div className="list-item">
                  <span>
                    Choose your favorite technology
                  </span>
                  <Duration duration={2} total={false} dark={true} />
                </div>
              </Link>
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
            index={selectedCategoryIndex}
            onChangeIndex={this.handleChangeSelectedCategoryIndex}
          >
            {['Frontend', 'Backend'].map((cat, index) =>
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
        />
        <div className="mobile-line-bend-bottom" />
        {!selected.comingSoon
          ? <div className="bottom-chooser">
              <div className="steps-content">
                <LeftColumn className="steps-description">
                  <h3>{selected.content.title}</h3>
                  <div className="duration">
                    <Duration duration={87} total={true} dark={true} />
                  </div>
                  <p>{selected.content.description}</p>
                </LeftColumn>
                <div className="steps-list fade-before">
                  {selected.steps.map((step, index) =>
                    <DottedListItem key={index} path={step.link}>
                      <div className="list-item">
                        <Link to={step.link}>
                          {step.title}
                        </Link>
                      </div>
                    </DottedListItem>,
                  )}
                </div>
              </div>
            </div>
          : <div className="coming-soon">
              <h1>This track is coming soon - stay tuned!</h1>
            </div>}
      </div>
    )
  }

  private selectStack = index => {
    const selectedCategoryIndex = index > 3 ? 1 : 0
    this.setState({ selectedIndex: index, selectedCategoryIndex })
  }

  private handleChangeSelectedCategoryIndex = index => {
    this.setState(state => {
      let selectedIndex = 0
      if (index === 0) {
        selectedIndex = 3
      }
      if (index === 1) {
        selectedIndex = 4
      }
      return { ...state, selectedCategoryIndex: index, selectedIndex }
    })
  }
}

export default withWidth<Props>()(Chooser)
