import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  title: string
  pinkLine: boolean
}

export default function TutorialTitleStep({ title, pinkLine }: Props) {
  return (
    <div className={cn('tutorial-title-step', { pinkLine })}>
      <style jsx={true}>{`
        .tutorial-title-step {
          @p: .bl, .bBlack20, .pb25, .pl25, .relative, .bw2;
        }
        .tutorial-title-step.pinkLine {
          border-color: $pink;
        }
        h3 {
          @p: .black30, .f14, .ttu, .fw6, .mb25, .tracked;
        }
      `}</style>
      <h3>{title} Tutorial</h3>
    </div>
  )
}
