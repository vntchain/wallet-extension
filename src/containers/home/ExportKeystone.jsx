import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'antd-mobile'
import PasswordForm from './PasswordForm'
import BaseTip from '../../component/layout/BaseTip'
import BaseLabel from '../../component/layout/BaseLabel'
import Copier from '../../component/Copier'
import styles from './ExportKeystone.scss'

const UserDetail = function(props) {
  const addrCopyRef = React.createRef()
  const privateCopyRef = React.createRef()
  const {
    visible,
    onClose,
    user: { addr },
    keystone: { privateKey, isDownloadDisable, hasGetKey },
    dispatch
  } = props
  useEffect(() => {
    //关闭窗口时重置状态，下次打开需重新输入密码获取
    return dispatch({
      type: 'keystone/setHasGetKey',
      payload: false
    })
  }, [])
  const handleGetJson = () => {
    if (!isDownloadDisable) {
      console.log('download') //eslint-disable-line
    }
  }
  const handleFetchKeystone = values => {
    const { password: passwd } = values
    dispatch({
      type: 'keystone/getPrivateKey',
      payload: {
        addr,
        passwd
      }
    })
  }
  return (
    <Modal
      visible={visible}
      transparent
      title="导出私钥"
      closable={true}
      maskClosable={true}
      onClose={onClose}
      className={styles.detail}
      wrapClassName={styles.wrap}
    >
      <div className={styles.cont}>
        {hasGetKey ? (
          <Fragment>
            <div className={styles.title}>
              <BaseLabel>地址</BaseLabel>
              <Copier text={addr} copyRef={addrCopyRef}>
                <a href="javascript:">复制地址</a>
              </Copier>
            </div>
            <div className={styles.code}>{addr}</div>
            <div className={styles.title}>
              <BaseLabel>私钥</BaseLabel>
              <span>
                <a href="javascript:" onClick={() => handleGetJson}>
                  下载JSON文件
                </a>
                <Copier text={privateKey} copyRef={privateCopyRef}>
                  <a href="javascript:">复制私钥</a>
                </Copier>
              </span>
            </div>
            <div className={styles.code}>{privateKey}</div>
            <BaseTip
              tips={[
                '注意',
                '永远不要公开这个私钥。任何拥有你的私钥的人都可以窃取你地址上的资产。'
              ]}
            />
            <Button type="primary" onClick={onClose}>
              完成
            </Button>
          </Fragment>
        ) : (
          <PasswordForm onCancel={onClose} onOk={handleFetchKeystone} />
        )}
      </div>
    </Modal>
  )
}

export default connect(({ user, keystone }) => ({
  user,
  keystone
}))(UserDetail)
