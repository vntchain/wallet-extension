import React from 'react'
import PropTypes from 'prop-types'
import styles from './BaseTip.scss'

const BaseTip = function(props) {
  const { tips } = props
  return (
    <div className={styles.tip}>
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
