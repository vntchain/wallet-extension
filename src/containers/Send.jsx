import React, { Fragment, useState } from 'react'
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
import { commonFormSet } from '../constants/set'
import { splitLongStr, calCommission, calBigMulti } from '../utils/helper'
import styles from './Send.scss'
import { FormattedMessage, localText } from '../i18n'

const FormItem = Form.Item
const TextArea = Input.TextArea

const SendForm = Form.create({ name: 'login' })(props => {
  const {
    form,
    user: { addr, accountBalance },
    price: { vntToCny },
    send: { tx },
    getGasInfo,
    onSubmit,
    language
  } = props
  const { to, value, data, gas: gasLimit, gasPrice } = tx
  const [balanceCNY, setBalanceCNY] = useState(0)
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form
  const formItemLayout = {
    zh: {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    },
    en: {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 }
    }
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
    handleGetGasLimit()
  }
  const validateToAddr = (rule, value, callback) => {
    if (!value) {
      callback(localText[language]['send_validateToAddr_callback'])
      return
    }
    if (!addrPatten.test(value)) {
      callback(localText[language]['send_validateToAddr_callback2'])
      return
    }
    callback()
  }
  const validateBalance = (rule, value, callback) => {
    if (!value) {
      callback(localText[language]['send_validateBalance_callback'])
      return
    }
    if (!balancePatten.test(value)) {
      callback(localText[language]['send_validateBalance_callback2'])
      return
    }
    if (value > Number(accountBalance)) {
      callback(localText[language]['send_validateBalance_callback3'])
      return
    }
    //设置vnt对应cny
    setBalanceCNY(calBigMulti(value, vntToCny))
    callback()
  }
  const validateRemarks = (rule, value, callback) => {
    callback()
  }
  const handleGetGasLimit = () => {
    const to = getFieldValue('to')
    const value = getFieldValue('value')
    const data = getFieldValue('data')
    getGasInfo({
      from: addr,
      to: to,
      value: value,
      data: data
    })
  }
  return (
    <Form
      {...commonFormSet}
      {...formItemLayout[language]}
      onSubmit={handleSubmit}
    >
      <FormItem label={<BaseLabel label={localText[language]['send_from']} />}>
        <span className={styles.value}>{splitLongStr(addr)}</span>
        <span className={styles.info}>{`${accountBalance} VNT`}</span>
        <span className={styles.info}>
          {`￥ ${calBigMulti(accountBalance, vntToCny)}`}
        </span>
      </FormItem>
      <FormItem
        label={
          <BaseLabel
            style={{ lineHeight: '.4rem' }}
            label={localText[language]['send_to']}
          />
        }
      >
        {getFieldDecorator('to', {
          initialValue: to,
          rules: [{ validator: validateToAddr }]
        })(
          <Input
            placeholder={localText[language]['send_addressTip']}
            size="large"
            onBlur={handleGetGasLimit}
          />
        )}
      </FormItem>
      <FormItem
        label={
          <BaseLabel
            style={{ lineHeight: '.4rem' }}
            label={localText[language]['send_num']}
          />
        }
      >
        {getFieldDecorator('value', {
          initialValue: value,
          rules: [{ validator: validateBalance }]
        })(
          <Input
            className={styles['suffix-input']}
            placeholder={localText[language]['send_numTip']}
            size="large"
            suffix={'VNT'}
            onBlur={handleGetGasLimit}
          />
        )}
      </FormItem>
      <div className={`${styles.between} ${styles.all}`}>
        <a href="javascript:void(0)" onClick={handleSendAll}>
          <FormattedMessage id="send_all" />
        </a>
        <span className={styles.info}>{`￥ ${balanceCNY}`}</span>
      </div>
      <FormItem
        label={
          <BaseLabel
            style={{ lineHeight: '.4rem' }}
            label={localText[language]['send_postscript']}
          />
        }
      >
        {getFieldDecorator('data', {
          initialValue: data,
          rules: [
            {
              max: 200,
              message: <FormattedMessage id="send_postscriptTip" />
            },
            { validator: validateRemarks }
          ]
        })(
          <TextArea
            placeholder={localText[language]['send_postscript_placeholder']}
            size="large"
            onBlur={handleGetGasLimit}
          />
        )}
      </FormItem>
      <FormItem
        label={
          <BaseLabel
            style={language === 'en' ? { lineHeight: '.2rem' } : {}}
            label={localText[language]['send_serviceCharge']}
          />
        }
      >
        <div className={styles.between}>
          <span className={styles.commission}>
            <span className={styles.value}>
              {`${calCommission(gasPrice, gasLimit)} VNT`}
            </span>
            <span className={styles.info}>
              {`￥ ${calBigMulti(calCommission(gasPrice, gasLimit), vntToCny)}`}
            </span>
          </span>
          <Link to={paths.commission}>
            <FormattedMessage id="send_custom" />
          </Link>
        </div>
      </FormItem>
      <Button type="primary" onClick={handleSubmit}>
        <FormattedMessage id="send_send" />
      </Button>
    </Form>
  )
})

const Send = function(props) {
  const {
    user,
    price,
    send,
    dispatch,
    international: { language }
  } = props
  const {
    envObj: { chainId }
  } = user
  const getGasInfo = txObj => {
    //同步数据
    dispatch({
      type: 'send/merge',
      payload: {
        tx: txObj
      }
    })
    dispatch({
      type: 'send/getGasInfo',
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
      <Header
        title={`${localText[language]['send_title']}(${netList[language][chainId]})`}
        hasBack={true}
      />
      <div className={styles.container}>
        <CommonPadding>
          <SendForm
            user={user}
            price={price}
            send={send}
            onSubmit={handleSend}
            getGasInfo={getGasInfo}
            language={language}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(({ user, price, send, international }) => ({
  user,
  price,
  send,
  international
}))(Send)
