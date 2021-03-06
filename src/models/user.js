import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  login,
  logout,
  getAddr,
  getAccounts,
  getAccountBalance,
  providerNet,
  changeAddress,
  addNewAccount,
  changeProvider
} from '../utils/chrome'
import { message } from 'antd'
import { formatDecimal } from '../utils/helper'
// import { FormattedMessage } from '../i18n'
const { put, all, select } = effects
export default {
  state: {
    isAuth: false,
    envObj: {
      url: '',
      chainId: 1
    },
    addr: '',
    accountBalance: 0,
    accounts: [],
    trades: [],
    currTrade: [],
    txDetail: {},
    isLoginDisable: false,
    redirect: null
  },
  reducers: {
    filterCurrentTrade: (state, { payload }) => {
      const newState = Object.assign({}, state)
      const addr = payload || newState.addr
      const chainId = newState.envObj.chainId
      const currTrade = newState.trades[addr] || []
      const filteredTrade = currTrade
        .filter(item => item.chainId == chainId)
        .sort((a, b) => {
          const dateA = new Date(a.time)
          const dateB = new Date(b.time)
          return dateB.valueOf() - dateA.valueOf()
        })
      return {
        ...newState,
        currTrade: [...filteredTrade]
      }
    },
    filterTradeDetail: (state, { payload }) => {
      const id = payload
      const txDetail = state.currTrade.find(item => item.id === id) || { id }
      return {
        ...state,
        txDetail
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
        const redirect = yield select(({ user: { redirect } }) => redirect)
        yield put(push(paths[redirect] || paths.home))
      } catch (e) {
        message.error(e.message || e)
        console.log('login:' + e) //eslint-disable-line
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
        message.error(e.message || e)
        console.log('logout:' + e) //eslint-disable-line
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
        message.error(e.message || e)
        console.log('getAddr:' + e) //eslint-disable-line
      }
    }),
    setUserAddr: takeLatest(function*({ payload }) {
      try {
        const { addr } = payload
        yield changeAddress(payload)
        yield put({
          type: 'user/setAddr',
          payload: addr
        })
        //重新筛选当前addr下的交易列表
        yield put({
          type: 'user/filterCurrentTrade'
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('setUserAddr:' + e) //eslint-disable-line
      }
    }),
    getAccounts: takeLatest(function*() {
      try {
        const data = yield getAccounts()
        const { accounts, trxs } = data
        // yield put({
        //   type: 'user/merge',
        //   payload: {
        //     accounts: accounts.reverse(),
        //     trades: trxs
        //   }
        // })
        yield put({
          type: 'user/setAccounts',
          payload: accounts.reverse()
        })
        yield put({
          type: 'user/setTrades',
          payload: trxs
        })
        //get trade list
        yield put({
          type: 'user/filterCurrentTrade'
        })
        //get detail
        const txDetail = yield select(state => state.user.txDetail)
        const txId = txDetail.id
        if (txId) {
          yield put({
            type: 'user/filterTradeDetail',
            payload: txId
          })
        }
      } catch (e) {
        message.error(e.message || e)
        console.log('getAccounts:' + e) //eslint-disable-line
      }
    }),
    getAccountBalance: takeLatest(function*({ payload }) {
      try {
        let addr
        if (payload) {
          addr = payload.addr
        } else {
          addr = yield select(state => state.user.addr)
        }
        const data = yield getAccountBalance({ addr })
        yield put({
          type: 'user/setAccountBalance',
          payload: formatDecimal(data, 8)
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getAccountBalance:' + e) //eslint-disable-line
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
        message.error(e.message || e)
        console.log('getAccountBalanceAll:' + e) //eslint-disable-line
      }
    }),
    setProviderUrl: takeLatest(function*({ payload }) {
      try {
        yield changeProvider(payload)
        yield put({
          type: 'user/setEnvObj',
          payload: { chainId: payload.newprovider }
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('setProviderUrl:' + e) //eslint-disable-line
      }
    }),
    getProviderUrl: takeLatest(function*() {
      try {
        const data = yield providerNet()
        yield put({
          type: 'user/setEnvObj',
          payload: data
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getProviderUrl:' + e) //eslint-disable-line
      }
    }),
    addNewAccount: takeLatest(function*() {
      try {
        const addr = yield addNewAccount()
        yield put({
          type: 'user/setUserAddr',
          payload: { addr }
        })
        yield put({
          type: 'user/getAccounts'
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('addNewAccount:' + e) //eslint-disable-line
      }
    })
  })
}
