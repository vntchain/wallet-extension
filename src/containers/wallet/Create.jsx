import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Form, Checkbox, message } from 'antd'
import { Button, InputItem } from 'antd-mobile'
import BaseLabel from '../../component/layout/BaseLabel'
import paths from '../../utils/paths'
import { passwordPatten } from '../../constants/pattens'
import { commonFormSet } from '../../constants/set'
import styles from './Create.scss'
const FormItem = Form.Item
import { FormattedMessage, localText } from '../../i18n'

const CreateForm = function(props) {
  const { form, onSubmit, isCreateDisable, language } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        const isAgree = form.getFieldValue('agree')
        if (isAgree) {
          console.log('Received values of form: ', values) //eslint-disable-line
          onSubmit({ passwd: values.password, language: language })
        } else {
          message.warn(localText[language]['Create_messageWarn'])
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
      callback(localText[language]['newPassword_callback'])
    }
    callback()
  }
  return (
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      <FormItem
        label={
          <BaseLabel
            label={localText[language]['newPassword']}
            tip={localText[language]['newPasswordTip']}
          />
        }
      >
        {getFieldDecorator('password', {
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
        {getFieldDecorator('agree', {
          valuePropName: 'checked',
          initialValue: true,
          rules: [{ required: true }]
        })(
          <Checkbox>
            <span>
              <FormattedMessage id="Create_messageWarn" />
              <Link to={paths.law}>
                <FormattedMessage id="Create_term" />
              </Link>
            </span>
          </Checkbox>
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={isCreateDisable}
        >
          <FormattedMessage id="Create_create" />
        </Button>
      </FormItem>
    </Form>
  )
}

const WrapCreateForm = Form.create({ name: 'create' })(CreateForm)

const Wallet = function(props) {
  const {
    dispatch,
    wallet: { isCreateDisable },
    international: { language }
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
          <h2>
            <FormattedMessage id="Create_title" />
          </h2>
          <FormattedMessage id="Create_title2" />
        </div>
      </div>
      <WrapCreateForm
        onSubmit={handleCreate}
        isCreateDisable={isCreateDisable}
        language={language}
      />
    </Fragment>
  )
}

export default connect(({ wallet, international }) => ({
  wallet,
  international
}))(Wallet)
