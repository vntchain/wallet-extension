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
  changeAddress,
  addNewAccount,
  changeProvider
} from '../utils/chrome'
import { message } from 'antd'

const { put, all, select } = effects
export default {
  state: {
    isAuth: false,
    envUrl: '',
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
        yield changeAddress(payload)
        yield put({
          type: 'user/setAddr',
          payload: addr
        })
        //拿到地址后获取当前账户vnt
        yield put({
          type: 'user/getAccountBalance',
          payload: { addr }
        })
        //重新筛选当前addr下的交易列表
        yield put({
          type: 'user/filterCurrentTrade'
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
    getAccountBalanceAll: takeLatest(function*() {
      try {
        const accounts = yield select(state => state.user.accounts)
        const objAll = {}
        accounts.map(
          item => (objAll[item.addr] = getAccountBalance({ addr: item.addr }))
        )
        const result = yield all(objAll)
        accounts.map(item => (item.vnt = result[item.addr]))
        yield put({
          type: 'user/setAccounts',
          payload: accounts
        })
      } catch (e) {
        message.error(e.message)
        console.log('getAccountBalanceAll' + e) //eslint-disable-line
      }
    }),
    setProviderUrl: takeLatest(function*({ payload }) {
      try {
        yield changeProvider(payload)
        yield put({
          type: 'user/setEnvUrl',
          payload: payload.newprovider
        })
      } catch (e) {
        message.error(e.message)
        console.log('getProviderUrl' + e) //eslint-disable-line
      }
    }),
    getProviderUrl: takeLatest(function*() {
      try {
        const data = yield getProviderUrl()
        yield put({
          type: 'user/setEnvUrl',
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
        yield put({
          type: 'user/getAccounts'
        })
      } catch (e) {
        message.error(e.message)
        console.log('addNewAccount' + e) //eslint-disable-line
      }
    })
  })
}
