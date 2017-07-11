import * as React from 'react'
import { Step } from '../../types'
import Checkmark from '../Checkmark'
import * as cn from 'classnames'
import Unlocked from './Unlocked'
import NextChapter from './NextChapter'
import { smoothScrollTo } from '../../utils/smoothScroll'
import RememberDecision from './RememberDecision'
import { connect } from 'react-redux'
import { defaultReaction, QuizState } from '../../reducers/quiz'
import {
  addAnswer,
  answerCorrectly,
  setRememberSkipped,
  skip,
} from '../../actions/quiz'

interface Props {
  question?: string
  answers?: string[]
  correctAnswerIndex?: number
  path: string
  nextChapter: Step
  n: number
  showBonus: boolean
  setRememberSkipped: (value: boolean) => void
  skip: (path: string) => void
  addAnswer: (path: string, answer: number) => void
  answerCorrectly: (path: string) => void
}

class Quiz extends React.Component<Props & QuizState, {}> {
  render() {
    const {
      question,
      answers,
      n,
      showBonus,
      path,
      correctAnswerIndex,
      rememberSkipped,
    } = this.props
    const reaction = this.props.quizReactions[path] || defaultReaction
    const { skipped, answeredCorrectly } = reaction
    const answerIndeces = reaction.answerIndeces || []

    const bonusChapter: Step = {
      description: `In this chapter, you'll learn about the core concepts of GraphQL clients and the abstractions and functionalities they provide`,
      link: '/advanced/0-clients/',
      title: 'Clients',
    }

    const hasQuestion = Boolean(question) && !skipped
    const showNextChapter =
      skipped || answeredCorrectly || rememberSkipped || !hasQuestion
    const showUnlock = !rememberSkipped
    const showQuestion = !rememberSkipped && !skipped

    return (
      <div className={cn('quiz', { hasQuestion })}>
        <style jsx={true}>{`
          .quiz {
          }
          .quiz.hasQuestion {
            @p: .mt60;
          }
          .quiz:not(.hasQuestion) :global(.next-chapter) {
            @p: .pt38;
          }
          .quiz-title {
            @p: .relative, .flex, .itemsCenter, .justifyCenter;
          }
          .quiz-title::before {
            @p: .absolute, .left0, .right0, .bb, .bBlack10, .bw2;
            top: 6px;
            content: "";
          }
          .quiz-title .title {
            @p: .pink, .bgWhite, .ph10, .f14, .fw6, .z2, .ttu, .tracked;
          }
          .question {
            @p: .tc, .fw6, .mt38, .lhTitle, .center;
            max-width: 800px;
            font-size: 30px;
          }
          .answers {
            @p: .mt60, .mh96;
          }
          .center-container {
            @p: .center;
            max-width: 924px;
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
          @media (max-width: 580px) {
            div.answer-row {
              @p: .db, .mt0;
            }
            div.quiz-title {
              @p: .justifyStart;
            }
            div.quiz-title .title {
              margin-left: 21px;
            }
            div.question {
              @p: .ph25, .f20, .tl;
            }
            div.answers {
              @p: .mh25, .mt38;
            }
            div.next-chapters {
              @p: .db;
            }
          }
        `}</style>
        {question &&
          showQuestion &&
          <div className="quiz-title">
            <div className="title">Unlock the next chapter</div>
          </div>}
        {question && showQuestion && <div className="question">{question}</div>}
        {answers &&
          answers.length === 4 &&
          showQuestion &&
          <div className="center-container">
            <div className="answers">
              <div className="answer-row">
                <Answer
                  text={answers[0]}
                  onClick={this.handleAnswerClick.bind(this, 0)}
                  checked={answerIndeces.includes(0)}
                  correct={correctAnswerIndex === 0}
                />
                <Answer
                  text={answers[1]}
                  onClick={this.handleAnswerClick.bind(this, 1)}
                  checked={answerIndeces.includes(1)}
                  correct={correctAnswerIndex === 1}
                />
              </div>
              <div className="answer-row">
                <Answer
                  text={answers[2]}
                  onClick={this.handleAnswerClick.bind(this, 2)}
                  checked={answerIndeces.includes(2)}
                  correct={correctAnswerIndex === 2}
                />
                <Answer
                  text={answers[3]}
                  onClick={this.handleAnswerClick.bind(this, 3)}
                  checked={answerIndeces.includes(3)}
                  correct={correctAnswerIndex === 3}
                />
              </div>
              {!answeredCorrectly &&
                <div className="skip" onClick={this.skip}>Skip</div>}
            </div>
          </div>}
        {showNextChapter &&
          <div>
            {!skipped && question && showUnlock && <Unlocked n={n} />}
            <div className="center-container">
              <div className="next-chapters">
                <NextChapter
                  step={this.props.nextChapter}
                  small={showBonus}
                  onClick={this.autoSkip}
                />
                {showBonus &&
                  <NextChapter
                    step={bonusChapter}
                    isBonus={true}
                    small={true}
                    onClick={this.autoSkip}
                  />}
              </div>
            </div>
          </div>}
        {(skipped || rememberSkipped) &&
          <RememberDecision
            onChangeRemember={this.toggleRememberSkip}
            remember={this.props.rememberSkipped}
          />}
      </div>
    )
  }

  private toggleRememberSkip = () => {
    this.props.setRememberSkipped(!this.props.rememberSkipped)
  }

  private autoSkip = () => {
    if (this.props.rememberSkipped) {
      this.props.skip(this.props.path)
    }
  }

  private skip = () => {
    this.props.skip(this.props.path)
    this.scrollDown()
  }

  private handleAnswerClick = i => {
    const { path } = this.props
    this.props.addAnswer(path, i)
    if (this.props.correctAnswerIndex === i) {
      this.props.answerCorrectly(path)
      this.scrollDown()
    }
  }

  private scrollDown = () => {
    setTimeout(() => {
      const container = document.getElementById('tutorials-left-container')
      if (container) {
        smoothScrollTo(container, container.scrollHeight, 600)
      }
    }, 0)
  }
}

interface AnswerProps {
  text: string
  onClick: () => void
  checked: boolean
  correct: boolean
}

function Answer({ text, onClick, checked, correct }: AnswerProps) {
  return (
    <div className={cn('answer', { checked, correct })} onClick={onClick}>
      <style jsx={true}>{`
        .answer {
          @p: .flex, .itemsStart, .w50, .pointer, .lhCopy;
        }
        .answer + .answer {
          @p: .ml25;
        }
        span {
          @p: .ml16, .black50, .f16;
        }
        .answer.checked.correct span {
          @p: .pink;
        }
        .answer.checked:not(.correct) span {
          @p: .strike, .black20;
        } /* avoids jumping of content when toggled */
        .checkmark {
          @p: .relative;
          top: 2px;
          width: 24px;
          height: 24px;
        }
        @media (max-width: 580px) {
          div.answer {
            @p: .mt25, .w100;
          }
          div.answer span {
            @p: .ml10;
          }
          div.answer + div.answer {
            @p: .ml0;
          }
        }
      `}</style>
      <div className="checkmark">
        <Checkmark checked={checked && correct} crossed={checked && !correct} />
      </div>
      <span>{text}</span>
    </div>
  )
}

export default connect(state => state.quiz, {
  addAnswer,
  answerCorrectly,
  setRememberSkipped,
  skip,
})(Quiz)
