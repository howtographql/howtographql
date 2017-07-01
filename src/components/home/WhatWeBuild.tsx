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

          .point:first-child {
            @p: .mt0;
          }

          .point p {
            @p: .ml16;
          }

          @media (max-width: 500px) {
            .what-we-build {
              @p: .relative;
              padding: 0 30px;
            }

            .what-we-build:after {
              content: "";
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 100px;
              background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))
            }

            p.c {
              text-align: left!important;
            }

            div.preview {
              @p: .mt38;
              flex-direction: column-reverse;
            }

            div.preview img {
              width: 100%;
              height: auto;
              @p: .mt38;
            }
          }
        `}</style>
        <h2>What you'll build: A Hackernews clone</h2>
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
