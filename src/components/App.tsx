import * as React from 'react'
import Header from './Header'

interface Props {
  children?: JSX.Element
}

export default function App({ children }: Props) {
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
          @p: .white, .f25, .fw6, .mt38, .dib, .lhTitle;
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
          @p: .bgWhite, .ba, .bw2, .pink;
          border-color: $pink30;
        }
        .btn.small {
          @p: .f20, .fw6, .pv16, .ph20;
        }
        @media (max-width: 500px) {
          .btn {
            padding: 10px 16px;
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
          padding-top: 72px;
        }
      `}</style>
      <Header />
      <div className="content">
        {children}
      </div>
    </div>
  )
}
