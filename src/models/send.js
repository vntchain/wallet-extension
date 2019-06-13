import { effects } from 'redux-sirius'
import { message } from 'antd'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
import {
  signThenSendTransaction,
  getGasPrice,
  getEstimateGas
} from '../utils/chrome'
const { put } = effects

export default {
  state: {
    gasPriceDefault: 0,
    gasLimitDefault: 21000,
    tx: {
      gasPrice: 0,
      gas: 21000, //gasLimit
      from: '',
      to: '',
      value: 0,
      data: ''
    },
    isSendLoading: false
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    sendTx: takeLatest(function*({ payload }) {
      try {
        yield put({
          type: 'send/setIsSendLoading',
          payload: true
        })
        const id = yield signThenSendTransaction(payload)
        yield put(push(`${paths.txDetail}/${id}`))
      } catch (e) {
        message.error(e.message)
        console.log('send:'+e) //eslint-disable-line
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
          type: 'send/merge',
          payload: {
            gasPriceDefault: res,
            tx: {
              gasPrice: res
            }
          }
        })
      } catch (e) {
        message.error(e.message)
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
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
