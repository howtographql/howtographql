import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

export default function CheckoutGraphcool() {
  return (
    <div className="checkout-graphcool">
      <style jsx={true}>{`
        .checkout-graphcool {
          @p: .pa60, .bt, .bBlack10, .bw2, .relative, .overflowHidden;
          background: #FBFBFB;
        }
        h1 {
          @p: .black80, .lhTitle, .mb25, .fw6;
          font-size: 30px;
          max-width: 400px;
        }
        p {
          @p: .f16, .black50, .lhCopy;
          max-width: 400px;
        }
        .rocket {
          @p: .absolute, .z0;
          bottom: -70px;
          left: -90px;
        }
        .btn {
          @p: .inlineFlex, .itemsCenter;
        }
        .btn span {
          @p: .ml10;
        }
        .content {
          @p: .z2, .relative, .flex, .justifyBetween;
        }
        h3 {
          @p: .f14, .fw6, .black30, .ttu, .tracked;
        }
        .left {
        }
        .right {
        }
      `}</style>
      <div className="rocket">
        <Icon
          src={require('../../assets/icons/success-rocket.svg')}
          color={'rgba(0,0,0,.05)'}
          width={409}
          height={409}
        />
      </div>
      <div className="content">
        <div className="left">
          <h1>Time to build something in production. Check it out.</h1>
          <p>
            Mauris non tempor quam, et lacinia sapien. Mauris accumsan eros eget
            libero posuere vulputate. Etiam elit elit, elementum sed varius.
          </p>
          <a
            className="btn green small"
            href="https://www.graph.cool"
            target="_blank"
          >
            <Icon
              src={require('../../assets/icons/companies/graphcool.svg')}
              width={24}
              height={24}
            />
            <span>Get started with Graphcool</span>
          </a>
        </div>
        <div className="right">
          <h3>Graphcool Tutorials</h3>
          <Tutorial
            title="Exploring Graphcool"
            description="Get an Overview over Graphcool"
            link="/"
          />
          <Tutorial
            title="The Graphcool permission system"
            description="Get an Overview over Graphcool"
            link="/"
          />
          <Tutorial
            title="Manipulating with the Request Pipeline"
            description="Get an Overview over Graphcool"
            link="/"
          />
        </div>
      </div>

    </div>
  )
}

interface TutorialProps {
  title: string
  description: string
  link: string
}

function Tutorial({ title, description, link }: TutorialProps) {
  return (
    <a className="tutorial" href={link} target="_blank">
      <style jsx={true}>{`
        .tutorial {
          @p: .mt25, .db, .relative;
          max-width: 300px;
        }
        .title {
          @p: .green, .f16, .flex, .itemsCenter;
        }
        .title::before {
          @p: .ba, .bGreen, .br100, .bw2, .absolute;
          left: -30px;
          content: '';
          width: 10px;
          height: 10px;
        }
        p {
          @p: .f16, .black50, .mt4;
        }
      `}</style>
      <div className="title">
        <span>{title}</span>
      </div>
      <p>{description}</p>
    </a>
  )
}
