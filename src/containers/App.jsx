import React, { useEffect } from 'react'
import { Route, withRouter, Switch } from 'react-router-dom'
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
import Law from './Law'

const App = function(props) {
  const { dispatch } = props
  useEffect(() => {
    //获取主网环境
    dispatch({
      type: 'user/getProviderUrl'
    })
    //获取地址-已登录状态初始化
    dispatch({
      type: 'user/getAddr'
    })
    //交易状态变化更新账户列表->更新交易列表->更新账户余额
    global.chrome.runtime.onMessage.addListener(function(request) {
      if (request.type === 'trx_state_changed') {
        dispatch({
          type: 'user/getAccounts'
        })
        dispatch({
          type: 'user/getAccountBalance'
        })
      }
    })
  }, [])
  return (
    <Switch>
      <Route exact path={paths.login} component={Login} />
      <Route exact path={paths.home} component={requireAuth(Home)} />
      <Route exact path={paths.scanWord} component={requireAuth(ScanWord)} />
      <Route exact path={paths.about} component={About} />
      <Route exact path={paths.law} component={Law} />
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
      <Route exact path={paths.outerAuth} component={requireAuth(OuterAuth)} />
      <Route exact path={paths.outerSend} component={requireAuth(OuterSend)} />
      <Route path={paths.wallet} component={Wallet} />
      {/* <Redirect to="/" /> */}
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
