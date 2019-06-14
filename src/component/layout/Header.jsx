import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import styles from './Header.scss'
import imgs from '../../utils/imgs'
import Setting from './Setting'
import CommonPadding from './CommonPadding'

const Header = function(props) {
  const { hasBack, title, hasSetting, theme = 'white', history } = props
  const handleBack = () => {
    history.goBack()
  }
  return (
    <CommonPadding className={`${styles.header} ${styles[theme]}`}>
      {hasBack ? (
        <span className={styles.back} onClick={handleBack}>
          <img src={imgs.back} alt="back" />
        </span>
      ) : (
        ''
      )}
      <span className={styles.title}>
        {typeof title === 'function' ? title() : <h1>{title}</h1>}
      </span>
      <span className={styles.setting}>{hasSetting ? <Setting /> : ''}</span>
    </CommonPadding>
  )
}

Header.propType = {
  title: PropTypes.string.isRequired || PropTypes.func.isRequired,
  hasBack: PropTypes.bool,
  hasSetting: PropTypes.bool,
  theme: PropTypes.string
}

export default withRouter(Header)
