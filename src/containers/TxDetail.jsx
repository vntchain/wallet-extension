import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import Copier from '../component/Copier'
import paths from '../utils/paths'
import { calBigMulti, calCommission } from '../utils/helper'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import styles from './TxDetail.scss'

const TxDetail = function(props) {
  const idCopyRef = React.createRef()
  const fromCopyRef = React.createRef()
  const toCopyRef = React.createRef()
  const refObj = {
    idCopyRef,
    fromCopyRef,
    toCopyRef
  }
  const {
    dispatch,
    history,
    user: { txDetail },
    price: { vntToCny },
    send: { isCancelLoading, gasPriceDefault, gasLimitDefault }
  } = props
  const id = props.match.params.id
  const renderTotal = (text, record) => {
    const { value, gas, gasPrice, gasUsed } = record
    const commission = gasUsed
      ? calCommission(gasUsed, gasPrice)
      : calCommission(gas, gasPrice)
    const total = Number(value) + Number(commission)
    return (
      <div className={styles.total}>
        <div className={styles.cont}>{total}</div>
        <div className={styles.info}>{`￥ ${calBigMulti(
          total,
          vntToCny
        )}`}</div>
      </div>
    )
  }
  useEffect(() => {
    dispatch({
      type: 'user/filterTradeDetail',
      payload: id
    })
    return () => {
      dispatch({
        type: 'user/setTxDetail',
        payload: {}
      })
    }
  }, [])
  const { data, from, to, value } = txDetail
  useEffect(() => {
    if (from) {
      //获取默认gas，hasOuterGas不更新tx里的gas
      dispatch({
        type: 'send/getGasInfo',
        payload: { tx: { data, from, to, value } },
        hasOuterGas: true
      })
    }
  }, [from])
  const DetailList = [
    {
      state: {
        label: '状态'
      },
      id: {
        label: '交易id',
        hasCopy: true
      },
      time: '时间',
      from: {
        label: '来自',
        hasCopy: true
      },
      to: {
        label: '至',
        hasCopy: true
      }
    },
    {
      data: '备忘数据'
    },
    {
      value: {
        label: '数量',
        render: text => `${text} VNT`
      },
      gas: 'Gas Limit',
      gasUsed: 'Gas Used',
      gasPrice: 'Gas Price（GWEI）',
      total: {
        label: '总量',
        render: (text, record) => renderTotal(text, record)
      }
    }
  ]
  const hasResendFooter = () => {
    const { state, gasPrice, gas } = txDetail
    return (
      state === 'pending' &&
      (gasPrice < gasPriceDefault || gas < gasLimitDefault)
    )
  }
  const handleCancel = () => {
    dispatch({
      type: 'send/cancelSendTx',
      payload: { txid: txDetail.id }
    })
  }
  const handleOk = () => {
    const { id, from, to, gasPrice, gas, value, data } = txDetail
    const tx = { id, from, to, gasPrice, gas, value, data }
    dispatch({
      type: 'send/setTx',
      payload: tx
    })
    dispatch({
      type: 'send/setIsResend',
      payload: true
    })
    history.push(paths.commission)
  }
  return (
    <Fragment>
      <Header title={'交易详情'} hasBack={true} backUrl={paths.home} />
      <div className={styles.container}>
        <CommonPadding>
          {txDetail.time ? (
            <Fragment>
              <div>
                {DetailList.map((blocks, index) => (
                  <div className={styles.block} key={index}>
                    {Object.keys(blocks).map(item => {
                      const val = blocks[item]
                      return (
                        <div className={styles['block-item']} key={item}>
                          <label>
                            {typeof val === 'string' ? val : val.label}
                          </label>
                          {val.render ? (
                            val.render(txDetail[item], txDetail)
                          ) : val.hasCopy ? (
                            <div className={styles.inner}>
                              <span className={styles.cont}>
                                {txDetail[item]}
                              </span>
                              <Copier
                                text={txDetail[item]}
                                ref={refObj[`${item}CopyRef`]}
                              >
                                <span className={styles.copy}>复制</span>
                              </Copier>
                            </div>
                          ) : (
                            <span className={styles.cont}>
                              {txDetail[item]}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              {hasResendFooter() ? (
                <BaseModalFooter
                  okText="加速交易"
                  cancelText="取消交易"
                  onCancel={handleCancel}
                  onOk={handleOk}
                  cancelLoading={isCancelLoading}
                />
              ) : (
                ''
              )}
            </Fragment>
          ) : (
            ''
          )}
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(({ user, price, send }) => ({ user, price, send }))(TxDetail)
)
