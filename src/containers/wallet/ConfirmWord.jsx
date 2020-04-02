import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import BaseLabel from '../../component/layout/BaseLabel'
import { Form } from 'antd'
import { Button, TextareaItem } from 'antd-mobile'
import { commonFormSet } from '../../constants/set'
const FormItem = Form.Item
import { FormattedMessage, localText } from '../../i18n'
// import FormattedText from '../../i18n/lib/FormattedTest'

const WordForm = Form.create({ name: 'word' })(props => {
  const { form, onSubmit, word, language } = props
  const { getFieldDecorator, setFields } = form
  const handleSubmit = e => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values) //eslint-disable-line
        console.log(word, values.word) //eslint-disable-line
        if (word === values.word) {
          onSubmit()
        } else {
          setFields({
            word: {
              value: values.word,
              errors: [new Error(localText[language]['WordForm_error'])]
            }
          })
        }
      }
    })
  }
  return (
    <Form {...commonFormSet} onSubmit={handleSubmit}>
      <FormItem
        label={<BaseLabel label={localText[language]['WordForm_label']} />}
      >
        {getFieldDecorator('word', {
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
      <FormItem>
        <Button type="primary" onClick={handleSubmit}>
          <FormattedMessage id="WordForm_ok" />
        </Button>
      </FormItem>
    </Form>
  )
})

const ConfirmWord = function(props) {
  const {
    wallet: { word },
    international: { language },
    dispatch
  } = props
  const handleConfirmWord = () => {
    dispatch({
      type: 'wallet/confirmWord'
    })
  }
  return (
    <Fragment>
      <WordForm onSubmit={handleConfirmWord} word={word} language={language} />
    </Fragment>
  )
}

export default connect(({ wallet, international }) => ({
  wallet,
  international
}))(ConfirmWord)
