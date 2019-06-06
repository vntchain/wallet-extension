import { effects } from 'redux-sirius'
import { exportAccountPrivatekey, exportAccountKeystore } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    hasGetKey: false,
    privateKey: '',
    privateJson: '',
    isExportDisable: false,
    isDownloadDisable: false
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    getPrivateKey: takeLatest(function*(payload) {
      yield put({
        type: 'user/setIsExportDisable',
        payload: true
      })
      try {
        const data = yield exportAccountPrivatekey(payload)
        yield put({
          type: 'user/merge',
          payload: {
            hasGetKey: true,
            privateKey: data
          }
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
    }),
    getPrivateJson: takeLatest(function*(payload) {
      yield put({
        type: 'user/setIsDownloadDisable',
        payload: true
      })
      try {
        const data = yield exportAccountKeystore(payload)
        yield put({
          type: 'user/setPrivateJson',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'user/setIsDownloadDisable',
          payload: false
        })
      }
    })
  })
}
