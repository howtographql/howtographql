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
          @p: .inlineFlex, .itemsCenter, .mt38;
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
        @media (max-width: 580px) {
          a.btn {
            @p: .mv16, .f16;
          }
          div.checkout-graphcool {
            @p: .pa25;
          }
          div.content {
            @p: .db;
          }
          div.right {
            @p: .mt25;
          }
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
          <h1>Next step: Build something in production.</h1>
          <p>
            Use your new knowledge and start building a production app.
            Prisma
            provides everything you need to build the backend for your next
            project.
          </p>
          <a
            className="btn green small"
            href="https://www.prisma.io"
            target="_blank"
          >
            <Icon
              src={require('../../assets/icons/companies/prisma.svg')}
              width={24}
              height={24}
            />
            <span>Get started with Prisma</span>
          </a>
        </div>
        <div className="right">
          <h3>Prisma Tutorials</h3>
          <Tutorial
            title="Quickstart"
            description="Get started with Prisma and"
            link="https://www.prisma.io/docs/get-started/"
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
          background: $green0;
          left: -30px;
          content: '';
          width: 10px;
          height: 10px;
          transition: background-color .25s ease-in-out;
        }
        .title:hover::before {
          @p: .bgGreen;
        }
        p {
          @p: .f16, .black50, .mt4;
        }
        @media (max-width: 580px) {
          a.tutorial {
            @p: .ml25;
          }
        }
      `}</style>
      <div className="title">
        <span>{title}</span>
      </div>
      <p>{description}</p>
    </a>
  )
}
