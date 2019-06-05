import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'antd-mobile'
import { Form, Input } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import styles from './ImportKeystone.scss'
import BaseLabel from '../component/layout/BaseLabel'
import paths from '../utils/paths'

const FormItem = Form.Item
const TexeArea = Input.TextArea

const SendForm = Form.create({ name: 'login' })(props => {
  const { form } = props
  const { getFieldDecorator } = form
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  }
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
      }
    })
  }
  return (
    <Form hideRequiredMark={true} {...formItemLayout} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'来自:'} />}>
        <p>11111</p>
      </FormItem>
      <FormItem label={<BaseLabel label={'发送至：'} />}>
        {getFieldDecorator('to', {
          rules: [{ required: true, message: '请输入目标地址' }]
        })(<Input type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem label={<BaseLabel label={'数量：'} />}>
        {getFieldDecorator('to', {
          rules: [{ required: true, message: '请输入数量' }]
        })(<Input type="number" placeholder="请输入" />)}
      </FormItem>
      <FormItem label={<BaseLabel label={'手续费:'} />}>
        <div>
          <p>11111</p>
          <Link to={paths.commission}>自定义</Link>
        </div>
      </FormItem>
      <FormItem label={<BaseLabel label={'备注数据：'} />}>
        {getFieldDecorator('remind')(
          <TexeArea placeholder="请填写交易备注数据，非必填。" />
        )}
      </FormItem>
      <FormItem>
        <Button type="primary" onClick={handleSubmit} />
      </FormItem>
    </Form>
  )
})

const Send = function() {
  return (
    <Fragment>
      <Header title={'发送VNT'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <SendForm />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Send
