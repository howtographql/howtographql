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
        <h2>Learn by Building</h2>
        <p className="c">
          Start from scratch and build a fully-featured Hackernews clone with one of the 
          detailled step-by-step tutorials. Use the programming language and framework of your choice!
        </p>
        <div className="preview">
          <img
            src={require('../../assets/graphics/hackernews-preview.png')}
            alt=""
          />
          <div className="points">
            <div className="point">
              <Checkmark />
              <p>Learn about best practices</p>
            </div>
            <div className="point">
              <Checkmark />
              <p>Detailled instructions &amp; explanations</p>
            </div>
            <div className="point">
              <Checkmark />
              <p>From scratch to production</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
