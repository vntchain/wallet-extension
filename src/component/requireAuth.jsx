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
    if (!props.isAuth) {
      props.dispatch(push(paths['login']))
    }
    return props.isAuth ? <WrappedComponent /> : null
  })
}

export default requireAuth
