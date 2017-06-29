import * as React from 'react'
import { Step } from '../../types'
import Checkmark from '../Checkmark'
import * as uniq from 'lodash/uniq'
import * as cn from 'classnames'
import Unlocked from './Unlocked'
import NextChapter from './NextChapter'
import { smoothScrollTo } from '../../utils/smoothScroll'

interface Props {
  question: string
  answers: string[]
  correctAnswerIndex: number
  nextChapter: Step
  n: number
  showBonus: boolean
}

interface State {
  checkedAnswerIndeces: number[]
  showNextChapter: boolean
}

export default class Quiz extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      checkedAnswerIndeces: [],
      showNextChapter: false,
    }
  }

  // reset the internal state when a site change occurs
  componentWillReceiveProps(nextProps) {
    this.setState(state => ({ ...state, showNextChapter: false }))
  }

  render() {
    const { question, answers, n, showBonus } = this.props
    const { checkedAnswerIndeces } = this.state
    const bonusChapter: Step = {
      link: '/tutorials/graphql/advanced/0-clients/',
      title: 'Clients',
    }
    return (
      <div className="quiz">
        <style jsx={true}>{`
          .quiz {
            @p: .mt60;
            margin-left: -38px;
            margin-right: -38px;
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
            @p: .mt60, .ph96, .mh38;
          }
          .answer-row {
            @p: .flex, .mt25;
          }
          .skip {
            @p: .underline, .black30, .tc, .mt38, .pointer, .mb60;
          }
          .next-chapters {
            @p: .flex, .justifyBetween;
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
          <div className="skip" onClick={this.skip}>Skip</div>
        </div>
        {this.state.showNextChapter &&
          <div>
            <Unlocked n={n} />
            <div className="next-chapters">
              {showBonus &&
                <NextChapter step={bonusChapter} isBonus={true} small={true} />}
              <NextChapter step={this.props.nextChapter} small={showBonus} />
            </div>
          </div>}
      </div>
    )
  }

  private skip = () => {
    this.setState(
      state => ({
        ...state,
        showNextChapter: true,
      }),
      this.scrollDown,
    )
  }

  private handleAnswerClick = i => {
    this.setState(state => {
      return {
        checkedAnswerIndeces: uniq(state.checkedAnswerIndeces.concat(i)),
        showNextChapter: true,
      }
    }, this.scrollDown)
  }

  private scrollDown = () => {
    setTimeout(() => {
      const container = document.getElementById('tutorials-left-container')
      if (container) {
        smoothScrollTo(container, container.scrollHeight, 300)
      }
    }, 0)
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
