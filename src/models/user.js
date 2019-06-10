import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  login,
  logout,
  getAddr,
  getAccounts,
  getAccountBalance
} from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    isAuth: false,
    addr: '',
    accountBalance: 0,
    accounts: [],
    trades: [],
    currTrade: [],
    isLoginDisable: false
  },
  reducer: {
    filterCurrentTrade: (state, { payload }) => {
      const addr = payload || state.addr
      const currTrade = state.trades[addr] || []
      return {
        ...state,
        currTrade
      }
    }
  },
  effects: ({ takeLatest }) => ({
    login: takeLatest(function*({ payload }) {
      yield put({
        type: 'user/setIsLoginDisable',
        payload: true
      })
      try {
        yield login(payload)
        yield put({
          type: 'user/setIsAuth',
          payload: true
        })
        //登录成功，获取地址
        yield put({
          type: 'user/getAddr'
        })
        yield put(push(paths.home))
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
    logout: takeLatest(function*() {
      try {
        yield logout()
        yield put({
          type: 'user/setIsAuth',
          payload: false
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    }),
    getAddr: takeLatest(function*() {
      try {
        const addr = yield getAddr()
        yield put({
          type: 'user/setAddr',
          payload: addr
        })
        //拿到地址后获取当前账户vnt
        yield put({
          type: 'user/getAccountBalance',
          payload: { addr }
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    }),
    getAccounts: takeLatest(function*() {
      try {
        const data = yield getAccounts()
        const { accounts, trxs } = data
        yield put({
          type: 'user/merge',
          payload: {
            accounts: accounts.reverse(),
            trades: trxs
          }
        })
        yield put({
          type: 'user/filterCurrentTrade'
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    }),
    getAccountBalance: takeLatest(function*({ payload }) {
      console.log(payload) //eslint-disable-line
      try {
        const data = yield getAccountBalance(payload)
        yield put({
          type: 'user/setAccountBalance',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log('getAccountBalance' + e) //eslint-disable-line
      }
    })
  })
}
