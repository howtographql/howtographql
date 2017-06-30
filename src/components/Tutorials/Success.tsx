import * as React from 'react'
import { MarkdownRemark } from '../../types'
import { QuizState } from '../../reducers/quiz'
import { connect } from 'react-redux'
import Markdown from './Markdown'

interface Props {
  post: MarkdownRemark
}

function Success({ post }: Props & QuizState) {
  return (
    <div>
      <h1>Success</h1>
      <Markdown html={post.html} />
    </div>
  )
}

export default connect(state => state)(Success)
