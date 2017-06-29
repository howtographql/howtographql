import React from 'react'
import { Provider } from 'react-redux'

import createStore from './src/createStore'

exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {

  const store = createStore()

  const ConnectedBody = () => (
    <Provider store={store}>
      {bodyComponent}
    </Provider>
  )
  replaceBodyHTMLString(<ConnectedBody/>)
}