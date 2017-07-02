import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Swipe from 'swipe-js-iso';

class ReactSwipe extends Component {
  static propTypes = {
    swipeOptions: PropTypes.shape({
      startSlide: PropTypes.number,
      speed: PropTypes.number,
      auto: PropTypes.number,
      continuous: PropTypes.bool,
      disableScroll: PropTypes.bool,
      stopPropagation: PropTypes.bool,
      swiping: PropTypes.func,
      callback: PropTypes.func,
      transitionEnd: PropTypes.func
    }),
    style: PropTypes.shape({
      container: PropTypes.object,
      wrapper: PropTypes.object,
      child: PropTypes.object
    }),
    id: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    swipeOptions: {},
    style: {
      container: {
        overflow: 'hidden',
        visibility: 'hidden',
        position: 'relative'
      },

      wrapper: {
        overflow: 'hidden',
        position: 'relative'
      },

      child: {
        float: 'left',
        width: '100%',
        position: 'relative',
        transitionProperty: 'transform'
      }
    },
    className: ''
  };

  componentDidMount() {
    const { swipeOptions } = this.props;

    this.swipe = Swipe(this.refs.container, swipeOptions);
  }

  componentWillUnmount() {
    this.swipe.kill();
    this.swipe = void 0;
  }

  next() {
    this.swipe.next();
  }

  prev() {
    this.swipe.prev();
  }

  slide(...args) {
    this.swipe.slide(...args);
  }

  getPos() {
    return this.swipe.getPos();
  }

  getNumSlides() {
    return this.swipe.getNumSlides();
  }

  render() {
    const { id, className, style, children } = this.props;

    return (
      <div ref="container" id={id} className={`react-swipe-container ${className}`} style={style.container}>
        <div style={style.wrapper}>
          {React.Children.map(children, (child) => {
            if (!child) {
              return null;
            }

            const childStyle = child.props.style ?
              Object.assign({}, style.child, child.props.style) :
              style.child;

            return React.cloneElement(child, {style: childStyle});
          })}
        </div>
      </div>
    );
  }
}

export default ReactSwipe;