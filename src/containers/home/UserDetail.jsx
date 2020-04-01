import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Modal, Button } from 'antd-mobile'
import Copier from '../../component/Copier'
import styles from './UserDetail.scss'
import genQRCode from '../../utils/genQRCode'
import { netUrlList } from '../../constants/net'
import { FormattedMessage } from '../../i18n'

const UserDetail = function(props) {
  const copyRef = React.createRef()
  const [QRCode, setQrCode] = useState('')
  const {
    visible,
    onClose,
    openKeystone,
    user: {
      addr,
      envObj: { chainId }
    },
    international: { language }
  } = props
  const handleOpenKeystone = () => {
    onClose()
    openKeystone()
  }
  const linkToVnt = () => {
    window.open(`${netUrlList[chainId]}/account/${addr}`)
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
        <Copier language={language} text={addr} ref={copyRef}>
          <span className={styles.copy} />
        </Copier>
      </div>
      <Button type="primary" className={styles.btn} onClick={linkToVnt}>
        <FormattedMessage id="UserDetail_toVnt" />
      </Button>
      <Button
        type="primary"
        className={styles.btn}
        onClick={handleOpenKeystone}
      >
        <FormattedMessage id="UserDetail_expPrivate" />
      </Button>
    </Modal>
  )
}

export default withRouter(
  connect(({ user, international }) => ({
    user,
    international
  }))(UserDetail)
)
