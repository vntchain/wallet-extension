import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  login,
  logout,
  getAddr,
  getAccounts,
  getAccountBalance,
  getProviderUrl,
  setAddr,
  addNewAccount
} from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    isAuth: false,
    providerUrl: '',
    addr: '',
    accountBalance: 0,
    accounts: [],
    trades: [],
    currTrade: [],
    isLoginDisable: false
  },
  reducers: {
    filterCurrentTrade: (state, { payload }) => {
      console.log(state) //eslint-disable-line
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
        yield put(push(paths.login))
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
    setUserAddr: takeLatest(function*({ payload }) {
      try {
        const addr = payload
        yield setAddr(addr)
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
    }),
    // setProviderUrl: {},
    getProviderUrl: takeLatest(function*() {
      try {
        const data = yield getProviderUrl()
        yield put({
          type: 'user/setProviderUrl',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log('getProviderUrl' + e) //eslint-disable-line
      }
    }),
    addNewAccount: takeLatest(function*() {
      try {
        const addr = yield addNewAccount()
        yield put({
          type: 'user/setUserAddr',
          payload: addr
        })
      } catch (e) {
        message.error(e.message)
        console.log('getIsWalletUnlock' + e) //eslint-disable-line
      }
    })
  })
}
