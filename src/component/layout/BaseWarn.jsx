import React from 'react'
import PropTypes from 'prop-types'
import imgs from '../../utils/imgs'
import styles from './BaseWarn.scss'

const BaseTip = function(props) {
  const { warns } = props
  return (
    <div className={styles.warn}>
      <img src={imgs.warning} alt="warning" />
      {warns.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </div>
  )
}

BaseTip.propTypes = {
  warns: PropTypes.array.isRequired
}

export default BaseTip
