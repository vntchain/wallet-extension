import { effects } from 'redux-sirius'

const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

const { put } = effects

export default {
  state: {
    count: 0
  },
  reducers: {
    increment: state => ({
      count: state.count + 1
    }),
    decrement: state => ({
      count: state.count - 1
    })
  },
  effects: ({ takeLatest }) => ({
    asyncDecrement: takeLatest(function*() {
      yield delay(2000)
      yield put({ type: 'count/decrement' })
    })
  })
}
