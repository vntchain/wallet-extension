import { effects } from 'redux-sirius'
import { popup } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    popup: {}
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    getPopup: takeLatest(function*() {
      try {
        const data = yield popup()
        yield put({
          type: 'popup/setPopup',
          payload: data
        })
      } catch (e) {
        message.error(e.message || e)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
