const walletManage = require('eth-keyring-controller')
const Tx = require('ethereumjs-tx');
const vntProvider = require('./vnt_extension_provider')
const util = require("./vnt_util")
const extension = require('extensionizer')
const Wallet = require('ethereumjs-wallet')
const importers = require('ethereumjs-wallet/thirdparty')
const ethUtil = require('ethereumjs-util')
const store = require("obs-store")


var network = {
    mainnet: { url: 'http://39.97.235.82:8880', chainId: 1},
    testnet: { url: 'http://47.111.100.232:8880', chainId: 2}
}
// var provider = new vntProvider("http://localhost:8888")
var providerNet = network.mainnet
var provider = new vntProvider(providerNet.url)
var selectedAddr = ''
var is_wallet_exist = false
var is_wallet_unlock = false
var extension_wallet = new walletManage({})
var wallet_passwd = ''
var authUrl = []
/**
 *  two item: 1. accounts   2. trxs   {accounts: accounts, trxs: trxs}
 *  accounts: [{
 *      addr: "the account addr",
 *      type: 0|1  // 0 means not import account
 * }]
 * 
 * trxs: {
 *      "the account addr": [
 *      {
 *      time: the time of the trx,
 *      id: the id of the trx,
 *      trx //transaction obj
 *      state: the trx state
 *      },
 *      ......
 *      ],
 *     
 *      ......
 * }
 */
var account_info = {accounts:[], trxs:{}}

var popup = {url: "", trx: {}}


/*********************************************/
/************  account management  ***********/
/*********************************************/

/**
 * wallet login
 * 
 * @param {string} passwd  the wallet passwd
 * 
 */
window.login = async function login(obj) {

    var passwd = obj.passwd

    if (!is_wallet_exist) {
        return Promise.reject(new Error('Please create wallet first.'))
    }

    wallet_passwd = passwd
    is_wallet_unlock = true
    updateState()
    await extension_wallet.submitPassword(passwd)
    return extension_wallet.fullUpdate()
}


/**
 * wallet logout
 * 
 */
window.logout = async function logout() {
    is_wallet_unlock = false
    updateState()
    await extension_wallet.setLocked()
    delete wallet_passwd
}



/**
 *  create a wallet according the password
 *
 * @param {string} passwd - the wallet password
 */
window.createWallet = async function createWallet(obj) {

    var passwd = obj.passwd

    try {

        await extension_wallet.createNewVaultAndKeychain(passwd)

        resetState()
        wallet_passwd = passwd
        is_wallet_exist = true
        is_wallet_unlock = true

        var addrs = await extension_wallet.getAccounts()
        selectedAddr = addrs[addrs.length - 1]
        updateAccounts(false, addrs[addrs.length - 1])
        updateState()

        var keyring = await getWalletKeyring('HD Key Tree')
        return Promise.resolve(keyring[0].mnemonic)

    } catch (error) {

        return Promise.reject(error)
    }

}

/**
 *  
 */

/**
 * clear keyring for not create
 */
function clearKeyrings() {
    extension_wallet.clearKeyrings()
    resetState()
}

/**
 *  recover a wallet according  the password and seed
 * 
 * @param {string} passwd - the wallet password
 * @param {string} seed   - the seed to recover
 * 
 */
window.restoreFromSeed = async function restoreFromSeed(obj) {

    var passwd = obj.passwd
    var seed = obj.seed

    try {
        await extension_wallet.createNewVaultAndRestore(passwd, seed)

        resetState()

        wallet_passwd = passwd
        is_wallet_exist = true
        is_wallet_unlock = true
        var addrs = await extension_wallet.getAccounts()
        selectedAddr = addrs[addrs.length - 1]
        updateAccounts(false, addrs[addrs.length - 1])
        updateState()

        return extension_wallet.fullUpdate()

    } catch (error) {
        return Promise.reject(error)
    }
   
}

/**
 *  verify the passwd after login in
 * 
 * @param {string} passwd - the wallet password
 */
window.verifyPasswd = function verifyPasswd(obj) {
    var passwd = obj.passwd

    if (passwd === wallet_passwd) {
        return Promise.resolve(true)
    } else {
        return Promise.resolve(false)
    }
}

/**
 *  export the account privateKey
 * 
 * @param {string} addr the addr of the account
 * @param {string} passwd the wallet passwd
 */
window.exportAccountPrivatekey = async function exportAccountPrivatekey(obj) {

    var addr = obj.addr
    var passwd = obj.passwd

    if (wallet_passwd !== passwd) {
        return Promise.reject(new Error("password not correct!"))
    }

    return extension_wallet.exportAccount(addr)
}

/**
 * export the account keystore
 * 
 * @param {*} privatekey the privatekey
 * @param {*} passwd  the wallet passwd
 */
window.exportAccountKeystore = function exportAccountKeystore(obj) {

    return new Promise ((resolve, reject) => {
        var privatekey = obj.privatekey
        var passwd = obj.passwd

        if (wallet_passwd !== passwd) {
            reject(new Error("password not correct!"))
        }

        privatekey = ethUtil.addHexPrefix(privatekey)
        const buffer = ethUtil.toBuffer(privatekey)
        const wallet = Wallet.fromPrivateKey(buffer)

        resolve(wallet.toV3String(passwd))
    })

}


/**
 *  get the account keyring
 * 
 * @param {string} addr 
 * @param {string} passwd
 */
window.getKeyringOfAccount = async function getKeyringOfAccount(obj) {
    var addr = obj.addr
    var passwd = obj.passwd

    if (wallet_passwd !== passwd) {
        return Promise.reject(new Error("password not correct!"))
    }
    
    var keyring = await extension_wallet.getKeyringForAccount(addr)
    return Promise.resolve(keyring.mnemonic)
}

/**
 * get the wallet keyring
 * 
 * @param {string} type  the kering type
 */
function getWalletKeyring(type) {
    return extension_wallet.getKeyringsByType(type)
}

/**
 * add a new account of certain keyring
 * 
 */
window.addNewAccount = async function addNewAccount() {
    
    var account_keyring = await getWalletKeyring('HD Key Tree')
    await extension_wallet.addNewAccount(account_keyring[0])

    // var addrs = await extension_wallet.getAccounts()
    var addrs = await account_keyring[0].getAccounts()
    selectedAddr = addrs[addrs.length - 1]
    updateAccounts(false, addrs[addrs.length - 1])
    updateState()

    return  Promise.resolve(selectedAddr)

}

/**
 * get all accounts
 */
function getAllAccounts() {
    return extension_wallet.getAccounts()
}

// /**
//  *  wallet event subscriber
//  */
// extension_wallet.on('update', function(){
//     console.log("catch update")
//     console.log(extension_wallet.memStore.getState())
//     // chrome.storage.local.set({"curAddress": })
// })


/**
 * 
 * import account by privatekey
 * 
 * @param {string} privateKey  the hex private key
 */
window.importByPrivatekey = async function importByPrivatekey(obj) {

    var privateKey = obj.privateKey

    try {

        if(!privateKey) {
            throw new Error('Cannot import an empty key.')
        }
        const prefixed = ethUtil.addHexPrefix(privateKey)
        const buffer = ethUtil.toBuffer(prefixed)
    
        if(!ethUtil.isValidPrivate(buffer)) {
            throw new  Error('Cannot import invalid private key. ')
        }
        const addr = ethUtil.bufferToHex(ethUtil.privateToAddress(buffer))
        selectedAddr = addr
        const stripped = ethUtil.stripHexPrefix(prefixed)
        await extension_wallet.addNewKeyring('Simple Key Pair', [stripped])

        updateAccounts(true, addr)
        updateState()
        return Promise.resolve(addr)
    } catch (e) {
        return Promise.reject(e)
    }
    
}

/**
 * 
 * import account by keyStore
 * 
 * @param {string} input  the keyStore content
 * @param {string} passwd the keyStore password
 */
window.importByKeystore = async function importByKeystore(obj) {

    var input = obj.input
    var passwd = obj.passwd

    let wallet
    try {
        wallet = importers.fromEtherWallet(input, passwd)
    } catch (e) {
        console.log('Attempt to import as EtherWallet format failed, trying V3...')
    }

    if (!wallet) {
        wallet = Wallet.fromV3(input, passwd, true)
    }

    const privateKeyBuffer = wallet.getPrivateKey()
    const addr = ethUtil.bufferToHex(ethUtil.privateToAddress(privateKeyBuffer))
    selectedAddr = addr

    await extension_wallet.addNewKeyring('Simple Key Pair', [privateKeyBuffer])
    updateAccounts(true, addr)
    updateState()
    return extension_wallet.fullUpdate()
}



/**
 * sign and send the transaction
 * 
 * @param {josn object} tx  the trx to sign
 * @param {string} addr  the account to sign
 */
function sendRawTransaction(rawTransactionParam) {
    var payload = {jsonrpc: "2.0", id: 1, method: "core_sendRawTransaction", params:[]}
    payload.params[0] = rawTransactionParam
    return provider.send(payload)
}

Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, 
        "d+": this.getDate(), 
        "h+": this.getHours(), 
        "m+": this.getMinutes(),  
        "s+": this.getSeconds(), 
        "q+": Math.floor((this.getMonth() + 3) / 3), 
        "S": this.getMilliseconds() 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

window.signThenSendTransaction = async function signThenSendTransaction(obj) {
    var tx = obj.tx
    var addr = obj.addr
    
    try {
        
        if (addr !== selectedAddr) throw new Error("sign addr and selected addr not the same.")
        if (tx.data === undefined) {
            delete tx.data
        }

        tx.nonce = getNonce(addr)
        var storetx = Object.assign({}, tx)

        tx.value = util.fromDecimal(util.toWei(tx.value), 'vnt')
        tx.gas = util.fromDecimal(tx.gas)
        tx.gasPrice = util.fromDecimal(util.toWei(tx.gasPrice, 'gwei'))
        tx.chainId = getChainId()
        tx = new Tx(tx)
        var privatekey = await extension_wallet.exportAccount(addr)
        var privatebuffer = new Buffer(privatekey, 'hex')
        tx.sign(privatebuffer)

        var serializedTx = tx.serialize()
        var rawTransactionParam = '0x' + serializedTx.toString('hex');
        var trx_id = sendRawTransaction(rawTransactionParam)

        if (!!trx_id.result) {
            var date = new Date().Format("yyyy-MM-dd hh:mm:ss")
            storetx.state = "pending"
            storetx.time = date
            storetx.gasUsed = 0
            storetx.id = trx_id.result
            storetx.chainId = providerNet.chainId
            updateTrxs(addr, storetx)
            updateState()
            return Promise.resolve(trx_id.result)
        } else {
            return Promise.reject(trx_id.error)
        }
        
    

    } catch (error) {
        return Promise.reject(error)
    }
   
}

/**
 *  cancel a pending transaction
 *  @param {string} txid  the trx hash id
 */
window.cancelTransaction = async function cancelTransaction(obj) {

    var trxs = account_info.trxs[selectedAddr]
    var cancelTrx = {}

    for (var i = 0; i < trxs.length; i++) {
        if (trxs[i].id === obj.txid) {
            trxs[i].state = "cancelled"

            // construct cancel trx
            cancelTrx.nonce = trxs[i].nonce
            cancelTrx.from = trxs[i].from
            cancelTrx.to = trxs[i].to

            cancelTrx.value = 0
            cancelTrx.chainId = trxs[i].chainId
            cancelTrx.gas = trxs[i].gas
            cancelTrx.data = trxs[i].data

            break
        }
    }

    try {


        if (cancelTrx.from !== selectedAddr) throw new Error("sign addr and selected addr not the same.")
        if (cancelTrx.data === undefined) {
            delete cancelTrx.data
        }

        var storetx = Object.assign({}, cancelTrx)

        cancelTrx.value = util.fromDecimal(util.toWei(cancelTrx.value), 'vnt')
        cancelTrx.gas = util.fromDecimal(cancelTrx.gas)
        cancelTrx.chainId = getChainId()
        getGasPrice().then((result) => {
            storetx.gasPrice = result
            cancelTrx.gasPrice = util.fromDecimal(util.toWei(result, 'gwei'))
        })
        cancelTrx = new Tx(cancelTrx)
        var privatekey = await extension_wallet.exportAccount(selectedAddr)
        var privatebuffer = new Buffer(privatekey, 'hex')
        cancelTrx.sign(privatebuffer)

        var serializedTx = cancelTrx.serialize()
        var rawTransactionParam = '0x' + serializedTx.toString('hex');
        var trx_id = sendRawTransaction(rawTransactionParam)

        if (!!trx_id.result) {
            var date = new Date().Format("yyyy-MM-dd hh:mm:ss")
            storetx.state = "pending"
            storetx.time = date
            storetx.gasUsed = 0
            storetx.id = trx_id.result
            storetx.chainId = providerNet.chainId
            updateTrxs(selectedAddr, storetx)
            updateState()
            return Promise.resolve(trx_id.result)
        } else {
            return Promise.reject(trx_id.error)
        }

    } catch (error) {
        return Promise.reject(error)
    }
}


/**
 * resend a pending transaction
 *
 * @param {josn object} tx  the trx to sign
 * @param {string} addr  the account to sign
 */
window.resendTransaction = async function resendTransaction(obj) {

    try {

        var trxs = account_info.trxs[selectedAddr]
        var index, nonce
        for (var i = 0; i < trxs.length; i++) {
            if (trxs[i].id === obj.tx.id) {
                index = i
                nonce = trxs[i].nonce
                break
            }
        }

        if (index === undefined) {
            throw new Error("no trx id in params")
        }
        
        trxs.splice(index, 1)

        var tx = obj.tx
        var addr = obj.addr

        if (addr !== selectedAddr) throw new Error("sign addr and selected addr not the same.")
        if (tx.data === undefined) {
            delete tx.data
        }

        var storetx = Object.assign({}, tx)

        tx.nonce = nonce
        tx.value = util.fromDecimal(util.toWei(tx.value), 'vnt')
        tx.gas = util.fromDecimal(tx.gas)
        tx.gasPrice = util.fromDecimal(util.toWei(tx.gasPrice, 'gwei'))
        tx.chainId = getChainId()
        tx = new Tx(tx)
        var privatekey = await extension_wallet.exportAccount(addr)
        var privatebuffer = new Buffer(privatekey, 'hex')
        tx.sign(privatebuffer)

        var serializedTx = tx.serialize()
        var rawTransactionParam = '0x' + serializedTx.toString('hex');
        var trx_id = sendRawTransaction(rawTransactionParam)

        if (!!trx_id.result) {
            var date = new Date().Format("yyyy-MM-dd hh:mm:ss")
            storetx.state = "pending"
            storetx.time = date
            storetx.gasUsed = 0
            storetx.id = trx_id.result
            storetx.chainId = providerNet.chainId
            updateTrxs(addr, storetx)
            updateState()
            return Promise.resolve(trx_id.result)
        } else {
            return Promise.reject(trx_id.error)
        }
    } catch (error) {
        return Promise.reject(error)
    }
}


/**
 * get the Nonce
 * @param {string} addr  the addr
 */
function getNonce(addr) {
    var payload = {jsonrpc: "2.0", id: 1, method: "core_getTransactionCount", params:[]}
    payload.params[0] = addr
    payload.params[1] = "pending"
            
    var nonce = provider.send(payload)
    return nonce.result
}

/**
 * get the chainid
 */
function getChainId() {
    var payload = {jsonrpc: "2.0", id: 1, method: "net_version", params:[]}
    var version = provider.send(payload)

    return util.fromDecimal(version.result)
}

/**
 * get the account balance
 * 
 * @param {string} addr  the addr of account
 */
window.getAccountBalance = function getAccountBalance(obj) {
    var addr = obj.addr

    var payload = {jsonrpc: "2.0", id: 1, method: "core_getBalance", params:[]}
    payload.params[0] = addr
    payload.params[1] = "latest"
    
    return  new Promise((resolve, reject) => {
     
        provider.sendAsync(payload, function (err, balanceobj) {
            if (err) {
                reject(err)
            } else {
                resolve(util.fromWei(balanceobj.result, 'vnt'))
            }
        })

    })
}


/**
 *  check Transaction status
 * 
 * @param {string} id  the transaction id
 * 
 */
window.checkTransaction = function checkTransaction(obj) {
    var id = obj.id

    var payload = {jsonrpc: "2.0", id: 1, method: "core_getTransactionReceipt", params:[]}
    payload.params[0] = id

    try {

        var trxobj = provider.send(payload)

        // trxobj is null, means in pending
        if (!trxobj) {
            return Promise.resolve("pending")
        } else if (trxobj.result.status === "0x0"){
            return Promise.resolve("failed")
        } else if (trxobj.result.status === "0x1"){
            return Promise.resolve("success")
        }
    } catch (error) {
        return Promise.reject(error)
    }
    

}


/**
 *  get the vnt price
 * 
 */
window.getVntPrice = async function getVntPrice() {

    try {
        var url = "http://dncapi.bqiapp.com/api/coin/coininfo?code=vntchain"

        const res = await new Promise(resolve => {

            provider.httpGet(url, function (result) {
                // console.log(result.data.price_cny)
                // return Promise.resolve(result.data.price_cny)
                resolve(result)
            })
        })

        return Promise.resolve(res.data.price_cny)
       
    } catch (error) {
       return Promise.reject(error)
    }
}

/**
 * get default gas price
 */
window.getGasPrice = function getGasPrice() {

    try {
        var payload = {jsonrpc: "2.0", id: 1, method: "core_gasPrice", params:[]}

        var gasprice = provider.send(payload)

        return Promise.resolve(util.fromWei(gasprice.result, 'gwei'))

    } catch (error) {
        return Promise.reject(error)
    }

}


/**
 * get estimate gas limit
 * 
 * @param {json object} tx  the transaction obj
 * 
 */
window.getEstimateGas = function getEstimateGas(obj) {
    
    try {

        obj.tx.value = util.fromDecimal(util.toWei(obj.tx.value, 'vnt'))

        var payload = {jsonrpc: "2.0", id: 1, method: "core_estimateGas", params:[]}
        payload.params[0] = obj.tx
        if (payload.params[0].data == undefined || payload.params[0].data == "") {
           delete payload.params[0].data
        } else {

            payload.params[0].data = util.fromAscii(payload.params[0].data)
        }

        var gaslimit = provider.send(payload)
        return Promise.resolve(util.toDecimal(gaslimit.result))

    } catch (error) {
        return Promise.reject(error)
    }

}

/**
 * get trx  info
 * @param {string} txid the transaction id
 * 
 */
window.getTrxInfo = function getTrxInfo(obj) {

    var trxs = account_info.trxs[selectedAddr]
    
    for (var i = 0; i < trxs.length; i++) {
        if (trxs[i].id === obj.txid) return Promise.resolve(trxs[i])
    }

    return Promise.reject(new Error('not found the transaction'))


}



/**
 * change the provider
 * 
 * @param {string} newprovider the new provider chainId
 */
window.changeProvider = function changeProvider(obj) {
    var newprovider = obj.newprovider

    if (newprovider != providerNet.chainId) {

        if (newprovider == network.testnet.chainId) {
            providerNet = network.testnet
        } else {
            providerNet = network.mainnet
        }
        
        provider = new vntProvider(providerNet.url)
        console.log("function: changeProvider")
            
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //     chrome.tabs.sendMessage(tabs[0].id, {type: "changeProvider", provider: newprovider}, function(response) {
        //         console.log(response);
        //     });
        // });

        // provoidUrl
        chrome.storage.local.set({'providerNet': providerNet}, function(){
            console.log('updateState: update providerNet')
        })


    }
   
}

/**
 *  change the addr
 * 
 * @param {string} addr  the account addr
 */
window.changeAddress = function changeAddress(obj) {

    selectedAddr = obj.addr

    // provoidUrl
    chrome.storage.local.set({'selectedAddr': selectedAddr}, function(){
        console.log('updateState: update selectedAddr')
    })


}


/**
 * create window
 */
window.createPopup = function createPopup(url, cb) {
    const NOTIFICATION_HEIGHT = 620
    const NOTIFICATION_WIDTH = 360
    const {screenX, screenY, outerWidth, outerHeight} = window
    const notificationTop = Math.round(screenY + (outerHeight / 2) - (NOTIFICATION_HEIGHT / 2))
    const notificationLeft = Math.round(screenX + (outerWidth / 2) - (NOTIFICATION_WIDTH / 2))

    extension.windows.create({
        url: url,
        type: 'popup',
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        top: Math.max(notificationTop, 0),
        left: Math.max(notificationLeft, 0),
      }, cb)

}


/**
 * timer function to update trx state
 * 
 */
function trxStateTimer() {

    var trxs = account_info.trxs[selectedAddr]
    var stateChanged = false
    if (trxs === undefined) {
        return 
    } else {
        for (var i = 0; i < trxs.length; i++) {

            if (trxs[i].state === 'pending') {

                var payload = {jsonrpc: "2.0", id: 1, method: "core_getTransactionReceipt", params:[]}
                payload.params[0] = trxs[i].id
                
                try {
                    var trxobj = provider.send(payload)

                    // trxobj is null, means in pending
                    if (!trxobj.result) {
                        continue
                    } else if (trxobj.result.status === "0x0") {
                        trxs[i].state = 'failed'
                        trxs[i].gasUsed = util.toDecimal(trxobj.result.gasUsed)
                        stateChanged = true
                        updateState()
                        // chrome.notifications.create({
                        //     'type': 'basic',
                        //     'title': 'VNT Wallet',
                        //     'iconUrl': chrome.extension.getURL('./images/icon-64.png'),
                        //     'message': "交易失败！",
                        //     })
                        break

                    } else if (trxobj.result.status === "0x1") {
                        trxs[i].state = 'success'
                        trxs[i].gasUsed = util.toDecimal(trxobj.result.gasUsed)
                        stateChanged = true
                        updateState()
                        chrome.notifications.create({
                            'type': 'basic',
                            'title': 'VNT Wallet',
                            'iconUrl': chrome.extension.getURL('./images/icon-64.png'),
                            'message': "交易成功！",
                        })
                        break

                    }
                } catch (error) {
                    continue
                }
               
            
               
            }
    
        }

        if (stateChanged) {
            chrome.runtime.sendMessage({type: "trx_state_changed"})
        }
    }
}

/**
 *  update the acccounts in account_info
 */
function updateAccounts(isImport, addr) {
    if (isImport) {
        account_info.accounts.push({addr: addr, type: 1})
    } else {
        account_info.accounts.push({addr: addr, type: 0})
    }
}

/**
 * update the trxs in account_info
 */
function updateTrxs(addr, trx) {

    var trxs = account_info.trxs[addr]

    if (trxs) {
        trxs.push(trx)
    } else {
        account_info.trxs[addr] = [trx]
    }

}

/**
 * reset extension state
 */
function resetState() {
    chrome.storage.local.clear()

    account_info = {accounts:[], trxs:{}}
    selectedAddr = ''
    providerNet = network.mainnet
    is_wallet_exist = false
    is_wallet_unlock = false
    authUrl = []

    chrome.storage.local.set({ 'providerNet': providerNet }, function () {
        console.log('updateState: update providerNet')
    })
}

/**
 * restore extension state
 * 
 * the state:
 * 
 *    extension_wallet:  the vault value({vault: "{the encrypted keyring info}"})
 *    account_info: the account info(see account info above)
 */
function restoreState() {

    chrome.storage.local.get('extension_wallet', function(obj){
        var backup_extension_wallet = obj.extension_wallet
        if (backup_extension_wallet !== undefined) {
            console.log("restoreState: extension wallet exist")
            is_wallet_exist = true
            extension_wallet = new walletManage({initState: backup_extension_wallet})
        }
    })

    chrome.storage.local.get('account_info', function(obj){
        var backup_account_info = obj.account_info
        if (backup_account_info !== undefined) {
            console.log("restoreState: account info")
            account_info = backup_account_info
        }
    })

    chrome.storage.local.get('selectedAddr', function(obj){
        var backup_selectedAddr = obj.selectedAddr
        if (backup_selectedAddr !== undefined) {
            console.log("restoreState: selected addr")
            selectedAddr = backup_selectedAddr
        }
    })

    chrome.storage.local.get('providerNet', function(obj){
        var backup_providerNet = obj.providerNet
        if (backup_providerNet !== undefined) {
            console.log("restoreState: provider url")
            providerNet = backup_providerNet
            provider = new vntProvider(providerNet.url)
        }
    })

    chrome.storage.local.get('isWalletExist', function(obj){
        var backup_isWalletExist = obj.isWalletExist
        if (backup_isWalletExist !== undefined){
            console.log('restoreState: is wallet exist')
            is_wallet_exist = backup_isWalletExist
        }
    })

    chrome.storage.local.get('isWalletUnlock', function(obj){
        var backup_isWalletUnlock = obj.isWalletUnlock
        if (backup_isWalletUnlock !== undefined){
            console.log('restoreState: is wallet unlock')
            is_wallet_unlock = backup_isWalletUnlock
        }
    })

    chrome.storage.local.get('authUrl', function(obj){
        var backup_authUrl = obj.authUrl
        if (backup_authUrl !== undefined){
            console.log('restoreState: auth url')
            authUrl = backup_authUrl
        }
    })
    

}

/**
 *  update extension state
 */
function updateState() {
    // extension_wallet
    chrome.storage.local.set({'extension_wallet': extension_wallet.store.getState()}, function(){
        console.log('updateState: update extension wallet')
    })

    // account_info
    chrome.storage.local.set({'account_info': account_info}, function(){
        console.log('updateState: update account info')
    })

    // selectedAddr
    chrome.storage.local.set({'selectedAddr': selectedAddr}, function(){
        console.log('updateState: update selectedAddr')
    })

    // provoidUrl
    chrome.storage.local.set({'providerNet': providerNet}, function(){
        console.log('updateState: update providerNet')
    })

    // wallet state
    chrome.storage.local.set({'isWalletExist': is_wallet_exist}, function(){
        console.log('updateState: update wallet exist state')
    })

    chrome.storage.local.set({'isWalletUnlock': is_wallet_unlock}, function(){
        console.log('updateState: update wallet unlock state')
    })

    // authurl
    chrome.storage.local.set({'authUrl': authUrl}, function(){
        console.log('updateState: update extension authUrl state')
    })


}





/*********************************************/
/************   event & message    ***********/
/*********************************************/
window.addEventListener("load", function() {
    console.log("background page loaded... " + Date())
    restoreState() 
});

// chrome.alarms.create('updatState', {delayInMinutes: 1.5})
// chrome.alarms.onAlarm.addListener(function(alarm){
//     if (alarm.name === 'updateState') {
//         console.log("background: alarm update state")
//         updateState()
//     }
// })

chrome.runtime.onInstalled.addListener(({reason}) => {
    console.log("background: in onInstalled")

    setInterval(trxStateTimer, 3000)
     // provoidUrl
     chrome.storage.local.set({'providerNet': providerNet}, function(){
        console.log('updateState: update providerNet')
    })
})
chrome.runtime.onSuspend.addListener(function(){
    console.log("background: suspend event update state")
    updateState()
})


//receive msg from ContentScript and popup.js
chrome.runtime.onConnect.addListener(function(port) {
	console.log("Connected ....." + port.name );

	port.onMessage.addListener(function(msg) {
        // from webpage (through contentScript)
        if (msg.src === 'contentScript') {
            if (msg.data.method === "inpage_sendTransaction"){
                console.log("background: receive inpage sendTransaction")
                console.log(msg) 

                popup.trx = msg.data.data.payload.params[0]
                popup.trx.value = util.fromWei(popup.trx.value, 'vnt')
                if (popup.trx.gasPrice != undefined) {
                    popup.trx.gasPrice = util.toDecimal(util.fromWei(popup.trx.gasPrice, 'gwei'))
                }
                if (popup.trx.gas != undefined) {
                    popup.trx.gas = util.toDecimal(popup.trx.gas)
                }
                chrome.storage.local.set({'popup': popup}, function(){
                    console.log('updateState: update popup info')
                })
               
                var url = chrome.extension.getURL('index.html/#/outer-send')
                createPopup(url, function(window){
                })
                // create confirm_send_trx popup window
                // chrome.rutime.sendMessage({type: "sendTransaction", trx: msg.data.data})
                // createPopup("notification.html", function(window){
                   
                // })
            } 
            // else if (msg.data.method === "inpage_accounts") {
                
            //     console.log("background: receive inpage get accounts")
            //     console.log(msg) 

            //     // create confirm_get_accounts popup window
            //     // chrome.rutime.sendMessage({type: "getAccounts"})
            //     // createPopup("notification.html", function(window){
            //     // })

            // } 
            else if (msg.data.method === "inpage_requestAuthorization") {
                
                console.log("background: receive inpage request authorization")
                console.log(msg) 

                popup.url = msg.data.data.url
                chrome.storage.local.set({'popup': popup}, function(){
                    console.log('updateState: update popup info')
                })
               
                var url = chrome.extension.getURL('index.html/#/auth')
                createPopup(url, function(window){
                })
                // create confirm_get_accounts popup window
                // chrome.rutime.sendMessage({type: "requestAuthorization", url: msg.data.data.url, addr: selectedAddr})
                // createPopup("notification.html", function(window){
                // })
            } 
            else if (msg.data.method === "inpage_login") {


                var url = chrome.extension.getURL('index.html')
                createPopup(url, function(window){
                })

                // window.postMessage({target: "popup_inpage"})
                // chrome.runtime.sendMessage({type:"inpage_requestAuthorization", route: "/auth", url: "test"})
            }  
            else if (msg.data.method === "inpage_get_walletUnlock") {
                port.postMessage({
                    type: "inpage_get_walletUnlock_response",
                    walletUnlock: is_wallet_unlock
                })
            }
            else if (msg.data.method === "inpage_get_selectedAddr") {
                port.postMessage({
                    type: "inpage_get_selectedAddr_response",
                    selectedAddr: selectedAddr
                })
            }
            else if (msg.data.method === "inpage_get_authUrl") {
                port.postMessage({
                    type: "inpage_get_authUrl_response",
                    authUrl: authUrl
                })
            }

        } else if (msg.src === 'popup') { // from popup
            if (msg.type === "confirm_send_trx") {

                chrome.windows.getLastFocused({windowTypes: ['popup']}, function(window){
                    extension.windows.remove(window.id)
                })
                console.log("confirm_send_trx")
                if (!!msg.data.confirmSendTrx) {

                    var tx = msg.data.trx
                    var addr = selectedAddr
                    
                    signThenSendTransaction({addr: addr, tx: tx}).then((trx_id) => {
                        chrome.tabs.query({active: true},function(tabArray) {
                            for (var i = 0; i < tabArray.length; i++) {
                                chrome.tabs.sendMessage(tabArray[i].id, {confirmSendTrx: true, trxid: trx_id});
                            }
                        });
                    }).catch((error) => {
                        chrome.tabs.query({active: true},function(tabArray) {
                            for (var i = 0; i < tabArray.length; i++) {
                                chrome.tabs.sendMessage(tabArray[i].id, {confirmSendTrx: true, error: error.message});
                            }
                        });
                    })
        

                } else {
                    chrome.tabs.query({active: true},function(tabArray) {
                        for (var i = 0; i < tabArray.length; i++) {
                            chrome.tabs.sendMessage(tabArray[i].id, {confirmSendTrx: false, trxid: ""});
                        }
                
                        });
                }
                
    
            } 
            // else if (msg.data.type === "confirm_get_accounts") {

            //     if (!!msg.data.data.confirmedGetAccounts) {
            //         chrome.tabs.query({currentWindow: true, active: true},function(tabArray) {
            //             chrome.tabs.sendMessage(tabArray[0].id, {confirmedGetAccounts: true});
            //         });
    
            //     } else {
            //         chrome.tabs.query({currentWindow: true, active: true},function(tabArray) {
            //             chrome.tabs.sendMessage(tabArray[0].id, {confirmedGetAccounts: false});
            //         });
            //     }

               
            // } 
            else if (msg.type === "confirm_request_authorization") {

                chrome.windows.getLastFocused({windowTypes: ['popup']}, function(window){
                    extension.windows.remove(window.id)
                })

                console.log("confirm_request_authorization")
                if (!!msg.data.confirmAuthorization) {
                   if (authUrl.indexOf(msg.data.url) == -1) {
                        authUrl.push(msg.data.url)
                   }

                    updateState()
                    chrome.tabs.query({active: true},function(tabArray) {
                        for (var i = 0; i < tabArray.length; i++) {
                            chrome.tabs.sendMessage(tabArray[i].id, {url: msg.data.url, confirmAuthorization: true});
                        }
                        
                    });
    
                } else {
    
                    chrome.tabs.query({active: true},function(tabArray) {
                        for (var i = 0; i < tabArray.length; i++) {
                            chrome.tabs.sendMessage(tabArray[i].id, {url: msg.data.url, confirmAuthorization: false});
                        }
                    });
                }


            }
        
        } // end src from popup
    })
})
