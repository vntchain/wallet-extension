import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import {
  splitLongStr,
  calBigMulti,
  calCommission,
  isEmptyObject
} from '../utils/helper'
import paths from '../utils/paths'
import styles from './OuterSend.scss'

const OuterSend = function(props) {
  const {
    dispatch,
    user: { accountBalance },
    price: { vntToCny = 1 },
    send: { tx },
    popup: {
      popup: { trx }
    }
  } = props
  const port = global.chrome.runtime.connect({ name: 'popup' })
  port.onMessage.addListener(function(msg) {
    console.log('send msg listened: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  port.onDisconnect.addListener(function(msg) {
    console.log('send Port disconnected: ' + JSON.stringify(msg)) //eslint-disable-line
  })
  const [txObj, setTxObj] = useState(tx)
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
    dispatch({
      type: 'popup/getPopup'
    })
    dispatch({
      type: 'popup/getGasPrice'
    })
  }, [])
  useEffect(() => {
    if (trx && !isEmptyObject(trx)) {
      const trxTemp = Object.assign({}, tx, trx)
      console.log(trxTemp) //eslint-disable-line
      setTxObj(trxTemp)
      getGasLimit({ tx: trxTemp })
    }
  }, [trx])

  const getGasLimit = data => {
    //同步数据
    dispatch({
      type: 'send/merge',
      payload: data
    })
    //获取gasLimit
    if (!data.tx.gas)
      dispatch({
        type: 'send/getGasLimit',
        payload: data
      })
  }
  return (
    <Fragment>
      <Header title={'发送VNT（VNT主网）'} />
      <div className={styles.container}>
        {txObj ? (
          <CommonPadding>
            <div className={styles['send-item']}>
              <label>来自：</label>
              <div>
                <div className={styles.cont}>{splitLongStr(txObj.from)}</div>
                <div className={styles.info}>{`${accountBalance} VNT`}</div>
                <div className={styles.info}>
                  {`￥ ${calBigMulti(accountBalance, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>发送至：</label>
              <div className={styles.cont}>{splitLongStr(txObj.to)}</div>
            </div>
            <div className={styles['send-item']}>
              <label>数量：</label>
              <div>
                <div className={styles.info}>{`${txObj.value} VNT`}</div>
                <div className={styles.remarks}>
                  {`￥ ${calBigMulti(txObj.value, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>手续费：</label>
              <div className={styles.inner}>
                <div>
                  <div className={styles.cont}>
                    {`${calCommission(txObj.gasPrice, txObj.gas)} VNT`}
                  </div>
                  <div className={styles.remarks}>
                    {`￥ ${calBigMulti(
                      calCommission(txObj.gasPrice, txObj.gas),
                      vntToCny
                    )}`}
                  </div>
                </div>
                <Link className={styles.commission} to={paths.commission}>
                  自定义
                </Link>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>备注：</label>
              <div className={styles.remarks}>{txObj.data}</div>
            </div>
            <BaseModalFooter
              onCancel={() => handleSend(false)}
              onOk={() => handleSend(true)}
              cancelText="拒绝"
              okText="同意"
            />
          </CommonPadding>
        ) : (
          ''
        )}
      </div>
    </Fragment>
  )
}

export default connect(({ user, price, send, popup }) => ({
  user,
  price,
  send,
  popup
}))(OuterSend)
