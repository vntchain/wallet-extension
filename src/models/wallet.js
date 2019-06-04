import { effects } from 'redux-sirius'
import { push } from 'react-router-redux'
import paths from 'utils/paths'
import { message } from 'antd'
const chrome = global.chrome

const { put } = effects
export default {
  state: {
    isCreateDisable: false
  },
  reducer: {},
  effects: ({ takeLatest }) => ({
    create: takeLatest(function*({ payload }) {
      yield put({
        type: 'wallet/setIsCreateDisable',
        payload: false
      })
      chrome.runtime.getBackgroundPage(function(bg) {
        console.log(bg) //eslint-disable-line
        bg.createWallet(payload)
          .then(function*() {
            message.success('创建钱包成功！')
            yield put({
              type: 'user/setIsLogin',
              payload: true
            })
            yield put(push(paths.home))
            yield put({
              type: 'user/setIsCreateDisable',
              payload: false
            })
          })
          .catch(e => {
            put({
              type: 'user/setIsCreateDisable',
              payload: false
            })
            message.error(e.message)
            console.log(e) //eslint-disable-line
          })
      })
    })
  })
}
