import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import OptionalSteps from '../Steps/OptionalSteps'
import Steps from '../Steps/Steps'
import ChooseTutorialStep from '../Steps/ChooseTutorialStep'
import Theory from '../Steps/Theory'
import { extractGroup } from '../../utils/graphql'
import TutorialTitleStep from '../Steps/TutorialTitleStep'
import data from '../Steps/data/stacks'

interface Props {
  steps: { [key: string]: Step[] }
  post?: MarkdownRemark
  location: any
}

export default class Sidebar extends React.Component<Props, {}> {
  private ref: any
  componentDidUpdate() {
    if (this.ref) {
      this.ref.scrollTop = this.ref.scrollHeight
    }
  }
  render() {
    const { post, steps, location } = this.props
    const group = post ? extractGroup(post.fields.slug) : 'basics'
    const selectedSteps = steps[group]
    let tutorialTitle: string | null = null
    const stack = data.find(s => s.key === group)
    if (stack) {
      tutorialTitle = stack.title
    }

    const showChoose =
      ['basics', 'advanced'].includes(group) ||
      location.pathname.includes('/choose')

    const nonGraphqlTutorial = !['basics', 'advanced'].includes(group)

    return (
      <div className="sidebar-container">
        <style jsx={true}>{`
          .sidebar {
            @p: .flexFixed,
              .pt38,
              .bbox,
              .overflowAuto,
              .relative,
              .bl,
              .bBlack10;
            background-color: rgb(245, 245, 245);
            padding-left: 21px;
            height: calc(100vh - 72px);
            width: 300px;
          }
          .sidebar-container {
            @p: .relative;
          }
          .sidebar-container::before {
            @p: .absolute, .top0, .right0, .z2;
            left: 1px;
            content: "";
            background: linear-gradient(
              to bottom,
              rgb(245, 245, 245) 30%,
              rgba(245, 245, 245, 0)
            );
            height: 38px;
            width: 100%;
          }
          .sidebar :global(.plus) {
            background-color: rgb(245, 245, 245);
          }
          .steps-list {
            @p: .pb96;
          }
        `}</style>
        <div className="sidebar" ref={this.setRef}>
          <div className="steps-list fade-before">
            <Theory />
            <Steps
              steps={steps.basics}
              small={true}
              showDuration={false}
              location={location}
              highlightFirst={false}
            />
            <OptionalSteps
              location={location}
              steps={steps.advanced}
              small={true}
              showDuration={false}
              mainPink={nonGraphqlTutorial}
            />
            {showChoose
              ? <ChooseTutorialStep
                  active={location.pathname.includes('choose')}
                />
              : <div>
                  {tutorialTitle &&
                    <TutorialTitleStep
                      title={tutorialTitle}
                      pinkLine={nonGraphqlTutorial}
                    />}
                  <Steps
                    steps={selectedSteps}
                    small={true}
                    showDuration={false}
                    location={location}
                  />
                </div>}
          </div>
        </div>
      </div>
    )
  }

  private setRef = ref => {
    this.ref = ref
  }
}
