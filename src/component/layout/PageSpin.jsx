import React from 'react'
import propTypes from 'prop-types'
import { Spin } from 'antd'
import styles from './PageSpin.scss'

const PageSpin = props => {
  const { spinning } = props
  return (
    <div
      className={styles.spin}
      style={{ display: spinning ? 'flex' : 'none' }}
    >
      <Spin />
    </div>
  )
}

PageSpin.propType = {
  spinning: propTypes.bool
}

export default PageSpin
