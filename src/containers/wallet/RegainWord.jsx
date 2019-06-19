import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import BaseLabel from '../../component/layout/BaseLabel'
import { Form } from 'antd'
import { Button, InputItem, TextareaItem } from 'antd-mobile'
import { passwordPatten } from '../../constants/pattens'
const FormItem = Form.Item
// const { TextArea } = Input

const WordForm = Form.create({ name: 'word' })(props => {
  const { form, onSubmit } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        const { seed, passwd } = values
        onSubmit({ seed, passwd })
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
    if (value && value !== form.getFieldValue('passwd')) {
      callback('请确认两次填写的密码相同！')
    }
    callback()
  }
  return (
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'确认您的助记词'} />}>
        {getFieldDecorator('seed', {
          rules: [{ required: true, message: '请输入助记词' }]
        })(
          <TextareaItem
            placeholder={`请使用空格分隔助记词，按照顺序依次输入。`}
          />
        )}
      </FormItem>
      <FormItem
        label={
          <BaseLabel label={'新密码'} tip={'(8-16位字符，包含字母和数字)'} />
        }
      >
        {getFieldDecorator('passwd', {
          rules: [
            { required: true, message: '请输入新密码' },
            { min: 8, max: 16, message: '请输入8-16位字符' },
            { pattern: passwordPatten, message: '密码包含字母和数字' },
            { validator: validateToNextPassword }
          ]
        })(<InputItem type="password" maxLength={16} placeholder="请输入" />)}
      </FormItem>
      <FormItem label={<BaseLabel label={'确认密码'} />}>
        {getFieldDecorator('confirmPassword', {
          rules: [
            { required: true, message: '请输入确认密码' },
            { validator: compareToFirstPassword }
          ]
        })(<InputItem type="password" maxLength={16} placeholder="请输入" />)}
      </FormItem>
      <FormItem>
        <Button type="primary" onClick={handleSubmit}>
          恢复钱包
        </Button>
      </FormItem>
    </Form>
  )
})

const RegainWord = function(props) {
  const { dispatch } = props
  const handleRegain = data => {
    dispatch({
      type: 'wallet/regainWord',
      payload: data
    })
  }
  return (
    <Fragment>
      <WordForm onSubmit={handleRegain} />
    </Fragment>
  )
}

export default connect()(RegainWord)
