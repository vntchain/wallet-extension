require('./vnt.min.js')
var errors = require('./errors');


// workaround to use httpprovider in different envs
// browser
if (typeof window !== 'undefined' && window.XMLHttpRequest) {
  XMLHttpRequest = window.XMLHttpRequest; // jshint ignore: line
// node
} else {
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest; // jshint ignore: line
}

var XHR2 = require('xhr2'); // jshint ignore: line

/**
 * HttpProvider should be used to send rpc calls over http
 */
var InpageHttpProvider = function (host, timeout, user, password, headers) {
  this.host = host || 'http://localhost:8545';
  this.timeout = timeout || 0;
  this.user = user;
  this.password = password;
  this.headers = headers;
};

/**
 * Should be called to prepare new XMLHttpRequest
 *
 * @method prepareRequest
 * @param {Boolean} true if request should be async
 * @return {XMLHttpRequest} object
 */
InpageHttpProvider.prototype.prepareRequest = function (async) {
  var request;

  if (async) {
    request = new XHR2();
    request.timeout = this.timeout;
  } else {
    request = new XMLHttpRequest();
  }

  request.open('POST', this.host, async);
  if (this.user && this.password) {
    var auth = 'Basic ' + new Buffer(this.user + ':' + this.password).toString('base64');
    request.setRequestHeader('Authorization', auth);
  } request.setRequestHeader('Content-Type', 'application/json');
  if(this.headers) {
      this.headers.forEach(function(header) {
          request.setRequestHeader(header.name, header.value);
      });
  }
  return request;
};

/**
 * Should be called to make sync request
 *
 * @method send
 * @param {Object} payload
 * @return {Object} result
 */
InpageHttpProvider.prototype.send = function (payload) { 

  if (!walletUnlock) {
    throw errors.walletLocked()
  }

  if (authUrl.indexOf(window.location.host) == -1) {
    throw errors.authorizationError('request Authorization first.')
  }

  // console.log(payload)

  switch (payload.method) {
    case 'core_accounts':
      var result = (selectedAccount === '')? []:[selectedAccount] 
      return {id: id, jsonrpc: jsonrpc, result: result}

    case 'core_coinbase':
      return {id: id, jsonrpc: jsonrpc, result: selectedAccount}

    case 'core_sendTransaction': 
      var message = `The VNT object does not support synchronous methods like ${payload.method} without a callback parameter.`
      throw new Error(message)
  }


  var request = this.prepareRequest(false);

  try {
    request.send(JSON.stringify(payload));
  } catch (error) {
    throw errors.InvalidConnection(this.host);
  }

  var result = request.responseText;

  try {
    result = JSON.parse(result);
  } catch (e) {
    throw errors.InvalidResponse(request.responseText);
  }

  return result;
};


/**
 * Should be used to make async request
 *
 * @method sendAsync
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
var id = 1
var jsonrpc = "2.0"

InpageHttpProvider.prototype.sendAsync = function (payload, callback) {

  if (!walletUnlock) {
    throw errors.walletLocked()
  }

  if (authUrl.indexOf(window.location.host) == -1) {
    callback(errors.authorizationError('request Authorization first.'))
    return
  }

  console.log(payload)
  switch (payload.method) {
    case 'core_sendTransaction':
      console.log('inpage: core_sendTransaction:')  

      window.postMessage({
        "target": "contentscript",
        "data":{"payload": payload},
        "method": "inpage_sendTransaction",
      }, "*");

      window.addEventListener('message', function(e) {
        //  e.data.data contain the passed data
        if (e.data.src ==="content" && e.data.type === "send_trx_response" && !!e.data.data) {
          console.log('inpage: message send_trx_response')
          if (!!e.data.data.confirmSendTrx) {
            if (e.data.data.error !== undefined) {
              // var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.error}
              callback(e.data.data.error)
            } else {
              var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.trxid}
              callback(null, result)
            }

          } else {
            callback(errors.authorizationError('user denied.'))
          }
        }
      })
      return

    case 'core_accounts':
      console.log('inpage: core_accounts:')
      var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
      callback(null, result)
      // window.postMessage({
      //   "target": "contentscript",
      //   "data":{"payload": payload},
      //   "method": "inpage_accounts",
      // }, "*");

      // listen message from contentscript
      window.addEventListener('message', function(e) {
        // e.detail contains the transferred data (can
        // if (e.data.src ==="content" && e.data.type === "get_accounts_response" && !!e.data.data) {
        //   console.log('inpage: message get_accounts_response')
        //   if (!!e.data.data.confirmGetAccounts) {
        //     var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
        //     callback(null, result)
        //   } else {
        //     callback(errors.authorizationError("user denied."))
        //   }
        // } else 
        if (e.data.src ==="inpage" && e.data.type === "web_core_accounts_change" && !!e.data.data){
          console.log('inpage: message web_core_accounts_change')
          var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
          callback(null, result)
        }
      })

      return

     case 'core_coinbase':
       console.log('inpage: core_coinbase')
       var result = {id: id, jsonrpc: jsonrpc, result: selectedAccount}
       callback(null, result)

        // listen message from contentscript
      window.addEventListener('message', function(e) {
        // e.detail contains the transferred data (can
        // if (e.data.src ==="content" && e.data.type === "get_accounts_response" && !!e.data.data) {
        //   console.log('inpage: message get_accounts_response')
        //   if (!!e.data.data.confirmGetAccounts) {
        //     var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
        //     callback(null, result)
        //   } else {
        //     callback(errors.authorizationError("user denied."))
        //   }
        // } else 
        if (e.data.src ==="inpage" && e.data.type === "web_core_coinbase_change" && !!e.data.data){
          console.log('inpage: message web_core_coinbase_change')
          var result = {id: id, jsonrpc: jsonrpc, result: selectedAccount}
          callback(null, result)
        }
      })

      return
  }

  var request = this.prepareRequest(true);

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.timeout !== 1) {
      var result = request.responseText;
      var error = null;
      try {
        // console.log(typeof result)
        // console.log(result)
        result = JSON.parse(result);
      } catch (e) {
        error = errors.InvalidResponse(request.responseText);
      }

      callback(error, result);
    }
  };

  request.ontimeout = function () {
    callback(errors.ConnectionTimeout(this.timeout));
  };

  try {
    request.send(JSON.stringify(payload));
  } catch (error) {
    callback(errors.InvalidConnection(this.host));
  }
};

/**
 * Synchronously tries to make Http request
 *
 * @method isConnected
 * @return {Boolean} returns true if request haven't failed. Otherwise false
 */
InpageHttpProvider.prototype.isConnected = function () {
  try {
    this.send({
      id: 9999999999,
      jsonrpc: '2.0',
      method: 'net_listening',
      params: []
    });
    return true;
  } catch (e) {
    return false;
  }
};

// InpageHttpProvider.prototype.signThenSendTransaction = function(tx, payload, callback) {

//   //to do: get the right privatekey
//   console.log('enter signThenSendTransaction');
//   var privateKey = new Buffer('e2a193920eafba2c7092b647813c951ee5b1a997e54caf53ebe7a271c58e9c5a', 'hex');
//   tx.sign(privateKey);
//   var serializedTx = tx.serialize();
//   console.log(serializedTx.toString('hex'));
//   //f889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
//   var rawTransactionParam = '0x' + serializedTx.toString('hex');
//   payload.method = 'core_sendRawTransaction';
//   payload.params[0] = rawTransactionParam;
//   console.log(payload)
//   if (callback) {
//     this.sendAsync(payload, callback);
//   } else {
//     this.send(payload);
//   }

// };



var network = {
  mainnet: {url: 'http://39.104.62.26:8880', chainId: 1},
  testnet: {url: 'http://47.104.173.117:8880', chainId: 2}
}
var selectedAccount = '';
var curProviderNet = network.testnet
var walletUnlock = false;
window.vnt = new Vnt(new InpageHttpProvider(curProviderNet.url))
var authUrl = []

window.vnt.requestAuthorization = function(callback) {

    const url = window.location.host
    
    if (!walletUnlock) {

      window.postMessage({
        "target": "contentscript",
        "data": {"url": url},
        "method": "inpage_login",
      }, "*");

    } else {

      window.postMessage({
        "target": "contentscript",
        "data": {"url": url},
        "method": "inpage_requestAuthorization",
      }, "*");

      window.addEventListener('message', function(e) {
        //  e.data.data contain the passed data
        if (e.data.src ==="content" && e.data.type === "requestAuthorization_response" && !!e.data.data) {
          console.log('inpage: message requestAuthorization_response')
          if (!!e.data.data.confirmAuthorization) {
            if ( (e.data.data.url == window.location.host) && (authUrl.indexOf(e.data.data.url) == -1)) {
              authUrl.push(e.data.data.url)
              // localStorage.setItem('authUrl', authUrl.join(','))
            }
            // var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.confirmAuthorization}
            callback(null, e.data.data.confirmAuthorization)
          } else {
            callback(errors.authorizationError('user denied.'))
          }
        }
      })

    }

}

window.vnt.getNetworkUrl = function(callback) {

  callback(null, curProviderNet)

  window.addEventListener('message', function(e) {
  
    if (e.data.src ==="inpage" && e.data.type === "web_network_change" && !!e.data.data){
      console.log('inpage: message web_account_change')
      // var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.networkChange}
      callback(null, e.data.data.networkChange)
    }
  })


}


window.vnt.logout = function(callback) {

  window.addEventListener('message', function(e) {
  
    if (e.data.src ==="inpage" && e.data.type === "web_logout" && !!e.data.data){
      console.log('inpage: message web_logout')
      // var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.logout}
      callback(null, e.data.data.logout)
    }
  })

}

window.addEventListener('message', function(e) {
  // e  contains the transferred data 
  if (e.data.src === "content" && e.data.type === "change_providerNet" && !!e.data.data) {
    console.log('inpage: message change_providerNet')
    curProviderNet = e.data.data.providerNet || network.testnet
    window.vnt.setProvider(new InpageHttpProvider(curProviderNet.url))

    window.postMessage({
      "src": "inpage",
      "type": "web_network_change",
      "data": {networkChange: curProviderNet}
    }, "*")

  } else if (e.data.src === "content" && e.data.type === "change_selectedAddr" && !!e.data.data){
    console.log('inpage: message change_selectedAddr')
    selectedAccount = e.data.data.selectedAddr || ''
    // localStorage.setItem('selectedAddr', e.data.data.selectedAddr)

    window.postMessage({
      "src": "inpage",
      "type": "web_core_accounts_change",
      "data": {selectedAddr: selectedAccount}
    }, "*")

    window.postMessage({
      "src": "inpage",
      "type": "web_core_coinbase_change",
      "data": {selectedAddr: selectedAccount}
    }, "*")

  } else if (e.data.src === "content" && e.data.type === "change_walletUnlock" && !!e.data.data) {
    console.log('inpage: message change_walletUnlock')
    walletUnlock = e.data.data.isWalletUnlock 
    // localStorage.setItem('walletUnlock', e.data.data.isWalletUnlock)

    if (!walletUnlock) {
      window.postMessage({
        "src": "inpage",
        "type": "web_logout",
        "data": {logout: true}
      }, "*")
    }
   
    
  } else if (e.data.src === "background" && e.data.data.type === "inpage_get_walletUnlock_response"){
    console.log('inpage: message inpage_get_walletUnlock_response')
    walletUnlock = e.data.data.walletUnlock
  } else if (e.data.src === "background" && e.data.data.type === "inpage_get_selectedAddr_response"){
    console.log('inpage: message inpage_get_selectedAddr_response')
    selectedAccount = e.data.data.selectedAddr
  } else if (e.data.src === "background" && e.data.data.type === "inpage_get_authUrl_response") {
    console.log('inpage: message inpage_get_authUrl_response')
    authUrl = e.data.data.authUrl
  }
})


window.onload = function() {

  window.postMessage({
    "target": "contentscript",
    "method": "inpage_get_authUrl",
  }, "*");

  window.postMessage({
    "target": "contentscript",
    "method": "inpage_get_walletUnlock",
  }, "*");

  window.postMessage({
    "target": "contentscript",
    "method": "inpage_get_selectedAddr",
  }, "*");


}