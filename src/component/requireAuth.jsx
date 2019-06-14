import React, { useEffect, useState } from 'react'
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
    const { isAuth, dispatch } = props
    const [isWalletUnlock, setIsWalletUnlock] = useState(false)
    useEffect(() => {
      // console.log(isAuth, isWalletUnlock) //eslint-disable-line
      // if (!isAuth && !isWalletUnlock) {
      //   dispatch(push(paths['login']))
      // }
      if (!isAuth) {
        global.chrome.storage.sync.get('isWalletUnlock', function(obj) {
          if (obj['isWalletUnlock']) {
            setIsWalletUnlock(true)
          } else {
            dispatch(push(paths['login']))
            setIsWalletUnlock(false)
          }
        })
      }
    }, [])
    return isAuth || isWalletUnlock ? <WrappedComponent /> : null
  })
}

export default requireAuth
