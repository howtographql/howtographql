import * as React from 'react'
import Header from './Header'
import Overlay from './Overlay'
import Search from './Search/Search'
import { Step } from '../types'
import MobileMenu from './MobileMenu'
// import OverviewVideoModal from './OverviewVideoModal'
import Logo from './Logo'
import '../utils/polyfill'

interface Props {
  children?: JSX.Element
  history: any
  steps: { [key: string]: Step[] }
  location: any
}

export default function App({ children, history, steps, location }: Props) {
  return (
    <div>
      <style jsx={true} global={true}>{`
        /* reset.css */
        html,
        body,
        div,
        span,
        applet,
        object,
        iframe,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        blockquote,
        pre,
        a,
        abbr,
        acronym,
        address,
        big,
        cite,
        code,
        del,
        dfn,
        em,
        img,
        ins,
        kbd,
        q,
        s,
        samp,
        small,
        strike,
        strong,
        sub,
        sup,
        tt,
        var,
        b,
        u,
        i,
        center,
        dl,
        dt,
        dd,
        ol,
        ul,
        li,
        fieldset,
        form,
        label,
        legend,
        table,
        caption,
        tbody,
        tfoot,
        thead,
        tr,
        th,
        td,
        article,
        aside,
        canvas,
        details,
        embed,
        figure,
        figcaption,
        footer,
        header,
        hgroup,
        menu,
        nav,
        output,
        ruby,
        section,
        summary,
        time,
        mark,
        audio,
        video {
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          vertical-align: baseline;
        }
        /* HTML5 display-role reset for older browsers */
        article,
        aside,
        details,
        figcaption,
        figure,
        footer,
        header,
        hgroup,
        menu,
        nav,
        section {
          display: block;
        }
        body {
          line-height: 1;
        }
        ol, ul {
          list-style: none;
        }
        blockquote, q {
          quotes: none;
        }
        blockquote:before, blockquote:after, q:before, q:after {
          content: '';
          content: none;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
        }
        /* main rules */
        body, input, select, option, textarea {
          font-family: 'Open Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        input, select, options, textarea {
          outline: none;
        }
        h1 {
          @p: .f38, .lhTitle;
        }
        h2 {
          @p: .lhTitle;
          font-size: 35px;
        }
        section p {
          @p: .f20, .darkBlue50, .lhCopy;
        }
        a {
          @p: .noUnderline, .lhCopy;
        }
        section {
          @p: .pt96;
        }
        section h2 {
          @p: .tc;
        } /* Reusable Components */
        .btn {
          @p: .white, .f25, .fw6, .dib, .lhTitle, .pointer;
          background: linear-gradient(103deg, rgba(224, 0, 130, 0.8), #e00082);
          border: solid 2px #e00083;
          padding: 17px 30px 19px;
          border-radius: 6px;
          transition: background .2s ease, box-shadow .2s ease;
        }
        .btn.green {
          @p: .white;
          background-image: linear-gradient(
            101deg,
            rgba(39, 174, 96, 0.8),
            #27ae60
          );
          border: solid 2px #27ae60;
        }
        .btn.green:hover {
          background-image: linear-gradient(
            101deg,
            rgba(39, 174, 96, 1),
            #27ae60
          );
          border: solid 2px #27ae60;
        }
        .btn:hover {
          background-image: linear-gradient(
            104deg,
            rgba(224, 0, 130, 1),
            rgba(224, 0, 130, 1)
          );
          box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
        }
        .btn.passive {
          @p: .ba, .bw2, .pink;
          background: white;
          border-color: $pink30;
        }
        .btn.small {
          @p: .f20, .fw6, .pv16, .ph20;
        }
        @media (max-width: 500px) {
          div div.btn {
            padding: 10px 16px !important;
          }
          h2 {
            font-size: 32px !important;
            text-align: left !important;
          }
          section {
            padding-top: 38px !important;
          }
        }
      `}</style>
      <style jsx={true}>{`
        .content {
          padding-top: 68px;
        }
        .mobile-logo {
          @p: .fixed, .top0, .left0, .dn;
          z-index: 10150;
        }
        @media (max-width: 1050px) {
          div.mobile-logo {
            @p: .db;
          }
        }
      `}</style>
      <Overlay />
      {/*<OverviewVideoModal />*/}
      <Search history={history} location={location} />
      <MobileMenu steps={steps} location={location} />
      <Header steps={steps} location={location} />
      <div className="mobile-logo">
        <Logo />
      </div>
      <div className="content">
        {children}
      </div>
    </div>
  )
}
