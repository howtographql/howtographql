import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import quizReducer from './reducers/quiz'
import persistState, { mergePersistedState } from 'redux-localstorage'
import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
import logger from 'redux-logger'
import overlayVisibleReducer from './reducers/overlayVisible'
import filter from 'redux-localstorage-filter'

const combinedReducers = combineReducers({
  overlayVisible: overlayVisibleReducer,
  quiz: quizReducer,
})

const reducer = compose(mergePersistedState())(combinedReducers)

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

const storage = compose(filter('quiz'))(adapter(localStorage))

const enhancer = compose(persistState(storage, 'howtographql-redux'))

const functions = [enhancer]

if (process.env.NODE_ENV !== 'production') {
  functions.push(applyMiddleware(logger))
}

export default () => createStore(reducer, compose.apply(null, functions))
