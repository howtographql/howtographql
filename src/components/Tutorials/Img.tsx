import * as React from 'react'

export default function Img(props) {
  return (
    <div className="image-wrapper">
      <style jsx={true}>{`
        .image-wrapper {
          max-width: 90vw;
        }
      `}</style>
      <img {...props} />
    </div>
  )
}
