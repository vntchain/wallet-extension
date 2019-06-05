import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import { login, getAddr } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    isAuth: false,
    addr: '',
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
        //登录成功，获取地址
        yield put({
          type: 'user/getAddr'
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
        yield put({
          type: 'user/setIsLoginDisable',
          payload: false
        })
      }
    }),
    getAddr: takeLatest(function*() {
      try {
        const addr = yield getAddr()
        yield put({
          type: 'user/setAddr',
          payload: addr
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
