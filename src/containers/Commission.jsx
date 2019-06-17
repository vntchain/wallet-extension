import React, { Fragment, useState, useReducer } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Input, Button, message } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import BaseTip from '../component/layout/BaseTip'
import { calCommission, calBigMulti } from '../utils/helper'
import paths from '../utils/paths'
import { balancePatten } from '../constants/pattens'
import styles from './Commission.scss'

const Send = function(props) {
  const {
    user: { accountBalance },
    price: { vntToCny },
    send: {
      tx: { gasPrice, gas, value },
      gasPriceDefault,
      gasLimitDefault
    },
    dispatch,
    history
  } = props
  const [commission, setCommission] = useState(calCommission(gasPrice, gas))
  const [state, innerDispatch] = useReducer(
    (state, action) => {
      console.log(action) //eslint-disable-line
      switch (action.type) {
        case 'setGasPrice':
          return {
            ...state,
            gasPrice: action.payload
          }
        case 'setPriceError':
          return {
            ...state,
            priceError: action.payload
          }
        case 'setGasLimit':
          return {
            ...state,
            gas: action.payload
          }
        case 'setLimitError':
          return {
            ...state,
            limitError: action.payload
          }
        case 'merge':
          return {
            ...state,
            ...action.payload
          }
        default:
          throw new Error()
      }
    },
    {
      gasPrice,
      priceError: '',
      gas,
      limitError: ''
    }
  )
  const handleSubmit = () => {
    const { gasPrice, gas } = state
    dispatch({
      type: 'send/merge',
      payload: {
        tx: {
          gasPrice,
          gas
        }
      }
    })
    history.push(paths.send)
  }
  const handleDefault = () => {
    innerDispatch({
      type: 'merge',
      payload: {
        gasPrice: gasPriceDefault,
        gas: gasLimitDefault
      }
    })
  }
  const handlePriceChange = val => {
    if (val && !balancePatten.test(val)) {
      message.info('非法字符')
      return
    }
    const { gas } = state
    //转账费+手续费不能高于余额
    if (calCommission(val, gas) > accountBalance) {
      return
    }
    innerDispatch({
      type: 'setGasPrice',
      payload: val
    })
    setCommission(calCommission(val, gas))
  }
  const handleLimitChange = val => {
    if (!balancePatten.test(val)) {
      message.info('非法字符')
      return
    }
    const { gasPrice } = state
    if (val < 21000) {
      innerDispatch({
        type: 'merge',
        payload: {
          gas: 21000
        }
      })
      return
    }
    //转账费+手续费不能高于余额
    if (calCommission(gasPrice, val) > accountBalance) {
      return
    }
    innerDispatch({
      type: 'setGasLimit',
      payload: val
    })
    setCommission(calCommission(gasPrice, val))
  }
  return (
    <Fragment>
      <Header title={'自定义手续费'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div className={`${styles.outlineFlex} ${styles.blocks}`}>
            <div className={styles.innerFlex}>
              <BaseLabel label={'手续费：'} />
              <span>
                <div className={styles.value}>{`${commission} VNT`}</div>
                <div className={styles.info}>
                  {`￥ ${calBigMulti(commission, vntToCny)}`}
                </div>
              </span>
            </div>
            <a
              className={styles.btn}
              href="javascript:"
              onClick={handleDefault}
            >
              推荐设置
            </a>
          </div>
          <div className={styles.blocks}>
            <div className={styles.price}>
              <div>
                <label>Gas Price（GWEI)</label>
                <Input
                  size="large"
                  value={state.gasPrice}
                  onChange={e => handlePriceChange(e.target.value)}
                />
                <span className={styles.error}>{state.priceError}</span>
              </div>
              <div>
                <label>Gas Limit</label>
                <Input
                  size="large"
                  value={state.gas}
                  onChange={e => handleLimitChange(e.target.value)}
                />
                <span className={styles.error}>{state.limitError}</span>
              </div>
            </div>
            <BaseTip
              tips={[
                '温馨提示：',
                '· 我们建议您使用系统推荐的参数设置。',
                '· Gas Price高，交易确认的速度快；Gas Price低，交易速度慢。',
                '· Gas Limit过低，会导致交易执行失败。'
              ]}
            />
          </div>
          <div className={`${styles.blocks} ${styles.total}`}>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>转账数量</span>
              <span className={styles.value}>{value}</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>手续费</span>
              <span className={styles.value}>{commission}</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>总计</span>
              <span className={styles.value}>{value + commission}</span>
            </div>
          </div>
          <Button
            className={styles.button}
            type="primary"
            size="large"
            onClick={handleSubmit}
          >
            确定
          </Button>
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(({ user, price, send }) => ({
    user,
    price,
    send
  }))(Send)
)
