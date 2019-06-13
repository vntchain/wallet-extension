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

const createGetPromise = function(getName) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(getName, function(obj) {
      const result = obj[getName]
      if (result) resolve(result)
      else reject({ message: '网络错误' })
    })
  })
}

const createSetPromise = function(obj) {
  return new Promise(resolve => {
    chrome.storage.sync.set(obj, function() {
      resolve('success')
    })
  })
}
//登录
export const login = function*(payload) {
  return yield createFuncPromise('login', payload)
}
//登出
export const logout = function*(payload) {
  return yield createFuncPromise('logout', payload)
}
//创建钱包
export const createWallet = function*(payload) {
  return yield createFuncPromise('createWallet', payload)
}
//找回钱包
export const restoreFromSeed = function*(payload) {
  return yield createFuncPromise('restoreFromSeed', payload)
}
//导出私钥
export const exportAccountPrivatekey = function*(payload) {
  return yield createFuncPromise('exportAccountPrivatekey', payload)
}
//导出私钥Json
export const exportAccountKeystore = function*(payload) {
  return yield createFuncPromise('exportAccountKeystore', payload)
}
//导入账户(私钥)
export const importByPrivatekey = function*(payload) {
  return yield createFuncPromise('importByPrivatekey', payload)
}
//导入账户(keystore文件)
export const importByKeystore = function*(payload) {
  return yield createFuncPromise('importByKeystore', payload)
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
//发送交易
export const signThenSendTransaction = function*(payload) {
  return yield createFuncPromise('signThenSendTransaction', payload)
}
//获取gasprice
export const getGasPrice = function*(payload) {
  return yield createFuncPromise('getGasPrice', payload)
}
//获取gaslimit
export const getEstimateGas = function*(payload) {
  return yield createFuncPromise('getEstimateGas', payload)
}

//获取地址信息
export const getAddr = function*() {
  return yield createGetPromise('selectedAddr')
}
//获取账户信息
export const getAccounts = function*() {
  return yield createGetPromise('account_info')
}
//获取钱包登录信息
export const getIsWalletUnlock = function*() {
  return yield createGetPromise('isWalletUnlock')
}

//同步地址
export const setAddr = function*(payload) {
  return yield createSetPromise({ selectedAddr: payload })
}
