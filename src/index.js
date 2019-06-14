import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'babel-polyfill'
import Sirius from 'redux-sirius'
import logger from 'redux-logger'
import {
  ConnectedRouter,
  routerMiddleware as RouterMiddleware
} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
// import registerServiceWorker from 'registerServiceWorker'

import App from './containers/App'
import 'normalize.css'
import './index.scss'

const history = createHistory()
const routerMiddleware = RouterMiddleware(history)

let mode = process.env.NODE_ENV // eslint-disable-line no-undef

let middleware =
  mode === 'development' ? [logger, routerMiddleware] : [routerMiddleware]
const store = new Sirius({
  fileModels: {
    webpackContext: require.context('./models', true, /\.js$/)
  },
  middleware
}).store()

const { chrome } = global

//通信连接
chrome.runtime.onMessage.addListener(function(request) {
  console.log('request', request) //eslint-disable-line
  const { type, router } = request
  console.log('type & router', type, router) //eslint-disable-line
  if (type === 'requesetAuthorization') {
    console.log('requesetAuthorization') //eslint-disable-line
  }
})

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
// registerServiceWorker()
