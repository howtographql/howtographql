import * as React from 'react'
import YoutubeEmbedVideo from 'youtube-embed-video'
import { Author } from '../../data/authors'

interface Props {
  videoId: string
  author: Author | null
}

export default function Video({ videoId, author }: Props) {
  return (
    <div className="video">
      <style jsx={true}>{`
        .video {
          @p: .relative;
          height: 0;
          padding-top: 25px;
          padding-bottom: 56.25%;
        }
        .video :global(iframe) {
          @p: .absolute, .top0, .left0, .right0, .bottom0, .w100, .h100;
        }
      `}</style>
      {author && <div />}
      <YoutubeEmbedVideo videoId={videoId} suggestions={false} />
    </div>
  )
}
