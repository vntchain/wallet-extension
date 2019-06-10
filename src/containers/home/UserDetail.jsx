import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Modal, Button } from 'antd-mobile'
import Copier from '../../component/Copier'
import styles from './UserDetail.scss'
import imgs from '../../utils/imgs'
import paths from '../../utils/paths'

const UserDetail = function(props) {
  const copyRef = React.createRef()
  const {
    visible,
    onClose,
    openKeystone,
    user: { addr },
    push
  } = props
  const handleOpenKeystone = () => {
    onClose()
    openKeystone()
  }
  const linkToVnt = () => {
    push(paths.vnt)
  }
  return (
    <Modal
      visible={visible}
      transparent
      maskClosable={true}
      onClose={onClose}
      className={styles.detail}
      wrapClassName={styles.wrap}
    >
      <img className={styles.qrcode} src={imgs.qrcode} alt="qrcode" />
      <div className={styles.code}>
        <span className={styles.str}>{addr}</span>
        <Copier text={addr} copyRef={copyRef}>
          <span className={styles.copy} />
        </Copier>
      </div>
      <Button type="primary" className={styles.btn} onClick={linkToVnt}>
        去VNT浏览器上查看
      </Button>
      <Button
        type="primary"
        className={styles.btn}
        onClick={handleOpenKeystone}
      >
        导出私钥
      </Button>
    </Modal>
  )
}

export default withRouter(
  connect(({ user }) => ({
    user
  }))(UserDetail)
)
