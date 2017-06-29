import * as React from 'react'
import Link from 'gatsby-link'
import * as cn from 'classnames'
import withWidth from './withWidth'
import DottedListItem from '../Steps/DottedListItem'
import LeftColumn from './LeftColumn'
import data from '../Steps/data/stacks'
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
            @p: .w50;
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
        `}</style>
        <div className="steps-content">
          <LeftColumn>
            <h3 className="first-h3">Practical part</h3>
          </LeftColumn>
          <div className="steps-list">
            <DottedListItem first={true} path={'/tutorials/choose'}>
              <Link to={'/tutorials/choose'}>
                Which tutorial should I pick next?
              </Link>
            </DottedListItem>
          </div>
        </div>
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
