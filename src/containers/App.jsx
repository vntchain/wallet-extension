import React, { Component } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import InnerWidthWatcher from '../component/InnerWidthWatcher'
import requireAuth from '../component/requireAuth'
import paths from '../utils/paths'

import Login from './Login'
import Wallet from './Wallet'
import Home from './Home'
import ScanWord from './ScanWord'
import About from './About'
import ImportKeystone from './ImportKeystone'
import Send from './Send'

class App extends Component {
  render() {
    return (
      <InnerWidthWatcher>
        <Switch>
          <Route exact path={paths.login} component={Login} />
          <Route exact path={paths.home} component={requireAuth(Home)} />
          <Route
            exact
            path={paths.scanWord}
            component={requireAuth(ScanWord)}
          />
          <Route exact path={paths.about} component={About} />
          <Route
            exact
            path={paths.importKeystone}
            component={requireAuth(ImportKeystone)}
          />
          <Route exact path={paths.send} component={requireAuth(Send)} />
          <Route exact path={paths.customize} component={requireAuth(Send)} />
          <Route exact path={paths.txDetail} component={requireAuth(Send)} />
          <Route path={paths.wallet} component={Wallet} />
          <Redirect to="/" />
        </Switch>
      </InnerWidthWatcher>
    )
  }
}

App.propTypes = {
  international: PropTypes.object
}

const mapStateToProps = () => {
  return {}
}

export default withRouter(connect(mapStateToProps)(App))
