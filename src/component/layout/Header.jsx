import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import styles from './Header.scss'
import imgs from '../../utils/imgs'
import Setting from './Setting'
import CommonPadding from './CommonPadding'
// import { requestAnimation } from '../../utils/requestAnimation'

const Header = function(props) {
  const {
    hasBack,
    title,
    hasSetting,
    theme = 'white',
    backUrl,
    history
  } = props
  // const [isScrollTop, setIsScrollTop] = useState(false)
  const handleBack = () => {
    if (backUrl) {
      history.push(backUrl)
    } else {
      history.goBack()
    }
  }
  // const onScroll = () => {
  //   const scrollTop = window.document.body.scrollTop
  //   if (scrollTop > 0) {
  //     setIsScrollTop(true)
  //   } else {
  //     setIsScrollTop(false)
  //   }
  // }
  // useEffect(() => {
  //   window.document.body.addEventListener(
  //     'scroll',
  //     () => requestAnimation(onScroll),
  //     false
  //   )
  // }, [])
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
      {hasSetting ? (
        <span className={styles.setting}>
          <Setting />
        </span>
      ) : (
        ''
      )}
    </CommonPadding>
  )
}

Header.propType = {
  title: PropTypes.string.isRequired || PropTypes.func.isRequired,
  hasBack: PropTypes.bool,
  backUrl: PropTypes.string,
  hasSetting: PropTypes.bool,
  theme: PropTypes.string
}

export default withRouter(Header)
