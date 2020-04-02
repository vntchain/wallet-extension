import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button, InputItem } from 'antd-mobile'
import { Form, Select } from 'antd'
import styles from './Login.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseLabel from '../component/layout/BaseLabel'
import paths from '../utils/paths'
import imgs from '../utils/imgs'
import { netList } from '../constants/net'
import { commonFormSet } from '../constants/set'
import { genSearchObj } from '../utils/helper'
import { FormattedMessage, localText } from '../i18n'

const FormItem = Form.Item
const Option = Select.Option

const LoginForm = Form.create({ name: 'login' })(props => {
  const { form, onSubmit, isLoginDisable, language } = props
  const { getFieldDecorator } = form

  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        onSubmit({ passwd: values.password })
      }
    })
  }

  return (
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      <FormItem
        label={
          <BaseLabel
            label={localText[language]['password']}
            icon={imgs.password}
          />
        }
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
        <Button type="primary" onClick={handleSubmit} disabled={isLoginDisable}>
          <FormattedMessage id="login_btn" />
        </Button>
      </FormItem>
    </Form>
  )
})
const Login = function(props) {
  const {
    dispatch,
    user: { isLoginDisable, envObj },
    international: { language }
  } = props
  useEffect(() => {
    const redirect = genSearchObj(props.location.search)['redirect']
    // console.log(redirect) //eslint-disable-line
    dispatch({
      type: 'user/setRedirect',
      payload: redirect
    })
  }, [])
  const handleLogin = data => {
    dispatch({
      type: 'user/login',
      payload: data
    })
  }
  const handleNetChange = val => {
    dispatch({
      type: 'user/setProviderUrl',
      payload: {
        newprovider: val
      }
    })
  }
  const renderTitle = () => {
    return (
      <Select
        onChange={handleNetChange}
        suffixIcon={<img src={imgs.suffix} alt="" />}
        value={envObj.chainId}
        className={styles.select}
      >
        {netList[language].map((item, index) => {
          return item ? (
            <Option value={index} key={index}>
              {item}
            </Option>
          ) : (
            ''
          )
        })}
      </Select>
    )
  }
  return (
    <Fragment>
      <Header title={renderTitle} theme={'trans'} />
      <div className={styles.banner} />
      <div className={styles.container}>
        <CommonPadding>
          <h2 className={styles.title}>
            <FormattedMessage id="login_title" />
          </h2>
          <LoginForm
            onSubmit={handleLogin}
            isLoginDisable={isLoginDisable}
            language={language}
          />
          <div className={styles.tip}>
            <p>
              <FormattedMessage id="login_tip1" />
              <Link to={paths.regainWord}>
                <FormattedMessage id="login_link1" />
              </Link>
            </p>
            <p>
              <FormattedMessage id="login_tip2" />
              <Link to={paths.create}>
                <FormattedMessage id="login_link2" />
              </Link>
            </p>
          </div>
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(({ user, international }) => ({ user, international }))(
  Login
)
