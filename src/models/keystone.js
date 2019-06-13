import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from '../utils/paths'
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
    privateJson: '',
    isExportLoading: false,
    isDownload: false,
    isImportLoading: false
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    getPrivateKey: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsExportLoading',
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
          type: 'keystone/setIsExportLoading',
          payload: false
        })
      }
    }),
    getPrivateJson: takeLatest(function*({ payload }) {
      try {
        const data = yield exportAccountKeystore(payload)
        yield put({
          type: 'keystone/setPrivateJson',
          payload: data
        })
        yield put({
          type: 'keystone/setIsDownload',
          payload: true
        })
      } catch (e) {
        yield put({
          type: 'keystone/setIsDownload',
          payload: false
        })
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    }),
    importByPrivateKey: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsImportLoading',
        payload: true
      })
      try {
        yield importByPrivatekey(payload)
        yield put({
          type: 'user/getAddr'
        })
        yield put(push(paths.home))
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsImportLoading',
          payload: false
        })
      }
    }),
    importByKeystone: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsImportLoading',
        payload: true
      })
      try {
        yield importByKeystore(payload)
        //切换地址并跳转
        yield put({
          type: 'user/getAddr'
        })
        yield put(push(paths.home))
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsImportLoading',
          payload: false
        })
      }
    })
  })
}
