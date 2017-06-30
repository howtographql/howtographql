import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import Video from './Video'
import { extractGroup } from '../../utils/graphql'
import authors from '../../data/authors'
import Markdown from './Markdown'
import TutorialChooser from './TutorialChooser'
import Author from './Author'
import Quiz from '../Quiz/Quiz'

interface Props {
  post: MarkdownRemark
  location: any
  steps: { [key: string]: Step[] }
}

export default function Chapter({ post, location, steps }: Props) {
  const group = extractGroup(location.pathname)
  const stack = steps[group]
  const n = stack.findIndex(step => step.link === location.pathname)
  const isTutorialChooser = location.pathname.includes('/choose')
  const showAuthor =
    n < 2 && !isTutorialChooser && !['basics', 'advanced'].includes(group)
  const videoAuthor = showAuthor
    ? post.frontmatter.videoAuthor
      ? authors[post.frontmatter.videoAuthor]
      : null
    : null
  let nextChapter = stack[n + 1]
  if (!nextChapter) {
    if (group === 'basics' || group === 'advanced') {
      nextChapter = {
        description: 'In this step we will choose the right tutorial together.',
        link: '/tutorials/choose',
        title: 'Choosing the right tutorial',
      }
    }
  }
  const showBonus = location.pathname.startsWith(
    '/tutorials/graphql/basics/3-big-picture',
  )
  return (
    <div>
      <style jsx={true}>{`
        .content {
          @p: .ph38, .pt38, .bbox;
        }
        .left {
          @p: .center;
          max-width: 924px;
          min-height: calc(100vh - 72px - 220px);
        }
        h1 {
          @p: .f38;
        }
      `}</style>
      {post.frontmatter.videoId &&
        <Video videoId={post.frontmatter.videoId} author={videoAuthor} />}
      {showAuthor && <Author post={post} group={group} />}
      <div className="left">
        <div className="content">
          <h1>{post.frontmatter.title}</h1>
          <Markdown html={post.html} />
          {isTutorialChooser
            ? <TutorialChooser markdownFiles={steps} />
            : nextChapter &&
                <Quiz
                  question={post.frontmatter.question}
                  answers={post.frontmatter.answers}
                  correctAnswerIndex={post.frontmatter.correctAnswer}
                  nextChapter={nextChapter}
                  n={n + 1}
                  showBonus={showBonus}
                  path={location.pathname}
                />}
        </div>
      </div>
    </div>
  )
}
