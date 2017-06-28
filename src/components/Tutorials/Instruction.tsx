import * as React from 'react'

interface InstructionProps {
  text: string
  children?: JSX.Element
}

export default function Instruction({ text, children }: InstructionProps) {
  return (
    <div>
      <h1>Text: {text}</h1>
      {children}
    </div>
  )
}
