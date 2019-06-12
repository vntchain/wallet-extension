import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button } from 'antd-mobile'
import { Form, Input } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import paths from '../utils/paths'
import { splitLongStr, calCommission } from '../utils/helper'
import styles from './Send.scss'

const FormItem = Form.Item
const TexeArea = Input.TextArea

const SendForm = Form.create({ name: 'login' })(props => {
  const {
    form,
    user: { addr, accountBalance },
    price: { vntToCny },
    send: { gasPrice, gasLimit },
    getGasLimit,
    onSubmit
  } = props
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
        const { to, balance, remark } = values
        onSubmit({
          addr: addr,
          tx: {
            from: addr,
            to: to,
            value: balance,
            gas: gasLimit,
            gasPrice: gasPrice,
            data: remark
          }
        })
      }
    })
  }
  const handleSendAll = () => {
    setFieldsValue({
      balance: accountBalance
    })
  }
  const validateToAddr = (rule, value, callback) => {
    if (!value) {
      callback('请输入地址')
    } else {
      handleGetGasLimit()
      callback()
    }
  }
  const validateBalance = (rule, value, callback) => {
    const balanceReg = new RegExp(/^\d+(.\d+)?$/)
    if (!value) {
      callback('请输入数量')
    } else if (!balanceReg.test(value)) {
      callback('请输入正确的数量')
    } else {
      //设置vnt对应cny
      setBalanceCNY(value * vntToCny)
      handleGetGasLimit()
      callback()
    }
  }
  const handleGetGasLimit = () => {
    const to = getFieldValue('to')
    const balance = getFieldValue('balance')
    if (to && balance) {
      getGasLimit({
        tx: {
          from: addr,
          to: to,
          value: balance
        }
      })
    }
  }
  return (
    <Form hideRequiredMark={true} {...formItemLayout} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'来自:'} />}>
        <span className={styles.value}>{splitLongStr(addr)}</span>
        <span className={styles.info}>{`${accountBalance} VNT`}</span>
        <span className={styles.info}>{`￥ ${accountBalance * vntToCny}`}</span>
      </FormItem>
      <FormItem
        label={<BaseLabel style={{ lineHeight: '.4rem' }} label={'发送至：'} />}
      >
        {getFieldDecorator('to', {
          rules: [{ validator: validateToAddr }]
        })(<Input placeholder="请输入接收地址" size="large" />)}
      </FormItem>
      <FormItem
        label={<BaseLabel style={{ lineHeight: '.4rem' }} label={'数量：'} />}
      >
        {getFieldDecorator('balance', {
          rules: [{ validator: validateBalance }]
        })(<Input placeholder="请输入发送数量" size="large" suffix={'VNT'} />)}
      </FormItem>
      <div className={`${styles.between} ${styles.all}`}>
        <a href="javascript:void(0)" onClick={handleSendAll}>
          全部
        </a>
        <span className={styles.info}>{`￥ ${balanceCNY}`}</span>
      </div>
      <FormItem label={<BaseLabel label={'手续费:'} />}>
        <div className={styles.between}>
          <span className={styles.commission}>
            <span className={styles.value}>
              {`${calCommission(gasPrice, gasLimit)} VNT`}
            </span>
            <span className={styles.info}>{`￥ ${calCommission(
              gasPrice,
              gasLimit
            ) * vntToCny}`}</span>
          </span>
          <Link to={paths.commission}>自定义</Link>
        </div>
      </FormItem>
      <FormItem
        label={
          <BaseLabel style={{ lineHeight: '.4rem' }} label={'备注数据：'} />
        }
      >
        {getFieldDecorator('remark')(
          <TexeArea placeholder="请填写交易备注数据，非必填。" size="large" />
        )}
      </FormItem>
      <Button type="primary" onClick={handleSubmit}>
        发送
      </Button>
    </Form>
  )
})

const Send = function(props) {
  const { user, price, send, dispatch } = props
  useEffect(() => {
    dispatch({
      type: 'send/getGasPrice'
    })
  }, [])
  const getGasLimit = data => {
    dispatch({
      type: 'send/getGasLimit',
      payload: data
    })
  }
  const handleSend = data => {
    dispatch({
      type: 'send/sendTx',
      payload: data
    })
  }
  return (
    <Fragment>
      <Header title={'发送VNT'} hasBack={true} />
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
