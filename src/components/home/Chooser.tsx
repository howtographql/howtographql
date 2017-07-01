import * as React from 'react'
import Link from 'gatsby-link'
import * as cn from 'classnames'
import withWidth from './withWidth'
import DottedListItem from '../Steps/DottedListItem'
import LeftColumn from './LeftColumn'
import data from '../../data/stacks'
import StackChooser from '../StackChooser'

import { Step } from '../../types'
import Duration from '../Duration'

interface Props {
  width?: number
  mds: { [key: string]: Step[] }
  light?: boolean
}

interface State {
  selectedIndex: number
}

class Chooser extends React.Component<Props, State> {
  state = {
    selectedIndex: 0,
  }

  selectStack = index => {
    this.setState({ selectedIndex: index })
  }

  render() {
    const { mds, light } = this.props
    const { selectedIndex } = this.state

    const tutorials = data.map(tutorial => {
      return {
        ...tutorial,
        steps: mds[tutorial.key],
      }
    })
    const selected = tutorials[selectedIndex]

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
          h3.first-h3 {
            @p: .mt60;
          }
          .steps-container :global(.steps-description) p {
            @p: .white30;
          }
          .duration {
            @p: .mt16, .mr38;
          }

          .mobile-line-bend {
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
              background: linear-gradient(to bottom, rgba(23, 42, 58, 0), rgba(23, 42, 58, 1));
            }
          }
        `}</style>
        <div className="steps-content">
          <LeftColumn>
            <h3 className="first-h3">Hands-on tutorials</h3>
          </LeftColumn>
          <div className="steps-list">
            <DottedListItem first={true} path={'/tutorials/choose'}>
              <Link to={'/tutorials/choose'}>
                Choose your favorite technology
              </Link>
            </DottedListItem>
          </div>
        </div>
        <div className="mobile-line-bend"></div>
        <StackChooser
          stacks={data}
          selectedIndex={this.state.selectedIndex}
          onChangeSelectedIndex={this.selectStack}
          markdownFiles={mds}
        />
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
                <Link to={step.link}>
                  {step.title}
                </Link>
              </DottedListItem>,
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default withWidth<Props>()(Chooser)
