import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import paths from '../utils/paths'

function requireAuth(WrappedComponent) {
  const mapStateToProps = ({ user: { isAuth, isWalletUnlock } }) => {
    return {
      isAuth,
      isWalletUnlock
    }
  }
  return connect(mapStateToProps)(function(props) {
    const { isAuth, isWalletUnlock, dispatch } = props
    const handleLocateHome = () => {
      dispatch(push(paths['login']))
    }
    return isAuth || isWalletUnlock ? (
      <WrappedComponent />
    ) : (
      <Fragment>{handleLocateHome}</Fragment>
    )
  })
}

export default requireAuth
