import { effects } from 'redux-sirius'
const { put } = effects

export default {
  state: {
    language: 'zh'
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    setLang: takeLatest(function*({ payload }) {
      try {
        if (payload.indexOf('?language') === -1) {
          yield put({
            type: 'international/setLanguage',
            payload: window.navigator.language.split('-')[0]
          })
        } else {
          const lang = payload.split('?language=')[1]
          yield put({
            type: 'international/setLanguage',
            payload: lang
          })
        }
      } catch (e) {
        console.log(e) //eslint-disable-line
      }
    })
  })
}
