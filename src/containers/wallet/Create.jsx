import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Form, Checkbox, message } from 'antd'
import { Button, InputItem } from 'antd-mobile'
import BaseLabel from '../../component/layout/BaseLabel'
import styles from './Create.scss'
const FormItem = Form.Item

const CreateForm = function(props) {
  const { form, onSubmit, isCreateDisable } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        const isAgree = form.getFieldValue('agree')
        if (isAgree) {
          console.log('Received values of form: ', values) //eslint-disable-line
          onSubmit({ passwd: values.password })
        } else {
          message.warn('请阅读并同意服务条款')
        }
      }
    })
  }
  const validateToNextPassword = (rule, value, callback) => {
    if (value && form.getFieldValue('confirmPassword')) {
      compareToFirstPassword(rule, value, callback)
    }
    callback()
  }
  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('请确认两次填写的密码相同！')
    }
    callback()
  }
  return (
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'新密码'} tip={'(至少8个字符)'} />}>
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不足' },
            { validator: validateToNextPassword }
          ]
        })(<InputItem type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem label={<BaseLabel label={'确认密码'} />}>
        {getFieldDecorator('confirmPassword', {
          rules: [
            { required: true, message: '请确认密码' },
            { validator: compareToFirstPassword }
          ]
        })(<InputItem type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem>
        {getFieldDecorator('agree', {
          valuePropName: 'checked',
          initialValue: true,
          rules: [{ required: true }]
        })(
          <Checkbox>
            <span>
              我已阅读并同意
              <a href="javascript:">服务条款</a>
            </span>
          </Checkbox>
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={isCreateDisable}
        >
          创建
        </Button>
      </FormItem>
    </Form>
  )
}

const WrapCreateForm = Form.create({ name: 'create' })(CreateForm)

const Wallet = function(props) {
  const {
    dispatch,
    wallet: { isCreateDisable }
  } = props
  const handleCreate = data => {
    dispatch({
      type: 'wallet/create',
      payload: data
    })
  }
  return (
    <Fragment>
      <div className={styles.create}>
        <div className={styles.title}>
          <h2>创建钱包</h2>
          <span>请记住您的密码，将用于登录钱包。</span>
        </div>
      </div>
      <WrapCreateForm
        onSubmit={handleCreate}
        isCreateDisable={isCreateDisable}
      />
    </Fragment>
  )
}

export default connect(({ wallet }) => ({
  wallet
}))(Wallet)
