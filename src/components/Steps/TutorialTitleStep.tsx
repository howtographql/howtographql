import * as React from 'react'

interface Props {
  title: string
}

export default function TutorialTitleStep({ title }: Props) {
  return (
    <div className="tutorial-title-step">
      <style jsx={true}>{`
        .tutorial-title-step {
          @p: .bl, .bBlack20, .pb25, .pl25, .relative, .bw2;
        }
        h3 {
          @p: .black30, .f14, .ttu, .fw6, .mb25, .tracked;
        }
      `}</style>
      <h3>{title} Tutorial</h3>
    </div>
  )
}
