import { effects } from 'redux-sirius'
import { getVntPrice } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    vntToCny: 1
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    getAccountBalance: takeLatest(function*() {
      try {
        const data = yield getVntPrice()
        yield put({
          type: 'price/setVntToCny',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
