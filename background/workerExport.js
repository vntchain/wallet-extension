const Wallet = require('ethereumjs-wallet')
const ethUtil = require('ethereumjs-util')

self.addEventListener(
  'message',
  function(e) {
    const { privatekey, passwd } = e.data
    const privateKey = ethUtil.addHexPrefix(privatekey)
    const buffer = ethUtil.toBuffer(privateKey)
    const wallet = Wallet.fromPrivateKey(buffer)
    self.postMessage(wallet.toV3String(passwd))
  },
  false
)
