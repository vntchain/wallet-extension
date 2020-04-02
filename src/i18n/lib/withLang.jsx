import React from 'react'
import { LangConsumer } from './LangContext'
import zhText from '../locale/zh'
import enText from '../locale/en'

export const localText = {
  zh: zhText,
  en: enText
}

const withLang = Comp => {
  return function WrappedComp(props) {
    return (
      <LangConsumer>
        {({ lang }) => <Comp {...props} localText={localText[lang]} />}
      </LangConsumer>
    )
  }
}

export default withLang
