import React, { Fragment, useState } from 'react'
import { InputItem, TextareaItem } from 'antd-mobile'
import { Form, Select } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseWarn from '../component/layout/BaseWarn'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import styles from './ImportKeystone.scss'
import BaseLabel from '../component/layout/BaseLabel'

const FormItem = Form.Item
const Option = Select.Option

const ImportForm = Form.create({ name: 'login' })(props => {
  const { form } = props
  const { getFieldDecorator } = form
  const importTypeList = ['私钥', 'JSON文件']
  const [importType, setImportType] = useState(importTypeList[0])
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
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      <FormItem label={<BaseLabel label={'选择类型:'} />}>
        <Select
          value={importType}
          onChange={e => setImportType(e)}
          className={styles.select}
        >
          {importTypeList.map((item, index) => (
            <Option value={item} key={index}>
              {item}
            </Option>
          ))}
        </Select>
      </FormItem>
      {importType === '私钥' ? (
        <FormItem label={<BaseLabel label={'请粘贴你的私钥:'} />}>
          {getFieldDecorator('private', {
            rules: [{ required: true, message: '请粘贴你的私钥' }]
          })(<TextareaItem />)}
        </FormItem>
      ) : (
        <FormItem label={<BaseLabel label={'请输入密码'} />}>
          {getFieldDecorator('password', {
            rules: [
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码长度不足' }
            ]
          })(<InputItem type="password" placeholder="请输入" />)}
        </FormItem>
      )}
      <FormItem>
        <BaseModalFooter onOk={handleSubmit} onCancel={routeBack} />
      </FormItem>
    </Form>
  )
})

const ImportKeystone = function() {
  return (
    <Fragment>
      <Header title={'导入地址'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <BaseWarn
            warns={[
              '导入的地址不能从当前钱包的助记词恢复。',
              '如果你切换了钱包，该地址将从钱包中消失，',
              '需要重新导入。',
              '请另行保管该地址的私钥！'
            ]}
          />
          <ImportForm />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default ImportKeystone
