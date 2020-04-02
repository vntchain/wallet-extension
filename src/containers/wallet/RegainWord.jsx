import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import BaseLabel from '../../component/layout/BaseLabel'
import { Form } from 'antd'
import { Button, InputItem, TextareaItem } from 'antd-mobile'
import { passwordPatten } from '../../constants/pattens'
import { commonFormSet } from '../../constants/set'
import { FormattedMessage, localText } from '../../i18n'

const FormItem = Form.Item
// const { TextArea } = Input

const WordForm = Form.create({ name: 'word' })(props => {
  const { form, onSubmit, language } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        const { seed, passwd } = values
        onSubmit({ seed, passwd, language: language })
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
      callback(localText[language]['newPassword_callback'])
    }
    callback()
  }
  return (
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      <FormItem
        label={<BaseLabel label={<FormattedMessage id="WordForm_label" />} />}
      >
        {getFieldDecorator('seed', {
          rules: [
            {
              required: true,
              message: <FormattedMessage id="WordForm_message" />
            }
          ]
        })(
          <TextareaItem
            placeholder={localText[language]['WordForm_placeholder']}
          />
        )}
      </FormItem>
      <FormItem
        label={
          <BaseLabel
            label={localText[language]['newPassword']}
            tip={<FormattedMessage id="newPasswordTip" />}
          />
        }
      >
        {getFieldDecorator('passwd', {
          rules: [
            {
              required: true,
              message: <FormattedMessage id="newPasswordMessage" />
            },
            {
              min: 8,
              max: 16,
              message: <FormattedMessage id="newPasswordMessage2" />
            },
            {
              pattern: passwordPatten,
              message: <FormattedMessage id="newPasswordMessage3" />
            },
            { validator: validateToNextPassword }
          ]
        })(
          <InputItem
            type="password"
            maxLength={16}
            placeholder={localText[language]['password_placeholder']}
          />
        )}
      </FormItem>
      <FormItem
        label={<BaseLabel label={localText[language]['newPasswordConfirm']} />}
      >
        {getFieldDecorator('confirmPassword', {
          rules: [
            {
              required: true,
              message: <FormattedMessage id="newPasswordConfirmMessage" />
            },
            { validator: compareToFirstPassword }
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
        <Button type="primary" onClick={handleSubmit}>
          <FormattedMessage id="RegainWord_recover" />
        </Button>
      </FormItem>
    </Form>
  )
})

const RegainWord = function(props) {
  const {
    dispatch,
    international: { language }
  } = props
  const handleRegain = data => {
    dispatch({
      type: 'wallet/regainWord',
      payload: data
    })
  }
  return (
    <Fragment>
      <WordForm onSubmit={handleRegain} language={language} />
    </Fragment>
  )
}

export default connect(({ international }) => ({ international }))(RegainWord)
