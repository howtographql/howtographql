import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import { MarkdownRemark } from '../types'
import { extractGroup } from '../utils/graphql'
import data from '../data/stacks'

interface Props {
  post: MarkdownRemark
}

export default function EditOnGithub({ post }: Props) {
  const slug = removeTrailingSlash(post.fields.slug)
  const group = extractGroup(post.fields.slug)
  const stack = data.find(s => s.key === group)
  const stackType = stack ? stack.type : 'graphql'
  const stackTypeString = slug.includes('choose') || slug.includes('success')
    ? ''
    : `/${stackType}`
  const link = `https://github.com/howtographql/howtographql/tree/master/content${stackTypeString}${removeTrailingSlash(
    slug,
  )}.md`
  return (
    <div className="footer">
      <style jsx={true}>{`
        .footer {
          @p: .tc, .pv38, .black40, .flex, .justifyCenter;
          background-color: rgba(0, 0, 0, .03);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding-left: 30px;
          padding-right: 30px;
          line-height: 1.5;
        }
        a {
          @p: .inlineFlex, .itemsCenter, .black40;
        }
        a:hover {
          @p: .underline;
        }
        span {
          @p: .ml16, .black40;
        }
      `}</style>
      <a href={link} target="_blank">
        <Icon
          src={require('graphcool-styles/icons/fill/github.svg')}
          color={$v.gray40}
          width={24}
          height={24}
        />
        <span>Edit on Github</span>
      </a>
    </div>
  )
}

function removeTrailingSlash(str: string) {
  if (str[str.length - 1] === '/') {
    return str.slice(0, str.length - 1)
  }

  return str
}
