import * as React from 'react'

interface State {
  width: number
}

export default function withWidth() {
  return Component => {
    class WithWidth extends React.Component<null, State> {
      constructor(props) {
        super(props)
        this.state = {
          width: window.innerWidth,
        }
      }

      componentDidMount() {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
      }

      componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions)
      }

      updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth })
      }

      render() {
        const { width } = this.state
        return <Component {...this.props} width={width} />
      }
    }
    return WithWidth
  }
}
