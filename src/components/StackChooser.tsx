import * as React from 'react'
import { Stack, Step } from '../types'
import withWidth from './home/withWidth'
import * as cn from 'classnames'

interface Props {
  stacks: Stack[]
  selectedIndex: number
  onChangeSelectedIndex: (n: number) => void
  width?: number
  markdownFiles: { [key: string]: Step[] }
  fixedWidth?: number
  showSelectedBorder?: boolean
}

function StackChooser({
  stacks,
  selectedIndex,
  onChangeSelectedIndex,
  width = 0,
  markdownFiles,
  fixedWidth = 0,
  showSelectedBorder = false,
}: Props) {
  const widthElement = 140 + 20
  const widthElementSelected = 140 + 80

  const translateWidth = fixedWidth > 0 ? fixedWidth : width
  const translateX =
    (translateWidth || 1) / 2 -
    widthElement * selectedIndex -
    widthElementSelected / 2

  const tutorials = stacks.map(tutorial => {
    return {
      ...tutorial,
      steps: markdownFiles[tutorial.key] || tutorial.steps,
    }
  })

  return (
    <div>
      <style jsx={true}>{`
        img {
          @p: .mh6;
          height: 40px;
          width: auto;
        }
        .stacks-content {
          @p: .overflowHidden, .flex;
          height: 180px;
          align-items: center;
        }
        .stacks {
          @p: .flex;
          transition: transform 0.2s ease-out;
          align-items: center;
        }
        .stacks-item {
          @p: .tc, .pointer, .mv0, .mh10;
          transition: all 0.1s ease-out;
          user-select: none;
          width: 140px;
        }
        .stacks-item img {
          @p: .o30;
          filter: grayscale(100%);
        }
        .stacks-item p {
          @p: .mt10, .o40, .f14, .fw6;
        }
        .stacks-item.active {
          @p: .pv16, .mv0, .mh38;
          transform: scale(1.2);
        }
        .stacks-item.active.showSelectedBorder {
          @p: .ba, .bw2;
          border-color: rgb(229, 229, 229);
          border-radius: 6px;
        }
        .stacks-item.active img {
          @p: .o100;
          filter: grayscale(0%);
        }
        .stacks-item.active p {
          @p: .o100;
        }
      `}</style>
      <div className="stacks-content">
        <div
          className="stacks"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {tutorials.map((tutorial, index) =>
            <div
              className={cn('stacks-item', {
                active: selectedIndex === index,
                showSelectedBorder,
              })}
              onClick={onChangeSelectedIndex.bind(null, index)}
              key={index}
            >
              <div>
                <img src={tutorial.images[0]} />
                {tutorial.images[1] && <img src={tutorial.images[1]} />}
                <p>{tutorial.title}</p>
              </div>
            </div>,
          )}
        </div>
      </div>
    </div>
  )
}

export default withWidth<Props>()(StackChooser)
