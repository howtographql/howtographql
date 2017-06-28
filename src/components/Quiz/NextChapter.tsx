import * as React from 'react'
import { Step } from '../../types'
import Link from 'gatsby-link'

interface Props {
  step: Step
}

export default function NextChapter({ step }: Props) {
  return (
    <div className="next-chapter">
      <style jsx={true}>{`
        .next-chapter {
          @p: .pa96, .flex, .justifyBetween, .itemsCenter;
        }
        .left {
          max-width: 420px;
        }
        h2 {
          @p: .f20, .fw6, .black80, .mt6;
        }
        h3 {
          @p: .black30, .f14, .ttu, .fw6;
        }
        .top {
          @p: .flex;
        }
        .top img {
          @p: .mr10, .relative;
          top: -2px;
          height: 42px;
        }
        p {
          @p: .f16, .black30, .lhCopy, .mt16;
        }
        .btn {
          @p: .mt0;
        }
      `}</style>
      <div className="left">
        <div className="top">
          <img src={require('../../assets/graphics/next-chapter.png')} alt="" />
          <div>
            <h3>Next Chapter</h3>
            <h2>
              {step.title}
            </h2>
          </div>
        </div>
        <p>
          In this chapter, we’ll start to build our own app. Choose
          your favorite technology and get started right away.
        </p>
      </div>
      <Link to={step.link}>
        <div className="btn small">
          Go to next chapter
        </div>
      </Link>
    </div>
  )
}
