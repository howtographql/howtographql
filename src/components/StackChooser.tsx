import * as React from 'react'
import { Stack, Step } from '../types'
import withWidth from './home/withWidth'
import * as cn from 'classnames'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import SwipeableViews from 'react-swipeable-views'

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
  // const widthElement = 140 + 20
  // const widthElementSelected = 140 + 80
  //
  // const translateWidth = (fixedWidth > 0 ? fixedWidth : width) || 1
  // const translateX =
  //   translateWidth / 2 - widthElement * selectedIndex - widthElementSelected / 2

  const tutorials = stacks.map(tutorial => {
    return {
      ...tutorial,
      steps: markdownFiles[tutorial.key],
    }
  })

  return (
    <div className="stack-chooser">
      <style jsx={true}>{`
        .stack-chooser {
          @p: .overflowHidden;
        }
        .stacks-content {
          @p: .flex, .center, .relative;
          left: 4px;
          max-width: 200px;
          height: 180px;
          align-items: center;
        }
        div :global(.stacks) {
          @p: .flex;
          transition: transform 0.2s ease-out;
          align-items: center;
        }
        .stacks-item {
          @p: .tc, .pointer, .center, .mt25;
          transition: all 0.1s ease-out;
          user-select: none;
          width: 140px;
        }
        .stacks-item:not(.active) {
          margin-top: 36px;
        }
        .stacks-item :global(i), .stacks-item img {
          @p: .o30;
          filter: grayscale(100%) brightness(200%);
        }
        .stacks-item img {
          @p: .mv0;
          max-width: 128px;
        }
        .stacks-item p {
          @p: .mt10, .o40, .f14, .fw6;
        }
        .stacks-item.active {
          @p: .pv16;
          transform: scale(1.2);
        }
        .stacks-item.active.showSelectedBorder {
          @p: .ba, .bw2;
          border-color: rgb(229, 229, 229);
          border-radius: 6px;
        }
        .stacks-item.active :global(i), .stacks-item.active img {
          @p: .o100;
          filter: grayscale(0%);
        }
        .stacks-item.active p {
          @p: .o100;
        }
        .logos {
          @p: .flex, .justifyCenter;
        }
        .logos :global(i) + :global(i),
        .logos :global(i) + :global(img),
        .logos :global(img) + :global(i) {
          @p: .ml10, .mv0;
        }
        .beginners-choice {
          @p: .f10, .fw6, .ttu, .tc, .mt10, .tracked;
          color: #459BF2;
        }
        img {
          width: auto;
          height: 50px;
        }
        .coming-soon {
          @p: .ttu, .br2, .ba, .dib, .relative, .fw6, .mt10;
          color: $pink;
          border-color: $pink;
          font-size: 10px;
          padding: 3px 7px;
        }
      `}</style>
      <div className="stacks-content">
        <SwipeableViews
          enableMouseEvents={true}
          style={{
            overflow: 'visible',
            width: 190,
          }}
          slideStyle={{
            height: 200,
          }}
          index={selectedIndex}
          onChangeIndex={onChangeSelectedIndex}
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
              <div className="logos">
                {tutorial.images[0].endsWith('.png') ||
                  tutorial.images[0].endsWith('.svg')
                  ? <img
                      src={tutorial.images[0]}
                      alt=""
                      className={cn({
                        darken: tutorial.darkenGreyLogo,
                        lighten: tutorial.lightenLogo,
                      })}
                    />
                  : <Icon
                      src={tutorial.images[0]}
                      width={50}
                      height={50}
                      color={tutorial.color1 || 'black'}
                    />}
                {tutorial.images[1] &&
                  <Icon
                    src={tutorial.images[1]}
                    width={50}
                    height={50}
                    color={tutorial.color2 || 'black'}
                    className={cn({ lighten: tutorial.lightenLogo })}
                  />}
              </div>
              <p>{tutorial.title}</p>
              {tutorial.comingSoon &&
                <div className="coming-soon">Coming Soon</div>}
              {tutorial.beginnersChoice &&
                <div className="beginners-choice">Beginners's Choice</div>}
            </div>,
          )}
        </SwipeableViews>
      </div>
    </div>
  )
}

export default withWidth<Props>()(StackChooser)
