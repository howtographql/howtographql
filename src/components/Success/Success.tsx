import * as React from 'react'
import { MarkdownRemark, Step } from '../../types'
import Markdown from '../Tutorials/Markdown'
import Result from './Result'
import Share from './Share'
import CheckoutGraphcool from './CheckoutGraphcool'
import CustomHelmet from '../CustomHelmet'

interface Props {
  post: MarkdownRemark
  steps: { [key: string]: Step[] }
}

export default function Success({ post, steps }: Props) {
  return (
    <div>
      <style jsx={true}>{`
        h1 {
          @p: .fw6, .mb60;
        }
        .content {
          @p: .pa60;
        }
        @media (max-width: 580px) {
          div.content {
            @p: .pa25;
          }
        }
      `}</style>
      <CustomHelmet
        title="It was great having you!"
        description="We hope you enjoyed going through this tutorial and learning about GraphQL. We believe that GraphQL will fundamentally change the way how we build applications and want to create an active community around it and are happy to welcome you as a new member! 🙌"
      />
      <Result steps={steps} />
      <Share />
      <div className="content">
        <h1>{post.frontmatter.title}</h1>
        <Markdown html={post.html} steps={steps} />
      </div>
      <CheckoutGraphcool />
    </div>
  )
}
