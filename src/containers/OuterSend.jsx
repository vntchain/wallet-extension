import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import { splitLongStr, calBigMulti, calCommission } from '../utils/helper'
import paths from '../utils/paths'
import styles from './OuterSend.scss'

const OuterSend = function(props) {
  const {
    price: { vntToCny = 1 },
    send: {
      tx: { gasPrice, gas }
    }
  } = props
  const [tx, setTx] = useState(null)
  const handleCancel = () => {}
  const handleOk = () => {}
  useEffect(() => {
    // global.chrome.runtime.onMessage.addListener(
    //   function(request, sender, sendResponse) {
    //     if(request.type === 'requesetAuthorization') {
    //     }
    //   }
    // )
    setTx(
      Object.assign(
        {
          from: '0x111111111111111111111',
          balance: '111',
          value: '111',
          to: '0x111111111111111111111',
          gasPrice: '50',
          gas: '21000',
          remarks: '111'
        },
        { gasPrice, gas }
      )
    )
  }, [])
  return (
    <Fragment>
      <Header title={'发送VNT（VNT主网）'} />
      <div className={styles.container}>
        {tx ? (
          <CommonPadding>
            <div className={styles['send-item']}>
              <label>来自：</label>
              <div>
                <div className={styles.cont}>{splitLongStr(tx.from)}</div>
                <div className={styles.info}>{`${tx.balance} VNT`}</div>
                <div className={styles.info}>
                  {`￥ ${calBigMulti(tx.balance, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>发送至：</label>
              <div className={styles.cont}>{splitLongStr(tx.to)}</div>
            </div>
            <div className={styles['send-item']}>
              <label>数量：</label>
              <div>
                <div className={styles.info}>{`${tx.value} VNT`}</div>
                <div className={styles.remarks}>
                  {`￥ ${calBigMulti(tx.value, vntToCny)}`}
                </div>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>手续费：</label>
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
                  自定义
                </Link>
              </div>
            </div>
            <div className={styles['send-item']}>
              <label>备注：</label>
              <div className={styles.remarks}>{tx.remarks}</div>
            </div>
            <BaseModalFooter
              onCancel={handleCancel}
              onOk={handleOk}
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

export default connect(({ price, send }) => ({ price, send }))(OuterSend)
