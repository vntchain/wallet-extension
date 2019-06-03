import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

const ResponsiveSwitch = props => {
  const { width, pc, mobile, isMobileArr = [768], ...rest } = props
  const isNeedResponsive = isMobileArr.includes(width)
  const C = isNeedResponsive ? mobile : pc
  return <C {...rest} />
}
ResponsiveSwitch.propTypes = {
  pc: PropTypes.func.isRequired,
  mobile: PropTypes.func.isRequired
}

function mapStateToProps({ window }) {
  return {
    width: window.width
  }
}
export default connect(mapStateToProps)(ResponsiveSwitch)
