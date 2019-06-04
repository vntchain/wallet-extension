import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import { login } from '../utils/chrome'
import { message } from 'antd'

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
      try {
        yield login(payload)
        yield put({
          type: 'user/setIsLogin',
          payload: true
        })
        yield put(push(paths.home))
        yield put({
          type: 'user/setIsLoginDisable',
          payload: false
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        put({
          type: 'user/setIsLoginDisable',
          payload: false
        })
      }
    })
  })
}
