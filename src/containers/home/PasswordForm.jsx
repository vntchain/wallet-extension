import React from 'react'
import { InputItem } from 'antd-mobile'
import BaseModalFooter from '../../component/layout/BaseModalFooter'
import { Form } from 'antd'
import BaseLabel from '../../component/layout/BaseLabel'

const FormItem = Form.Item

const PasswordForm = Form.create({ name: 'word' })(props => {
  const { form, onCancel, onOk } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        onOk(values)
      }
    })
  }
  return (
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'请输入密码'} />}>
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不足' }
          ]
        })(<InputItem type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem>
        <BaseModalFooter onCancel={onCancel} onOk={handleSubmit} />
      </FormItem>
    </Form>
  )
})

export default PasswordForm
