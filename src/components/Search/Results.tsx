import * as React from 'react'
import * as cn from 'classnames'
import { connect } from 'react-redux'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { setOverlayVisible } from '../../actions/overlayVisible'
import Link from 'gatsby-link'
import GroupBadge from './GroupBadge'
import { extractGroup } from '../../utils/graphql'

interface Props {
  results: any[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  visible: boolean
  setOverlayVisible: (value: boolean) => void
  gotoSelectedItem: () => void
}

class Results extends React.Component<Props, {}> {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
  render() {
    const { results, selectedIndex, onSelectIndex, visible } = this.props
    return (
      <div className={cn('search-results', { visible })}>
        <style jsx={true}>{`
          .search-results {
            @p: .absolute, .o0;
            margin-top: -60px;
            padding-top: 67px;
            padding-bottom: 10px;
            box-shadow: 0 1px 5px 0 rgba(0, 0, 0, .07),
              0 7px 17px 0 rgba(0, 0, 0, .1);
            background: white;
            transition: opacity .25s ease-in-out;
            pointer-events: none;
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;
          }
          .search-results.visible {
            @p: .o100;
            pointer-events: all;
          }
          .result {
            @p: .relative;
            padding: 10px 15px 8px 44px;
            margin-bottom: 10px;
          }
          .result.selected {
            background-color: #ecfaff;
          }
          .result.selected :global(i) {
            @p: .absolute;
            left: 20px;
            margin-top: 6px;
          }
          .result :global(a) {
            display: inline-block;
            font-weight: 500;
            color: #0099e5;
            font-size: 15px;
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .result :global(a) span {
            text-decoration: underline;
          }
          .result p {
            font-size: 13px;
            line-height: 20px;
            color: #4c555a;
            overflow: hidden;
            padding: 0;
            margin: 0;
            max-height: 40px;
          }
        `}</style>
        <div className="results">
          {results.map((result, index) =>
            <div
              className={cn('result', { selected: index === selectedIndex })}
              onClick={onSelectIndex.bind(null, index)}
            >
              {index === selectedIndex &&
                <Icon
                  src={require('graphcool-styles/icons/stroke/arrowRight.svg')}
                  color="#0099e5"
                  stroke={true}
                  strokeWidth={4}
                  width={10}
                  height={10}
                />}
              <Link to="/" onClick={this.handleLinkClick}>
                <span>
                  {result.title}
                </span>
                <GroupBadge group={extractGroup(result.link)} />
              </Link>
              <p>{result.description}</p>
            </div>,
          )}
        </div>
      </div>
    )
  }

  private handleKeyDown = e => {
    if (!this.props.visible) {
      return
    }

    if (e.keyCode === 13 && !e.metaKey) {
      this.props.gotoSelectedItem()
    }
    if (e.keyCode === 38) {
      this.props.onSelectIndex(this.props.selectedIndex - 1)
    }
    if (e.keyCode === 40) {
      this.props.onSelectIndex(this.props.selectedIndex + 1)
    }
  }

  private handleLinkClick = () => {
    this.props.setOverlayVisible(false)
  }
}

export default connect(state => ({ visible: state.overlayVisible }), {
  setOverlayVisible,
})(Results)
