import React, { Fragment } from 'react'
import BaseLabel from '../../component/layout/BaseLabel'
import { Form } from 'antd'
import { Button, TextareaItem } from 'antd-mobile'
const FormItem = Form.Item

const WordForm = Form.create({ name: 'word' })(props => {
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
      <FormItem label={<BaseLabel label={'确认您的助记词'} />}>
        {getFieldDecorator('word', {
          rules: [{ required: true, message: '请输入助记词' }]
        })(
          <TextareaItem
            placeholder={`请使用空格分隔助记词，按照顺序依次输入。`}
          />
        )}
      </FormItem>
      <FormItem>
        <Button type="primary" onClick={handleSubmit}>
          确认
        </Button>
      </FormItem>
    </Form>
  )
})

const ConfirmWord = function() {
  return (
    <Fragment>
      <WordForm />
    </Fragment>
  )
}

export default ConfirmWord
