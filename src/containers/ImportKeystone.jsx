import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import { InputItem, TextareaItem } from 'antd-mobile'
import { Form, Select, Row, Col, Upload, Button } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseWarn from '../component/layout/BaseWarn'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import styles from './ImportKeystone.scss'
import BaseLabel from '../component/layout/BaseLabel'

const FormItem = Form.Item
const Option = Select.Option

const ImportForm = Form.create({ name: 'login' })(props => {
  const { form, importType, onSubmit, labelCol } = props
  const { getFieldDecorator } = form
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        onSubmit(values)
      }
    })
  }
  const routeBack = () => {}
  return (
    <Form hideRequiredMark={true} onSubmit={handleSubmit}>
      {importType === 0 ? (
        <FormItem label={<BaseLabel label={'请粘贴你的私钥:'} />}>
          {getFieldDecorator('privateKey', {
            rules: [{ required: true, message: '请粘贴你的私钥' }]
          })(<TextareaItem />)}
        </FormItem>
      ) : (
        <Fragment>
          <FormItem wrapperCol={{ offset: labelCol }}>
            {getFieldDecorator('passwd', {
              rules: [
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码长度不足' }
              ]
            })(
              <Upload>
                <Button size="large">选择文件</Button>
              </Upload>
            )}
          </FormItem>
          <FormItem label={<BaseLabel label={'请输入密码'} />}>
            {getFieldDecorator('passwd', {
              rules: [
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码长度不足' }
              ]
            })(<InputItem type="password" placeholder="请输入" />)}
          </FormItem>
        </Fragment>
      )}
      <FormItem>
        <BaseModalFooter onOk={handleSubmit} onCancel={routeBack} />
      </FormItem>
    </Form>
  )
})

const ImportKeystone = function() {
  const importTypeList = ['私钥', 'JSON文件']
  const [importType, setImportType] = useState(0)
  const labelCol = 6
  const contCol = 18
  const handleImport = () => {}
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
          <Row>
            <Col span={labelCol}>
              <BaseLabel label={'选择类型:'} />
            </Col>
            <Col span={contCol}>
              <Select
                value={importType}
                onChange={e => setImportType(e)}
                className={styles.select}
                size="large"
              >
                {importTypeList.map((item, index) => (
                  <Option value={index} key={index}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <ImportForm
            importType={importType}
            onSubmit={handleImport}
            labelCol={labelCol}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect()(ImportKeystone)
