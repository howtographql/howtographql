// import React from 'react'
const React = require('react')
const {Provider} = require('react-redux')
// import { Provider } from 'react-redux'

// import createStore from './src/createStore'
const createStore = require('./src/createStore').default

exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {

  const store = createStore()

  const ConnectedBody = () => (
    React.createElement(Provider, {store: store}, bodyComponent)
  )

  // replaceBodyHTMLString(<ConnectedBody/>)
  replaceBodyHTMLString(React.createElement(ConnectedBody))
}
// /*<Provider store={store}>*/}
//   {/*{bodyComponent}*/}
// {/*</Provider>*/}
