import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseTip from '../component/layout/BaseTip'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import { splitLongStr } from '../utils/helper'
import styles from './OuterAuth.scss'

const OuterAuth = function(props) {
  const {
    dispatch,
    user: { addr },
    popup: { popup }
  } = props
  const port = global.chrome.runtime.connect({ name: 'popup' })
  const handleAuth = status => {
    port.postMessage({
      src: 'popup',
      dst: 'background',
      type: 'confirm_request_authorization',
      data: { confirmAuthorization: status }
    })
  }
  useEffect(() => {
    dispatch({
      type: 'popup/getPopup'
    })
  }, [])
  return (
    <Fragment>
      <Header title={'VNT主网'} />
      <div className={styles.container}>
        <CommonPadding>
          <h3>请求获得您的VNT地址</h3>
          <div className={styles.info}>
            <div className={styles['info-item']}>
              <label>请求来源:</label>
              <span>{popup.url}</span>
            </div>
            <div className={styles['info-item']}>
              <label>您的地址:</label>
              <span>{splitLongStr(addr)}</span>
            </div>
          </div>
          <BaseTip
            className={styles.tip}
            tips={[
              'Dice2Win.com正在请求获得您的地址，以便它提供后续服务。这意味着它能够查询到您在该地址的资产数量及相关交易。如果它想从您的地址转移资产，那么每次转账都需要您重新批准。'
            ]}
          />
          <BaseModalFooter
            onCancel={handleAuth(false)}
            onOk={handleAuth(true)}
            cancelText="拒绝"
            okText="同意"
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(({ user, popup }) => ({ user, popup }))(OuterAuth)
