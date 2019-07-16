import { effects } from 'redux-sirius'
import { popup } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    trx: {},
    url: ''
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    getPopup: takeLatest(function*() {
      try {
        const { trx, url } = yield popup()
        yield put({
          type: 'popup/merge',
          payload: {
            trx,
            url
          }
        })
      } catch (e) {
        message.error(e.message || e)
        console.log('getPopup' + e) //eslint-disable-line
      }
    })
  })
}
