import React from 'react'
import PropTypes from 'prop-types'
import styles from './Header.scss'
import imgs from '../../utils/imgs'
import Setting from './Setting'
import CommonPadding from './CommonPadding'

const Header = function(props) {
  const { hasBack, title, hasSetting, theme = 'white' } = props
  const handleBack = () => {}
  return (
    <CommonPadding className={`${styles.header} ${styles[theme]}`}>
      <span className={styles.back}>
        {hasBack ? <img src={imgs.back} alt="back" onClick={handleBack} /> : ''}
      </span>
      <span className={styles.title}>
        {typeof title === 'function' ? title() : <h1>{title}</h1>}
      </span>
      <span className={styles.settign}>{hasSetting ? <Setting /> : ''}</span>
    </CommonPadding>
  )
}

Header.propType = {
  title: PropTypes.string.isRequired || PropTypes.func.isRequired,
  hasBack: PropTypes.bool,
  hasSetting: PropTypes.bool,
  theme: PropTypes.string
}

export default Header
