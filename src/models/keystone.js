import { effects } from 'redux-sirius'
import {
  exportAccountPrivatekey,
  exportAccountKeystore,
  importByPrivatekey,
  importByKeystore
} from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    hasGetKey: false,
    privateKey: '',
    privateJson: {},
    isExportDisable: false,
    isDownloadDisable: false,
    idImportDisable: false
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    getPrivateKey: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsExportDisable',
        payload: true
      })
      try {
        const data = yield exportAccountPrivatekey(payload)
        yield put({
          type: 'keystone/merge',
          payload: {
            hasGetKey: true,
            privateKey: data
          }
        })
        yield put({
          type: 'keystone/getPrivateJson',
          payload: {
            passwd: payload.passwd,
            privatekey: data
          }
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsExportDisable',
          payload: false
        })
      }
    }),
    getPrivateJson: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsDownloadDisable',
        payload: true
      })
      try {
        const data = yield exportAccountKeystore(payload)
        yield put({
          type: 'keystone/setPrivateJson',
          payload: data
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsDownloadDisable',
          payload: false
        })
      }
    }),
    importByPrivateKey: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIdImportDisable',
        payload: true
      })
      try {
        yield importByPrivatekey(payload)
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIdImportDisable',
          payload: false
        })
      }
    }),
    importByKeystone: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIdImportDisable',
        payload: true
      })
      try {
        yield importByKeystore(payload)
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIdImportDisable',
          payload: false
        })
      }
    })
  })
}
