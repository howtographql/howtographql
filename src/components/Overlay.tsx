import * as React from 'react'
import { connect } from 'react-redux'
import * as cn from 'classnames'
import { hideOverlay } from '../actions/ui'

interface Props {
  visible: boolean
  hideOverlay: () => void
}

interface State {
  transition: boolean
}

class Overlay extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      transition: false,
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ transition: true })
    }, 1000)
  }

  shouldComponentUpdate(nextProps) {
    return this.props.visible !== nextProps.visible
  }

  render() {
    const { visible } = this.props
    const { transition } = this.state
    return (
      <div
        className={cn('overlay', { visible, transition })}
        onClick={this.handleClick}
      >
        <style jsx={true}>{`
          .overlay {
            @p: .fixed, .top0, .left0, .right0, .bottom0, .bgWhite80, .o0;
            pointer-events: none;
            z-index: 10000;
          }
          .overlay.transition {
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
