import React, { useState } from 'react'
import schema from 'async-validator'
import { Button } from 'antd-mobile'
import styles from './BaseForm.scss'

// const FieldList = [
//   {
//     name: 'password',
//     label: '选择类型',
//     direction: 'horizontal',
//     render:  props => <InputItem {...props} />
//   },
//   {
//     name: 'rePassword',
//     label: '确认密码',
//     rules: [{ required: true }, { max: 8, message: '密码长度不足' }],
//     render:  props => <InputItem {...props} />
//   }
// ]

const BaseForm = function(props) {
  const { FieldList, onSubmit, direction } = props
  const [formData, setFormData] = useState({})
  const [error, setError] = useState({})
  const descriptor = {}
  const handleDataChange = result => {
    setFormData({ ...formData, ...result })
  }
  const handleCheck = () => {
    var validator = new schema(descriptor)
    validator.validate(formData, (errors, fields) => {
      if (errors) {
        console.log(errors, fields) //eslint-disable-line
        setError(fields)
      } else {
        setError({})
        onSubmit(formData)
      }
    })
  }
  return (
    <div className={styles.form}>
      {FieldList.map(field => {
        const { name, label, tip, render, rules } = field
        if (rules) descriptor[name] = rules
        const currError = error[name]
        const layout = field.direction || direction || 'vertical' //排布方向：'horizontal', 'vertical'
        return (
          <div
            className={`${styles['form-item']} ${styles[layout]}`}
            key={name}
          >
            <div className={styles.label}>
              <label>{label}</label>
            </div>
            <div className={styles.cont}>
              {render({
                value: formData[name],
                onChange: e => handleDataChange({ [name]: e })
              })}
              <p className={styles.error}>
                {currError ? currError[0].message : ''}
              </p>
              <p>{tip}</p>
            </div>
          </div>
        )
      })}
      <Button type="primary" onClick={() => handleCheck()}>
        创建
      </Button>
    </div>
  )
}

export default BaseForm
