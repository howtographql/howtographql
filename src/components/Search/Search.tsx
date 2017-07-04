import * as React from 'react'
import * as throttle from 'lodash/throttle'
import * as algolia from 'algoliasearch'
import SearchInput from './SearchInput'
import { connect } from 'react-redux'
import { setSearchVisible } from '../../actions/ui'
import Results from './Results'
import * as cn from 'classnames'

interface Props {
  setSearchVisible: (value: boolean) => void
  router: any
  history: any
  location: any
  visible: boolean
}

interface State {
  query: string
  results: Result[]
  focused: boolean
  selectedIndex: number
}

export interface Result {
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
              results: data.hits.map(hit => ({
                description: hit.body,
                link: hit.objectID,
                title: hit._highlightResult.title.value,
              })),
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
    this.client = algolia('EGOD51Z7AV', '8cfa9fa05850587f0624c13b4df797b1')
    this.index = this.client.initIndex('howtographql')

    this.state = {
      focused: false,
      query: '',
      results: [],
      selectedIndex: 0,
    }
  }

  render() {
    const { focused } = this.state
    return (
      <div className={cn('search', { visible: focused })}>
        <style jsx={true}>{`
          .search {
            @p: .fixed;
            top: 9px;
            left: 235px;
            z-index: 10010;
            width: calc(100% - 235px - 456px);
          }
          .search.visible {
            z-index: 10180;
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
          location={this.props.location}
          numResults={this.state.results.length}
        />
        <Results
          results={this.state.results}
          selectedIndex={this.state.selectedIndex}
          onSelectIndex={this.handleSelectIndex}
          gotoSelectedItem={this.handleGotoSelectedItem}
        />
      </div>
    )
  }

  private handleClose = () => {
    this.props.setSearchVisible(false)
  }

  private handleSelectIndex = selectedIndex => {
    // TODO put the real length in here
    if (selectedIndex < 0 || selectedIndex > this.state.results.length - 1) {
      return
    }
    this.setState(state => ({ ...state, selectedIndex }))
  }

  private handleGotoSelectedItem = () => {
    const { selectedIndex, results } = this.state
    this.props.history.push(results[selectedIndex].link)
    this.props.setSearchVisible(false)
  }

  private handleFocus = e => {
    this.setState(state => ({ ...state, focused: true }))
    if (this.state.query.length > 0) {
      this.props.setSearchVisible(true)
    }
  }

  private handleBlur = e => {
    this.setState(state => ({ ...state, focused: false }))
    if (window && window.innerWidth < 1050 && this.state.query.length === 0) {
      this.props.setSearchVisible(false)
    }
  }

  private handleChange = value => {
    this.setState(state => ({ ...state, query: value }))
    if (value.length > 0) {
      this.props.setSearchVisible(true)
    } else {
      this.props.setSearchVisible(false)
    }
    this.search(value)
  }
}

export default connect(null, {
  setSearchVisible,
})(Search)
