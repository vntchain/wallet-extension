import { effects } from 'redux-sirius'
import { message } from 'antd'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  signThenSendTransaction,
  getGasPrice,
  getEstimateGas,
  cancelTransaction,
  resendTransaction
} from '../utils/chrome'
const { put, select } = effects

const defaultTx = {
  gasPrice: 0,
  gas: 21000, //gasLimit
  from: '',
  to: '',
  value: 0,
  data: ''
}

export default {
  state: {
    gasPriceDefault: 0,
    gasLimitDefault: 21000,
    tx: defaultTx,
    isSendLoading: false,
    isCancelLoading: false,
    isResend: false //是否重发交易标志
  },
  reducers: {
    clearTx: state => {
      return {
        ...state,
        tx: defaultTx
      }
    }
  },
  effects: ({ takeLatest }) => ({
    sendTx: takeLatest(function*() {
      try {
        yield put({
          type: 'send/setIsSendLoading',
          payload: true
        })
        const tx = yield select(state => state.send.tx)
        const addr = yield select(state => state.user.addr)
        const id = yield signThenSendTransaction({ tx: { ...tx }, addr })
        //清空发送表单
        yield put({
          type: 'send/clearTx'
        })
        //给交易详情默认一个id，获取到交易信息后更新
        yield put({
          type: 'user/setTxDetail',
          payload: { id }
        })
        //获取交易信息
        yield put({
          type: 'user/getAccounts'
        })
        yield put(push(`${paths.txDetail}/${id}`))
      } catch (e) {
        message.error(e.message || e)
        console.log('sendTx:' + e) //eslint-disable-line
      } finally {
        yield put({
          type: 'send/setIsSendLoading',
          payload: false
        })
      }
    }),
    getGasPrice: takeLatest(function*() {
      try {
        const res = yield getGasPrice()
        yield put({
          type: 'send/setGasPriceDefault',
          payload: res
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getGasPrice:' + e) //eslint-disable-line
      }
    }),
    getGasLimit: takeLatest(function*({ payload }) {
      try {
        const res = yield getEstimateGas(payload)
        yield put({
          type: 'send/merge',
          payload: {
            gasLimitDefault: res,
            tx: {
              gas: res
            }
          }
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getGasLimit:' + e) //eslint-disable-line
      }
    }),
    cancelSendTx: takeLatest(function*({ payload }) {
      try {
        yield put({
          type: 'send/setIsCancelLoading',
          payload: true
        })
        yield cancelTransaction(payload)
        yield put(push(`${paths.home}`))
      } catch (e) {
        message.error(e.message || e)
        console.log('cancelTx:' + e) //eslint-disable-line
      } finally {
        yield put({
          type: 'send/setIsCancelLoading',
          payload: false
        })
      }
    }),
    resendTx: takeLatest(function*({ payload }) {
      try {
        const tx = yield select(({ send: { tx } }) => tx)
        const addr = yield select(({ user: { addr } }) => addr)
        const id = yield resendTransaction({
          tx: { ...tx, ...payload.tx },
          addr
        })
        //清空发送表单
        yield put({
          type: 'send/clearTx'
        })
        //给交易详情默认一个id，获取到交易信息后更新
        yield put({
          type: 'user/setTxDetail',
          payload: { id }
        })
        //获取交易信息
        yield put({
          type: 'user/getAccounts'
        })
        yield put(push(`${paths.txDetail}/${id}`))
      } catch (e) {
        message.error(e.message || e)
        console.log('resendTx:' + e) //eslint-disable-line
      }
    }),
    getGasInfo: takeLatest(function*({ payload, hasOuterGas }) {
      try {
        const gasPriceDefault = yield select(
          ({ send: { gasPriceDefault } }) => gasPriceDefault
        )
        let gasPrice = gasPriceDefault
        if (!gasPriceDefault) {
          gasPrice = yield getGasPrice()
          yield put({
            type: 'send/setGasPriceDefault',
            payload: gasPrice
          })
        }
        const gasLimit = yield getEstimateGas(payload)
        yield put({
          type: 'send/setGasLimitDefault',
          payload: gasLimit
        })
        //dapp页面传入gasPrice和gas时，设置获取到的默认值为交易值
        if (!hasOuterGas) {
          yield put({
            type: 'send/merge',
            payload: {
              tx: {
                gasPrice: gasPrice,
                gas: gasLimit
              }
            }
          })
        }
      } catch (e) {
        message.error(e.message || e)
        console.log('getGas:' + e) //eslint-disable-line
      }
    })
  })
}
