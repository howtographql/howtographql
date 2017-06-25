import * as React from 'react'
import YoutubeEmbedVideo from 'youtube-embed-video'

interface Props {
  videoId: string
}

export default function Video({ videoId }: Props) {
  return <YoutubeEmbedVideo />
}
