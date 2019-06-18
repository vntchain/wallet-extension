const fs = require('fs')
const path = require('path')
const extension = require('extensionizer')


const inpageContent = fs.readFileSync(path.join(__dirname, 'extension', 'inpage.js')).toString()
const inpageSuffix = '//# sourceURL=' + extension.extension.getURL('inpage.js') + '\n'
const inpageBundle = inpageContent + inpageSuffix

// initState()
injectScript(inpageBundle)

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript (content) {
    try {
      const container = document.head || document.documentElement
      const scriptTag = document.createElement('script')
      scriptTag.setAttribute('async', false)
      scriptTag.textContent = content
      container.insertBefore(scriptTag, container.children[0])
      container.removeChild(scriptTag)
    } catch (e) {
      console.error('vnt script injection failed', e)
    }
  }


/*********************************************/
/************   event & message    ***********/
/*********************************************/
var port = chrome.runtime.connect({name: "contentscript"});
// port.postMessage({src: "contentScript",dst:"background"});
port.onMessage.addListener(function(msg) {
    console.log("port.onMessage: " +JSON.stringify(msg));

    window.postMessage({        //forward msg from background to webpage
        "src": "background",
        "dst": "inpage",
        "data":msg
    }, "*");

});

//just for debug, listen to port disconnect event
port.onDisconnect.addListener(function(message) {
    console.log("Port disconnected: " + JSON.stringify(message))
});



// Event listener, msg from web-page
window.addEventListener('message', function(e) {

  if(e.data.target === "contentscript") {
      port.postMessage({          //forward msg from webpage to background
          src: "contentScript",
          dst: "background",
          data: e.data
      })
  }

});

  
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // if (request.changeproviderNet) {
    //   console.log("contentscript: change providerNet")
    //   window.postMessage({
    //     "src": "content",
    //     "type": "change_providerNet",
    //     "data": {providerNet: storageChange.newValue}
    //   }, "*")
      
    // } else if (request.changeSelectedAddr) {
    //   console.log("contentscript: change selectedAddr")
    //   window.postMessage({
    //     "src": "content",
    //     "type": "change_providerNet",
    //     "data": request
    //   }, "*")
    // } 
    if (request.confirmSendTrx !== undefined) {
      console.log("contentscript: send_trx_response")
      window.postMessage({
        "src": "content",
        "type": "send_trx_response",
        "data": request
      }, "*")
    }
    //  else if (request.confirmedGetAccounts) {
    //   console.log("contentscript: get_accounts_response")
    //   window.postMessage({
    //     "src": "content",
    //     "type": "get_accounts_response",
    //     "data": request
    //   }, "*")
    // } 
    else if (request.confirmAuthorization !== undefined) {
      console.log("contentscript: requestAuthorization_response")
      window.postMessage({
        "src": "content",
        "type": "requestAuthorization_response",
        "data": request
      }, "*")
    } 
    else if (request.logout !== undefined) {
      console.log("contentscript: wallet logout")
      window.postMessage({
        "src": "content",
        "type": "web_logout",
        "data": request
      }, "*")
    }
       
})


chrome.storage.onChanged.addListener(function(changed, area){
  for (var key in changed) {
    if (key === 'providerNet') {
      var storageChange = changed[key]
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      area,
                      storageChange.oldValue,
                      storageChange.newValue);

      window.postMessage({
        "src": "content",
        "type": "change_providerNet",
        "data": {providerNet: storageChange.newValue}
      }, "*")
    } else if (key === 'selectedAddr') {
      var storageChange = changed[key]
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      area,
                      storageChange.oldValue,
                      storageChange.newValue);

      window.postMessage({
        "src": "content",
        "type": "change_selectedAddr",
        "data": {selectedAddr: storageChange.newValue}
      }, "*")

    } else if (key === 'isWalletUnlock') {
      var storageChange = changed[key]
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      area,
                      storageChange.oldValue,
                      storageChange.newValue);

      window.postMessage({
        "src": "content",
        "type": "change_walletUnlock",
        "data": {isWalletUnlock: storageChange.newValue}
      }, "*")
    }
  }
})











