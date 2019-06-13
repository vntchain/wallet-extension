import React from 'react'
import PropTypes from 'prop-types'
import styles from './BaseTip.scss'

const BaseTip = function(props) {
  const { tips, className } = props
  return (
    <div className={`${styles.tip} ${className || ''}`}>
      {tips.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </div>
  )
}

BaseTip.propTypes = {
  tips: PropTypes.array.isRequired
}

export default BaseTip
