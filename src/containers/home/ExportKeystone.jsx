import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'antd-mobile'
import PasswordForm from './PasswordForm'
import BaseTip from '../../component/layout/BaseTip'
import BaseLabel from '../../component/layout/BaseLabel'
import Copier from '../../component/Copier'
import styles from './ExportKeystone.scss'

const UserDetail = function(props) {
  const {
    visible,
    onClose,
    user: { addr },
    keystone: { privateKey }
  } = props
  const handleFetchKeystone = () => {}
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
        {privateKey ? (
          <Fragment>
            <div className={styles.title}>
              <BaseLabel>地址</BaseLabel>
              <a href="javascript:">复制地址</a>
            </div>
            <div className={styles.code}>{addr}</div>
            <div className={styles.title}>
              <BaseLabel>私钥</BaseLabel>
              <span>
                <a href="javascript:">下载JSON文件</a>
                <Copier text={addr}>
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
