import React, { Component } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import InnerWidthWatcher from '../component/InnerWidthWatcher'
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
          <Route exact path={paths.home} component={Home} />
          <Route exact path={paths.scanWord} component={ScanWord} />
          <Route exact path={paths.about} component={About} />
          <Route exact path={paths.importKeystone} component={ImportKeystone} />
          <Route exact path={paths.send} component={Send} />
          <Route exact path={paths.customize} component={Send} />
          <Route exact path={paths.txDetail} component={Send} />
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
