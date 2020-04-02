import React, { Fragment } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import styles from './Wallet.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import paths from '../utils/paths'
import Create from './wallet/Create'
import Word from './wallet/Word'
import ConfirmWord from './wallet/ConfirmWord'
import RegainWord from './wallet/RegainWord'
import { FormattedMessage } from '../i18n'

const Wallet = function() {
  return (
    <Fragment>
      <Header
        title={<FormattedMessage id="Wallet_title" />}
        hasBack={true}
        theme={'white'}
      />
      <div className={styles.container}>
        <CommonPadding>
          <Switch>
            <Route exact path={paths.create} component={Create} />
            <Route exact path={paths.word} component={Word} />
            <Route exact path={paths.confirmWord} component={ConfirmWord} />
            <Route exact path={paths.regainWord} component={RegainWord} />
            <Redirect to="/" />
          </Switch>
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Wallet
