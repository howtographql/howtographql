import * as React from 'react'

export default function Img(props) {
  return (
    <div className="image-wrapper">
      <style jsx={true}>{`
        .image-wrapper {
          @p: .w100;
        }
      `}</style>
      <img {...props} />
    </div>
  )
}
