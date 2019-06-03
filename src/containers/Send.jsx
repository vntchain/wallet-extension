import React, { Fragment } from 'react'
import { InputItem, TextareaItem } from 'antd-mobile'
import { Form } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import styles from './ImportKeystone.scss'
import BaseLabel from '../component/layout/BaseLabel'
// import { Link } from 'react-router-dom'
// import paths from '../utils/paths'

const FormItem = Form.Item

const SendForm = Form.create({ name: 'login' })(props => {
  const { form } = props
  const { getFieldDecorator } = form
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 }
    }
  }
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
      }
    })
  }
  const routeBack = () => {}
  return (
    <Form hideRequiredMark={true} {...formItemLayout} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'来自:'} />}>
        <p>11111</p>
      </FormItem>
      <FormItem label={<BaseLabel label={'请输入密码'} />}>
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不足' }
          ]
        })(<InputItem type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem label={<BaseLabel label={'请输入密码'} />}>
        {getFieldDecorator('remind')(
          <TextareaItem placeholder="请填写交易备注数据，非必填。" />
        )}
      </FormItem>
      <FormItem>
        <BaseModalFooter onOk={handleSubmit} onCancel={routeBack} />
      </FormItem>
    </Form>
  )
})

const Send = function() {
  return (
    <Fragment>
      <Header title={'主网'} theme={'trans'} />
      <div className={styles.banner} />
      <div className={styles.container}>
        <CommonPadding>
          <SendForm />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Send
