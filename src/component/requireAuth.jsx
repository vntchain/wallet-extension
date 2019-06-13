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
      dispatch(push(paths['login']))
    } else {
      // dispatch({
      //   type: 'user/getAddr'
      // })
    }
    return isAuth ? <WrappedComponent /> : null
  })
}

export default requireAuth
