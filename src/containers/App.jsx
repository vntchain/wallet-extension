import React, { useEffect } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import requireAuth from '../component/requireAuth'
import paths from '../utils/paths'

import Login from './Login'
import Wallet from './Wallet'
import Home from './Home'
import ScanWord from './ScanWord'
import About from './About'
import ImportKeystone from './ImportKeystone'
import Send from './Send'
import Commission from './Commission'
import TxDetail from './TxDetail'
import OuterAuth from './OuterAuth'
import OuterSend from './OuterSend'

const { chrome } = global

const App = function(props) {
  const { dispatch, push } = props
  useEffect(() => {
    //获取是否有登录状态
    dispatch({
      type: 'user/getIsWalletUnlock'
    })
    //通信连接
    chrome.runtime.onMessage.addListener(function(request) {
      console.log('request', request) //eslint-disable-line
      const { type, router } = request
      console.log('type & router', type, router) //eslint-disable-line
      push(router)
      if (type === 'requesetAuthorization') {
        console.log('requesetAuthorization') //eslint-disable-line
      }
    })
  }, [])
  return (
    <Switch>
      <Route exact path={paths.login} component={Login} />
      <Route exact path={paths.home} component={requireAuth(Home)} />
      <Route exact path={paths.scanWord} component={requireAuth(ScanWord)} />
      <Route exact path={paths.about} component={About} />
      <Route
        exact
        path={paths.importKeystone}
        component={requireAuth(ImportKeystone)}
      />
      <Route exact path={paths.send} component={requireAuth(Send)} />
      <Route
        exact
        path={paths.commission}
        component={requireAuth(Commission)}
      />
      <Route
        exact
        path={`${paths.txDetail}/:id`}
        component={requireAuth(TxDetail)}
      />
      <Route exact path={paths.outerAuth} component={OuterAuth} />
      <Route exact path={paths.outerSend} component={OuterSend} />
      <Route path={paths.wallet} component={Wallet} />
      <Redirect to="/" />
    </Switch>
  )
}

App.propTypes = {
  international: PropTypes.object
}

const mapStateToProps = () => {
  return {}
}

export default withRouter(connect(mapStateToProps)(App))
