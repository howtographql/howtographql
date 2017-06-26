import * as React from 'react'
import JsxParser from 'react-jsx-parser'

export default function Markdown({ html }: { html: string }) {
  return (
    <div className="markdown">
      <style jsx={true} global={true}>{`
        .markdown {
          @p: .lhCopy;
        }
        .markdown h1, .markdown h2, .markdown h3, .markdown h4 {
          @p: .lhTitle, .darkBlue, .fw6;
        }
        .markdown h1 {
          @p: .f38, .mb25;
        }
        .markdown h2 {
          @p: .f25, .fw7;
        }
        .markdown h3 {
          @p: .f20, .fw7;
          margin-top: 30px;
        }
        .markdown h2 {
          margin-top: 48px; /* 2x mt38 due to vertical line */
        }
        .markdown h4 {
          @p: .fw7;
          margin-top: 20px;
        }
        .markdown p {
          @p: .f16, .black;
        }
        .markdown p, .markdown ul {
          @p: .mt16;
        }
        .markdown pre {
          @p: .mt38,
            .bDarkBlue10,
            .ba,
            .br2,
            .pa16,
            .bgDarkBlue04,
            .overflowAuto;
        }
        .markdown img {
          max-width: 600px;
        }
        .fl {
          @p: .flex;
        }
      `}</style>
      <JsxParser
        jsx={`<div>${html}</div>`}
        components={{}}
        showWarnings={true}
      />
    </div>
  )
}
/*<div dangerouslySetInnerHTML={{ __html: post.html }} />*/
