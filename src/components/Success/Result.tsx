import * as React from 'react'
import * as cn from 'classnames'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

export default function Result() {
  return (
    <div className="result">
      <style jsx={true}>{`
        .result {
          @p: .pa60, .relative, .overflowHidden;
          background: #f9f9f9;
        }
        .medal {
          @p: .absolute;
          top: -70px;
          right: 60px;
        }
        h1 {
          @p: .fw6, .pink;
          font-size: 30px;
        }
        p {
          @p: .f16, .lhCopy, .black50, .mt16;
          max-width: 514px;
        }
        .bars {
          @p: .mt60, .flex;
        }
      `}</style>
      <div className="medal">
        <Icon
          src={require('../../assets/icons/success-badge.svg')}
          color={'rgba(0,0,0,.05)'}
          width={212}
          height={339}
        />
      </div>
      <h1>
        You did better than 89% — Congrats
      </h1>
      <p>
        You concluded 11 of 15 chapters. That’s impressive. Only 4 chapters
        left to compete with the very best. If you liked the tutorial, a Github
        star would be nice.
      </p>
      <div className="bars">
        <Bar items={[true, false, true]} title="Basics" />
        <Bar
          items={[
            true,
            false,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
          ]}
          title="React + Apollo"
        />
      </div>
    </div>
  )
}

interface BarProps {
  items: boolean[]
  title: string
}

function Bar({ items, title }: BarProps) {
  const doneCount = items.reduce((total, curr) => (curr ? total + 1 : total), 0)
  const totalCount = items.length
  return (
    <div className="bar">
      <style jsx={true}>{`
        .bar + .bar {
          @p: .ml25;
        }
        .cells {
          @p: .flex;
        }
        .cell {
          @p: .bgPink20;
          border-radius: 4px;
          width: 37px;
          height: 8px;
        }
        .cell.done {
          @p: .bgPink;
        }
        .cell + .cell {
          @p: .ml4;
        }
        .label {
          @p: .f12, .fw6, .pink70, .ttu, .mt16;
        }
      `}</style>
      <div className="cells">
        {items.map((item, i) =>
          <div className={cn('cell', { done: item })} key={i} />,
        )}
      </div>
      <div className="label">
        {title} ({doneCount}/{totalCount})
      </div>
    </div>
  )
}
