import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import paths from '../utils/paths'

function requireAuth(WrappedComponent) {
  const mapStateToProps = ({ user: { isAuth } }) => {
    return {
      isAuth
    }
  }
  return connect(mapStateToProps)(function(props) {
    const { isAuth, dispatch } = props
    if (!isAuth) {
      global.chrome.storage.sync.get('isWalletUnlock', function(obj) {
        if (obj['isWalletUnlock']) {
          dispatch({
            type: 'user/setIsAuth',
            payload: true
          })
        } else {
          dispatch(push(paths['login']))
        }
      })
    }
    return isAuth ? <WrappedComponent /> : null
  })
}

export default requireAuth
