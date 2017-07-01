import * as React from 'react'
import * as cn from 'classnames'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { connect } from 'react-redux'
import { QuizReaction, /*QuizReaction,*/ QuizState } from '../../reducers/quiz'
import * as groupBy from 'lodash/groupBy'
import * as map from 'lodash/map'
import * as values from 'lodash/values'
import { Step } from '../../types'
import { extractGroup } from '../../utils/graphql'
import { getStackName } from '../../utils/getStackName'
import Link from 'gatsby-link'

interface Props {
  steps: { [key: string]: Step[] }
}

interface GroupScore {
  group: string
  scores: ScoreStep[]
}

interface ScoreStep {
  path: string
  score: number
}

function Result({ steps, ...state }: Props & QuizState) {
  const filteredReactions = Object.keys(state.quizReactions)
    .map(path => {
      const reaction = state.quizReactions[path]
      return { ...reaction, path }
    })
    .filter(
      (reaction: QuizReaction) =>
        reaction.answerIndeces && reaction.answerIndeces.length > 0,
    )

  const groupedReactions = groupBy(filteredReactions, reaction =>
    extractGroup(reaction.path),
  )

  const groupScores: GroupScore[] = map(
    groupedReactions,
    (reactions: QuizReaction[], group: string) => {
      const groupSteps = steps[group]
      const scores = groupSteps.map(step => {
        const reaction = state.quizReactions[step.link]
        if (reaction) {
          const score = reaction.answeredCorrectly && reaction.answerIndeces
            ? 5 - reaction.answerIndeces.length
            : 0
          return { score, path: step.link }
        }
        return { score: 0, path: step.link }
      })

      return {
        group,
        scores,
      }
    },
  )

  const totalChapters = values(groupScores).reduce(
    (acc, curr) => acc + curr.scores.length,
    0,
  )
  const doneChapters = values(groupScores).reduce(
    (acc, curr) => acc + curr.scores.filter(step => step.score > 0).length,
    0,
  )
  const totalScore = totalChapters * 4
  const achievedScore = values(groupScores).reduce(
    (acc, curr) =>
      acc +
      curr.scores
        .map(step => step.score)
        .reduce((acc2, curr2) => acc2 + curr2, 0),
    0,
  )

  // _.map over object

  // CONTINUE HERE
  // console.log(steps)
  // Object.keys(steps).filter(group => reactions[group])

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
        You achieved a score of {Math.round(achievedScore / totalScore * 100)}%
        — Congrats
      </h1>
      <p>
        You concluded {doneChapters} of {totalChapters} chapters. That’s
        impressive.
        Only {totalChapters - doneChapters} chapters left to compete with the
        very best.
        If you liked the tutorial, a Github star would be nice.
      </p>
      <div className="bars">
        {groupScores.map(groupScore =>
          <Bar
            key={groupScore.group}
            items={groupScore.scores}
            title={getStackName(groupScore.group) || 'No Title'}
          />,
        )}
      </div>
    </div>
  )
}

export default connect(state => state)(Result)

interface BarProps {
  items: ScoreStep[]
  title: string
}

function Bar({ items, title }: BarProps) {
  const doneCount = items.reduce(
    (total, curr) => (curr.score > 0 ? total + 1 : total),
    0,
  )
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
          border-radius: 4px;
          width: 37px;
          height: 8px;
        }
        .cell {
          @p: .mr4;
        }
        .label {
          @p: .f12, .fw6, .pink70, .ttu, .mt16;
        }
        .l-0 {
          @p: .ba;
          border-color: rgba(0, 0, 0, .15);
        }
        .l-1 {
          @p: .bgPink40;
        }
        .l-2 {
          @p: .bgPink60;
        }
        .l-3 {
          @p: .bgPink80;
        }
        .l-4 {
          @p: .bgPink;
        }
      `}</style>
      <div className="cells">
        {items.map((item, i) =>
          <Link to={item.path}>
            <div className={cn('cell', `l-${item.score}`)} key={i} />
          </Link>,
        )}
      </div>
      <div className="label">
        {title} ({doneCount}/{totalCount})
      </div>
    </div>
  )
}
