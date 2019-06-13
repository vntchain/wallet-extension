import React, { useEffect } from 'react'
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
      return null
    }
    useEffect(() => {
      if (!isAuth && !isWalletUnlock) {
        handleLocateHome()
      }
    }, [isAuth, isWalletUnlock])
    return isAuth || isWalletUnlock ? <WrappedComponent /> : null
  })
}

export default requireAuth
