import { effects } from 'redux-sirius'
import { popup } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    popup: 1
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    getPopup: takeLatest(function*() {
      try {
        const data = yield popup()
        yield put({
          type: 'price/setPopup',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
