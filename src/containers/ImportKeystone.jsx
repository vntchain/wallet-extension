import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import { InputItem, TextareaItem } from 'antd-mobile'
import { Form, Select, Row, Col, Upload, Button, message } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseWarn from '../component/layout/BaseWarn'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import BaseLabel from '../component/layout/BaseLabel'
import { fileReaderAsText } from '../utils/helper'
import styles from './ImportKeystone.scss'

const FormItem = Form.Item
const Option = Select.Option

const ImportForm = Form.create({ name: 'login' })(props => {
  const [files, setFiles] = useState([])
  const { form, importType, onSubmit, labelCol, contCol } = props
  const { getFieldDecorator } = form
  const uploadProps = {
    name: 'files',
    action: '',
    accept: '.json',
    beforeUpload: file => {
      console.log('Received values of form: ', file) //eslint-disable-line
      setFiles([file])
      return false
    },
    fileList: files
  }
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        onSubmit({ ...values, files })
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
          <FormItem wrapperCol={{ offset: labelCol, xs: contCol }}>
            {getFieldDecorator('file', {
              rules: [{ required: true, message: '请上传keystone' }]
            })(
              <Upload {...uploadProps}>
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

const ImportKeystone = function(props) {
  const { dispatch } = props
  const importTypeList = ['私钥', 'JSON文件']
  const [importType, setImportType] = useState(0)
  const labelCol = 6
  const contCol = 18
  const handleImport = data => {
    if (importType === 0) {
      const { privateKey } = data
      dispatch({
        type: 'keystone/importByPrivateKey',
        payload: { privateKey }
      })
    } else {
      const { files, passwd } = data
      fileReaderAsText(files[0])
        .then(text => {
          const keystone = JSON.parse(text)
          dispatch({
            type: 'keystone/importByKeystone',
            payload: {
              passwd,
              input: keystone
            }
          })
        })
        .catch(err => {
          message.error(err.message)
        })
    }
  }
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
          <Row className={styles.types}>
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
            contCol={contCol}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect()(ImportKeystone)
