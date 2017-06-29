import React from 'react'
import {Provider} from 'react-redux'
import {createStore, compose, applyMiddleware} from 'redux'
import quizReducer from './src/reducers/quiz'
import persistState, {mergePersistedState} from 'redux-localstorage'
import adapter from 'redux-localstorage/lib/adapters/localStorage'
import logger from 'redux-logger'

const reducer = compose(
  mergePersistedState()
)(quizReducer)

const enhancer = compose(
  persistState(adapter(window.localStorage), 'howtographql-redux')
)

const store = createStore(reducer, compose(enhancer, applyMiddleware(logger)))

exports.wrapRootComponent = function wrapRootComponent({Root}) {
  return function wrapRootComponentComponent(props) {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }
}