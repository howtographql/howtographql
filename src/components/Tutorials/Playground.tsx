import * as React from 'react'
import { CustomGraphiQL } from 'graphcool-graphiql'
import '../../styles/graphiql-light.css'
import { connect } from 'react-redux'
import { setEndpoint } from '../../actions/playground'
import { PlaygroundState } from '../../reducers/playground'
import { childrenToString } from './Pre'
import Loader from './Loader'

interface Props {
  setEndpoint: (endpoint: string) => void
}
interface GraphQLParams {
  query: string
  variables: {}
}

interface State {
  loading: boolean
}

class Playground extends React.Component<Props & PlaygroundState, State> {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
    }
  }

  render() {
    const query = childrenToString(this.props.children).trim()
    return (
      <div className="container docs-graphiql">
        <style jsx={true}>{`
          .container {
            @p: .pb38;
          }
          .graphiql {
            @p: .flex, .center, .justifyCenter, .mt25;
            max-width: 840px;
            height: 500px;
          }
          .btn {
            @p: .mt25;
            width: 312px;
          }
        `}</style>

        {this.props.endpoint
          ? <div className="graphiql">
              <CustomGraphiQL
                showEndpoints={false}
                fetcher={this.fetcher}
                query={query}
                showQueryTitle={true}
                showResponseTitle={true}
                disableAutofocus={true}
                rerenderQuery={false}
              />
            </div>
          : <div>
              {this.props.children}
              <div className="btn small" onClick={this.createEndpoint}>
                {this.state.loading ? <Loader /> : 'Get your GraphQL endpoint'}
              </div>
            </div>}
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
    }

    return fetch(this.props.endpoint!, {
      body: JSON.stringify(graphQLParams),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
    }).then(res => res.json())
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
