import React from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'antd-mobile'
import Copier from '../../component/Copier'
import styles from './UserDetail.scss'
import imgs from '../../utils/imgs'

const UserDetail = function(props) {
  const copyRef = React.createRef()
  const {
    visible,
    onClose,
    openKeystone,
    user: { addr }
  } = props
  const handleOpenKeystone = () => {
    onClose()
    openKeystone()
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
      <Button type="primary" className={styles.btn}>
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

export default connect(({ user }) => ({
  user
}))(UserDetail)
