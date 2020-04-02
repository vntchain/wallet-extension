import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseTip from '../component/layout/BaseTip'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import { splitLongStr } from '../utils/helper'
import { netList } from '../constants/net'
import styles from './OuterAuth.scss'
import { FormattedMessage, localText } from '../i18n'

const OuterAuth = function(props) {
  const {
    dispatch,
    user: {
      addr,
      envObj: { chainId }
    },
    popup: { url },
    international: { language }
  } = props
  const port = global.chrome.runtime.connect({ name: 'popup' })
  port.onMessage.addListener(function(msg) {
    console.log('auth msg listened: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  port.onDisconnect.addListener(function(msg) {
    console.log('auth Port disconnected: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  const handleAuth = status => {
    port.postMessage({
      src: 'popup',
      dst: 'background',
      type: 'confirm_request_authorization',
      data: { url: url, confirmAuthorization: status }
    })
  }
  useEffect(() => {
    dispatch({
      type: 'popup/getPopup'
    })
  }, [])
  return (
    <Fragment>
      <Header title={`VNT${netList[language][chainId]}`} />
      <div className={styles.container}>
        <CommonPadding>
          <h3>
            <FormattedMessage id="OuterAuth_titleh3" />
          </h3>
          <div className={styles.info}>
            <div className={styles['info-item']}>
              <label>
                <FormattedMessage id="OuterAuth_from" />
              </label>
              <span>{url}</span>
            </div>
            <div className={styles['info-item']}>
              <label>
                <FormattedMessage id="OuterAuth_address" />
              </label>
              <span>{splitLongStr(addr)}</span>
            </div>
          </div>
          <BaseTip
            className={styles.tip}
            tips={[`${url}${localText[language]['OuterAuth_Tip']}`]}
          />
          <BaseModalFooter
            onCancel={() => handleAuth(false)}
            onOk={() => handleAuth(true)}
            cancelText={localText[language]['OuterAuth_cancelText']}
            okText={localText[language]['OuterAuth_okText']}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(({ user, popup, international }) => ({
  user,
  popup,
  international
}))(OuterAuth)
