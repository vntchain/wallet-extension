import { effects } from 'redux-sirius'
import { message } from 'antd'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  signThenSendTransaction,
  getGasPrice,
  getEstimateGas
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
    isSendLoading: false
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
        yield put({
          type: 'send/clearTx'
        })
        yield put(push(`${paths.txDetail}/${id}`))
      } catch (e) {
        message.error(e.message || e)
        console.log(e) //eslint-disable-line
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
        console.log(e) //eslint-disable-line
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
        console.log(e) //eslint-disable-line
      }
    })
  })
}
