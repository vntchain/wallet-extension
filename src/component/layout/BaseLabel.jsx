import React from 'react'
import PropTypes from 'prop-types'
import styles from './BaseLabel.scss'

class BaseLabel extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { label, tip, icon, children } = this.props
    return (
      <div className={styles.label}>
        {icon ? <img src={icon} alt={label} /> : ''}
        <label>{children || label}</label>
        {tip ? <span className={styles.tip}>{tip}</span> : ''}
      </div>
    )
  }
}

BaseLabel.propTypes = {
  label: PropTypes.string,
  tip: PropTypes.string,
  icon: PropTypes.string
}

export default BaseLabel
