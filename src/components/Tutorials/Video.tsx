import * as React from 'react'
import YoutubeEmbedVideo from 'youtube-embed-video'
import { Author } from '../../data/authors'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import * as cn from 'classnames'

interface Props {
  videoId: string
  author: Author | null
}

interface State {
  showVideo: boolean
}

export default class Video extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      showVideo: false,
    }
  }
  render() {
    const { author, videoId } = this.props
    const { showVideo } = this.state
    return (
      <div className="video-wrapper">
        <style jsx={true}>{`
          .video-wrapper {
            @p: .w100, .bgBlack, .relative;
          }
          .video-wrap {
            @p: .center;
            max-width: 920px;
          }
          .video {
            @p: .relative;
            height: 0;
            padding-top: 25px;
            padding-bottom: 56.25%;
          }
          .video :global(iframe) {
            @p: .absolute, .top0, .left0, .right0, .bottom0, .w100, .h100;
          }
          .overlay {
            @p: .absolute,
              .top0,
              .left0,
              .right0,
              .bottom0,
              .pointer,
              .flex,
              .itemsCenter,
              .justifyCenter,
              .bgBlack;
            @p: .o0;
            pointer-events: none;
            transition: $duration opacity;
            transition-delay: 0.3s;
          }
          .overlay.visible {
            @p: .o100;
            pointer-events: all;
          }
          .overlay :global(i) {
            @p: .absolute;
          }
          .overlay :global(polygon) {
            fill: white !important;
          }
          img.preview {
            height: 100%;
            width: auto;
            filter: brightness(40%);
          }
          .author {
            @p: .absolute, .bottom0, .right0, .mb16, .flex, .itemsCenter, .z2;
          }
          .avatar {
            @p: .overflowHidden, .flex, .itemsCenter, .justifyCenter, .br100;
            width: 38px;
            height: 38px;
          }
          .avatar img {
            height: auto;
            width: 100%;
          }
          .info {
            @p: .ml10, .mr16;
          }
          .by {
            @p: .f12, .white50, .fw6, .ttu;
          }
          .author-name {
            @p: .f16, .white80, .fw6, .mt6;
          }
        `}</style>

        <div className="video-wrap">
          <div className="video">
            <YoutubeEmbedVideo
              videoId={videoId}
              suggestions={false}
              autoplay={showVideo}
              controls={false}
            />
            {!showVideo &&
              author &&
              <div className="author">
                <div className="avatar">
                  <img src={author.avatar} alt="" />
                </div>
                <div className="info">
                  <div className="by">Screencast By</div>
                  <div className="author-name">{author.name}</div>
                </div>
              </div>}
          </div>
        </div>
        <div
          className={cn('overlay', { visible: !showVideo })}
          onClick={this.showVideo}
        >
          <img
            src={`http://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            className="preview"
          />
          <Icon
            src={require('../../assets/icons/video.svg')}
            width={62}
            height={62}
            color={'white'}
          />
        </div>
      </div>
    )
  }

  private showVideo = () => {
    this.setState({ showVideo: true })
  }
}
