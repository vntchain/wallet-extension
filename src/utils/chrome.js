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
    chrome.storage.local.get(getName, function(obj) {
      const result = obj[getName]
      if (result !== 'undefined') resolve(result)
      else reject({ message: '网络错误' })
    })
  })
}

const createChangePromise = function(funcName, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage(function(bg) {
      try {
        bg[funcName](payload)
        // debugger //eslint-disable-line
        resolve('success')
      } catch (e) {
        reject(e)
      }
    })
  })
}
//登录
export const login = function(payload) {
  return createFuncPromise('login', payload)
}
//登出
export const logout = function(payload) {
  return createFuncPromise('logout', payload)
}
//创建钱包
export const createWallet = function(payload) {
  return createFuncPromise('createWallet', payload)
}
//找回钱包
export const restoreFromSeed = function(payload) {
  return createFuncPromise('restoreFromSeed', payload)
}
//导出私钥
export const exportAccountPrivatekey = function(payload) {
  return createFuncPromise('exportAccountPrivatekey', payload)
}
//导出私钥Json
export const exportAccountKeystore = function(payload) {
  return createFuncPromise('exportAccountKeystore', payload)
  //test pause page...
  // return new Promise(resolve => {
  //   chrome.runtime.getBackgroundPage(function() {
  //     func(payload).then(res => resolve(res))
  //   })
  // })
}
// const func = function(payload) {
//   return new Promise(resolve =>
//     setTimeout(() => {
//       resolve({ a: '111' })
//       console.log(payload) //eslint-disable-line
//     }, 10000)
//   )
// }
//导入账户(私钥)
export const importByPrivatekey = function(payload) {
  return createFuncPromise('importByPrivatekey', payload)
}
//导入账户(keystore文件)
export const importByKeystore = function(payload) {
  return createFuncPromise('importByKeystore', payload)
}
//获取账户余额
export const getAccountBalance = function(payload) {
  return createFuncPromise('getAccountBalance', payload)
}
//查看助记词
export const getKeyringOfAccount = function(payload) {
  return createFuncPromise('getKeyringOfAccount', payload)
}
//获取当前vnt价格
export const getVntPrice = function(payload) {
  return createFuncPromise('getVntPrice', payload)
}
//发送交易
export const signThenSendTransaction = function(payload) {
  return createFuncPromise('signThenSendTransaction', payload)
}
//获取gasprice
export const getGasPrice = function(payload) {
  return createFuncPromise('getGasPrice', payload)
}
//获取gaslimit
export const getEstimateGas = function(payload) {
  return createFuncPromise('getEstimateGas', payload)
}
//创建账户
export const addNewAccount = function(payload) {
  return createFuncPromise('addNewAccount', payload)
}
//网络选择
export const changeProvider = function(payload) {
  return createChangePromise('changeProvider', payload)
}
//同步地址
export const changeAddress = function(payload) {
  return createChangePromise('changeAddress', payload)
}

//获取地址信息
export const getAddr = function() {
  return createGetPromise('selectedAddr')
}
//获取账户信息
export const getAccounts = function() {
  return createGetPromise('account_info')
}
//获取钱包登录信息
export const providerNet = function() {
  return createGetPromise('providerNet')
}
//获取钱包登录信息
export const popup = function() {
  return createGetPromise('popup')
}
