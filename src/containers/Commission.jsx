import React, { Fragment, useState, useReducer } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Input, Button } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import BaseTip from '../component/layout/BaseTip'
import { calCommission } from '../utils/helper'
import paths from '../utils/paths'
import styles from './Commission.scss'

const Send = function(props) {
  const {
    price: { vntToCny },
    send: { gasPrice, gasLimit, price, gasPriceDefault, gasLimitDefault },
    dispatch,
    history
  } = props
  const [commission, setCommission] = useState(
    calCommission(gasPrice, gasLimit)
  )
  const [state, innerDispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'setGasPrice':
          return {
            ...state,
            gasPrice: action.payload
          }
        case 'setGasLimit':
          return {
            ...state,
            gasLimit: action.payload
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
      gasLimit
    }
  )
  const handleSubmit = () => {
    const { gasPrice, gasLimit } = state
    dispatch({
      type: 'send/merge',
      payload: {
        gasPrice,
        gasLimit
      }
    })
    history.push(paths.send)
  }
  const handleDefault = () => {
    innerDispatch({
      type: 'merge',
      payload: {
        gasPrice: gasPriceDefault,
        gasLimit: gasLimitDefault
      }
    })
  }
  const handlePriceChange = val => {
    //todo:验证
    innerDispatch({
      type: 'setGasPrice',
      payload: val
    })
    setCommission(calCommission(val, gasLimit))
  }
  const handleLimitChange = val => {
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
                <div className={styles.info}>{`￥ ${commission *
                  vntToCny}`}</div>
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
              </div>
              <div>
                <label>Gas Limit</label>
                <Input
                  size="large"
                  value={state.gasLimit}
                  onChange={e => handleLimitChange(e.target.value)}
                />
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
              <span className={styles.value}>{price}</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>手续费</span>
              <span className={styles.value}>{commission}</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>总计</span>
              <span className={styles.value}>{price + commission}</span>
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
  connect(({ price, send }) => ({
    price,
    send
  }))(Send)
)
