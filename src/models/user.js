import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from 'utils/paths'
import { message } from 'antd'

const chrome = global.chrome

const { put } = effects
export default {
  state: {
    isAuth: false,
    accounts: [],
    isLoginDisable: false
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    login: takeLatest(function*(payload) {
      yield put({
        type: 'user/setIsLoginDisable',
        payload: true
      })
      chrome.runtime.getBackgroundPage(function(bg) {
        bg.login(payload)
          .then(function*() {
            yield put({
              type: 'user/setIsLogin',
              payload: true
            })
            yield put(push(paths.home))
            yield put({
              type: 'user/setIsLoginDisable',
              payload: false
            })
          })
          .catch(e => {
            put({
              type: 'user/setIsLoginDisable',
              payload: false
            })
            message.error(e.message)
            console.log(e) //eslint-disable-line
          })
      })
    })
  })
}
