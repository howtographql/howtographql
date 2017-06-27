import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import OptionalSteps from '../Steps/OptionalSteps'
import Steps from '../Steps/Steps'
import ChooseTutorialStep from '../Steps/ChooseTutorialStep'
import Theory from '../Steps/Theory'
import { extractGroup } from '../../utils/graphql'
import TutorialTitleStep from '../Steps/TutorialTitleStep'

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

    return (
      <div className="sidebar-container">
        <style jsx={true}>{`
          .sidebar {
            @p: .flexFixed, .pt38, .bbox, .overflowAuto, .relative;
            background-color: rgb(239, 239, 239);
            padding-left: 21px;
            max-height: calc(100vh - 72px);
            width: 300px;
          }
          .sidebar-container {
            @p: .relative;
          }
          .sidebar-container::before {
            @p: .absolute, .top0, .left0, .right0, .z2;
            content: "";
            background: linear-gradient(
              to bottom,
              rgb(239, 239, 239) 30%,
              rgba(239, 239, 239, 0)
            );
            height: 38px;
            width: 100%;
          }
          .sidebar :global(.plus) {
            background-color: rgb(239, 239, 239);
          }
          .sidebar :global(.dotted-list-item.first.light::after) {
            @p: .dn;
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
            />
            <OptionalSteps
              location={location}
              steps={steps.advanced}
              small={true}
              showDuration={false}
            />
            {['basics', 'advanced'].includes(group)
              ? <ChooseTutorialStep />
              : <div>
                  <TutorialTitleStep title="React + Apollo" />
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
