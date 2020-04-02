import React from 'react'
import PropTypes from 'prop-types'
import { LangConsumer } from './LangContext'
import zhText from '../locale/zh'
import enText from '../locale/en'

const localText = {
  zh: zhText,
  en: enText
}

const FormattedMessage = props => {
  const { id, plain } = props

  return (
    <LangConsumer>
      {({ lang }) =>
        plain ? localText[lang][id] : <span>{localText[lang][id]}</span>
      }
    </LangConsumer>
  )
}

FormattedMessage.propTypes = {
  id: PropTypes.string.isRequired,
  plain: PropTypes.bool
}

FormattedMessage.defaultProps = {
  plain: false
}

export default FormattedMessage
