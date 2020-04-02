import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'antd-mobile'
import PasswordForm from './PasswordForm'
import BaseTip from '../../component/layout/BaseTip'
import BaseLabel from '../../component/layout/BaseLabel'
import Copier from '../../component/Copier'
// import PageSpin from '../../component/layout/PageSpin'
import styles from './ExportKeystone.scss'
import { FormattedMessage, localText } from '../../i18n'

const UserDetail = function(props) {
  const addrCopyRef = React.createRef()
  const privateCopyRef = React.createRef()
  const [passwd, setPasswd] = useState('')
  const {
    visible,
    onClose,
    user: { addr },
    keystone: { privateKey, isDownloadLoading, isExportLoading },
    international: { language },
    dispatch
  } = props
  const handleFetchKeystone = values => {
    const { password: passwd } = values
    setPasswd(passwd)
    dispatch({
      type: 'keystone/getPrivateKey',
      payload: {
        addr,
        passwd
      }
    })
  }
  const handleFetchKeystoneJson = () => {
    dispatch({
      type: 'keystone/getPrivateJson',
      payload: {
        passwd,
        privatekey: privateKey
      }
    })
  }
  const handleClose = () => {
    onClose()
    //关闭窗口时重置状态，下次打开需重新输入密码获取
    dispatch({
      type: 'keystone/setPrivateKey',
      payload: null
    })
    //清空获取到的私钥json，下次打开需重新获取
    dispatch({
      type: 'keystone/setPrivateJson',
      payload: null
    })
  }
  return (
    <Modal
      visible={visible}
      transparent
      title={<FormattedMessage id="ExportKeystone_Modal_title" />}
      closable={true}
      maskClosable={true}
      onClose={handleClose}
      className={styles.detail}
      wrapClassName={styles.wrap}
    >
      {/* <PageSpin spinning={isDownloadLoading} /> */}
      <div className={styles.cont}>
        {privateKey ? (
          <Fragment>
            <div className={styles.title}>
              <BaseLabel>
                <FormattedMessage id="ExportKeystone_address" />
              </BaseLabel>
              <Copier text={addr} language={language} ref={addrCopyRef}>
                <a href="javascript:">
                  <FormattedMessage id="ExportKeystone_addrCopy" />
                </a>
              </Copier>
            </div>
            <div className={styles.addr}>{addr}</div>
            <div className={styles.title}>
              <BaseLabel>
                <FormattedMessage id="ExportKeystone_private" />
              </BaseLabel>
              <span>
                {isDownloadLoading ? (
                  <FormattedMessage id="ExportKeystone_DownloadLoading" />
                ) : (
                  <a href="javascript:" onClick={handleFetchKeystoneJson}>
                    <FormattedMessage id="ExportKeystone_downloadJson" />
                  </a>
                )}
                <Copier
                  text={privateKey}
                  language={language}
                  ref={privateCopyRef}
                >
                  <a href="javascript:">
                    <FormattedMessage id="ExportKeystone_privateCopy" />
                  </a>
                </Copier>
              </span>
            </div>
            <div className={styles.code}>{privateKey}</div>
            <BaseTip
              className={styles.tips}
              tips={localText[language]['ExportKeystone_tip']}
            />
            <Button type="primary" onClick={handleClose}>
              <FormattedMessage id="ExportKeystone_ok" />
            </Button>
          </Fragment>
        ) : (
          <PasswordForm
            onCancel={onClose}
            onOk={handleFetchKeystone}
            loading={isExportLoading}
          />
        )}
      </div>
    </Modal>
  )
}

export default connect(({ user, keystone, international }) => ({
  user,
  keystone,
  international
}))(UserDetail)
