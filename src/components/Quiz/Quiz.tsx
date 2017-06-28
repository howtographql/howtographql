import * as React from 'react'
import { Step } from '../../types'
import Checkmark from '../Checkmark'
import * as uniq from 'lodash/uniq'
import * as cn from 'classnames'

interface Props {
  question: string
  answers: string[]
  correctAnswerIndex: number
  nextChapter: Step
}

interface State {
  checkedAnswerIndeces: number[]
}

export default class Quiz extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      checkedAnswerIndeces: [],
    }
  }

  render() {
    const { question, answers } = this.props
    const { checkedAnswerIndeces } = this.state
    return (
      <div className="quiz">
        <style jsx={true}>{`
          .quiz {
            @p: .mt60, .mb38;
          }
          .quiz-title {
            @p: .relative, .flex, .itemsCenter, .justifyCenter;
          }
          .quiz-title::before {
            @p: .absolute, .left0, .right0, .bb, .bBlack10, .bw2;
            content: "";
          }
          .quiz-title .title {
            @p: .pink, .bgWhite, .ph10, .f14, .fw6, .z2;
          }
          .question {
            @p: .tc, .fw6, .mt38;
            font-size: 30px;
          }
          .answers {
            @p: .mt60;
          }
          .answer-row {
            @p: .flex, .mt25;
          }
        `}</style>
        <div className="quiz-title">
          <div className="title">Unlock the next chapter</div>
        </div>
        <div className="question">{question}</div>
        <div className="answers">
          <div className="answer-row">
            <Answer
              text={answers[0]}
              onClick={this.handleAnswerClick.bind(this, 0)}
              checked={checkedAnswerIndeces.includes(0)}
            />
            <Answer
              text={answers[1]}
              onClick={this.handleAnswerClick.bind(this, 1)}
              checked={checkedAnswerIndeces.includes(1)}
            />
          </div>
          <div className="answer-row">
            <Answer
              text={answers[2]}
              onClick={this.handleAnswerClick.bind(this, 2)}
              checked={checkedAnswerIndeces.includes(2)}
            />
            <Answer
              text={answers[3]}
              onClick={this.handleAnswerClick.bind(this, 3)}
              checked={checkedAnswerIndeces.includes(3)}
            />
          </div>
        </div>
      </div>
    )
  }

  private handleAnswerClick = i => {
    this.setState(state => {
      return {
        ...state,
        checkedAnswerIndeces: uniq(state.checkedAnswerIndeces.concat(i)),
      }
    })
  }
}

interface AnswerProps {
  text: string
  onClick: () => void
  checked: boolean
}

function Answer({ text, onClick, checked }: AnswerProps) {
  return (
    <div className={cn('answer', { checked })} onClick={onClick}>
      <style jsx={true}>{`
        .answer {
          @p: .flex, .itemsCenter, .w50, .pointer;
        }
        span {
          @p: .ml16, .black50, .f16;
        }
        .answer.checked span {
          @p: .pink;
        }
      `}</style>
      <Checkmark checked={checked} />
      <span>{text}</span>
    </div>
  )
}
