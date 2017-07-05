import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import Video from './Video'
import { extractGroup } from '../../utils/graphql'
import authors from '../../data/authors'
import Markdown from './Markdown'
import Author from './Author'
import Quiz from '../Quiz/Quiz'
import EditOnGithub from '../EditOnGithub'
import { getStackName } from '../../utils/getStackName'
import { Helmet } from 'react-helmet'

interface Props {
  post: MarkdownRemark
  location: any
  steps: { [key: string]: Step[] }
}

export default function Chapter({ post, location, steps }: Props) {
  const group = extractGroup(location.pathname)
  const stack = steps[group] || []
  const n = stack.findIndex(step => step.link === location.pathname)
  const isTutorialChooser = location.pathname.includes('/choose')
  const showAuthor =
    n < 2 && !isTutorialChooser && !['basics', 'advanced'].includes(group)
  const videoAuthor = showAuthor
    ? post.frontmatter.videoAuthor
      ? authors[post.frontmatter.videoAuthor]
      : null
    : null
  const autoplay = location.search.includes('autoplay')
  let nextChapter = stack[n + 1]
  if (!nextChapter) {
    if (group === 'basics' || group === 'advanced') {
      nextChapter = {
        description: 'In this step we will choose the right tutorial together.',
        link: '/tutorials/choose',
        title: 'Choosing the right tutorial',
      }
    } else {
      if (stack.length - 1 === n) {
        nextChapter = {
          description:
            "We're proud that you finished this tutorial! Let's celebrate your success",
          link: '/tutorials/success',
          title: 'You did it!',
        }
      }
    }
  }
  const showBonus = location.pathname.startsWith(
    '/tutorials/graphql/basics/3-big-picture',
  )
  const title = getTitle(group, post)
  const description = post.excerpt
  const image = '/social.png'

  return (
    <div>
      <Helmet
        title={title}
        meta={[
          { name: 'description', content: title },
          { property: 'og:type', content: 'article' },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:image', content: image },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image', content: image },
        ]}
      />
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
          @p: .f38, .fw6, .mb38, .mt16;
        }
      `}</style>
      {post.frontmatter.videoId &&
        <Video
          videoId={post.frontmatter.videoId}
          author={videoAuthor}
          autoplay={autoplay}
        />}
      {showAuthor && <Author post={post} group={group} />}
      <div className="left">
        <div className="content">
          <h1>{post.frontmatter.title}</h1>
          <Markdown html={post.html} steps={steps} />
        </div>
      </div>
      {!isTutorialChooser &&
        nextChapter &&
        <Quiz
          question={post.frontmatter.question}
          answers={post.frontmatter.answers}
          correctAnswerIndex={post.frontmatter.correctAnswer}
          nextChapter={nextChapter}
          n={n + 1}
          showBonus={showBonus}
          path={location.pathname}
        />}
      <EditOnGithub post={post} />
    </div>
  )
}

function getTitle(group: string, post: MarkdownRemark) {
  const stackName = getStackName(group)
  const stackPrefix = stackName ? `${stackName} - ` : ''
  return stackPrefix + post.frontmatter.title
}
