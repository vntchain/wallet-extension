import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import { createWallet } from '../utils/chrome'
import { message } from 'antd'

const { put, select } = effects
export default {
  state: {
    isCreateDisable: false,
    isConfirmDisable: false,
    word: ''
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    create: takeLatest(function*({ payload }) {
      yield put({
        type: 'wallet/setIsCreateDisable',
        payload: true
      })
      try {
        const word = yield createWallet(payload)
        message.success('创建钱包成功！')
        yield put({
          type: 'user/setIsLogin',
          payload: true
        })
        yield put({
          type: 'wallet/setWord',
          payload: word
        })
        yield put(push(paths.word))
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'user/setIsCreateDisable',
          payload: false
        })
      }
    }),
    confirmWord: takeLatest(function*({ payload }) {
      try {
        yield put({
          type: 'wallet/setIsConfirmDisable',
          payload: true
        })
        const word = yield select(state => state.wallet.word)
        if (word === payload) {
          message.success('助记词确认成功！')
          yield put(push(paths.home))
        } else {
          message.error('请输入正确助记词！')
        }
      } catch (e) {
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'wallet/setIsConfirmDisable',
          payload: false
        })
      }
    })
  })
}
