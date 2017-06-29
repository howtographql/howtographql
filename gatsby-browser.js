import React from 'react'
import {Provider} from 'react-redux'
import {createStore, combineReducers} from 'redux'

const reducers = combineReducers({
  quiz: quiz => quiz || {},
  steps: steps => steps || {},
})

const store = createStore(reducers)

exports.wrapRootComponent = function wrapRootComponent({Root}) {
  return function wrapRootComponentComponent(props) {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }
}