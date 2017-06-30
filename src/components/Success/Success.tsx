import * as React from 'react'
import { MarkdownRemark } from '../../types'
import { QuizState } from '../../reducers/quiz'
import { connect } from 'react-redux'
import Markdown from '../Tutorials/Markdown'
import Result from './Result'
import Share from './Share'
import CheckoutGraphcool from './CheckoutGraphcool'

interface Props {
  post: MarkdownRemark
}

function Success({ post }: Props & QuizState) {
  return (
    <div>
      <style jsx={true}>{`
        h1 {
          @p: .fw6, .mb60;
        }
        .content {
          @p: .pa60;
        }
      `}</style>
      <Result />
      <Share />
      <div className="content">
        <h1>{post.frontmatter.title}</h1>
        <Markdown html={post.html} />
      </div>
      <CheckoutGraphcool />
    </div>
  )
}

export default connect(state => state)(Success)
