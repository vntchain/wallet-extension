const chrome = global.chrome

export const login = payload =>
  new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage(function(bg) {
      bg.login(payload)
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          reject(e)
        })
    })
  })

export const createWallet = payload =>
  new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage(function(bg) {
      bg.createWallet(payload)
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          reject(e)
        })
    })
  })
