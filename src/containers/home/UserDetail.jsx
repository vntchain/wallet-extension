import React from 'react'
import { Modal, Button } from 'antd-mobile'
import styles from './UserDetail.scss'
import imgs from '../../utils/imgs'

const UserDetail = function(props) {
  const { visible, onClose, openKeystone } = props
  const handleCopyCode = () => {}
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
        <span className={styles.str}>{`12312313123123123123132323424112`}</span>
        <span className={styles.copy} onClick={() => handleCopyCode} />
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

export default UserDetail
