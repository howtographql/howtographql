import * as React from 'react'
import { MarkdownRemark } from '../../types'
import { getAuthorByGroup } from '../../utils/getAuthorByGroup'

interface Props {
  post: MarkdownRemark
  group: string
}

export default function Author({ post, group }: Props) {
  const author = getAuthorByGroup(group)

  if (!author) {
    return null
  }

  return (
    <div className="author-wrapper">
      <style jsx={true}>{`
        .author-wrapper {
          @p: .bb, .bBlack10, .bw2;
          background-color: #f9f9f9;
          padding: 31px;
        }
        .author {
          @p: .center, .flex, .justifyBetween, .itemsCenter;
          max-width: 747px;
        }
        .img {
          @p: .overflowHidden, .flex, .itemsCenter, .justifyCenter, .br100;
          width: 98px;
          height: 98px;
        }
        .img img {
          height: auto;
          width: 100%;
        }
        .left {
          @p: .flex, .itemsCenter;
        }
        .info {
          @p: .ml25;
        }
        .written-by {
          @p: .f14, .ttu, .black30, .fw6;
        }
        .job {
          @p: .f14, .black30, .fw6, .mt6;
        }
        p {
          @p: .lhCopy, .f16, .black50;
          max-width: 369px;
        }
        .name {
          @p: .f25, .fw6, .mt10, .black, .dib;
        }
      `}</style>
      <div className="author">
        <div className="left">
          <a className="img" href={author.link} target="_blank">
            <img src={author.avatar} alt={author.name} />
          </a>
          <div className="info">
            <div className="written-by">Written By</div>
            <a className="name" href={author.link} target="_blank">
              {author.name}
            </a>
            <div className="job">{author.job}</div>
          </div>
        </div>
        <p>
          {author.bio}
        </p>
      </div>
    </div>
  )
}
