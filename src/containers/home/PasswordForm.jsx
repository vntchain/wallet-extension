import React from 'react'
import { InputItem } from 'antd-mobile'
import { connect } from 'react-redux'
import BaseModalFooter from '../../component/layout/BaseModalFooter'
import { Form } from 'antd'
import BaseLabel from '../../component/layout/BaseLabel'
import { commonFormSet } from '../../constants/set'
import { FormattedMessage, localText } from '../../i18n'

const FormItem = Form.Item

const PasswordForm = Form.create({ name: 'word' })(props => {
  const {
    form,
    onCancel,
    onOk,
    loading,
    international: { language }
  } = props
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
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      <FormItem
        label={<BaseLabel label={localText[language]['password_tip']} />}
      >
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: <FormattedMessage id="password_tip" /> }
          ]
        })(
          <InputItem
            type="password"
            maxLength={16}
            placeholder={localText[language]['password_placeholder']}
          />
        )}
      </FormItem>
      <FormItem>
        <BaseModalFooter
          onCancel={onCancel}
          onOk={handleSubmit}
          loading={loading}
        />
      </FormItem>
    </Form>
  )
})

export default connect(({ international }) => ({
  international
}))(PasswordForm)
