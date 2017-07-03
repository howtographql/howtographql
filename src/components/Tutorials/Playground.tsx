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
import DataTables from './DataTables'
import { CSSTransitionGroup } from 'react-transition-group'

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
  query: string
  selectedTab: number
  personData: Array<{ [key: string]: any }>
  postData: Array<{ [key: string]: any }>
}

class Playground extends React.Component<Props & PlaygroundState, State> {
  constructor(props) {
    super(props)

    this.state = {
      heightAddition: 0,
      loading: false,
      personData: [],
      postData: [],
      query: childrenToString(props.children).trim(),
      queryExecuted: false,
      selectedTab: 0,
    }
  }

  componentDidMount() {
    if (this.props.endpoint) {
      this.fetchData()
    }
  }

  render() {
    const { loading, query } = this.state
    const numLines = query.split('\n').length
    // const height = parseInt(String(this.props.height), 10) || 160 + this.state.heightAddition
    const height = Math.min(numLines * 24 + 32 + this.state.heightAddition, 600)
    const active = Boolean(this.props.endpoint)
    return (
      <div className="container docs-graphiql">
        <style jsx={true}>{`
          .container {
            @p: .pb38, .mt25;
          }
          .graphiql {
            @p: .flex,
              .center,
              .justifyCenter,
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
          .tabs {
            @p: .relative, .z2;
            margin-left: 3px;
            bottom: -1px;
          }
          .tab {
            @p: .pv10, .ph16, .darkBlue60, .f14, .fw6, .dib, .bbox, .pointer;
            background: #F6F7F7;
            border: 1px solid $darkBlue10;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
          }
          .tab.active {
            @p: .darkBlue80;
            border-bottom-color: #F6F7F7;
          }
          .tab + .tab {
            @p: .ml10;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .tabs-enter {
            opacity: 0.01;
          }
          .tabs-enter.tabs-enter-active {
            opacity: 1;
            transition: opacity 500ms ease-in;
          }
          .tabs-leave {
            opacity: 1;
          }
          .tabs-leave.tabs-leave-active {
            opacity: 0.01;
            transition: opacity 300ms ease-in;
          }
        `}</style>

        <CSSTransitionGroup
          transitionName="playground"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {this.props.endpoint &&
            <div className="tabs">
              {['Playground', 'Data'].map((tab, index) =>
                <div
                  className={cn('tab', {
                    active: index === this.state.selectedTab,
                  })}
                  key={tab}
                  onClick={this.selectTab.bind(this, index)}
                >
                  {tab}
                </div>,
              )}
            </div>}
        </CSSTransitionGroup>
        {(this.state.selectedTab === 0 || !this.props.endpoint) &&
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
          </div>}
        {this.props.endpoint &&
          this.state.selectedTab === 1 &&
          <DataTables
            personData={this.state.personData}
            postData={this.state.postData}
          />}
      </div>
    )
  }

  private selectTab = i => {
    this.setState(state => ({ ...state, selectedTab: i }))
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
    })
      .then(res => res.json())
      .then(res => {
        this.fetchData(endpoint)
        return res
      })
  }

  private fetchData = (endpoint?: string) => {
    const apiEndpoint = endpoint || this.props.endpoint!
    return fetch(apiEndpoint, {
      body: JSON.stringify({ query: dataQuery }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
    })
      .then(res => res.json())
      .then((res: any) => {
        const { data } = res
        this.setState(state => ({
          ...state,
          personData: data.allPersons,
          postData: data.allPosts,
        }))
      })
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

    return fetch(
      this.props.endpoint ||
        'https://api.graph.cool/simple/v1/cj4o1v4x42p910149bcfaq44d',
      {
        body: JSON.stringify(graphQLParams),
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
      },
    )
      .then(res => res.json())
      .then(res => {
        if (!graphQLParams.query.includes('IntrospectionQuery')) {
          const queryLinesCount = this.state.query.split('\n').length
          const resultLineCount = JSON.stringify(res, null, 2).split('\n')
            .length
          let additionalLines = resultLineCount - queryLinesCount
          additionalLines = additionalLines > 0 ? additionalLines : 0
          this.setState(state => ({
            ...state,
            heightAddition: additionalLines * 24,
            queryExecuted: true,
          }))
          this.fetchData()
        }
        return res
      })
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

const dataQuery = `{
  allPersons {
    id
    name
    age
  }
  
  allPosts {
    id
    title
  }
}`

export default connect(state => state.playground, { setEndpoint })(Playground)
