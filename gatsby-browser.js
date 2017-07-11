// import React from 'react'
// import {Provider} from 'react-redux'
// import createStore from './src/createStore'
//
// const store = createStore()
//
// exports.wrapRootComponent = function wrapRootComponent({Root}) {
//   return function wrapRootComponentComponent(props) {
//     return (
//       <Provider store={store}>
//         <Root />
//       </Provider>
//     )
//   }
// }
//
//
//
//
//
//
//
//

import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import createStore from './src/createStore'

exports.replaceRouterComponent = ({ history }) => {
  const store = createStore()

  const ConnectedRouterWrapper = ({ children }) => (
    <Provider store={store}>
      <Router history={history}>{children}</Router>
    </Provider>
  )

  return ConnectedRouterWrapper
}

exports.onRouteUpdate = function({ location }) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof ga === `function`) {
    ga(`set`, `page`, (location || {}).pathname)
    ga(`send`, `pageview`)
  }
}