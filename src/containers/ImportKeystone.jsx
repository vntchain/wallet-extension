import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { InputItem, TextareaItem } from 'antd-mobile'
import { Form, Select, Row, Col, Upload, Button, message } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseWarn from '../component/layout/BaseWarn'
import BaseModalFooter from '../component/layout/BaseModalFooter'
import BaseLabel from '../component/layout/BaseLabel'
import { fileReaderAsText } from '../utils/helper'
import { commonFormSet } from '../constants/set'
import styles from './ImportKeystone.scss'
import { FormattedMessage, localText } from '../i18n'

const FormItem = Form.Item
const Option = Select.Option

const ImportForm = Form.create({ name: 'login' })(props => {
  const [files, setFiles] = useState([])
  const {
    form,
    importType,
    onSubmit,
    labelCol,
    contCol,
    isImportLoading,
    history,
    language
  } = props
  const { getFieldDecorator } = form
  const uploadProps = {
    name: 'files',
    action: '',
    // accept: '.json',
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
  const routeBack = () => {
    history.goBack()
  }
  return (
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      {importType === 0 ? (
        <FormItem
          label={
            <BaseLabel label={localText[language]['ImportKeystone_private']} />
          }
        >
          {getFieldDecorator('privateKey', {
            rules: [
              {
                required: true,
                message: <FormattedMessage id="ImportKeystone_privateTip" />
              }
            ]
          })(<TextareaItem />)}
        </FormItem>
      ) : (
        <Fragment>
          <FormItem wrapperCol={{ offset: labelCol, xs: contCol }}>
            {getFieldDecorator('file', {
              rules: [
                {
                  required: true,
                  message: <FormattedMessage id="ImportKeystone_fileTip" />
                }
              ]
            })(
              <Upload {...uploadProps}>
                <Button size="large">
                  <FormattedMessage id="ImportKeystone_file" />
                </Button>
              </Upload>
            )}
          </FormItem>
          <FormItem
            label={<BaseLabel label={localText[language]['password_tip']} />}
          >
            {getFieldDecorator('passwd')(
              <InputItem
                type="password"
                placeholder={localText[language]['password_placeholder']}
              />
            )}
          </FormItem>
        </Fragment>
      )}
      <FormItem>
        <BaseModalFooter
          onOk={handleSubmit}
          onCancel={routeBack}
          loading={isImportLoading}
        />
      </FormItem>
    </Form>
  )
})

const ImportKeystone = function(props) {
  const {
    dispatch,
    keystone: { isImportLoading },
    history,
    international: { language }
  } = props
  const importTypeList = {
    zh: ['私钥', 'Keystore文件'],
    en: ['Private Key', 'Keystore File']
  }
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
              passwd: passwd || '',
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
      <Header
        title={<FormattedMessage id="ImportKeystone_title" />}
        hasBack={true}
      />
      <div className={styles.container}>
        <CommonPadding>
          <BaseWarn warns={[localText[language]['ImportKeystone_warns']]} />
          <Row className={styles.types}>
            <Col span={labelCol}>
              <BaseLabel label={localText[language]['ImportKeystone_type']} />
            </Col>
            <Col span={contCol}>
              <Select
                onChange={e => setImportType(e)}
                value={importType}
                className={styles.select}
                size="large"
              >
                {importTypeList[language].map((item, index) => (
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
            isImportLoading={isImportLoading}
            history={history}
            language={language}
          />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(({ keystone, international }) => ({
    keystone,
    international
  }))(ImportKeystone)
)
