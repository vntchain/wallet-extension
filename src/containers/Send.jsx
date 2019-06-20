import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button } from 'antd-mobile'
import { Form, Input } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import paths from '../utils/paths'
import { netList } from '../constants/net'
import { addrPatten, balancePatten } from '../constants/pattens'
import { splitLongStr, calCommission, calBigMulti } from '../utils/helper'
import styles from './Send.scss'

const FormItem = Form.Item
const TexeArea = Input.TextArea

const SendForm = Form.create({ name: 'login' })(props => {
  const {
    form,
    user: { addr, accountBalance },
    price: { vntToCny },
    send: { tx },
    getGasLimit,
    onSubmit
  } = props
  const { to, value, data, gas: gasLimit, gasPrice } = tx
  const [balanceCNY, setBalanceCNY] = useState(0)
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  }
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        onSubmit()
      }
    })
  }
  const handleSendAll = () => {
    setFieldsValue({
      value: accountBalance
    })
    //设置vnt对应cny
    setBalanceCNY(calBigMulti(accountBalance, vntToCny))
  }
  const validateToAddr = (rule, value, callback) => {
    if (!value) {
      callback('请输入地址')
      return
    }
    if (!addrPatten.test(value)) {
      callback('请输入正确的地址')
      return
    }
    handleGetGasLimit()
    callback()
  }
  const validateBalance = (rule, value, callback) => {
    if (!value) {
      callback('请输入数量')
      return
    }
    if (!balancePatten.test(value)) {
      callback('请输入正确的数量')
      return
    }
    if (value > Number(accountBalance)) {
      callback('发送数量大于持有余额')
      return
    }
    //设置vnt对应cny
    setBalanceCNY(calBigMulti(value, vntToCny))
    handleGetGasLimit()
    callback()
  }
  const handleGetGasLimit = () => {
    const to = getFieldValue('to')
    const value = getFieldValue('value')
    const data = getFieldValue('data')
    getGasLimit({
      from: addr,
      to: to,
      value: value,
      data: data
    })
  }
  return (
    <Form hideRequiredMark={true} {...formItemLayout} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'来自:'} />}>
        <span className={styles.value}>{splitLongStr(addr)}</span>
        <span className={styles.info}>{`${accountBalance} VNT`}</span>
        <span className={styles.info}>
          {`￥ ${calBigMulti(accountBalance, vntToCny)}`}
        </span>
      </FormItem>
      <FormItem
        label={<BaseLabel style={{ lineHeight: '.4rem' }} label={'发送至:'} />}
      >
        {getFieldDecorator('to', {
          initialValue: to,
          rules: [{ validator: validateToAddr }]
        })(<Input placeholder="请输入接收地址" size="large" />)}
      </FormItem>
      <FormItem
        label={<BaseLabel style={{ lineHeight: '.4rem' }} label={'数量:'} />}
      >
        {getFieldDecorator('value', {
          initialValue: value,
          rules: [{ validator: validateBalance }]
        })(<Input placeholder="请输入发送数量" size="large" suffix={'VNT'} />)}
      </FormItem>
      <div className={`${styles.between} ${styles.all}`}>
        <a href="javascript:void(0)" onClick={handleSendAll}>
          全部
        </a>
        <span className={styles.info}>{`￥ ${balanceCNY}`}</span>
      </div>
      <FormItem
        label={
          <BaseLabel style={{ lineHeight: '.4rem' }} label={'备注数据:'} />
        }
      >
        {getFieldDecorator('data', {
          initialValue: data,
          rules: [{ max: 200, message: '备注数据要求200字符以内' }]
        })(
          <TexeArea
            placeholder="请填写交易备注数据，非必填。"
            size="large"
            onChange={handleGetGasLimit}
          />
        )}
      </FormItem>
      <FormItem label={<BaseLabel label={'手续费:'} />}>
        <div className={styles.between}>
          <span className={styles.commission}>
            <span className={styles.value}>
              {`${calCommission(gasPrice, gasLimit)} VNT`}
            </span>
            <span className={styles.info}>
              {`￥ ${calBigMulti(calCommission(gasPrice, gasLimit), vntToCny)}`}
            </span>
          </span>
          <Link to={paths.commission}>自定义</Link>
        </div>
      </FormItem>
      <Button type="primary" onClick={handleSubmit}>
        发送
      </Button>
    </Form>
  )
})

const Send = function(props) {
  const { user, price, send, dispatch } = props
  const {
    envObj: { chainId }
  } = user
  useEffect(() => {
    dispatch({
      type: 'send/getGasPrice'
    })
  }, [])
  const getGasLimit = txObj => {
    //同步数据
    dispatch({
      type: 'send/merge',
      payload: {
        tx: {
          ...txObj,
          gasPrice: send.gasPriceDefault //修改时设置gasPrice为默认值
        }
      }
    })
    //获取gasLimit
    dispatch({
      type: 'send/getGasLimit',
      payload: {
        tx: txObj
      }
    })
  }
  const handleSend = () => {
    dispatch({
      type: 'send/sendTx'
    })
  }
  return (
    <Fragment>
      <Header title={`发送VNT(${netList[chainId]})`} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <SendForm
            user={user}
            price={price}
            send={send}
            onSubmit={handleSend}
            getGasLimit={getGasLimit}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(({ user, price, send }) => ({
  user,
  price,
  send
}))(Send)
