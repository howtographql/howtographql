import * as React from 'react'
import { connect } from 'react-redux'
import * as cn from 'classnames'
import { hideOverlay } from '../actions/ui'

interface Props {
  visible: boolean
  hideOverlay: () => void
}

class Overlay extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }

  shouldComponentUpdate(nextProps) {
    return this.props.visible !== nextProps.visible
  }

  render() {
    const { visible } = this.props
    return (
      <div className={cn('overlay', { visible })} onClick={this.handleClick}>
        <style jsx={true}>{`
          .overlay {
            @p: .fixed, .top0, .left0, .right0, .bottom0, .bgWhite80, .o0;
            pointer-events: none;
            z-index: 10000;
            transition: opacity .25s ease-in-out;
          }
          .overlay.visible {
            @p: .o100;
            pointer-events: all;
          }
        `}</style>
      </div>
    )
  }

  private handleClick = () => {
    this.props.hideOverlay()
  }
}

export default connect(state => ({ visible: state.ui.overlayVisible }), {
  hideOverlay,
})(Overlay)
