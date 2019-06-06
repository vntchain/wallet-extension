import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import { exportAccountPrivatekey } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    privateKey: ''
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    getPrivatekey: takeLatest(function*(payload) {
      yield put({
        type: 'user/setIsLoginDisable',
        payload: true
      })
      try {
        yield exportAccountPrivatekey(payload)
        yield put({
          type: 'user/setIsAuth',
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
    })
  })
}
