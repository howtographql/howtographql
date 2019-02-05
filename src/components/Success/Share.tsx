import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

export default function Share() {
  return (
    <div className="share">
      <style jsx={true}>{`
        .share {
          @p: .bt, .bb, .bBlack10, .bw2, .flex;
        }
        .block {
          @p: .pa60, .w50;
        }
        .left {
          background: #F7F7F7;
        }
        .right {
          @p: .bl, .bBlack10, .bw2;
          background: #FAFAFA;
        }
        h2 {
          @p: .f20, .black80, .f16;
        }
        p {
          @p: .f16, .black50, .mt16, .mb25;
        }
        .button {
          @p: .ba, .pointer, .inlineFlex, .itemsCenter;
          padding: 10px 14px 11px;
          border-radius: 6px;
        }
        .button span {
          @p: .ml6, .fw6, .f16;
        }
        .button.gh {
          @p: .black;
          border-color: rgba(0, 0, 0, .15);
        }
        .button.twitter {
          color: rgb(29, 161, 242);
          border-color: rgba(29, 161, 242, 0.3);
        }
        @media (max-width: 580px) {
          div.share {
            @p: .db;
          }
          div.block {
            @p: .w100, .bbox, .pa25;
          }
          div.block + div.block {
            @p: .bt, .bw2, .bBlack10;
            border-left: none;
          }
        }
      `}</style>
      <div className="block left">
        <h2>Star us on Github</h2>
        <p>We're open-source and would love your support.</p>
        <a
          className="button gh"
          href="https://github.com/howtographql/howtographql"
          target="_blank"
        >
          <Icon
            src={require('graphcool-styles/icons/fill/github.svg')}
            width={20}
            height={20}
          />
          <span>Star on Github</span>
        </a>
      </div>
      <div className="block right">
        <h2>Share it on Twitter</h2>
        <p>Share this tutorial with your friends.</p>
        <a
          className="button twitter"
          href="https://twitter.com/intent/tweet?text=I%20just%20finished%20the%20How%20to%20GraphQL%20tutorial%20by%20@prisma%20%20🎉%20Check%20it%20out%20on%20howtographql.com"
         target="_blank"
        >
          <Icon
            src={require('graphcool-styles/icons/fill/twitter.svg')}
            width={20}
            height={20}
          />
          <span>
            Post on Twitter
          </span>
        </a>
      </div>
    </div>
  )
}
