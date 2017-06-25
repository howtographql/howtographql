import * as React from 'react'

interface State {
  width: number
}

export default function withWidth() {
  return Component => {
    class WithWidth extends React.Component<null, State> {
      constructor(props) {
        super(props)
        const innerWidth = typeof window !== 'undefined'
          ? window.innerWidth
          : 800
        this.state = {
          width: innerWidth,
        }
      }

      componentDidMount() {
        this.updateWindowDimensions()
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', this.updateWindowDimensions)
        }
      }

      componentWillUnmount() {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', this.updateWindowDimensions)
        }
      }

      updateWindowDimensions = () => {
        const innerWidth = typeof window !== 'undefined'
          ? window.innerWidth
          : 800
        this.setState({ width: innerWidth })
      }

      render() {
        const { width } = this.state
        return <Component {...this.props} width={width} />
      }
    }
    return WithWidth
  }
}
