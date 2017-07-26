import * as React from 'react'
import data from '../../data/stacks'
import StackChooser from '../StackChooser'
import { Step } from '../../types'
import Link from 'gatsby-link'
import NewsletterSignup from '../NewsletterSignup'
import CustomHelmet from '../CustomHelmet'

interface Props {
  markdownFiles: { [key: string]: Step[] }
}

interface State {
  selectedIndex: number
}

export default class TutorialChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 4,
    }
  }

  render() {
    const { markdownFiles } = this.props

    const selected = data[this.state.selectedIndex]
    return (
      <div className="tutorial-chooser">
        <style jsx={true}>{`
          .tutorial-chooser {
            @p: .mb96, .mt60;
            margin-left: -38px;
            margin-right: -38px;
          }
          .center-container {
            @p: .flex, .justifyCenter;
          }
          .tutorial-chooser :global(.stacks-item:not(.active)) :global(i),
          .tutorial-chooser :global(.stacks-item:not(.active)) :global(img) {
            filter: grayscale(100%) !important;
          }
          .tutorial-chooser :global(.stacks-item:not(.active)) :global(img.darken) {
            filter: grayscale(100%) brightness(50%) !important;
          }
          h1 {
            @p: .pv60, .fw6, .center;
          }
          .btn {
            @p: .mt38;
          }
          @media (max-width: 580px) {
            div.center-container {
              @p: .mh25;
            }
          }
        `}</style>
        <CustomHelmet
          title="Choose your favorite technology"
          description="In the following, you can choose from one of the many hands-on tutorials we created for you. All tutorials will start from scratch and teach you how to build a fully-fledged Hackernews clone. Depending on what you want to learn, you can either choose a tutorial from the frontend or the backend tracks."
        />
        <StackChooser
          selectedIndex={this.state.selectedIndex}
          markdownFiles={this.props.markdownFiles}
          onChangeSelectedIndex={this.handleSelectIndex}
          stacks={data}
          fixedWidth={960}
          showSelectedBorder={true}
        />
        <div className="center-container">
          {selected.comingSoon
            ? <div>
                <NewsletterSignup light={true} tutorial={selected.key} />
              </div>
            : <Link to={markdownFiles[selected.key][0].link}>
                <div className="btn small">
                  Continue with the {selected.title} Tutorial
                </div>
              </Link>}
        </div>
      </div>
    )
  }

  private handleSelectIndex = i => {
    this.setState({ selectedIndex: i })
  }
}
