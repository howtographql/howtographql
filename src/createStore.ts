import { createStore, compose, applyMiddleware } from 'redux'
import quizReducer, { defaultQuizState } from './reducers/quiz'
import persistState, { mergePersistedState } from 'redux-localstorage'
import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
import logger from 'redux-logger'

const reducer = compose(mergePersistedState(defaultQuizState))(quizReducer)

let localStorage: any = null

if (typeof window !== 'undefined') {
  localStorage = window.localStorage
} else {
  localStorage = {
    clearItem: () => null,
    getItem: () => null,
    setItem: () => null,
  }
}

const enhancer = compose(
  persistState(adapter(localStorage), 'howtographql-redux'),
)

const functions = [enhancer]

if (process.env.NODE_ENV !== 'production') {
  functions.push(applyMiddleware(logger))
}

export default () => createStore(reducer, compose.apply(null, functions))
