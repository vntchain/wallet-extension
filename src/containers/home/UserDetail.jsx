import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Modal, Button } from 'antd-mobile'
import Copier from '../../component/Copier'
import styles from './UserDetail.scss'
import genQRCode from '../../utils/genQRCode'
import paths from '../../utils/paths'

const UserDetail = function(props) {
  const copyRef = React.createRef()
  const [QRCode, setQrCode] = useState('')
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
  useEffect(() => {
    async function fetchData() {
      if (addr) {
        const qr = await genQRCode(addr)
        setQrCode(qr)
      }
    }
    fetchData()
  }, [addr])
  return (
    <Modal
      visible={visible}
      transparent
      maskClosable={true}
      onClose={onClose}
      className={styles.detail}
      wrapClassName={styles.wrap}
    >
      <img className={styles.qrcode} src={QRCode} alt="qrcode" />
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
