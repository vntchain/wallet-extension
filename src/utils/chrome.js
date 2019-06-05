const chrome = global.chrome

const createFuncPromise = function(funcName, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage(function(bg) {
      bg[funcName](payload)
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          reject(e)
        })
    })
  })
}

export const login = function*(payload) {
  yield createFuncPromise('login', payload)
}

export const logout = function*(payload) {
  yield createFuncPromise('logout', payload)
}

export const createWallet = function*(payload) {
  yield createFuncPromise('createWallet', payload)
}

export const restoreFromSeed = function*(payload) {
  yield createFuncPromise('restoreFromSeed', payload)
}

export const getAddr = () =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get('selectedAddr', function(obj) {
      const addr = obj.selectedAddr
      if (addr) resolve(addr)
      else reject({ message: '系统错误' })
    })
  })
