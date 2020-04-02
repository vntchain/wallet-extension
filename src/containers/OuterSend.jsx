import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import { netList } from '../constants/net'
import {
  splitLongStr,
  calBigMulti,
  calCommission,
  isEmptyObject
} from '../utils/helper'
import paths from '../utils/paths'
import styles from './OuterSend.scss'
import { FormattedMessage, localText } from '../i18n'

const OuterSend = function(props) {
  const {
    dispatch,
    user: {
      addr,
      accountBalance,
      envObj: { chainId }
    },
    price: { vntToCny = 1 },
    send: { tx },
    popup: { trx },
    international: { language }
  } = props
  const port = global.chrome.runtime.connect({ name: 'popup' })
  port.onMessage.addListener(function(msg) {
    console.log('send msg listened: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  port.onDisconnect.addListener(function(msg) {
    console.log('send Port disconnected: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  const handleSend = status => {
    port.postMessage({
      src: 'popup',
      dst: 'background',
      type: 'confirm_send_trx',
      data: { confirmSendTrx: status, trx: tx }
    })
    //清除数据
    dispatch({
      type: 'send/clearTx'
    })
  }
  useEffect(() => {
    if (isEmptyObject(trx)) {
      dispatch({
        type: 'popup/getPopup'
      })
    }
    return () => {
      dispatch({
        type: 'popup/setTrx',
        payload: {}
      })
    }
  }, [])
  useEffect(() => {
    dispatch({
      type: 'user/getAccountBalance',
      payload: { addr }
    })
  }, [addr])
  useEffect(() => {
    if (trx && !isEmptyObject(trx)) {
      const trxTemp = Object.assign({}, tx, trx)
      // setTxObj(trxTemp)
      getGasLimit(trxTemp)
    }
  }, [trx])

  const getGasLimit = trxTemp => {
    //同步数据
    dispatch({
      type: 'send/setTx',
      payload: trxTemp
    })

    //获取gasInfo
    const { data, from, to, value } = trxTemp
    const newTx = { from, to, value, data }
    dispatch({
      type: 'send/getGasInfo',
      payload: { tx: newTx },
      hasOuterGas: trxTemp.gas ? true : false
    })
  }
  return (
    <Fragment>
      <Header
        title={`${localText[language]['OuterSend_title']}${netList[language][chainId]})`}
      />
      <div className={styles.container}>
        {tx ? (
          <CommonPadding>
            <div className={styles['send-item']}>
              <label>
                <FormattedMessage id="OuterSend_from" />
              </label>
              <div>
                <div className={styles.cont}>{splitLongStr(tx.from)}</div>
                <div className={styles.info}>{`${accountBalance} VNT`}</div>
                <div className={styles.info}>
                  {`￥ ${calBigMulti(accountBalance, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>
                <FormattedMessage id="OuterSend_to" />
              </label>
              <div className={styles.cont}>{splitLongStr(tx.to)}</div>
            </div>
            <div className={styles['send-item']}>
              <label>
                <FormattedMessage id="OuterSend_num" />
              </label>
              <div>
                <div className={styles.info}>{`${tx.value} VNT`}</div>
                <div className={styles.remarks}>
                  {`￥ ${calBigMulti(tx.value, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>
                <FormattedMessage id="OuterSend_serviceCharge" />
              </label>
              <div className={styles.inner}>
                <div>
                  <div className={styles.cont}>
                    {`${calCommission(tx.gasPrice, tx.gas)} VNT`}
                  </div>
                  <div className={styles.remarks}>
                    {`￥ ${calBigMulti(
                      calCommission(tx.gasPrice, tx.gas),
                      vntToCny
                    )}`}
                  </div>
                </div>
                <Link className={styles.commission} to={paths.commission}>
                  <FormattedMessage id="OuterSend_commission" />
                </Link>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>
                <FormattedMessage id="OuterSend_mark" />
              </label>
              <div className={styles.remarks}>{tx.data}</div>
            </div>
            <BaseModalFooter
              onCancel={() => handleSend(false)}
              onOk={() => handleSend(true)}
              cancelText={localText[language]['OuterAuth_cancelText']}
              okText={localText[language]['OuterAuth_okText']}
            />
          </CommonPadding>
        ) : (
          ''
        )}
      </div>
    </Fragment>
  )
}

export default connect(({ user, price, send, popup, international }) => ({
  user,
  price,
  send,
  popup,
  international
}))(OuterSend)
