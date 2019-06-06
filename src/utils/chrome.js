const chrome = global.chrome

const createPromise = function(funcName, payload) {
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

const createFuncPromise = function(funcName, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage(function(bg) {
      const result = bg[funcName](payload)
      if (result) resolve(result)
      else reject({ message: '网络错误' })
    })
  })
}

const createGetPromise = function(getName) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(getName, function(obj) {
      const result = obj[getName]
      if (result) resolve(result)
      else reject({ message: '网络错误' })
    })
  })
}
//登录
export const login = function*(payload) {
  return yield createPromise('login', payload)
}
//登出
export const logout = function*(payload) {
  return yield createPromise('logout', payload)
}
//创建钱包
export const createWallet = function*(payload) {
  return yield createPromise('createWallet', payload)
}
//找回钱包
export const restoreFromSeed = function*(payload) {
  return yield createPromise('restoreFromSeed', payload)
}
//导出私钥
export const exportAccountPrivatekey = function*(payload) {
  return yield createPromise('exportAccountPrivatekey', payload)
}
//导出私钥Json
export const exportAccountKeystore = function*(payload) {
  return yield createPromise('exportAccountKeystore', payload)
}
//获取账户余额
export const getAccountBalance = function*(payload) {
  return yield createFuncPromise('getAccountBalance', payload)
}
//查看助记词
export const getKeyringOfAccount = function*(payload) {
  return yield createFuncPromise('getKeyringOfAccount', payload)
}
//获取当前vnt价格
export const getVntPrice = function*(payload) {
  return yield createFuncPromise('getVntPrice', payload)
}

//获取地址信息
export const getAddr = function*() {
  return yield createGetPromise('selectedAddr')
}
//获取账户信息
export const getAccounts = function*() {
  return yield createGetPromise('account_info')
}
