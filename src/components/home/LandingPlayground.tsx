import * as React from 'react'
// import 'graphiql/graphiql.css'
import '../../styles/graphiql-dark.css'
import MarkdownGraphiQL from '../MarkdownGraphiQL'
import { simpleQuery } from '../../data/LandingPlayground'
import Link from 'gatsby-link'

export default function LandingPlayground() {
  return (
    <section className="landing-playground">
      <style jsx={true}>{`
        .landing-playground {
          @p: .pv96, .bgDarkerBlue;
        }
        .graphiql {
          @p: .flex, .center, .justifyCenter, .mv96;
          max-width: 960px;
          height: 500px;
        }
        .graphiql :global(.variable-editor) {
          @p: .dn;
        }
        h1 {
          @p: .tc, .white;
        }
        p {
          @p: .tc, .white50, .mt25;
        }
        h3 {
          @p: .white, .tc, .f20, .fw6, .mb25;
        }
        .center-container {
          @p: .center, .flex, .justifyCenter;
          max-width: 960px;
        }
        @media (max-width: 900px) {
          .landing-playground {
            @p: .dn;
          }
        }
      `}</style>
      <h1>Never tried GraphQL before?</h1>
      <p>Time to run your first query in the Playground…</p>
      <div className="graphiql">
        <MarkdownGraphiQL
          literal={simpleQuery(
            'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr',
          )}
          playground={true}
          disableResize={true}
          disableQueryHeader={true}
        />
      </div>
      <div className="center-container">
        <div>
          <h3>That was easy, wasn't it?</h3>
          <Link to="/tutorials/graphql/basics/0-introduction/">
            <div className="btn small">Learn how to use GraphQL</div>
          </Link>
        </div>
      </div>
    </section>
  )
}
