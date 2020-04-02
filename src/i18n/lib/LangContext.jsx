import React from 'react' // , { useState }

const LangContext = React.createContext({
  lang: 'zh',
  changeLang: () => {}
})

// 实际使用的 lang Provider

export const LangProvider = props => {
  const { lang } = props

  // const changeLang = language => {
  //   dispatch({
  //     type: 'international/setLanguage',
  //     payload: language
  //   })
  // }

  return (
    <LangContext.Provider value={{ lang }}>
      {props.children}
    </LangContext.Provider>
  )
}

// 实际使用的 lang Consumer
export const LangConsumer = LangContext.Consumer
