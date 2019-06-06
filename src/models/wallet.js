import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import { createWallet, restoreFromSeed } from '../utils/chrome'
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
          type: 'user/setIsAuth',
          payload: true
        })
        yield put({
          type: 'wallet/setWord',
          payload: word
        })
        //登录成功，获取地址
        yield put({
          type: 'user/getAddr'
        })
        //跳转页面
        yield put(push(paths.word))
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'wallet/setIsCreateDisable',
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
    }),
    regainWord: takeLatest(function*({ payload }) {
      try {
        yield put({
          type: 'wallet/setIsConfirmDisable',
          payload: true
        })
        yield restoreFromSeed(payload)
        message.success('恢复钱包成功！')
        yield put({
          type: 'user/setIsAuth',
          payload: true
        })
        //登录成功，获取地址
        yield put({
          type: 'user/getAddr'
        })
        //跳转页面
        yield put(push(paths.word))
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
