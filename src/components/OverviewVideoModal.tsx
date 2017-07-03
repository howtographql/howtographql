import * as React from 'react'
import { connect } from 'react-redux'
import * as cn from 'classnames'
import YoutubeEmbedVideo from 'youtube-embed-video'

interface Props {
  visible: boolean
}

class OverviewVideoModal extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { visible } = this.props
    return (
      <div className={cn('overview-video-modal', { visible })}>
        <style jsx={true}>{`
          .overview-video-modal {
            @p: .fixed, .bgWhite, .o0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 924px;
            max-width: 100vw;
            z-index: 10011;
            pointer-events: none;
            transition: opacity ease-in-out 0.25s;
            transition-delay: 0.3s;
          }
          .overview-video-modal.visible {
            @p: .o100;
            pointer-events: all;
            transition-delay: 0;
          }
          .video-wrap {
            @p: .center;
            max-width: 920px;
          }
          .video {
            @p: .relative;
            height: 0;
            padding-top: 0;
            padding-bottom: 56.25%;
          }
          .video :global(iframe) {
            @p: .absolute, .top0, .left0, .right0, .bottom0, .w100, .h100;
          }
        `}</style>
        <div className="video-wrap">
          <div className="video">
            <YoutubeEmbedVideo
              videoId="oCT4HOJsUZQ"
              suggestions={false}
              autoplay={visible}
              controls={false}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({ visible: state.ui.overviewVideoVisible }))(
  OverviewVideoModal,
)
