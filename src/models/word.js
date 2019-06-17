import { effects } from 'redux-sirius'
import { getKeyringOfAccount } from '../utils/chrome'
import { message } from 'antd'

const { put } = effects
export default {
  state: {
    hasGetWord: false,
    word: ''
  },
  reducers: {},
  effects: ({ takeLatest }) => ({
    fetchWord: takeLatest(function*({ payload }) {
      try {
        const data = yield getKeyringOfAccount(payload)
        yield put({
          type: 'word/merge',
          payload: {
            hasGetWord: true,
            word: data
          }
        })
      } catch (e) {
        message.error(e.message)
        console.log(e) //eslint-disable-line
      }
    })
  })
}
