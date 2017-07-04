import * as React from 'react'

export default function Img(props) {
  return (
    <div className="image-wrapper">
      <style jsx={true}>{`
        .image-wrapper {
          @p: .justifyCenter, .flex, .itemsCenter;
          @p: .mt25, .mb38;
        }
        img {
          max-width: 100%;
        }
        @media (max-width: 1050px) {
          div.image-wrapper {
            max-width: 100vw;
            margin-left: -38px;
            width: calc(100% + 76px);
          }
        }
      `}</style>
      <img {...props} />
    </div>
  )
}
