import * as React from 'react'
import Checkmark from '../Checkmark'

export default function WhatWeBuild() {
  return (
    <section>
      <div className="what-we-build">
        <style jsx={true}>{`
          .what-we-build {
            @p: .center;
            max-width: 960px;
          }
          p.c {
            @p: .tc, .mt38;
          }
          .preview {
            @p: .flex, .justifyBetween, .itemsCenter, .mt96;
          }
          .preview img {
            height: 370px;
            width: auto;
          }
          .point {
            @p: .flex, .itemsCenter, .mt20;
          }
          .point p {
            @p: .ml16;
          }
        `}</style>
        <h2>What you'll build: A Hackernews clone</h2>
        <p className="c">
          No styling, no framework setup, we did that all for you. Just focus on
          GraphQL.
        </p>
        <div className="preview">
          <img
            src={require('../../assets/graphics/hackernews-preview.png')}
            alt=""
          />
          <div className="points">
            <div className="point">
              <Checkmark />
              <p>No Styling required</p>
            </div>
            <div className="point">
              <Checkmark />
              <p>You’ll learn about the dev tools required</p>
            </div>
            <div className="point">
              <Checkmark />
              <p>Prepared code projects available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
