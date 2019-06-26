import { effects } from 'redux-sirius'
import { getVntPrice } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    vntToCny: null
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    getVntToCny: takeLatest(function*() {
      try {
        const data = yield getVntPrice()
        yield put({
          type: 'price/setVntToCny',
          payload: data
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getVntToCny:' + e) //eslint-disable-line
      }
    })
  })
}
