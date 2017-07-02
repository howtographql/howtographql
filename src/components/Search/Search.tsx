import * as React from 'react'
import * as throttle from 'lodash/throttle'
import * as uniqBy from 'lodash/uniqBy'
import * as algolia from 'algoliasearch'
import SearchInput from './SearchInput'
import { connect } from 'react-redux'
import { setOverlayVisible } from '../../actions/overlayVisible'
import Results from './Results'
import * as cn from 'classnames'

interface Props {
  setOverlayVisible: (value: boolean) => void
  router: any
  history: any
}

interface State {
  query: string
  results: any[]
  focused: boolean
  selectedIndex: number
}

interface Result {
  title: string
  description: string
  link: string
}

class Search extends React.Component<Props, State> {
  private client: algolia.AlgoliaClient
  private index: algolia.AlgoliaIndex
  private search = throttle(
    (q: string) => {
      this.index.search(
        {
          attributesToHighlight: ['title'],
          hitsPerPage: 10,
          query: q,
        },
        (err, data) => {
          if (err) {
            // handle error
          } else {
            this.setState({
              results: uniqBy(data.hits, (result: any) => result.alias).slice(
                0,
                10,
              ),
            })
          }
        },
      )
    },
    500,
    {
      // this is very important as otherwise the last change would be ignored
      trailing: true,
    },
  )
  constructor(props) {
    super(props)
    this.client = algolia('MU1EXDJ8LW', '4ac8dd3789c402e98dd0816518e1e842')
    this.index = this.client.initIndex('Simple Search')

    this.state = {
      focused: false,
      query: '',
      results: [],
      selectedIndex: 0,
    }
  }

  render() {
    return (
      <div className={cn('search')}>
        <style jsx={true}>{`
          .search {
            @p: .fixed;
            top: 9px;
            left: 235px;
            z-index: 10010;
            width: calc(100% - 235px - 456px);
          }
          @media (max-width: 1050px) {
            div.search {
              left: 0;
              width: calc(100%);
            }
          }
        `}</style>
        <SearchInput
          focused={this.state.focused}
          query={this.state.query}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onClose={this.handleClose}
        />
        <Results
          results={results}
          selectedIndex={this.state.selectedIndex}
          onSelectIndex={this.handleSelectIndex}
          gotoSelectedItem={this.handleGotoSelectedItem}
        />
      </div>
    )
  }

  private handleClose = () => {
    this.props.setOverlayVisible(false)
  }

  private handleSelectIndex = selectedIndex => {
    // TODO put the real length in here
    if (selectedIndex < 0 || selectedIndex > 3 - 1) {
      return
    }
    this.setState(state => ({ ...state, selectedIndex }))
  }

  private handleGotoSelectedItem = () => {
    this.props.history.push('/route')
  }

  private handleFocus = e => {
    this.setState(state => ({ ...state, focused: true }))
    if (this.state.query.length > 0) {
      this.props.setOverlayVisible(true)
    }
  }

  private handleBlur = e => {
    this.setState(state => ({ ...state, focused: false }))
    if (window && window.innerWidth < 1050) {
      this.props.setOverlayVisible(false)
    }
  }

  private handleChange = value => {
    this.setState(state => ({ ...state, query: value }))
    if (value.length > 0) {
      this.props.setOverlayVisible(true)
    } else {
      this.props.setOverlayVisible(false)
    }
    this.search(value)
  }
}

const results: Result[] = [
  {
    description:
      'Over the past decade, REST has become the standard (yet a fuzzy one) for designing web APIs. It offers some great ideas, such as stateless servers and structured access to resources. However, REST APIs have shown to be too inflexible to keep up with the rapidly changing requirements of the clients that access them.',
    link: '/tutorials/graphql/basics/1-graphql-is-the-better-rest/',
    title: 'GraphQL is the Better REST',
  },
  {
    description:
      'Working with a GraphQL API on the frontend is a great opportunity to develop new abstractions and help implement common functionality on the client-side. Let’s consider some “infrastructure” features that you probably want to have in your app:',
    link: '/tutorials/graphql/advanced/0-clients/',
    title: 'Client',
  },
  {
    description:
      'In the previous chapter, you learned about major concepts and benefits of GraphQL. Now is the time to get your hands dirty and start out with an actual project!',
    link: '/tutorials/frontend/react-apollo/0-introduction/',
    title: 'Introduction',
  },
  {
    description:
      'GraphQL has its own type system that’s used to define the schema of an API. The syntax for writing schemas is called Schema Definition Language (SDL).',
    link: '/tutorials/backend/graphql-ruby/3-mutations/',
    title: 'Mutations',
  },
]

export default connect(null, {
  setOverlayVisible,
})(Search)
