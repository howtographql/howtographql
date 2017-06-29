import React from 'react'
import {Provider} from 'react-redux'
import createStore from './src/createStore'

const store = createStore()

exports.wrapRootComponent = function wrapRootComponent({Root}) {
  return function wrapRootComponentComponent(props) {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }
}