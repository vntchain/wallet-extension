import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Button, InputItem } from 'antd-mobile'
import { Form } from 'antd'
import styles from './Login.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseLabel from '../component/layout/BaseLabel'
import paths from '../utils/paths'
import imgs from '../utils/imgs'
const FormItem = Form.Item

const LoginForm = Form.create({ name: 'login' })(props => {
  const { form } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
      }
    })
  }
  return (
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'密码'} icon={imgs.password} />}>
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不足' }
          ]
        })(<InputItem type="password" placeholder="请输入" />)}
      </FormItem>
      <FormItem>
        <Button type="primary" onClick={handleSubmit}>
          登录
        </Button>
      </FormItem>
    </Form>
  )
})
const Login = function() {
  return (
    <Fragment>
      <Header title={'主网'} theme={'trans'} />
      <div className={styles.banner} />
      <div className={styles.container}>
        <CommonPadding>
          <h2 className={styles.title}>登录VNT钱包</h2>
          <LoginForm />
          <div className={styles.tip}>
            <p>
              登录另一个钱包？
              <Link to={paths.regainWord}>从助记词恢复钱包</Link>
            </p>
            <p>
              没有钱包？
              <Link to={paths.create}>创建钱包</Link>
            </p>
          </div>
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Login
