import * as React from 'react'
import * as cn from 'classnames'

interface InstructionProps {
  text: string
  children?: JSX.Element
}

export default function Instruction({ text, ...props }: InstructionProps) {
  const children: React.ReactChild[] = React.Children.toArray(props.children)

  const filteredChildren: any[] = children.filter((c: any) => {
    if (c.type) {
      return ['DIV', 'P'].includes(c.type)
    }
    return false
  })
  // only one p child
  if (filteredChildren.length === 1 && filteredChildren[0].type === 'P') {
    return (
      <div className="instruction-block">
        <style jsx={true}>{`
          .instruction-block {
            @p: .mt16, .mb10;
          }
        `}</style>
        <DottedElement>{filteredChildren[0]}</DottedElement>
      </div>
    )
  }

  if (
    filteredChildren.length ===
    filteredChildren.filter(c => c.type === 'P').length
  ) {
    return (
      <div className="instruction-block">
        <style jsx={true}>{`
          .instruction-block {
            @p: .mv38;
          }
          .instructions {
            @p: .pl25, .blue;
          }
        `}</style>
        <Bordered>
          <div style={{ height: 16 }} />
        </Bordered>
        <DottedElement>{filteredChildren[0]}</DottedElement>
        <Bordered>
          <div className="instructions">
            {filteredChildren
              .slice(1, filteredChildren.length)
              .map(child => child)}
          </div>
        </Bordered>
      </div>
    )
  }
  if (
    filteredChildren[0].type === 'P' &&
    ['PRE', 'DIV'].includes(filteredChildren[1].type) &&
    filteredChildren.length === 2
  ) {
    return (
      <div className="instruction-block">
        <style jsx={true}>{`
          .instruction-block {
            @p: .mv38, .relative;
          }
          .instruction-code {
            @p: .pl25, .pt25;
            padding-bottom: 1px;
          }
          .instruction-code :global(.pre-container) {
            margin-top: 0 !important;
          }
        `}</style>
        <Bordered>
          <div style={{ height: 16 }} />
        </Bordered>
        <DottedElement>{filteredChildren[0]}</DottedElement>
        <Bordered absolute={true}>
          <div className="instruction-code">
            {filteredChildren[1]}
          </div>
        </Bordered>
      </div>
    )
  }
  return (
    <div className="instruction-block">
      <style jsx={true}>{`
        .instruction-block {
          @p: .mv38;
        }
      `}</style>
      {children}
    </div>
  )
}

interface BorderedProps {
  children?: JSX.Element
  absolute?: boolean
}

function Bordered({ children, absolute = false }: BorderedProps) {
  return (
    <div className={cn("bordered", {absolute})}>
      <style jsx={true}>{`
        .bordered {
          @p: .relative;
        }
        .bordered.absolute {
          @p: .static;
        }
        .bordered:before {
          content: "";
          @p: .absolute, .bgBlue, .top0, .bottom0;
          left: 3px;
          border-radius: 2px;
          width: 4px;
        }
        .bordered.absolute:before {
          top: 40px;
        }
      `}</style>
      {children}
    </div>
  )
}

interface DottedElementProps {
  children?: JSX.Element
}

function DottedElement({ children }: DottedElementProps) {
  return (
    <div className="dotted-element">
      <style jsx={true}>{`
        .dotted-element {
          @p: .relative, .flex, .itemsStart;
        }
        .dotted-element:before {
          @p: .absolute, .br100, .bgBlue, .left0;
          top: 7px;
          width: 10px;
          height: 10px;
          content: "";
        }
        .dotted-element-content {
          @p: .pl25, .blue;
        }
        .dotted-element-content :global(p) {
          @p: .mt0;
        }
        .dotted-element :global(a) {
          @p: .underline, .fw6;
        }
      `}</style>
      <div className="dotted-element-content">
        {children}
      </div>
    </div>
  )
}
