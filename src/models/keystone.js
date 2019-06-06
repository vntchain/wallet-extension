import { effects } from 'redux-sirius'
import { exportAccountPrivatekey } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    privateKey: '',
    isExportDisable: false
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    getPrivatekey: takeLatest(function*(payload) {
      yield put({
        type: 'user/setIsExportDisable',
        payload: true
      })
      try {
        const data = yield exportAccountPrivatekey(payload)
        yield put({
          type: 'user/setPrivateKey',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'user/setIsExportDisable',
          payload: false
        })
      }
    })
  })
}
