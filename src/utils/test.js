export const testPromise = function(payload) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(payload)
    }, 300)
  })
}

export const testFunc = function*(cb) {
  yield cb()
}
