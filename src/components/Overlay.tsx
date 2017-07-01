import * as React from 'react'
import { connect } from 'react-redux'
import * as cn from 'classnames'
import { setOverlayVisible } from '../actions/overlayVisible'

interface Props {
  visible: boolean
  setOverlayVisible: (value: boolean) => void
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
    this.props.setOverlayVisible(false)
  }
}

export default connect(state => ({ visible: state.overlayVisible }), {
  setOverlayVisible,
})(Overlay)
