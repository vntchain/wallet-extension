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
import downloader from '../utils/downloader'
import { delay } from '../utils/helper'

const { put, select } = effects
export default {
  state: {
    hasGetKey: false,
    privateKey: null,
    privateJson: null,
    isExportLoading: false,
    isImportLoading: false,
    isDownloadLoading: false
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
      } catch (e) {
        message.error(e.message || e)
        console.log('getPrivateKey: '+e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsExportLoading',
          payload: false
        })
      }
    }),
    getPrivateJson: takeLatest(function*({ payload }) {
      yield put({
        type: 'keystone/setIsDownloadLoading',
        payload: true
      })
      yield delay(100)
      try {
        let privateJson = yield select(
          ({ keystone: { privateJson } }) => privateJson
        )
        if (!privateJson) {
          privateJson = yield exportAccountKeystore(payload)
          yield put({
            type: 'keystone/setPrivateJson',
            payload: privateJson
          })
        }
        yield downloader(privateJson, 'keystore', 'json')
      } catch (e) {
        message.error(e.message || e)
        console.log('getPrivateJson: ' + e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsDownloadLoading',
          payload: false
        })
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
        message.error(e.message || e)
        console.log('importByPrivateKey: ' + e) //eslint-disable-line
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
        message.error(e.message || e)
        console.log('importByKeystone: ' + e) //eslint-disable-line
      } finally {
        yield put({
          type: 'keystone/setIsImportLoading',
          payload: false
        })
      }
    })
  })
}
