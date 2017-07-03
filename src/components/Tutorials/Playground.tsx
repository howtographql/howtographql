import * as React from 'react'
import { CustomGraphiQL } from 'graphcool-graphiql'
import '../../styles/graphiql-light.css'
import { connect } from 'react-redux'
import { setEndpoint } from '../../actions/playground'
import { PlaygroundState } from '../../reducers/playground'
import { childrenToString } from './Pre'
import Loader from './Loader'
import * as cn from 'classnames'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface Props {
  setEndpoint: (endpoint: string) => void
  height?: number
}
interface GraphQLParams {
  query: string
  variables: {}
}

interface State {
  loading: boolean
  heightAddition: number
  queryExecuted: boolean
}

class Playground extends React.Component<Props & PlaygroundState, State> {
  constructor(props) {
    super(props)

    this.state = {
      heightAddition: 0,
      loading: false,
      queryExecuted: false,
    }
  }

  render() {
    const query = childrenToString(this.props.children).trim()
    const height =
      parseInt(String(this.props.height), 10) || 160 + this.state.heightAddition
    const active = Boolean(this.props.endpoint)
    const { loading } = this.state
    return (
      <div className="container docs-graphiql">
        <style jsx={true}>{`
          .container {
            @p: .pb38;
          }
          .graphiql {
            @p: .flex,
              .center,
              .justifyCenter,
              .mt25,
              .overflowHidden,
              .br2,
              .ba,
              .bDarkBlue10,
              .relative;
            max-width: 840px;
            transition: height linear .15s;
          }
          .graphiql :global(.resultWrap) {
            @p: .o0;
            pointer-events: none;
            transition: opacity ease-in-out .25s;
          }
          .graphiql.active :global(.resultWrap) {
            @p: .o100;
            pointer-events: all;
            transition: opacity ease-in-out .25s;
          }
          .run {
            @p: .absolute, .bottom0, .right0, .mb16, .mr16;
          }
          div div.btn {
            @p: .bbox;
            padding: 12px 16px;
            width: 211px;
          }
          div div.btn.loading {
            transform: translateY(6px);
          }
          .btn-inner {
            @p: .flex, .itemsCenter;
            height: 26px;
          }
          .btn-inner span {
            @p: .ml10;
          }
        `}</style>

        <div className={cn('graphiql', { active })} style={{ height }}>
          <CustomGraphiQL
            showEndpoints={false}
            fetcher={this.fetcher}
            query={query}
            showQueryTitle={true}
            showResponseTitle={true}
            disableAutofocus={true}
            rerenderQuery={false}
            hideLineNumbers={true}
            hideGutters={true}
            readOnly={true}
            disableQueryHeader={true}
            showDocs={false}
          />
          {!active &&
            <div className="run">
              <div
                className={cn('btn small', { loading })}
                onClick={this.createEndpoint}
              >
                {loading
                  ? <div className="btn-inner"><Loader /></div>
                  : <div className="btn-inner">
                      <Icon
                        src={require('../../assets/icons/video.svg')}
                        color={'white'}
                        width={14}
                        height={14}
                      />
                      <span>Run in Sandbox</span>
                    </div>}
              </div>
            </div>}
        </div>
      </div>
    )
  }

  private createEndpoint = () => {
    this.setState(state => ({ ...state, loading: true }))
    fetch('https://graphql-up-api.graph.cool/create', {
      body: JSON.stringify({ schema }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
    })
      .then(res => res.json())
      .then((res: any) => {
        // if (res.code) {
        //   this.setState({
        //     loading: false,
        //     error: res.message,
        //   } as State)
        // } else {
        const endpoint = `https://api.graph.cool/simple/v1/${res.project.id}`

        this.prePopulateData(endpoint).then(data => {
          this.setState(state => ({ ...state, loading: false }))
          this.props.setEndpoint(endpoint)
        })
      })
  }

  private prePopulateData = (endpoint: string) => {
    const mutation = `mutation {
      a: createPerson(
        age: 23,
      name: "Johnny",
      posts: [
        {title: "GraphQL is awesome"},
        {title: "Relay is a powerful GraphQL Client"}
      ]) {
        id
      }
      b: createPerson(
        age: 20,
        name: "Sarah",
        posts: [
          {title: "How to get started with React & GraphQL"},
      ]) {
        id
      }
      c: createPerson(
          age: 20,
        name: "Alice") {
          id
        }
    }`
    return fetch(endpoint, {
      body: JSON.stringify({ query: mutation }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
    }).then(res => res.json())
  }

  private fetcher = (graphQLParams: GraphQLParams) => {
    if (!graphQLParams.query.includes('IntrospectionQuery')) {
      this.setState(
        {
          query: graphQLParams.query,
          variables: JSON.stringify(graphQLParams.variables),
        } as any,
      )
      if (!this.state.queryExecuted) {
        this.setState(state => ({
          ...state,
          heightAddition: 240,
          queryExecuted: true,
        }))
      }
    }

    return fetch(
      this.props.endpoint ||
        'https://api.graph.cool/simple/v1/cj4o1v4x42p910149bcfaq44d',
      {
        body: JSON.stringify(graphQLParams),
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
      },
    ).then(res => res.json())
  }
}

const schema = `type Post {
  title: String!
  author: Person! @relation(name: "UserPosts")
}

type Person {
  name: String!
  age: Int!
  posts: [Post!]! @relation(name: "UserPosts")
}`

export default connect(state => state.playground, { setEndpoint })(Playground)
