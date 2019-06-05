(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
    This file is part of vnt.js.
    vnt.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    vnt.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with vnt.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file errors.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

module.exports = {
    InvalidNumberOfArgs: function () {
        return new Error('Invalid number of arguments to function');
    },
    InvalidNumberOfRPCParams: function () {
        return new Error('Invalid number of input parameters to RPC method');
    },
    InvalidConnection: function (host){
        return new Error('CONNECTION ERROR: Couldn\'t connect to node '+ host +'.');
    },
    InvalidProvider: function () {
        return new Error('Provider not set or invalid');
    },
    InvalidResponse: function (result){
        var message = !!result && !!result.error && !!result.error.message ? result.error.message : 'Invalid JSON RPC response: ' + JSON.stringify(result);
        return new Error(message);
    },
    ConnectionTimeout: function (ms){
        return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
    },

    ApiNotEnabled: function (){
        return new Error('Api not enabled')
    },

    authorizationError: function (error){
        return new Error('authorizationError: ' + error)
    }

    
};
},{}],2:[function(require,module,exports){
module.exports = XMLHttpRequest;

},{}],3:[function(require,module,exports){
(function (process,Buffer){
/**
 * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
 *
 * This can be used with JS designed for browsers to improve reuse of code and
 * allow the use of existing libraries.
 *
 * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @contributor David Ellis <d.f.ellis@ieee.org>
 * @license MIT
 */

var Url = require("url");
var spawn = require("child_process").spawn;
var fs = require("fs");

exports.XMLHttpRequest = function() {
  "use strict";

  /**
   * Private variables
   */
  var self = this;
  var http = require("http");
  var https = require("https");

  // Holds http.js objects
  var request;
  var response;

  // Request settings
  var settings = {};

  // Disable header blacklist.
  // Not part of XHR specs.
  var disableHeaderCheck = false;

  // Set some default headers
  var defaultHeaders = {
    "User-Agent": "node-XMLHttpRequest",
    "Accept": "*/*",
  };

  var headers = {};
  var headersCase = {};

  // These headers are not user setable.
  // The following are allowed but banned in the spec:
  // * user-agent
  var forbiddenRequestHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "content-transfer-encoding",
    "cookie",
    "cookie2",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via"
  ];

  // These request methods are not allowed
  var forbiddenRequestMethods = [
    "TRACE",
    "TRACK",
    "CONNECT"
  ];

  // Send flag
  var sendFlag = false;
  // Error flag, used when errors occur or abort is called
  var errorFlag = false;

  // Event listeners
  var listeners = {};

  /**
   * Constants
   */

  this.UNSENT = 0;
  this.OPENED = 1;
  this.HEADERS_RECEIVED = 2;
  this.LOADING = 3;
  this.DONE = 4;

  /**
   * Public vars
   */

  // Current state
  this.readyState = this.UNSENT;

  // default ready state change handler in case one is not set or is set late
  this.onreadystatechange = null;

  // Result & response
  this.responseText = "";
  this.responseXML = "";
  this.status = null;
  this.statusText = null;
  
  // Whether cross-site Access-Control requests should be made using
  // credentials such as cookies or authorization headers
  this.withCredentials = false;

  /**
   * Private methods
   */

  /**
   * Check if the specified header is allowed.
   *
   * @param string header Header to validate
   * @return boolean False if not allowed, otherwise true
   */
  var isAllowedHttpHeader = function(header) {
    return disableHeaderCheck || (header && forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1);
  };

  /**
   * Check if the specified method is allowed.
   *
   * @param string method Request method to validate
   * @return boolean False if not allowed, otherwise true
   */
  var isAllowedHttpMethod = function(method) {
    return (method && forbiddenRequestMethods.indexOf(method) === -1);
  };

  /**
   * Public methods
   */

  /**
   * Open the connection. Currently supports local server requests.
   *
   * @param string method Connection method (eg GET, POST)
   * @param string url URL for the connection.
   * @param boolean async Asynchronous connection. Default is true.
   * @param string user Username for basic authentication (optional)
   * @param string password Password for basic authentication (optional)
   */
  this.open = function(method, url, async, user, password) {
    this.abort();
    errorFlag = false;

    // Check for valid request method
    if (!isAllowedHttpMethod(method)) {
      throw new Error("SecurityError: Request method not allowed");
    }

    settings = {
      "method": method,
      "url": url.toString(),
      "async": (typeof async !== "boolean" ? true : async),
      "user": user || null,
      "password": password || null
    };

    setState(this.OPENED);
  };

  /**
   * Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
   * This does not conform to the W3C spec.
   *
   * @param boolean state Enable or disable header checking.
   */
  this.setDisableHeaderCheck = function(state) {
    disableHeaderCheck = state;
  };

  /**
   * Sets a header for the request or appends the value if one is already set.
   *
   * @param string header Header name
   * @param string value Header value
   */
  this.setRequestHeader = function(header, value) {
    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
    }
    if (!isAllowedHttpHeader(header)) {
      console.warn("Refused to set unsafe header \"" + header + "\"");
      return;
    }
    if (sendFlag) {
      throw new Error("INVALID_STATE_ERR: send flag is true");
    }
    header = headersCase[header.toLowerCase()] || header;
    headersCase[header.toLowerCase()] = header;
    headers[header] = headers[header] ? headers[header] + ', ' + value : value;
  };

  /**
   * Gets a header from the server response.
   *
   * @param string header Name of header to get.
   * @return string Text of the header or null if it doesn't exist.
   */
  this.getResponseHeader = function(header) {
    if (typeof header === "string"
      && this.readyState > this.OPENED
      && response
      && response.headers
      && response.headers[header.toLowerCase()]
      && !errorFlag
    ) {
      return response.headers[header.toLowerCase()];
    }

    return null;
  };

  /**
   * Gets all the response headers.
   *
   * @return string A string with all response headers separated by CR+LF
   */
  this.getAllResponseHeaders = function() {
    if (this.readyState < this.HEADERS_RECEIVED || errorFlag) {
      return "";
    }
    var result = "";

    for (var i in response.headers) {
      // Cookie headers are excluded
      if (i !== "set-cookie" && i !== "set-cookie2") {
        result += i + ": " + response.headers[i] + "\r\n";
      }
    }
    return result.substr(0, result.length - 2);
  };

  /**
   * Gets a request header
   *
   * @param string name Name of header to get
   * @return string Returns the request header or empty string if not set
   */
  this.getRequestHeader = function(name) {
    if (typeof name === "string" && headersCase[name.toLowerCase()]) {
      return headers[headersCase[name.toLowerCase()]];
    }

    return "";
  };

  /**
   * Sends the request to the server.
   *
   * @param string data Optional data to send as request body.
   */
  this.send = function(data) {
    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
    }

    if (sendFlag) {
      throw new Error("INVALID_STATE_ERR: send has already been called");
    }

    var ssl = false, local = false;
    var url = Url.parse(settings.url);
    var host;
    // Determine the server
    switch (url.protocol) {
      case "https:":
        ssl = true;
        // SSL & non-SSL both need host, no break here.
      case "http:":
        host = url.hostname;
        break;

      case "file:":
        local = true;
        break;

      case undefined:
      case null:
      case "":
        host = "localhost";
        break;

      default:
        throw new Error("Protocol not supported.");
    }

    // Load files off the local filesystem (file://)
    if (local) {
      if (settings.method !== "GET") {
        throw new Error("XMLHttpRequest: Only GET method is supported");
      }

      if (settings.async) {
        fs.readFile(url.pathname, "utf8", function(error, data) {
          if (error) {
            self.handleError(error);
          } else {
            self.status = 200;
            self.responseText = data;
            setState(self.DONE);
          }
        });
      } else {
        try {
          this.responseText = fs.readFileSync(url.pathname, "utf8");
          this.status = 200;
          setState(self.DONE);
        } catch(e) {
          this.handleError(e);
        }
      }

      return;
    }

    // Default to port 80. If accessing localhost on another port be sure
    // to use http://localhost:port/path
    var port = url.port || (ssl ? 443 : 80);
    // Add query string if one is used
    var uri = url.pathname + (url.search ? url.search : "");

    // Set the defaults if they haven't been set
    for (var name in defaultHeaders) {
      if (!headersCase[name.toLowerCase()]) {
        headers[name] = defaultHeaders[name];
      }
    }

    // Set the Host header or the server may reject the request
    headers.Host = host;
    if (!((ssl && port === 443) || port === 80)) {
      headers.Host += ":" + url.port;
    }

    // Set Basic Auth if necessary
    if (settings.user) {
      if (typeof settings.password === "undefined") {
        settings.password = "";
      }
      var authBuf = new Buffer(settings.user + ":" + settings.password);
      headers.Authorization = "Basic " + authBuf.toString("base64");
    }

    // Set content length header
    if (settings.method === "GET" || settings.method === "HEAD") {
      data = null;
    } else if (data) {
      headers["Content-Length"] = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "text/plain;charset=UTF-8";
      }
    } else if (settings.method === "POST") {
      // For a post with no data set Content-Length: 0.
      // This is required by buggy servers that don't meet the specs.
      headers["Content-Length"] = 0;
    }

    var options = {
      host: host,
      port: port,
      path: uri,
      method: settings.method,
      headers: headers,
      agent: false,
      withCredentials: self.withCredentials
    };

    // Reset error flag
    errorFlag = false;

    // Handle async requests
    if (settings.async) {
      // Use the proper protocol
      var doRequest = ssl ? https.request : http.request;

      // Request is being sent, set send flag
      sendFlag = true;

      // As per spec, this is called here for historical reasons.
      self.dispatchEvent("readystatechange");

      // Handler for the response
      var responseHandler = function responseHandler(resp) {
        // Set response var to the response we got back
        // This is so it remains accessable outside this scope
        response = resp;
        // Check for redirect
        // @TODO Prevent looped redirects
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307) {
          // Change URL to the redirect location
          settings.url = response.headers.location;
          var url = Url.parse(settings.url);
          // Set host var in case it's used later
          host = url.hostname;
          // Options for the new request
          var newOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.path,
            method: response.statusCode === 303 ? "GET" : settings.method,
            headers: headers,
            withCredentials: self.withCredentials
          };

          // Issue the new request
          request = doRequest(newOptions, responseHandler).on("error", errorHandler);
          request.end();
          // @TODO Check if an XHR event needs to be fired here
          return;
        }

        response.setEncoding("utf8");

        setState(self.HEADERS_RECEIVED);
        self.status = response.statusCode;

        response.on("data", function(chunk) {
          // Make sure there's some data
          if (chunk) {
            self.responseText += chunk;
          }
          // Don't emit state changes if the connection has been aborted.
          if (sendFlag) {
            setState(self.LOADING);
          }
        });

        response.on("end", function() {
          if (sendFlag) {
            // Discard the end event if the connection has been aborted
            setState(self.DONE);
            sendFlag = false;
          }
        });

        response.on("error", function(error) {
          self.handleError(error);
        });
      };

      // Error handler for the request
      var errorHandler = function errorHandler(error) {
        self.handleError(error);
      };

      // Create the request
      request = doRequest(options, responseHandler).on("error", errorHandler);

      // Node 0.4 and later won't accept empty data. Make sure it's needed.
      if (data) {
        request.write(data);
      }

      request.end();

      self.dispatchEvent("loadstart");
    } else { // Synchronous
      // Create a temporary file for communication with the other Node process
      var contentFile = ".node-xmlhttprequest-content-" + process.pid;
      var syncFile = ".node-xmlhttprequest-sync-" + process.pid;
      fs.writeFileSync(syncFile, "", "utf8");
      // The async request the other Node process executes
      var execString = "var http = require('http'), https = require('https'), fs = require('fs');"
        + "var doRequest = http" + (ssl ? "s" : "") + ".request;"
        + "var options = " + JSON.stringify(options) + ";"
        + "var responseText = '';"
        + "var req = doRequest(options, function(response) {"
        + "response.setEncoding('utf8');"
        + "response.on('data', function(chunk) {"
        + "  responseText += chunk;"
        + "});"
        + "response.on('end', function() {"
        + "fs.writeFileSync('" + contentFile + "', JSON.stringify({err: null, data: {statusCode: response.statusCode, headers: response.headers, text: responseText}}), 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + "response.on('error', function(error) {"
        + "fs.writeFileSync('" + contentFile + "', JSON.stringify({err: error}), 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + "}).on('error', function(error) {"
        + "fs.writeFileSync('" + contentFile + "', JSON.stringify({err: error}), 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + (data ? "req.write('" + JSON.stringify(data).slice(1,-1).replace(/'/g, "\\'") + "');":"")
        + "req.end();";
      // Start the other Node Process, executing this string
      var syncProc = spawn(process.argv[0], ["-e", execString]);
      while(fs.existsSync(syncFile)) {
        // Wait while the sync file is empty
      }
      var resp = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
      // Kill the child process once the file has data
      syncProc.stdin.end();
      // Remove the temporary file
      fs.unlinkSync(contentFile);

      if (resp.err) {
        self.handleError(resp.err);
      } else {
        response = resp.data;
        self.status = resp.data.statusCode;
        self.responseText = resp.data.text;
        setState(self.DONE);
      }
    }
  };

  /**
   * Called when an error is encountered to deal with it.
   */
  this.handleError = function(error) {
    this.status = 0;
    this.statusText = error;
    this.responseText = error.stack;
    errorFlag = true;
    setState(this.DONE);
    this.dispatchEvent('error');
  };

  /**
   * Aborts a request.
   */
  this.abort = function() {
    if (request) {
      request.abort();
      request = null;
    }

    headers = defaultHeaders;
    this.status = 0;
    this.responseText = "";
    this.responseXML = "";

    errorFlag = true;

    if (this.readyState !== this.UNSENT
        && (this.readyState !== this.OPENED || sendFlag)
        && this.readyState !== this.DONE) {
      sendFlag = false;
      setState(this.DONE);
    }
    this.readyState = this.UNSENT;
    this.dispatchEvent('abort');
  };

  /**
   * Adds an event listener. Preferred method of binding to events.
   */
  this.addEventListener = function(event, callback) {
    if (!(event in listeners)) {
      listeners[event] = [];
    }
    // Currently allows duplicate callbacks. Should it?
    listeners[event].push(callback);
  };

  /**
   * Remove an event callback that has already been bound.
   * Only works on the matching funciton, cannot be a copy.
   */
  this.removeEventListener = function(event, callback) {
    if (event in listeners) {
      // Filter will return a new array with the callback removed
      listeners[event] = listeners[event].filter(function(ev) {
        return ev !== callback;
      });
    }
  };

  /**
   * Dispatch any events, including both "on" methods and events attached using addEventListener.
   */
  this.dispatchEvent = function(event) {
    if (typeof self["on" + event] === "function") {
      self["on" + event]();
    }
    if (event in listeners) {
      for (var i = 0, len = listeners[event].length; i < len; i++) {
        listeners[event][i].call(self);
      }
    }
  };

  /**
   * Changes readyState and calls onreadystatechange.
   *
   * @param int state New state
   */
  var setState = function(state) {
    if (state == self.LOADING || self.readyState !== state) {
      self.readyState = state;

      if (settings.async || self.readyState < self.OPENED || self.readyState === self.DONE) {
        self.dispatchEvent("readystatechange");
      }

      if (self.readyState === self.DONE && !errorFlag) {
        self.dispatchEvent("load");
        // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)
        self.dispatchEvent("loadend");
      }
    }
  };
};

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":19,"buffer":9,"child_process":6,"fs":6,"http":35,"https":13,"url":41}],4:[function(require,module,exports){
(function (Buffer){
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

  if ((authUrl === '') || (authUrl !== window.location.host)) {
    throw errors.authorizationError('request Authorization first.')
  }

  switch (payload.method) {
    case 'core_accounts':
      return (this.selectedAccount === '')? []:[this.selectedAccount] 

    case 'core_coinbase':
      return this.selectedAccount

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
            var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.trxid}
            callback(null, result)
          } else {
            callback(errors.authorizationError('user denied.'))
          }
        }
      })
      return;

    case 'core_accounts':
      console.log('inpage: core_accounts:')
  
      window.postMessage({
        "target": "contentscript",
        "data":{"payload": payload},
        "method": "inpage_accounts",
      }, "*");

      // listen message from contentscript
      window.addEventListener('message', function(e) {
        // e.detail contains the transferred data (can
        if (e.data.src ==="content" && e.data.type === "get_accounts_response" && !!e.data.data) {
          console.log('inpage: message get_accounts_response')
          if (!!e.data.data.confirmGetAccounts) {
            var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
            callback(null, result)
          } else {
            callback(errors.authorizationError("user denied."))
          }
        } else if (e.data.src ==="content" && e.data.type === "web_account_change" && !!e.data.data){
          console.log('inpage: message web_account_change')
          var result = {id: id, jsonrpc: jsonrpc, result: [selectedAccount]}
          callback(null, result)
        }
      })

      return;
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
  mainnet: '',
  testnet: 'http://47.104.173.117:8880'
}
var selectedAccount = '';
var curProviderUrl = network.testnet
window.vnt = new Vnt(new InpageHttpProvider(curProviderUrl))


var authUrl = ''
window.vnt.requesetAuthorization = function(callback) {

    const url = window.location.host

    window.postMessage({
      "target": "contentscript",
      "data": {"url": url},
      "method": "inpage_requesetAuthorization",
    }, "*");

    window.addEventListener('message', function(e) {
      //  e.data.data contain the passed data
      if (e.data.src ==="content" && e.data.type === "requesetAuthorization_response" && !!e.data.data) {
        console.log('inpage: message requesetAuthorization_response')
        if (!!e.data.data.confirmAuthorization) {
          authUrl = e.data.data.url
          localStorage.setItem('authUrl', authUrl)
          var result = {id: id, jsonrpc: jsonrpc, result: e.data.data.confirmAuthorization}
          callback(null, result)
        } else {
          callback(errors.authorizationError('user denied.'))
        }
      }
    })


}

window.addEventListener('web_api_enable', function(e){
    const domain = window.location.host
    curProvider.isEnable.push(domain)
})

window.addEventListener('message', function(e) {
  // e  contains the transferred data 
  if (e.data.src ==="content" && e.data.type === "change_providerUrl" && !!e.data.data) {
    console.log('inpage: message change_providerUrl')
    curProviderUrl = e.data.data.providerUrl
    window.vnt.setProvider(new InpageHttpProvider(curProviderUrl))

  } else if (e.data.src ==="content" && e.data.type === "change_selectedAddr" && !!e.data.data){
    console.log('inpage: message change_selectedAddr')
    selectedAccount = e.data.data.selectedAddr
  }
})


window.onload = function() {
  authUrl = localStorage.getItem('authUrl') || ''
}
}).call(this,require("buffer").Buffer)
},{"./errors":1,"./vnt.min.js":5,"buffer":9,"xhr2":2,"xmlhttprequest":3}],5:[function(require,module,exports){
(function (global,Buffer){
require=function i(a,s,c){function u(e,t){if(!s[e]){if(!a[e]){var r="function"==typeof require&&require;if(!t&&r)return r(e,!0);if(f)return f(e,!0);var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}var o=s[e]={exports:{}};a[e][0].call(o.exports,function(t){return u(a[e][1][t]||t)},o,o.exports,i,a,s,c)}return s[e].exports}for(var f="function"==typeof require&&require,t=0;t<c.length;t++)u(c[t]);return u}({1:[function(t,e,r){e.exports=[{constant:!0,inputs:[{name:"_owner",type:"address"}],name:"name",outputs:[{name:"o_name",type:"bytes32"}],type:"function"},{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"owner",outputs:[{name:"",type:"address"}],type:"function"},{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"content",outputs:[{name:"",type:"bytes32"}],type:"function"},{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"addr",outputs:[{name:"",type:"address"}],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"}],name:"reserve",outputs:[],type:"function"},{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"subRegistrar",outputs:[{name:"",type:"address"}],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_newOwner",type:"address"}],name:"transfer",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_registrar",type:"address"}],name:"setSubRegistrar",outputs:[],type:"function"},{constant:!1,inputs:[],name:"Registrar",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_a",type:"address"},{name:"_primary",type:"bool"}],name:"setAddress",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_content",type:"bytes32"}],name:"setContent",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"}],name:"disown",outputs:[],type:"function"},{anonymous:!1,inputs:[{indexed:!0,name:"_name",type:"bytes32"},{indexed:!1,name:"_winner",type:"address"}],name:"AuctionEnded",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"_name",type:"bytes32"},{indexed:!1,name:"_bidder",type:"address"},{indexed:!1,name:"_value",type:"uint256"}],name:"NewBid",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"name",type:"bytes32"}],name:"Changed",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"name",type:"bytes32"},{indexed:!0,name:"addr",type:"address"}],name:"PrimaryChanged",type:"event"}]},{}],2:[function(t,e,r){e.exports=[{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"owner",outputs:[{name:"",type:"address"}],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_refund",type:"address"}],name:"disown",outputs:[],type:"function"},{constant:!0,inputs:[{name:"_name",type:"bytes32"}],name:"addr",outputs:[{name:"",type:"address"}],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"}],name:"reserve",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_newOwner",type:"address"}],name:"transfer",outputs:[],type:"function"},{constant:!1,inputs:[{name:"_name",type:"bytes32"},{name:"_a",type:"address"}],name:"setAddr",outputs:[],type:"function"},{anonymous:!1,inputs:[{indexed:!0,name:"name",type:"bytes32"}],name:"Changed",type:"event"}]},{}],3:[function(t,e,r){e.exports=[{constant:!1,inputs:[{name:"from",type:"bytes32"},{name:"to",type:"address"},{name:"value",type:"uint256"}],name:"transfer",outputs:[],type:"function"},{constant:!1,inputs:[{name:"from",type:"bytes32"},{name:"to",type:"address"},{name:"indirectId",type:"bytes32"},{name:"value",type:"uint256"}],name:"icapTransfer",outputs:[],type:"function"},{constant:!1,inputs:[{name:"to",type:"bytes32"}],name:"deposit",outputs:[],payable:!0,type:"function"},{anonymous:!1,inputs:[{indexed:!0,name:"from",type:"address"},{indexed:!1,name:"value",type:"uint256"}],name:"AnonymousDeposit",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"from",type:"address"},{indexed:!0,name:"to",type:"bytes32"},{indexed:!1,name:"value",type:"uint256"}],name:"Deposit",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"from",type:"bytes32"},{indexed:!0,name:"to",type:"address"},{indexed:!1,name:"value",type:"uint256"}],name:"Transfer",type:"event"},{anonymous:!1,inputs:[{indexed:!0,name:"from",type:"bytes32"},{indexed:!0,name:"to",type:"address"},{indexed:!1,name:"indirectId",type:"bytes32"},{indexed:!1,name:"value",type:"uint256"}],name:"IcapTransfer",type:"event"}]},{}],4:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputInt,this._outputFormatter=n.formatOutputAddress};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/address(\[([0-9]*)\])?/)},e.exports=i},{"./formatters":9,"./type":14}],5:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputBool,this._outputFormatter=n.formatOutputBool};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^bool(\[([0-9]*)\])*$/)},e.exports=i},{"./formatters":9,"./type":14}],6:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputBytes,this._outputFormatter=n.formatOutputBytes};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^bytes([0-9]{1,})(\[([0-9]*)\])*$/)},e.exports=i},{"./formatters":9,"./type":14}],7:[function(t,e,r){var y=t("./formatters"),n=t("./address"),o=t("./bool"),i=t("./int"),a=t("./uint"),s=t("./dynamicbytes"),c=t("./string"),u=t("./real"),f=t("./ureal"),l=t("./bytes"),p=function(t,e){return t.isDynamicType(e)||t.isDynamicArray(e)},h=function(t){this._types=t};h.prototype._requireType=function(e){var t=this._types.filter(function(t){return t.isType(e)})[0];if(!t)throw Error("invalid type!: "+e);return t},h.prototype.encodeParam=function(t,e){return this.encodeParams([t],[e])},h.prototype.encodeParams=function(i,r){var a=this.getTypes(i),t=a.map(function(t,e){return t.encode(r[e],i[e])}),e=a.reduce(function(t,e,r){var n=e.staticPartLength(i[r]),o=32*Math.floor((n+31)/32);return t+(p(a[r],i[r])?32:o)},0);return this.encodeMultiWithOffset(i,a,t,e)},h.prototype.encodeMultiWithOffset=function(n,o,i,a){var s="",c=this;return n.forEach(function(t,e){if(p(o[e],n[e])){s+=y.formatInputInt(a).encode();var r=c.encodeWithOffset(n[e],o[e],i[e],a);a+=r.length/2}else s+=c.encodeWithOffset(n[e],o[e],i[e],a)}),n.forEach(function(t,e){if(p(o[e],n[e])){var r=c.encodeWithOffset(n[e],o[e],i[e],a);a+=r.length/2,s+=r}}),s},h.prototype.encodeWithOffset=function(t,e,r,n){var o=1,i=2,a=3,s=e.isDynamicArray(t)?o:e.isStaticArray(t)?i:a;if(s===a)return r;var c=e.nestedName(t),u=e.staticPartLength(c),f=s===o?r[0]:"";if(e.isDynamicArray(c))for(var l=s===o?2:0,p=0;p<r.length;p++)s===o?l+=+r[p-1][0]||0:s===i&&(l+=+(r[p-1]||[])[0]||0),f+=y.formatInputInt(n+p*u+32*l).encode();for(var h=s===o?r.length-1:r.length,d=0;d<h;d++){var m=f/2;s===o?f+=this.encodeWithOffset(c,e,r[d+1],n+m):s===i&&(f+=this.encodeWithOffset(c,e,r[d],n+m))}return f},h.prototype.decodeParam=function(t,e){return this.decodeParams([t],e)[0]},h.prototype.decodeParams=function(r,n){var t=this.getTypes(r),o=this.getOffsets(r,t);return t.map(function(t,e){return t.decode(n,o[e],r[e],e)})},h.prototype.getOffsets=function(r,n){for(var t=n.map(function(t,e){return t.staticPartLength(r[e])}),e=1;e<t.length;e++)t[e]+=t[e-1];return t.map(function(t,e){return t-n[e].staticPartLength(r[e])})},h.prototype.getTypes=function(t){var e=this;return t.map(function(t){return e._requireType(t)})};var d=new h([new n,new o,new i,new a,new s,new l,new c,new u,new f]);e.exports=d},{"./address":4,"./bool":5,"./bytes":6,"./dynamicbytes":8,"./formatters":9,"./int":10,"./real":12,"./string":13,"./uint":15,"./ureal":16}],8:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputDynamicBytes,this._outputFormatter=n.formatOutputDynamicBytes};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^bytes(\[([0-9]*)\])*$/)},i.prototype.isDynamicType=function(){return!0},e.exports=i},{"./formatters":9,"./type":14}],9:[function(t,e,r){var n=t("bignumber.js"),o=t("../utils/utils"),i=t("../utils/config"),a=t("./param"),s=function(t){n.config(i.VNT_BIGNUMBER_ROUNDING_MODE);var e=o.padLeft(o.toTwosComplement(t).toString(16),64);return new a(e)},c=function(t){var e=t.staticPart()||"0";return"1"===new n(e.substr(0,1),16).toString(2).substr(0,1)?new n(e,16).minus(new n("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",16)).minus(1):new n(e,16)},u=function(t){var e=t.staticPart()||"0";return new n(e,16)};e.exports={formatInputInt:s,formatInputBytes:function(t){var e=o.toHex(t).substr(2),r=Math.floor((e.length+63)/64);return e=o.padRight(e,64*r),new a(e)},formatInputDynamicBytes:function(t){var e=o.toHex(t).substr(2),r=e.length/2,n=Math.floor((e.length+63)/64);return e=o.padRight(e,64*n),new a(s(r).value+e)},formatInputString:function(t){var e=o.fromUtf8(t).substr(2),r=e.length/2,n=Math.floor((e.length+63)/64);return e=o.padRight(e,64*n),new a(s(r).value+e)},formatInputBool:function(t){return new a("000000000000000000000000000000000000000000000000000000000000000"+(t?"1":"0"))},formatInputReal:function(t){return s(new n(t).times(new n(2).pow(128)))},formatOutputInt:c,formatOutputUInt:u,formatOutputReal:function(t){return c(t).dividedBy(new n(2).pow(128))},formatOutputUReal:function(t){return u(t).dividedBy(new n(2).pow(128))},formatOutputBool:function(t){return"0000000000000000000000000000000000000000000000000000000000000001"===t.staticPart()},formatOutputBytes:function(t,e){var r=e.match(/^bytes([0-9]*)/),n=parseInt(r[1]);return"0x"+t.staticPart().slice(0,2*n)},formatOutputDynamicBytes:function(t){var e=2*new n(t.dynamicPart().slice(0,64),16).toNumber();return"0x"+t.dynamicPart().substr(64,e)},formatOutputString:function(t){var e=2*new n(t.dynamicPart().slice(0,64),16).toNumber();return o.toUtf8(t.dynamicPart().substr(64,e))},formatOutputAddress:function(t){var e=t.staticPart();return"0x"+e.slice(e.length-40,e.length)}}},{"../utils/config":18,"../utils/utils":21,"./param":11,"bignumber.js":"bignumber.js"}],10:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputInt,this._outputFormatter=n.formatOutputInt};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^int([0-9]*)?(\[([0-9]*)\])*$/)},e.exports=i},{"./formatters":9,"./type":14}],11:[function(t,e,r){var n=t("../utils/utils"),o=function(t,e){this.value=t||"",this.offset=e};o.prototype.dynamicPartLength=function(){return this.dynamicPart().length/2},o.prototype.withOffset=function(t){return new o(this.value,t)},o.prototype.combine=function(t){return new o(this.value+t.value)},o.prototype.isDynamic=function(){return void 0!==this.offset},o.prototype.offsetAsBytes=function(){return this.isDynamic()?n.padLeft(n.toTwosComplement(this.offset).toString(16),64):""},o.prototype.staticPart=function(){return this.isDynamic()?this.offsetAsBytes():this.value},o.prototype.dynamicPart=function(){return this.isDynamic()?this.value:""},o.prototype.encode=function(){return this.staticPart()+this.dynamicPart()},o.encodeList=function(t){var r=32*t.length,e=t.map(function(t){if(!t.isDynamic())return t;var e=r;return r+=t.dynamicPartLength(),t.withOffset(e)});return e.reduce(function(t,e){return t+e.dynamicPart()},e.reduce(function(t,e){return t+e.staticPart()},""))},e.exports=o},{"../utils/utils":21}],12:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputReal,this._outputFormatter=n.formatOutputReal};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/real([0-9]*)?(\[([0-9]*)\])?/)},e.exports=i},{"./formatters":9,"./type":14}],13:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputString,this._outputFormatter=n.formatOutputString};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^string(\[([0-9]*)\])*$/)},i.prototype.isDynamicType=function(){return!0},e.exports=i},{"./formatters":9,"./type":14}],14:[function(t,e,r){var n=t("./formatters"),a=t("./param"),o=function(t){this._inputFormatter=t.inputFormatter,this._outputFormatter=t.outputFormatter};o.prototype.isType=function(t){throw"this method should be overrwritten for type "+t},o.prototype.staticPartLength=function(t){return(this.nestedTypes(t)||["[1]"]).map(function(t){return parseInt(t.slice(1,-1),10)||1}).reduce(function(t,e){return t*e},32)},o.prototype.isDynamicArray=function(t){var e=this.nestedTypes(t);return!!e&&!e[e.length-1].match(/[0-9]{1,}/g)},o.prototype.isStaticArray=function(t){var e=this.nestedTypes(t);return!!e&&!!e[e.length-1].match(/[0-9]{1,}/g)},o.prototype.staticArrayLength=function(t){var e=this.nestedTypes(t);return e?parseInt(e[e.length-1].match(/[0-9]{1,}/g)||1):1},o.prototype.nestedName=function(t){var e=this.nestedTypes(t);return e?t.substr(0,t.length-e[e.length-1].length):t},o.prototype.isDynamicType=function(){return!1},o.prototype.nestedTypes=function(t){return t.match(/(\[[0-9]*\])/g)},o.prototype.encode=function(o,i){var t,e,r,a=this;return this.isDynamicArray(i)?(t=o.length,e=a.nestedName(i),(r=[]).push(n.formatInputInt(t).encode()),o.forEach(function(t){r.push(a.encode(t,e))}),r):this.isStaticArray(i)?function(){for(var t=a.staticArrayLength(i),e=a.nestedName(i),r=[],n=0;n<t;n++)r.push(a.encode(o[n],e));return r}():this._inputFormatter(o,i).encode()},o.prototype.decode=function(c,u,f){var t,e,r,n,l=this;if(this.isDynamicArray(f))return function(){for(var t=parseInt("0x"+c.substr(2*u,64)),e=parseInt("0x"+c.substr(2*t,64)),r=t+32,n=l.nestedName(f),o=l.staticPartLength(n),i=32*Math.floor((o+31)/32),a=[],s=0;s<e*i;s+=i)a.push(l.decode(c,r+s,n));return a}();if(this.isStaticArray(f))return function(){for(var t=l.staticArrayLength(f),e=u,r=l.nestedName(f),n=l.staticPartLength(r),o=32*Math.floor((n+31)/32),i=[],a=0;a<t*o;a+=o)i.push(l.decode(c,e+a,r));return i}();if(this.isDynamicType(f))return t=parseInt("0x"+c.substr(2*u,64)),e=parseInt("0x"+c.substr(2*t,64)),r=Math.floor((e+31)/32),n=new a(c.substr(2*t,64*(1+r)),0),l._outputFormatter(n,f);var o=this.staticPartLength(f),i=new a(c.substr(2*u,2*o));return this._outputFormatter(i,f)},e.exports=o},{"./formatters":9,"./param":11}],15:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputInt,this._outputFormatter=n.formatOutputUInt};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^uint([0-9]*)?(\[([0-9]*)\])*$/)},e.exports=i},{"./formatters":9,"./type":14}],16:[function(t,e,r){var n=t("./formatters"),o=t("./type"),i=function(){this._inputFormatter=n.formatInputReal,this._outputFormatter=n.formatOutputUReal};((i.prototype=new o({})).constructor=i).prototype.isType=function(t){return!!t.match(/^ureal([0-9]*)?(\[([0-9]*)\])*$/)},e.exports=i},{"./formatters":9,"./type":14}],17:[function(t,e,r){"use strict";"undefined"==typeof XMLHttpRequest?r.XMLHttpRequest={}:r.XMLHttpRequest=XMLHttpRequest},{}],18:[function(t,e,r){var n=t("bignumber.js");e.exports={VNT_PADDING:32,VNT_SIGNATURE_LENGTH:4,VNT_UNITS:["wei","Kwei","Mwei","Gwei","microvnt","micro","millivnt","milli","vnt"],VNT_BIGNUMBER_ROUNDING_MODE:{ROUNDING_MODE:n.ROUND_DOWN},VNT_POLLING_TIMEOUT:500,defaultBlock:"latest",defaultAccount:void 0}},{"bignumber.js":"bignumber.js"}],19:[function(t,e,r){var d="0123456789abcdef".split(""),m=[1,256,65536,16777216],y=[0,8,16,24],ft=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648],v=function(t){var e,r,n,o,i,a,s,c,u,f,l,p,h,d,m,y,v,g,b,_,w,x,k,B,S,A,C,F,I,N,O,P,T,D,E,R,M,j,H,q,z,L,U,W,J,K,G,$,V,X,Z,Y,Q,tt,et,rt,nt,ot,it,at,st,ct,ut;for(n=0;n<48;n+=2)o=t[0]^t[10]^t[20]^t[30]^t[40],i=t[1]^t[11]^t[21]^t[31]^t[41],a=t[2]^t[12]^t[22]^t[32]^t[42],s=t[3]^t[13]^t[23]^t[33]^t[43],c=t[4]^t[14]^t[24]^t[34]^t[44],u=t[5]^t[15]^t[25]^t[35]^t[45],f=t[6]^t[16]^t[26]^t[36]^t[46],l=t[7]^t[17]^t[27]^t[37]^t[47],e=(p=t[8]^t[18]^t[28]^t[38]^t[48])^(a<<1|s>>>31),r=(h=t[9]^t[19]^t[29]^t[39]^t[49])^(s<<1|a>>>31),t[0]^=e,t[1]^=r,t[10]^=e,t[11]^=r,t[20]^=e,t[21]^=r,t[30]^=e,t[31]^=r,t[40]^=e,t[41]^=r,e=o^(c<<1|u>>>31),r=i^(u<<1|c>>>31),t[2]^=e,t[3]^=r,t[12]^=e,t[13]^=r,t[22]^=e,t[23]^=r,t[32]^=e,t[33]^=r,t[42]^=e,t[43]^=r,e=a^(f<<1|l>>>31),r=s^(l<<1|f>>>31),t[4]^=e,t[5]^=r,t[14]^=e,t[15]^=r,t[24]^=e,t[25]^=r,t[34]^=e,t[35]^=r,t[44]^=e,t[45]^=r,e=c^(p<<1|h>>>31),r=u^(h<<1|p>>>31),t[6]^=e,t[7]^=r,t[16]^=e,t[17]^=r,t[26]^=e,t[27]^=r,t[36]^=e,t[37]^=r,t[46]^=e,t[47]^=r,e=f^(o<<1|i>>>31),r=l^(i<<1|o>>>31),t[8]^=e,t[9]^=r,t[18]^=e,t[19]^=r,t[28]^=e,t[29]^=r,t[38]^=e,t[39]^=r,t[48]^=e,t[49]^=r,d=t[0],m=t[1],K=t[11]<<4|t[10]>>>28,G=t[10]<<4|t[11]>>>28,F=t[20]<<3|t[21]>>>29,I=t[21]<<3|t[20]>>>29,at=t[31]<<9|t[30]>>>23,st=t[30]<<9|t[31]>>>23,L=t[40]<<18|t[41]>>>14,U=t[41]<<18|t[40]>>>14,D=t[2]<<1|t[3]>>>31,E=t[3]<<1|t[2]>>>31,y=t[13]<<12|t[12]>>>20,v=t[12]<<12|t[13]>>>20,$=t[22]<<10|t[23]>>>22,V=t[23]<<10|t[22]>>>22,N=t[33]<<13|t[32]>>>19,O=t[32]<<13|t[33]>>>19,ct=t[42]<<2|t[43]>>>30,ut=t[43]<<2|t[42]>>>30,tt=t[5]<<30|t[4]>>>2,et=t[4]<<30|t[5]>>>2,R=t[14]<<6|t[15]>>>26,M=t[15]<<6|t[14]>>>26,g=t[25]<<11|t[24]>>>21,b=t[24]<<11|t[25]>>>21,X=t[34]<<15|t[35]>>>17,Z=t[35]<<15|t[34]>>>17,P=t[45]<<29|t[44]>>>3,T=t[44]<<29|t[45]>>>3,B=t[6]<<28|t[7]>>>4,S=t[7]<<28|t[6]>>>4,rt=t[17]<<23|t[16]>>>9,nt=t[16]<<23|t[17]>>>9,j=t[26]<<25|t[27]>>>7,H=t[27]<<25|t[26]>>>7,_=t[36]<<21|t[37]>>>11,w=t[37]<<21|t[36]>>>11,Y=t[47]<<24|t[46]>>>8,Q=t[46]<<24|t[47]>>>8,W=t[8]<<27|t[9]>>>5,J=t[9]<<27|t[8]>>>5,A=t[18]<<20|t[19]>>>12,C=t[19]<<20|t[18]>>>12,ot=t[29]<<7|t[28]>>>25,it=t[28]<<7|t[29]>>>25,q=t[38]<<8|t[39]>>>24,z=t[39]<<8|t[38]>>>24,x=t[48]<<14|t[49]>>>18,k=t[49]<<14|t[48]>>>18,t[0]=d^~y&g,t[1]=m^~v&b,t[10]=B^~A&F,t[11]=S^~C&I,t[20]=D^~R&j,t[21]=E^~M&H,t[30]=W^~K&$,t[31]=J^~G&V,t[40]=tt^~rt&ot,t[41]=et^~nt&it,t[2]=y^~g&_,t[3]=v^~b&w,t[12]=A^~F&N,t[13]=C^~I&O,t[22]=R^~j&q,t[23]=M^~H&z,t[32]=K^~$&X,t[33]=G^~V&Z,t[42]=rt^~ot&at,t[43]=nt^~it&st,t[4]=g^~_&x,t[5]=b^~w&k,t[14]=F^~N&P,t[15]=I^~O&T,t[24]=j^~q&L,t[25]=H^~z&U,t[34]=$^~X&Y,t[35]=V^~Z&Q,t[44]=ot^~at&ct,t[45]=it^~st&ut,t[6]=_^~x&d,t[7]=w^~k&m,t[16]=N^~P&B,t[17]=O^~T&S,t[26]=q^~L&D,t[27]=z^~U&E,t[36]=X^~Y&W,t[37]=Z^~Q&J,t[46]=at^~ct&tt,t[47]=st^~ut&et,t[8]=x^~d&y,t[9]=k^~m&v,t[18]=P^~B&A,t[19]=T^~S&C,t[28]=L^~D&R,t[29]=U^~E&M,t[38]=Y^~W&K,t[39]=Q^~J&G,t[48]=ct^~tt&rt,t[49]=ut^~et&nt,t[0]^=ft[n],t[1]^=ft[n+1]},n=function(a){return function(t){var e,r,n;if("0x"===t.slice(0,2)){e=[];for(var o=2,i=t.length;o<i;o+=2)e.push(parseInt(t.slice(o,o+2),16))}else e=t;return function(t,e){for(var r,n=e.length,o=t.blocks,i=t.blockCount<<2,a=t.blockCount,s=t.outputBlocks,c=t.s,u=0;u<n;){if(t.reset)for(t.reset=!1,o[0]=t.block,p=1;p<a+1;++p)o[p]=0;if("string"!=typeof e)for(p=t.start;u<n&&p<i;++u)o[p>>2]|=e[u]<<y[3&p++];else for(p=t.start;u<n&&p<i;++u)(r=e.charCodeAt(u))<128?o[p>>2]|=r<<y[3&p++]:(r<2048?o[p>>2]|=(192|r>>6)<<y[3&p++]:(r<55296||57344<=r?o[p>>2]|=(224|r>>12)<<y[3&p++]:(r=65536+((1023&r)<<10|1023&e.charCodeAt(++u)),o[p>>2]|=(240|r>>18)<<y[3&p++],o[p>>2]|=(128|r>>12&63)<<y[3&p++]),o[p>>2]|=(128|r>>6&63)<<y[3&p++]),o[p>>2]|=(128|63&r)<<y[3&p++]);if(i<=(t.lastByteIndex=p)){for(t.start=p-i,t.block=o[a],p=0;p<a;++p)c[p]^=o[p];v(c),t.reset=!0}else t.start=p}if(o[(p=t.lastByteIndex)>>2]|=m[3&p],t.lastByteIndex===i)for(o[0]=o[a],p=1;p<a+1;++p)o[p]=0;for(o[a-1]|=2147483648,p=0;p<a;++p)c[p]^=o[p];v(c);for(var f,l="",p=0,h=0;h<s;){for(p=0;p<a&&h<s;++p,++h)f=c[p],l+=d[f>>4&15]+d[15&f]+d[f>>12&15]+d[f>>8&15]+d[f>>20&15]+d[f>>16&15]+d[f>>28&15]+d[f>>24&15];h%a==0&&(v(c),p=0)}return"0x"+l}({blocks:[],reset:!0,block:0,start:0,blockCount:1600-((r=a)<<1)>>5,outputBlocks:r>>5,s:(n=[0,0,0,0,0,0,0,0,0,0],[].concat(n,n,n,n,n))},e)}};e.exports={keccak256:n(256),keccak512:n(512),keccak256s:n(256),keccak512s:n(512)}},{}],20:[function(t,e,r){var n=t("crypto-js"),o=t("crypto-js/sha3");e.exports=function(t,e){return e&&"hex"===e.encoding&&(2<t.length&&"0x"===t.substr(0,2)&&(t=t.substr(2)),t=n.enc.Hex.parse(t)),o(t,{outputLength:256}).toString()}},{"crypto-js":59,"crypto-js/sha3":80}],21:[function(t,e,r){var n=t("bignumber.js"),o=t("./sha3.js"),a=t("utf8"),i={novnt:"0",wei:"1",kwei:"1000",Kwei:"1000",mwei:"1000000",Mwei:"1000000",gwei:"1000000000",Gwei:"1000000000",microvnt:"1000000000000",micro:"1000000000000",millivnt:"1000000000000000",milli:"1000000000000000",vnt:"1000000000000000000"},s=function(t,e,r){return new Array(e-t.length+1).join(r||"0")+t},c=function(t,e){t=a.encode(t);for(var r="",n=0;n<t.length;n++){var o=t.charCodeAt(n);if(0===o){if(!e)break;r+="00"}else{var i=o.toString(16);r+=i.length<2?"0"+i:i}}return"0x"+r},u=function(t){var e=p(t),r=e.toString(16);return e.lessThan(0)?"-0x"+r.substr(1):"0x"+r},f=function(t){if(v(t))return u(+t);if(m(t))return u(t);if("object"==typeof t)return c(JSON.stringify(t));if(y(t)){if(0===t.indexOf("-0x"))return u(t);if(0===t.indexOf("0x"))return t;if(!isFinite(t))return c(t,1)}return u(t)},l=function(t){t=t?t.toLowerCase():"vnt";var e=i[t];if(void 0===e)throw new Error("This unit doesn't exists, please use the one of the following units"+JSON.stringify(i,null,2));return new n(e,10)},p=function(t){return m(t=t||0)?t:!y(t)||0!==t.indexOf("0x")&&0!==t.indexOf("-0x")?new n(t.toString(10),10):new n(t.replace("0x",""),16)},h=function(t){return/^0x[0-9a-f]{40}$/i.test(t)},d=function(t){t=t.replace("0x","");for(var e=o(t.toLowerCase()),r=0;r<40;r++)if(7<parseInt(e[r],16)&&t[r].toUpperCase()!==t[r]||parseInt(e[r],16)<=7&&t[r].toLowerCase()!==t[r])return!1;return!0},m=function(t){return t instanceof n||t&&t.constructor&&"BigNumber"===t.constructor.name},y=function(t){return"string"==typeof t||t&&t.constructor&&"String"===t.constructor.name},v=function(t){return"boolean"==typeof t};e.exports={padLeft:s,padRight:function(t,e,r){return t+new Array(e-t.length+1).join(r||"0")},toHex:f,toDecimal:function(t){return p(t).toNumber()},fromDecimal:u,toUtf8:function(t){var e="",r=0,n=t.length;for("0x"===t.substring(0,2)&&(r=2);r<n;r+=2){var o=parseInt(t.substr(r,2),16);if(0===o)break;e+=String.fromCharCode(o)}return a.decode(e)},toAscii:function(t){var e="",r=0,n=t.length;for("0x"===t.substring(0,2)&&(r=2);r<n;r+=2){var o=parseInt(t.substr(r,2),16);e+=String.fromCharCode(o)}return e},fromUtf8:c,fromAscii:function(t){for(var e="",r=0;r<t.length;r++){var n=t.charCodeAt(r).toString(16);e+=n.length<2?"0"+n:n}return"0x"+e},transformToFullName:function(t){if(-1!==t.name.indexOf("("))return t.name;var e=t.inputs.map(function(t){return t.type}).join();return t.name+"("+e+")"},extractDisplayName:function(t){var e=t.indexOf("("),r=t.indexOf(")");return-1!==e&&-1!==r?t.substr(0,e):t},extractTypeName:function(t){var e=t.indexOf("("),r=t.indexOf(")");return-1!==e&&-1!==r?t.substr(e+1,r-e-1).replace(" ",""):""},toWei:function(t,e){var r=p(t).times(l(e));return m(t)?r:r.toString(10)},fromWei:function(t,e){var r=p(t).dividedBy(l(e));return m(t)?r:r.toString(10)},toBigNumber:p,toTwosComplement:function(t){var e=p(t).round();return e.lessThan(0)?new n("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",16).plus(e).plus(1):e},toAddress:function(t){return h(t)?t:/^[0-9a-f]{40}$/.test(t)?"0x"+t:"0x"+s(f(t).substr(2),40)},isBigNumber:m,isStrictAddress:h,isAddress:function(t){return!!/^(0x)?[0-9a-f]{40}$/i.test(t)&&(!(!/^(0x)?[0-9a-f]{40}$/.test(t)&&!/^(0x)?[0-9A-F]{40}$/.test(t))||d(t))},isChecksumAddress:d,toChecksumAddress:function(t){if(void 0===t)return"";t=t.toLowerCase().replace("0x","");for(var e=o(t),r="0x",n=0;n<t.length;n++)7<parseInt(e[n],16)?r+=t[n].toUpperCase():r+=t[n];return r},isFunction:function(t){return"function"==typeof t},isString:y,isObject:function(t){return null!==t&&!Array.isArray(t)&&"object"==typeof t},isBoolean:v,isArray:function(t){return Array.isArray(t)},isJson:function(t){try{return!!JSON.parse(t)}catch(t){return!1}},isBloom:function(t){return!(!/^(0x)?[0-9a-f]{512}$/i.test(t)||!/^(0x)?[0-9a-f]{512}$/.test(t)&&!/^(0x)?[0-9A-F]{512}$/.test(t))},isTopic:function(t){return!(!/^(0x)?[0-9a-f]{64}$/i.test(t)||!/^(0x)?[0-9a-f]{64}$/.test(t)&&!/^(0x)?[0-9A-F]{64}$/.test(t))}}},{"./sha3.js":20,"bignumber.js":"bignumber.js",utf8:85}],22:[function(t,e,r){e.exports={version:"0.20.7"}},{}],23:[function(t,e,r){var n=t("./vnt/requestmanager"),o=t("./vnt/iban"),i=t("./vnt/methods/core"),a=t("./vnt/methods/shh"),s=t("./vnt/methods/net"),c=t("./vnt/methods/personal"),u=t("./vnt/methods/swarm"),f=t("./vnt/settings"),l=t("./version.json"),p=t("./utils/utils"),h=t("./utils/sha3"),d=t("./utils/hash"),m=t("./vnt/extend"),y=t("./vnt/batch"),v=t("./vnt/property"),g=t("./vnt/httpprovider"),b=t("./vnt/ipcprovider"),_=t("bignumber.js");function w(t){this._requestManager=new n(t),this.currentProvider=t,this.core=new i(this),this.shh=new a(this),this.net=new s(this),this.hash=d,this.utils=p,this.personal=new c(this),this.bzz=new u(this),this.settings=new f,this.version={api:l.version},this.providers={HttpProvider:g,IpcProvider:b},this._extend=m(this),this._extend({properties:x()})}w.providers={HttpProvider:g,IpcProvider:b},w.prototype.setProvider=function(t){this._requestManager.setProvider(t),this.currentProvider=t},w.prototype.reset=function(t){this._requestManager.reset(t),this.settings=new f},w.prototype.BigNumber=_,w.prototype.toHex=p.toHex,w.prototype.toAscii=p.toAscii,w.prototype.toUtf8=p.toUtf8,w.prototype.fromAscii=p.fromAscii,w.prototype.fromUtf8=p.fromUtf8,w.prototype.toDecimal=p.toDecimal,w.prototype.fromDecimal=p.fromDecimal,w.prototype.toBigNumber=p.toBigNumber,w.prototype.toWei=p.toWei,w.prototype.fromWei=p.fromWei,w.prototype.isAddress=p.isAddress,w.prototype.isChecksumAddress=p.isChecksumAddress,w.prototype.toChecksumAddress=p.toChecksumAddress,w.prototype.isIBAN=p.isIBAN,w.prototype.padLeft=p.padLeft,w.prototype.padRight=p.padRight,w.prototype.sha3=function(t,e){return"0x"+h(t,e)},w.prototype.fromICAP=function(t){return new o(t).address()};var x=function(){return[new v({name:"version.node",getter:"vnt_clientVersion"}),new v({name:"version.network",getter:"net_version",inputFormatter:p.toDecimal}),new v({name:"version.vntchain",getter:"core_protocolVersion",inputFormatter:p.toDecimal}),new v({name:"version.whisper",getter:"shh_version",inputFormatter:p.toDecimal})]};w.prototype.isConnected=function(){return this.currentProvider&&this.currentProvider.isConnected()},w.prototype.createBatch=function(){return new y(this)},e.exports=w},{"./utils/hash":19,"./utils/sha3":20,"./utils/utils":21,"./version.json":22,"./vnt/batch":25,"./vnt/extend":29,"./vnt/httpprovider":33,"./vnt/iban":34,"./vnt/ipcprovider":35,"./vnt/methods/core":38,"./vnt/methods/net":39,"./vnt/methods/personal":40,"./vnt/methods/shh":41,"./vnt/methods/swarm":42,"./vnt/property":45,"./vnt/requestmanager":46,"./vnt/settings":47,"bignumber.js":"bignumber.js"}],24:[function(t,e,r){var n=t("../utils/sha3"),o=t("./event"),i=t("./formatters"),a=t("../utils/utils"),s=t("./filter"),c=t("./methods/watches"),u=function(t,e,r){this._requestManager=t,this._json=e,this._address=r};u.prototype.encode=function(e){e=e||{};var r={};return["fromBlock","toBlock"].filter(function(t){return void 0!==e[t]}).forEach(function(t){r[t]=i.inputBlockNumberFormatter(e[t])}),r.address=this._address,r},u.prototype.decode=function(t){t.data=t.data||"";var e=a.isArray(t.topics)&&a.isString(t.topics[0])?t.topics[0].slice(2):"",r=this._json.filter(function(t){return e===n(a.transformToFullName(t))})[0];return r?new o(this._requestManager,r,this._address).decode(t):i.outputLogFormatter(t)},u.prototype.execute=function(t,e){a.isFunction(arguments[arguments.length-1])&&(e=arguments[arguments.length-1],1===arguments.length&&(t=null));var r=this.encode(t),n=this.decode.bind(this);return new s(r,"vnt",this._requestManager,c.vnt(),n,e)},u.prototype.attachToContract=function(t){var e=this.execute.bind(this);t.allEvents=e},e.exports=u},{"../utils/sha3":20,"../utils/utils":21,"./event":28,"./filter":30,"./formatters":31,"./methods/watches":43}],25:[function(t,e,r){var o=t("./jsonrpc"),i=t("./errors"),n=function(t){this.requestManager=t._requestManager,this.requests=[]};n.prototype.add=function(t){this.requests.push(t)},n.prototype.execute=function(){var n=this.requests;this.requestManager.sendBatch(n,function(t,r){r=r||[],n.map(function(t,e){return r[e]||{}}).forEach(function(t,e){if(n[e].callback){if(!o.isValidResponse(t))return n[e].callback(i.InvalidResponse(t));n[e].callback(null,n[e].format?n[e].format(t.result):t.result)}})})},e.exports=n},{"./errors":27,"./jsonrpc":36}],26:[function(t,e,r){var n=t("fs"),c=t("../utils/utils"),a=t("../types/coder"),o=t("./event"),i=t("./function"),s=t("./allevents"),u=t("../utils/sha3"),f=function(t,e){return t.filter(function(t){return"constructor"===t.type&&t.inputs.length===e.length}).map(function(t){return t.inputs.map(function(t){return t.type})}).map(function(t){return a.encodeParams(t,e)})[0]||""},l=function(e){e.abi.filter(function(t){return"function"===t.type}).map(function(t){return new i(e._core,t,e.address)}).forEach(function(t){t.attachToContract(e)})},p=function(e){var t=e.abi.filter(function(t){return"event"===t.type});new s(e._core._requestManager,t,e.address).attachToContract(e),t.map(function(t){return new o(e._core._requestManager,t,e.address)}).forEach(function(t){t.attachToContract(e)})},h=function(n,o){var e=0,i=!1,a=n._core.filter("latest",function(t){if(!t&&!i)if(50<++e){if(a.stopWatching(function(){}),i=!0,!o)throw new Error("Contract transaction couldn't be found after 50 blocks");o(new Error("Contract transaction couldn't be found after 50 blocks"))}else n._core.getTransactionReceipt(n.transactionHash,function(t,r){r&&r.blockHash&&!i&&n._core.getCode(r.contractAddress,function(t,e){if(!i&&e)if(a.stopWatching(function(){}),i=!0,3<e.length)n.address=r.contractAddress,l(n),p(n),o&&o(null,n);else{if(!o)throw new Error("The contract code couldn't be stored, please check your gas amount.");o(new Error("The contract code couldn't be stored, please check your gas amount."))}})})})},d=function(t,s){this.core=t,this.abi=s,this.code=null,this.new=function(){var r,n=new m(this.core,this.abi),t={},e=Array.prototype.slice.call(arguments);c.isFunction(e[e.length-1])&&(r=e.pop());var o=e[e.length-1];if((c.isObject(o)&&!c.isArray(o)&&(t=e.pop()),0<t.value)&&"$"!=(s.filter(function(t){return"constructor"===t.type&&t.inputs.length===e.length})[0]||{}).name.substring(0,1))throw new Error("Cannot send value to non-payable constructor");var i=f(this.abi,e);if(t.data+=i,r)this.core.sendTransaction(t,function(t,e){t?r(t):(n.transactionHash=e,r(null,n),h(n,r))});else{var a=this.core.sendTransaction(t);n.transactionHash=a,h(n)}return n},this.new.getData=this.getData.bind(this)};d.prototype.at=function(t,e){var r=new m(this.core,this.abi,t);return l(r),p(r),e&&e(null,r),r},d.prototype.codeFile=function(t){var e="0x"+n.readFileSync(t).toString("hex");return this.code=e,this},d.prototype.packContructorData=function(){if(!this.code)throw new Error("There is no code file specified. Please specify it with codeFile method.");var t=Array.prototype.slice.call(arguments),e=f(this.abi,t);return this.code+e},d.prototype.packFunctionData=function(){var t=Array.prototype.slice.call(arguments);if(t.length<1)throw new Error("Please specify the function name and parameters.");var e=t[0],r=[];if(1<t.length&&(r=t[1]),!c.isString(e))throw new Error("Invalide function name.");if(!c.isArray(r))throw new Error("Invalide arguments array.");var n=this.abi.filter(function(t){return"function"===t.type&&t.name==e&&t.inputs.length===r.length})[0];if(!n)throw new Error("Invalide function name or arguments.");var o=n.inputs.map(function(t){return t.type}),i=e+"("+o.toString()+")";return"0x"+u(i).slice(0,8)+a.encodeParams(o,r)},d.prototype.unPackOutput=function(){var t=Array.prototype.slice.call(arguments);if(t.length<2)throw new Error("Please specify the function name and parameters.");var e=t[0],r=t[1];if(r){if(!c.isString(e))throw new Error("Invalide function name.");if(!c.isString(r))throw new Error("Invalide output hex string.");var n=this.abi.filter(function(t){return"function"===t.type&&t.name==e})[0];if(!n)throw new Error("Invalide function name.");var o=n.outputs.map(function(t){return t.type});r=2<=r.length?r.slice(2):r;var i=a.decodeParams(o,r);return 1===i.length?i[0]:i}},d.prototype.getData=function(){var t={},e=Array.prototype.slice.call(arguments),r=e[e.length-1];c.isObject(r)&&!c.isArray(r)&&(t=e.pop());var n=f(this.abi,e);return t.data+=n,t.data};var m=function(t,e,r){this._core=t,this.transactionHash=null,this.address=r,this.abi=e};e.exports=d},{"../types/coder":7,"../utils/sha3":20,"../utils/utils":21,"./allevents":24,"./event":28,"./function":32,fs:50}],27:[function(t,e,r){e.exports={InvalidNumberOfArgs:function(){return new Error("Invalid number of arguments to function")},InvalidNumberOfRPCParams:function(){return new Error("Invalid number of input parameters to RPC method")},InvalidConnection:function(t){return new Error("CONNECTION ERROR: Couldn't connect to node "+t+".")},InvalidProvider:function(){return new Error("Provider not set or invalid")},InvalidResponse:function(t){var e=t&&t.error&&t.error.message?t.error.message:"Invalid JSON RPC response: "+JSON.stringify(t);return new Error(e)},ConnectionTimeout:function(t){return new Error("CONNECTION TIMEOUT: timeout of "+t+" ms achived")}}},{}],28:[function(t,e,r){var i=t("../utils/utils"),a=t("../types/coder"),s=t("./formatters"),n=t("../utils/sha3"),c=t("./filter"),u=t("./methods/watches"),o=function(t,e,r){this._requestManager=t,this._params=e.inputs,this._name=i.transformToFullName(e),this._address=r,this._anonymous=e.anonymous};o.prototype.types=function(e){return this._params.filter(function(t){return t.indexed===e}).map(function(t){return t.type})},o.prototype.displayName=function(){return i.extractDisplayName(this._name)},o.prototype.typeName=function(){return i.extractTypeName(this._name)},o.prototype.signature=function(){return n(this._name)},o.prototype.encode=function(r,e){r=r||{},e=e||{};var n={};["fromBlock","toBlock"].filter(function(t){return void 0!==e[t]}).forEach(function(t){n[t]=s.inputBlockNumberFormatter(e[t])}),n.topics=[],n.address=this._address,this._anonymous||n.topics.push("0x"+this.signature());var t=this._params.filter(function(t){return!0===t.indexed}).map(function(e){var t=r[e.name];return null==t?null:i.isArray(t)?t.map(function(t){return"0x"+a.encodeParam(e.type,t)}):"0x"+a.encodeParam(e.type,t)});return n.topics=n.topics.concat(t),n},o.prototype.decode=function(t){t.data=t.data||"",t.topics=t.topics||[];var e=(this._anonymous?t.topics:t.topics.slice(1)).map(function(t){return t.slice(2)}).join(""),r=a.decodeParams(this.types(!0),e),n=t.data.slice(2),o=a.decodeParams(this.types(!1),n),i=s.outputLogFormatter(t);return i.event=this.displayName(),i.address=t.address,i.args=this._params.reduce(function(t,e){return t[e.name]=e.indexed?r.shift():o.shift(),t},{}),delete i.data,delete i.topics,i},o.prototype.execute=function(t,e,r){i.isFunction(arguments[arguments.length-1])&&(r=arguments[arguments.length-1],2===arguments.length&&(e=null),1===arguments.length&&(e=null,t={}));var n=this.encode(t,e),o=this.decode.bind(this);return new c(n,"vnt",this._requestManager,u.vnt(),o,r)},o.prototype.attachToContract=function(t){var e=this.execute.bind(this),r=this.displayName();t[r]||(t[r]=e),t[r][this.typeName()]=this.execute.bind(this,t)},e.exports=o},{"../types/coder":7,"../utils/sha3":20,"../utils/utils":21,"./filter":30,"./formatters":31,"./methods/watches":43}],29:[function(t,e,r){var n=t("./formatters"),o=t("./../utils/utils"),i=t("./method"),a=t("./property");e.exports=function(r){var t=function(t){var e;e=t.property?(r[t.property]||(r[t.property]={}),r[t.property]):r,t.methods&&t.methods.forEach(function(t){t.attachToObject(e),t.setRequestManager(r._requestManager)}),t.properties&&t.properties.forEach(function(t){t.attachToObject(e),t.setRequestManager(r._requestManager)})};return t.formatters=n,t.utils=o,t.Method=i,t.Property=a,t}},{"./../utils/utils":21,"./formatters":31,"./method":37,"./property":45}],30:[function(t,e,r){var u=t("./formatters"),f=t("../utils/utils"),l=function(t){return null==t?null:0===(t=String(t)).indexOf("0x")?t:f.fromUtf8(t)},p=function(t,r){f.isString(t.options)||t.get(function(t,e){t&&r(t),f.isArray(e)&&e.forEach(function(t){r(null,t)})})},h=function(r){r.requestManager.startPolling({method:r.implementation.poll.call,params:[r.filterId]},r.filterId,function(e,t){if(e)return r.callbacks.forEach(function(t){t(e)});f.isArray(t)&&t.forEach(function(e){e=r.formatter?r.formatter(e):e,r.callbacks.forEach(function(t){t(null,e)})})},r.stopWatching.bind(r))},n=function(t,e,r,n,o,i,a){var s=this,c={};return n.forEach(function(t){t.setRequestManager(r),t.attachToObject(c)}),this.requestManager=r,this.options=function(t,e){if(f.isString(t))return t;switch(t=t||{},e){case"vnt":return t.topics=t.topics||[],t.topics=t.topics.map(function(t){return f.isArray(t)?t.map(l):l(t)}),{topics:t.topics,from:t.from,to:t.to,address:t.address,fromBlock:u.inputBlockNumberFormatter(t.fromBlock),toBlock:u.inputBlockNumberFormatter(t.toBlock)};case"shh":return t}}(t,e),this.implementation=c,this.filterId=null,this.callbacks=[],this.getLogsCallbacks=[],this.pollFilters=[],this.formatter=o,this.implementation.newFilter(this.options,function(e,t){if(e)s.callbacks.forEach(function(t){t(e)}),"function"==typeof a&&a(e);else if(s.filterId=t,s.getLogsCallbacks.forEach(function(t){s.get(t)}),s.getLogsCallbacks=[],s.callbacks.forEach(function(t){p(s,t)}),0<s.callbacks.length&&h(s),"function"==typeof i)return s.watch(i)}),this};n.prototype.watch=function(t){return this.callbacks.push(t),this.filterId&&(p(this,t),h(this)),this},n.prototype.stopWatching=function(t){if(this.requestManager.stopPolling(this.filterId),this.callbacks=[],!t)return this.implementation.uninstallFilter(this.filterId);this.implementation.uninstallFilter(this.filterId,t)},n.prototype.get=function(r){var n=this;if(f.isFunction(r))return null===this.filterId?this.getLogsCallbacks.push(r):this.implementation.getLogs(this.filterId,function(t,e){t?r(t):r(null,e.map(function(t){return n.formatter?n.formatter(t):t}))}),this;if(null===this.filterId)throw new Error("Filter ID Error: filter().get() can't be chained synchronous, please provide a callback for the get() method.");return this.implementation.getLogs(this.filterId).map(function(t){return n.formatter?n.formatter(t):t})},e.exports=n},{"../utils/utils":21,"./formatters":31}],31:[function(t,e,r){"use strict";var n=t("../utils/utils"),o=t("../utils/config"),i=t("./iban"),a=function(t){var e;if(void 0!==t)return"latest"===(e=t)||"pending"===e||"earliest"===e?t:n.toHex(t)},s=function(t){return null!==t.blockNumber&&(t.blockNumber=n.toDecimal(t.blockNumber)),null!==t.transactionIndex&&(t.transactionIndex=n.toDecimal(t.transactionIndex)),t.nonce=n.toDecimal(t.nonce),t.gas=n.toDecimal(t.gas),t.gasPrice=n.toBigNumber(t.gasPrice),t.value=n.toBigNumber(t.value),t},c=function(t){return t.blockNumber&&(t.blockNumber=n.toDecimal(t.blockNumber)),t.transactionIndex&&(t.transactionIndex=n.toDecimal(t.transactionIndex)),t.logIndex&&(t.logIndex=n.toDecimal(t.logIndex)),t},u=function(t){var e=new i(t);if(e.isValid()&&e.isDirect())return"0x"+e.address();if(n.isStrictAddress(t))return t;if(n.isAddress(t))return"0x"+t;throw new Error("invalid address")};e.exports={inputDefaultBlockNumberFormatter:function(t){return void 0===t?o.defaultBlock:a(t)},inputBlockNumberFormatter:a,inputCallFormatter:function(e){return e.from=e.from||o.defaultAccount,e.from&&(e.from=u(e.from)),e.to&&(e.to=u(e.to)),["gasPrice","gas","value","nonce"].filter(function(t){return void 0!==e[t]}).forEach(function(t){e[t]=n.fromDecimal(e[t])}),e},inputTransactionFormatter:function(e){return e.from=e.from||o.defaultAccount,e.from=u(e.from),e.to&&(e.to=u(e.to)),["gasPrice","gas","value","nonce"].filter(function(t){return void 0!==e[t]}).forEach(function(t){e[t]=n.fromDecimal(e[t])}),e},inputAddressFormatter:u,inputPostFormatter:function(t){return t.ttl=n.fromDecimal(t.ttl),t.workToProve=n.fromDecimal(t.workToProve),t.priority=n.fromDecimal(t.priority),n.isArray(t.topics)||(t.topics=t.topics?[t.topics]:[]),t.topics=t.topics.map(function(t){return 0===t.indexOf("0x")?t:n.fromUtf8(t)}),t},outputBigNumberFormatter:function(t){return n.toBigNumber(t)},outputTransactionFormatter:s,outputTransactionReceiptFormatter:function(t){return null!==t.blockNumber&&(t.blockNumber=n.toDecimal(t.blockNumber)),null!==t.transactionIndex&&(t.transactionIndex=n.toDecimal(t.transactionIndex)),t.cumulativeGasUsed=n.toDecimal(t.cumulativeGasUsed),t.gasUsed=n.toDecimal(t.gasUsed),n.isArray(t.logs)&&(t.logs=t.logs.map(function(t){return c(t)})),t},outputBlockFormatter:function(t){return t.gasLimit=n.toDecimal(t.gasLimit),t.gasUsed=n.toDecimal(t.gasUsed),t.size=n.toDecimal(t.size),t.timestamp=n.toDecimal(t.timestamp),null!==t.number&&(t.number=n.toDecimal(t.number)),t.difficulty=n.toBigNumber(t.difficulty),t.totalDifficulty=n.toBigNumber(t.totalDifficulty),n.isArray(t.transactions)&&t.transactions.forEach(function(t){if(!n.isString(t))return s(t)}),t},outputLogFormatter:c,outputPostFormatter:function(t){return t.expiry=n.toDecimal(t.expiry),t.sent=n.toDecimal(t.sent),t.ttl=n.toDecimal(t.ttl),t.workProved=n.toDecimal(t.workProved),t.topics||(t.topics=[]),t.topics=t.topics.map(function(t){return n.toAscii(t)}),t},outputSyncingFormatter:function(t){return t&&(t.startingBlock=n.toDecimal(t.startingBlock),t.currentBlock=n.toDecimal(t.currentBlock),t.highestBlock=n.toDecimal(t.highestBlock),t.knownStates&&(t.knownStates=n.toDecimal(t.knownStates),t.pulledStates=n.toDecimal(t.pulledStates))),t}}},{"../utils/config":18,"../utils/utils":21,"./iban":34}],32:[function(t,e,r){var n=t("../types/coder"),o=t("../utils/utils"),i=t("./errors"),a=t("./formatters"),s=t("../utils/sha3"),c=function(t,e,r){this._vnt=t,this._inputTypes=e.inputs.map(function(t){return t.type}),this._outputTypes=e.outputs.map(function(t){return t.type}),this._constant=e.constant,"$"==e.name.substring(0,1)&&(this._payable=!0),this._name=o.transformToFullName(e),this._address=r};c.prototype.extractCallback=function(t){if(o.isFunction(t[t.length-1]))return t.pop()},c.prototype.extractDefaultBlock=function(t){if(t.length>this._inputTypes.length&&!o.isObject(t[t.length-1]))return a.inputDefaultBlockNumberFormatter(t.pop())},c.prototype.validateArgs=function(t){if(t.filter(function(t){return!(!0===o.isObject(t)&&!1===o.isArray(t)&&!1===o.isBigNumber(t))}).length!==this._inputTypes.length)throw i.InvalidNumberOfArgs()},c.prototype.toPayload=function(t){var e={};return t.length>this._inputTypes.length&&o.isObject(t[t.length-1])&&(e=t[t.length-1]),this.validateArgs(t),e.to=this._address,e.data="0x"+this.signature()+n.encodeParams(this._inputTypes,t),e},c.prototype.signature=function(){return s(this._name).slice(0,8)},c.prototype.unpackOutput=function(t){if(t){t=2<=t.length?t.slice(2):t;var e=n.decodeParams(this._outputTypes,t);return 1===e.length?e[0]:e}},c.prototype.call=function(){var t=Array.prototype.slice.call(arguments).filter(function(t){return void 0!==t}),n=this.extractCallback(t),e=this.extractDefaultBlock(t),r=this.toPayload(t);if(!n){var o=this._vnt.call(r,e);return this.unpackOutput(o)}var i=this;this._vnt.call(r,e,function(e,t){if(e)return n(e,null);var r=null;try{r=i.unpackOutput(t)}catch(t){e=t}n(e,r)})},c.prototype.sendTransaction=function(){var t=Array.prototype.slice.call(arguments).filter(function(t){return void 0!==t}),e=this.extractCallback(t),r=this.toPayload(t);if(0<r.value&&!this._payable)throw new Error("Cannot send value to non-payable function");if(!e)return this._vnt.sendTransaction(r);this._vnt.sendTransaction(r,e)},c.prototype.estimateGas=function(){var t=Array.prototype.slice.call(arguments),e=this.extractCallback(t),r=this.toPayload(t);if(!e)return this._vnt.estimateGas(r);this._vnt.estimateGas(r,e)},c.prototype.getData=function(){var t=Array.prototype.slice.call(arguments);return this.toPayload(t).data},c.prototype.displayName=function(){return o.extractDisplayName(this._name)},c.prototype.typeName=function(){return o.extractTypeName(this._name)},c.prototype.request=function(){var t=Array.prototype.slice.call(arguments),e=this.extractCallback(t),r=this.toPayload(t),n=this.unpackOutput.bind(this);return{method:this._constant?"core_call":"core_sendTransaction",callback:e,params:[r],format:n}},c.prototype.execute=function(){return!this._constant?this.sendTransaction.apply(this,Array.prototype.slice.call(arguments)):this.call.apply(this,Array.prototype.slice.call(arguments))},c.prototype.attachToContract=function(t){var e=this.execute.bind(this);e.request=this.request.bind(this),e.call=this.call.bind(this),e.sendTransaction=this.sendTransaction.bind(this),e.estimateGas=this.estimateGas.bind(this),e.getData=this.getData.bind(this);var r=this.displayName();t[r]||(t[r]=e),t[r][this.typeName()]=e},e.exports=c},{"../types/coder":7,"../utils/sha3":20,"../utils/utils":21,"./errors":27,"./formatters":31}],33:[function(t,e,r){var o=t("./errors");"undefined"!=typeof window&&window.XMLHttpRequest?XMLHttpRequest=window.XMLHttpRequest:XMLHttpRequest=t("xmlhttprequest").XMLHttpRequest;var n=t("xhr2"),i=function(t,e,r,n,o){this.host=t||"http://localhost:8545",this.timeout=e||0,this.user=r,this.password=n,this.headers=o};i.prototype.prepareRequest=function(t){var e;if(t?(e=new n).timeout=this.timeout:e=new XMLHttpRequest,e.open("POST",this.host,t),this.user&&this.password){var r="Basic "+new Buffer(this.user+":"+this.password).toString("base64");e.setRequestHeader("Authorization",r)}return e.setRequestHeader("Content-Type","application/json"),this.headers&&this.headers.forEach(function(t){e.setRequestHeader(t.name,t.value)}),e},i.prototype.send=function(t){var e=this.prepareRequest(!1);try{e.send(JSON.stringify(t))}catch(t){throw o.InvalidConnection(this.host)}var r=e.responseText;try{r=JSON.parse(r)}catch(t){throw o.InvalidResponse(e.responseText)}return r},i.prototype.sendAsync=function(t,r){var n=this.prepareRequest(!0);n.onreadystatechange=function(){if(4===n.readyState&&1!==n.timeout){var t=n.responseText,e=null;try{t=JSON.parse(t)}catch(t){e=o.InvalidResponse(n.responseText)}r(e,t)}},n.ontimeout=function(){r(o.ConnectionTimeout(this.timeout))};try{n.send(JSON.stringify(t))}catch(t){r(o.InvalidConnection(this.host))}},i.prototype.isConnected=function(){try{return this.send({id:9999999999,jsonrpc:"2.0",method:"net_listening",params:[]}),!0}catch(t){return!1}},e.exports=i},{"./errors":27,xhr2:86,xmlhttprequest:17}],34:[function(t,e,r){var n=t("bignumber.js"),o=function(t,e){for(var r=t;r.length<2*e;)r="0"+r;return r},i=function(t){var r="A".charCodeAt(0),n="Z".charCodeAt(0);return(t=(t=t.toUpperCase()).substr(4)+t.substr(0,4)).split("").map(function(t){var e=t.charCodeAt(0);return r<=e&&e<=n?e-r+10:t}).join("")},a=function(t){for(var e,r=t;2<r.length;)e=r.slice(0,9),r=parseInt(e,10)%97+r.slice(e.length);return parseInt(r,10)%97},s=function(t){this._iban=t};s.fromAddress=function(t){var e=new n(t,16).toString(36),r=o(e,15);return s.fromBban(r.toUpperCase())},s.fromBban=function(t){var e=("0"+(98-a(i("XE00"+t)))).slice(-2);return new s("XE"+e+t)},s.createIndirect=function(t){return s.fromBban("VNT"+t.institution+t.identifier)},s.isValid=function(t){return new s(t).isValid()},s.prototype.isValid=function(){return/^XE[0-9]{2}(VNT[0-9A-Z]{13}|[0-9A-Z]{30,31})$/.test(this._iban)&&1===a(i(this._iban))},s.prototype.isDirect=function(){return 34===this._iban.length||35===this._iban.length},s.prototype.isIndirect=function(){return 20===this._iban.length},s.prototype.checksum=function(){return this._iban.substr(2,2)},s.prototype.institution=function(){return this.isIndirect()?this._iban.substr(7,4):""},s.prototype.client=function(){return this.isIndirect()?this._iban.substr(11):""},s.prototype.address=function(){if(this.isDirect()){var t=this._iban.substr(4),e=new n(t,36);return o(e.toString(16),20)}return""},s.prototype.toString=function(){return this._iban},e.exports=s},{"bignumber.js":"bignumber.js"}],35:[function(t,e,r){"use strict";var n=t("../utils/utils"),o=t("./errors"),i=function(t,e){var r=this;this.responseCallbacks={},this.path=t,this.connection=e.connect({path:this.path}),this.connection.on("error",function(t){console.error("IPC Connection Error",t),r._timeout()}),this.connection.on("end",function(){r._timeout()}),this.connection.on("data",function(t){r._parseResponse(t.toString()).forEach(function(t){var e=null;n.isArray(t)?t.forEach(function(t){r.responseCallbacks[t.id]&&(e=t.id)}):e=t.id,r.responseCallbacks[e]&&(r.responseCallbacks[e](null,t),delete r.responseCallbacks[e])})})};i.prototype._parseResponse=function(t){var r=this,n=[];return t.replace(/\}[\n\r]?\{/g,"}|--|{").replace(/\}\][\n\r]?\[\{/g,"}]|--|[{").replace(/\}[\n\r]?\[\{/g,"}|--|[{").replace(/\}\][\n\r]?\{/g,"}]|--|{").split("|--|").forEach(function(e){r.lastChunk&&(e=r.lastChunk+e);var t=null;try{t=JSON.parse(e)}catch(t){return r.lastChunk=e,clearTimeout(r.lastChunkTimeout),void(r.lastChunkTimeout=setTimeout(function(){throw r._timeout(),o.InvalidResponse(e)},15e3))}clearTimeout(r.lastChunkTimeout),r.lastChunk=null,t&&n.push(t)}),n},i.prototype._addResponseCallback=function(t,e){var r=t.id||t[0].id,n=t.method||t[0].method;this.responseCallbacks[r]=e,this.responseCallbacks[r].method=n},i.prototype._timeout=function(){for(var t in this.responseCallbacks)this.responseCallbacks.hasOwnProperty(t)&&(this.responseCallbacks[t](o.InvalidConnection("on IPC")),delete this.responseCallbacks[t])},i.prototype.isConnected=function(){return this.connection.writable||this.connection.connect({path:this.path}),!!this.connection.writable},i.prototype.send=function(t){if(this.connection.writeSync){var e;this.connection.writable||this.connection.connect({path:this.path});var r=this.connection.writeSync(JSON.stringify(t));try{e=JSON.parse(r)}catch(t){throw o.InvalidResponse(r)}return e}throw new Error('You tried to send "'+t.method+'" synchronously. Synchronous requests are not supported by the IPC provider.')},i.prototype.sendAsync=function(t,e){this.connection.writable||this.connection.connect({path:this.path}),this.connection.write(JSON.stringify(t)),this._addResponseCallback(t,e)},e.exports=i},{"../utils/utils":21,"./errors":27}],36:[function(t,e,r){var n={messageId:0,toPayload:function(t,e){return t||console.error("jsonrpc method should be specified!"),n.messageId++,{jsonrpc:"2.0",id:n.messageId,method:t,params:e||[]}},isValidResponse:function(t){return Array.isArray(t)?t.every(e):e(t);function e(t){return!!t&&!t.error&&"2.0"===t.jsonrpc&&"number"==typeof t.id&&void 0!==t.result}},toBatchPayload:function(t){return t.map(function(t){return n.toPayload(t.method,t.params)})}};e.exports=n},{}],37:[function(t,e,r){var n=t("../utils/utils"),o=t("./errors"),i=function(t){this.name=t.name,this.call=t.call,this.params=t.params||0,this.inputFormatter=t.inputFormatter,this.outputFormatter=t.outputFormatter,this.requestManager=null};i.prototype.setRequestManager=function(t){this.requestManager=t},i.prototype.getCall=function(t){return n.isFunction(this.call)?this.call(t):this.call},i.prototype.extractCallback=function(t){if(n.isFunction(t[t.length-1]))return t.pop()},i.prototype.validateArgs=function(t){if(t.length!==this.params)throw o.InvalidNumberOfRPCParams()},i.prototype.formatInput=function(r){return this.inputFormatter?this.inputFormatter.map(function(t,e){return t?t(r[e]):r[e]}):r},i.prototype.formatOutput=function(t){return this.outputFormatter&&t?this.outputFormatter(t):t},i.prototype.toPayload=function(t){var e=this.getCall(t),r=this.extractCallback(t),n=this.formatInput(t);return this.validateArgs(n),{method:e,params:n,callback:r}},i.prototype.attachToObject=function(t){var e=this.buildCall();e.call=this.call;var r=this.name.split(".");1<r.length?(t[r[0]]=t[r[0]]||{},t[r[0]][r[1]]=e):t[r[0]]=e},i.prototype.buildCall=function(){var n=this,t=function(){var r=n.toPayload(Array.prototype.slice.call(arguments));return r.callback?n.requestManager.sendAsync(r,function(t,e){r.callback(t,n.formatOutput(e))}):n.formatOutput(n.requestManager.send(r))};return t.request=this.request.bind(this),t},i.prototype.request=function(){var t=this.toPayload(Array.prototype.slice.call(arguments));return t.format=this.formatOutput.bind(this),t},e.exports=i},{"../utils/utils":21,"./errors":27}],38:[function(t,e,r){"use strict";var h=t("../formatters"),d=t("../../utils/utils"),m=t("../method"),n=t("../property"),o=t("../../utils/config"),i=t("../contract"),a=t("./watches"),s=t("../filter"),c=t("../syncing"),u=t("../namereg"),f=t("../iban"),l=t("../transfer"),y=function(t){return d.isString(t[0])&&0===t[0].indexOf("0x")?"core_getBlockByHash":"core_getBlockByNumber"},v=function(t){return d.isString(t[0])&&0===t[0].indexOf("0x")?"core_getTransactionByBlockHashAndIndex":"core_getTransactionByBlockNumberAndIndex"},g=function(t){return d.isString(t[0])&&0===t[0].indexOf("0x")?"core_getBlockTransactionCountByHash":"core_getBlockTransactionCountByNumber"};function p(t){this._requestManager=t._requestManager;var e=this;b().forEach(function(t){t.attachToObject(e),t.setRequestManager(e._requestManager)}),_().forEach(function(t){t.attachToObject(e),t.setRequestManager(e._requestManager)}),this.iban=f,this.sendIBANTransaction=l.bind(null,this)}Object.defineProperty(p.prototype,"defaultBlock",{get:function(){return o.defaultBlock},set:function(t){return o.defaultBlock=t}}),Object.defineProperty(p.prototype,"defaultAccount",{get:function(){return o.defaultAccount},set:function(t){return o.defaultAccount=t}});var b=function(){var t=new m({name:"getBalance",call:"core_getBalance",params:2,inputFormatter:[h.inputAddressFormatter,h.inputDefaultBlockNumberFormatter],outputFormatter:h.outputBigNumberFormatter}),e=new m({name:"getStorageAt",call:"core_getStorageAt",params:3,inputFormatter:[null,d.toHex,h.inputDefaultBlockNumberFormatter]}),r=new m({name:"getCode",call:"core_getCode",params:2,inputFormatter:[h.inputAddressFormatter,h.inputDefaultBlockNumberFormatter]}),n=new m({name:"getBlock",call:y,params:2,inputFormatter:[h.inputBlockNumberFormatter,function(t){return!!t}],outputFormatter:h.outputBlockFormatter}),o=new m({name:"getBlockTransactionCount",call:g,params:1,inputFormatter:[h.inputBlockNumberFormatter],outputFormatter:d.toDecimal}),i=new m({name:"getTransaction",call:"core_getTransactionByHash",params:1,outputFormatter:h.outputTransactionFormatter}),a=new m({name:"getTransactionFromBlock",call:v,params:2,inputFormatter:[h.inputBlockNumberFormatter,d.toHex],outputFormatter:h.outputTransactionFormatter}),s=new m({name:"getTransactionReceipt",call:"core_getTransactionReceipt",params:1,outputFormatter:h.outputTransactionReceiptFormatter}),c=new m({name:"getTransactionCount",call:"core_getTransactionCount",params:2,inputFormatter:[null,h.inputDefaultBlockNumberFormatter],outputFormatter:d.toDecimal}),u=new m({name:"sendRawTransaction",call:"core_sendRawTransaction",params:1,inputFormatter:[null]}),f=new m({name:"sendTransaction",call:"core_sendTransaction",params:1,inputFormatter:[h.inputTransactionFormatter]}),l=new m({name:"signTransaction",call:"core_signTransaction",params:1,inputFormatter:[h.inputTransactionFormatter]}),p=new m({name:"sign",call:"core_sign",params:2,inputFormatter:[h.inputAddressFormatter,null]});return[t,e,r,n,o,i,a,s,c,new m({name:"call",call:"core_call",params:2,inputFormatter:[h.inputCallFormatter,h.inputDefaultBlockNumberFormatter]}),new m({name:"estimateGas",call:"core_estimateGas",params:1,inputFormatter:[h.inputCallFormatter],outputFormatter:d.toDecimal}),u,l,f,p]},_=function(){return[new n({name:"coinbase",getter:"core_coinbase"}),new n({name:"producing",getter:"core_producing"}),new n({name:"syncing",getter:"core_syncing",outputFormatter:h.outputSyncingFormatter}),new n({name:"gasPrice",getter:"core_gasPrice",outputFormatter:h.outputBigNumberFormatter}),new n({name:"accounts",getter:"core_accounts"}),new n({name:"blockNumber",getter:"core_blockNumber",outputFormatter:d.toDecimal}),new n({name:"protocolVersion",getter:"core_protocolVersion"})]};p.prototype.contract=function(t){return new i(this,t)},p.prototype.filter=function(t,e,r){return new s(t,"vnt",this._requestManager,a.vnt(),h.outputLogFormatter,e,r)},p.prototype.namereg=function(){return this.contract(u.global.abi).at(u.global.address)},p.prototype.icapNamereg=function(){return this.contract(u.icap.abi).at(u.icap.address)},p.prototype.isSyncing=function(t){return new c(this._requestManager,t)},e.exports=p},{"../../utils/config":18,"../../utils/utils":21,"../contract":26,"../filter":30,"../formatters":31,"../iban":34,"../method":37,"../namereg":44,"../property":45,"../syncing":48,"../transfer":49,"./watches":43}],39:[function(t,e,r){var n=t("../../utils/utils"),o=t("../property"),i=function(){return[new o({name:"listening",getter:"net_listening"}),new o({name:"peerCount",getter:"net_peerCount",outputFormatter:n.toDecimal})]};e.exports=function(e){this._requestManager=e._requestManager;var r=this;i().forEach(function(t){t.attachToObject(r),t.setRequestManager(e._requestManager)})}},{"../../utils/utils":21,"../property":45}],40:[function(t,e,r){"use strict";var u=t("../method"),f=t("../property"),l=t("../formatters");e.exports=function(t){this._requestManager=t._requestManager;var e,r,n,o,i,a,s,c=this;(e=new u({name:"newAccount",call:"personal_newAccount",params:1,inputFormatter:[null]}),r=new u({name:"importRawKey",call:"personal_importRawKey",params:2}),n=new u({name:"sign",call:"personal_sign",params:3,inputFormatter:[null,l.inputAddressFormatter,null]}),o=new u({name:"ecRecover",call:"personal_ecRecover",params:2}),i=new u({name:"unlockAccount",call:"personal_unlockAccount",params:3,inputFormatter:[l.inputAddressFormatter,null,null]}),a=new u({name:"sendTransaction",call:"personal_sendTransaction",params:2,inputFormatter:[l.inputTransactionFormatter,null]}),s=new u({name:"lockAccount",call:"personal_lockAccount",params:1,inputFormatter:[l.inputAddressFormatter]}),[e,r,i,o,n,a,s]).forEach(function(t){t.attachToObject(c),t.setRequestManager(c._requestManager)}),[new f({name:"listAccounts",getter:"personal_listAccounts"})].forEach(function(t){t.attachToObject(c),t.setRequestManager(c._requestManager)})}},{"../formatters":31,"../method":37,"../property":45}],41:[function(t,e,r){var n=t("../method"),o=t("../filter"),i=t("./watches"),a=function(t){this._requestManager=t._requestManager;var e=this;s().forEach(function(t){t.attachToObject(e),t.setRequestManager(e._requestManager)})};a.prototype.newMessageFilter=function(t,e,r){return new o(t,"shh",this._requestManager,i.shh(),null,e,r)};var s=function(){return[new n({name:"version",call:"shh_version",params:0}),new n({name:"info",call:"shh_info",params:0}),new n({name:"setMaxMessageSize",call:"shh_setMaxMessageSize",params:1}),new n({name:"setMinPoW",call:"shh_setMinPoW",params:1}),new n({name:"markTrustedPeer",call:"shh_markTrustedPeer",params:1}),new n({name:"newKeyPair",call:"shh_newKeyPair",params:0}),new n({name:"addPrivateKey",call:"shh_addPrivateKey",params:1}),new n({name:"deleteKeyPair",call:"shh_deleteKeyPair",params:1}),new n({name:"hasKeyPair",call:"shh_hasKeyPair",params:1}),new n({name:"getPublicKey",call:"shh_getPublicKey",params:1}),new n({name:"getPrivateKey",call:"shh_getPrivateKey",params:1}),new n({name:"newSymKey",call:"shh_newSymKey",params:0}),new n({name:"addSymKey",call:"shh_addSymKey",params:1}),new n({name:"generateSymKeyFromPassword",call:"shh_generateSymKeyFromPassword",params:1}),new n({name:"hasSymKey",call:"shh_hasSymKey",params:1}),new n({name:"getSymKey",call:"shh_getSymKey",params:1}),new n({name:"deleteSymKey",call:"shh_deleteSymKey",params:1}),new n({name:"post",call:"shh_post",params:1,inputFormatter:[null]})]};e.exports=a},{"../filter":30,"../method":37,"./watches":43}],42:[function(t,e,r){"use strict";var p=t("../method"),h=t("../property");e.exports=function(t){this._requestManager=t._requestManager;var e,r,n,o,i,a,s,c,u,f,l=this;(e=new p({name:"blockNetworkRead",call:"bzz_blockNetworkRead",params:1,inputFormatter:[null]}),r=new p({name:"syncEnabled",call:"bzz_syncEnabled",params:1,inputFormatter:[null]}),n=new p({name:"swapEnabled",call:"bzz_swapEnabled",params:1,inputFormatter:[null]}),o=new p({name:"download",call:"bzz_download",params:2,inputFormatter:[null,null]}),i=new p({name:"upload",call:"bzz_upload",params:2,inputFormatter:[null,null]}),a=new p({name:"retrieve",call:"bzz_retrieve",params:1,inputFormatter:[null]}),s=new p({name:"store",call:"bzz_store",params:2,inputFormatter:[null,null]}),c=new p({name:"get",call:"bzz_get",params:1,inputFormatter:[null]}),u=new p({name:"put",call:"bzz_put",params:2,inputFormatter:[null,null]}),f=new p({name:"modify",call:"bzz_modify",params:4,inputFormatter:[null,null,null,null]}),[e,r,n,o,i,a,s,c,u,f]).forEach(function(t){t.attachToObject(l),t.setRequestManager(l._requestManager)}),[new h({name:"hive",getter:"bzz_hive"}),new h({name:"info",getter:"bzz_info"})].forEach(function(t){t.attachToObject(l),t.setRequestManager(l._requestManager)})}},{"../method":37,"../property":45}],43:[function(t,e,r){var n=t("../method");e.exports={vnt:function(){return[new n({name:"newFilter",call:function(t){switch(t[0]){case"latest":return t.shift(),this.params=0,"core_newBlockFilter";case"pending":return t.shift(),this.params=0,"core_newPendingTransactionFilter";default:return"core_newFilter"}},params:1}),new n({name:"uninstallFilter",call:"core_uninstallFilter",params:1}),new n({name:"getLogs",call:"core_getFilterLogs",params:1}),new n({name:"poll",call:"core_getFilterChanges",params:1})]},shh:function(){return[new n({name:"newFilter",call:"shh_newMessageFilter",params:1}),new n({name:"uninstallFilter",call:"shh_deleteMessageFilter",params:1}),new n({name:"getLogs",call:"shh_getFilterMessages",params:1}),new n({name:"poll",call:"shh_getFilterMessages",params:1})]}}},{"../method":37}],44:[function(t,e,r){var n=t("../contracts/GlobalRegistrar.json"),o=t("../contracts/ICAPRegistrar.json");e.exports={global:{abi:n,address:"0xc6d9d2cd449a754c494264e1809c50e34d64562b"},icap:{abi:o,address:"0xa1a111bc074c9cfa781f0c38e63bd51c91b8af00"}}},{"../contracts/GlobalRegistrar.json":1,"../contracts/ICAPRegistrar.json":2}],45:[function(t,e,r){var n=t("../utils/utils"),o=function(t){this.name=t.name,this.getter=t.getter,this.setter=t.setter,this.outputFormatter=t.outputFormatter,this.inputFormatter=t.inputFormatter,this.requestManager=null};o.prototype.setRequestManager=function(t){this.requestManager=t},o.prototype.formatInput=function(t){return this.inputFormatter?this.inputFormatter(t):t},o.prototype.formatOutput=function(t){return this.outputFormatter&&null!=t?this.outputFormatter(t):t},o.prototype.extractCallback=function(t){if(n.isFunction(t[t.length-1]))return t.pop()},o.prototype.attachToObject=function(t){var e={get:this.buildGet(),enumerable:!0},r=this.name.split("."),n=r[0];1<r.length&&(t[r[0]]=t[r[0]]||{},t=t[r[0]],n=r[1]),Object.defineProperty(t,n,e),t[i(n)]=this.buildAsyncGet()};var i=function(t){return"get"+t.charAt(0).toUpperCase()+t.slice(1)};o.prototype.buildGet=function(){var t=this;return function(){return t.formatOutput(t.requestManager.send({method:t.getter}))}},o.prototype.buildAsyncGet=function(){var n=this,t=function(r){n.requestManager.sendAsync({method:n.getter},function(t,e){r(t,n.formatOutput(e))})};return t.request=this.request.bind(this),t},o.prototype.request=function(){var t={method:this.getter,params:[],callback:this.extractCallback(Array.prototype.slice.call(arguments))};return t.format=this.formatOutput.bind(this),t},e.exports=o},{"../utils/utils":21}],46:[function(t,e,r){var a=t("./jsonrpc"),s=t("../utils/utils"),c=t("../utils/config"),u=t("./errors"),n=function(t){this.provider=t,this.polls={},this.timeout=null};n.prototype.send=function(t){if(!this.provider)return console.error(u.InvalidProvider()),null;var e=a.toPayload(t.method,t.params),r=this.provider.send(e);if(!a.isValidResponse(r))throw u.InvalidResponse(r);return r.result},n.prototype.sendAsync=function(t,r){if(!this.provider)return r(u.InvalidProvider());var e=a.toPayload(t.method,t.params);this.provider.sendAsync(e,function(t,e){return t?r(t):a.isValidResponse(e)?void r(null,e.result):r(u.InvalidResponse(e))})},n.prototype.sendBatch=function(t,r){if(!this.provider)return r(u.InvalidProvider());var e=a.toBatchPayload(t);this.provider.sendAsync(e,function(t,e){return t?r(t):s.isArray(e)?void r(t,e):r(u.InvalidResponse(e))})},n.prototype.setProvider=function(t){this.provider=t},n.prototype.startPolling=function(t,e,r,n){this.polls[e]={data:t,id:e,callback:r,uninstall:n},this.timeout||this.poll()},n.prototype.stopPolling=function(t){delete this.polls[t],0===Object.keys(this.polls).length&&this.timeout&&(clearTimeout(this.timeout),this.timeout=null)},n.prototype.reset=function(t){for(var e in this.polls)t&&-1!==e.indexOf("syncPoll_")||(this.polls[e].uninstall(),delete this.polls[e]);0===Object.keys(this.polls).length&&this.timeout&&(clearTimeout(this.timeout),this.timeout=null)},n.prototype.poll=function(){if(this.timeout=setTimeout(this.poll.bind(this),c.VNT_POLLING_TIMEOUT),0!==Object.keys(this.polls).length)if(this.provider){var t=[],r=[];for(var e in this.polls)t.push(this.polls[e].data),r.push(e);if(0!==t.length){var n=a.toBatchPayload(t),o={};n.forEach(function(t,e){o[t.id]=r[e]});var i=this;this.provider.sendAsync(n,function(t,e){if(!t){if(!s.isArray(e))throw u.InvalidResponse(e);e.map(function(t){var e=o[t.id];return!!i.polls[e]&&(t.callback=i.polls[e].callback,t)}).filter(function(t){return!!t}).filter(function(t){var e=a.isValidResponse(t);return e||t.callback(u.InvalidResponse(t)),e}).forEach(function(t){t.callback(null,t.result)})}})}}else console.error(u.InvalidProvider())},e.exports=n},{"../utils/config":18,"../utils/utils":21,"./errors":27,"./jsonrpc":36}],47:[function(t,e,r){e.exports=function(){this.defaultBlock="latest",this.defaultAccount=void 0}},{}],48:[function(t,e,r){var o=t("./formatters"),i=t("../utils/utils"),a=1,n=function(t,e){var n;return this.requestManager=t,this.pollId="syncPoll_"+a++,this.callbacks=[],this.addCallback(e),this.lastSyncState=!1,(n=this).requestManager.startPolling({method:"core_syncing",params:[]},n.pollId,function(e,r){if(e)return n.callbacks.forEach(function(t){t(e)});i.isObject(r)&&r.startingBlock&&(r=o.outputSyncingFormatter(r)),n.callbacks.forEach(function(t){n.lastSyncState!==r&&(!n.lastSyncState&&i.isObject(r)&&t(null,!0),setTimeout(function(){t(null,r)},0),n.lastSyncState=r)})},n.stopWatching.bind(n)),this};n.prototype.addCallback=function(t){return t&&this.callbacks.push(t),this},n.prototype.stopWatching=function(){this.requestManager.stopPolling(this.pollId),this.callbacks=[]},e.exports=n},{"../utils/utils":21,"./formatters":31}],49:[function(t,e,r){var s=t("./iban"),c=t("../contracts/SmartExchange.json"),u=function(t,e,r,n,o){return t.sendTransaction({to:r,from:e,value:n},o)},f=function(t,e,r,n,o,i){var a=c;return t.contract(a).at(r).deposit(o,{from:e,value:n},i)};e.exports=function(r,n,t,o,i){var a=new s(t);if(!a.isValid())throw new Error("invalid iban address");if(a.isDirect())return u(r,n,a.address(),o,i);if(!i){var e=r.icapNamereg().addr(a.institution());return f(r,n,e,o,a.client())}r.icapNamereg().addr(a.institution(),function(t,e){return f(r,n,e,o,a.client(),i)})}},{"../contracts/SmartExchange.json":3,"./iban":34}],50:[function(t,e,r){},{}],51:[function(t,e,r){var n,o;n=this,o=function(o){return function(){var t=o,e=t.lib.BlockCipher,r=t.algo,u=[],f=[],l=[],p=[],h=[],d=[],m=[],y=[],v=[],g=[];!function(){for(var t=[],e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;var r=0,n=0;for(e=0;e<256;e++){var o=n^n<<1^n<<2^n<<3^n<<4;o=o>>>8^255&o^99,u[r]=o;var i=t[f[o]=r],a=t[i],s=t[a],c=257*t[o]^16843008*o;l[r]=c<<24|c>>>8,p[r]=c<<16|c>>>16,h[r]=c<<8|c>>>24,d[r]=c;c=16843009*s^65537*a^257*i^16843008*r;m[o]=c<<24|c>>>8,y[o]=c<<16|c>>>16,v[o]=c<<8|c>>>24,g[o]=c,r?(r=i^t[t[t[s^i]]],n^=t[t[n]]):r=n=1}}();var b=[0,1,2,4,8,16,32,64,128,27,54],n=r.AES=e.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes/4,n=4*((this._nRounds=r+6)+1),o=this._keySchedule=[],i=0;i<n;i++)if(i<r)o[i]=e[i];else{var a=o[i-1];i%r?6<r&&i%r==4&&(a=u[a>>>24]<<24|u[a>>>16&255]<<16|u[a>>>8&255]<<8|u[255&a]):(a=u[(a=a<<8|a>>>24)>>>24]<<24|u[a>>>16&255]<<16|u[a>>>8&255]<<8|u[255&a],a^=b[i/r|0]<<24),o[i]=o[i-r]^a}for(var s=this._invKeySchedule=[],c=0;c<n;c++){i=n-c;if(c%4)a=o[i];else a=o[i-4];s[c]=c<4||i<=4?a:m[u[a>>>24]]^y[u[a>>>16&255]]^v[u[a>>>8&255]]^g[u[255&a]]}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,l,p,h,d,u)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,m,y,v,g,f);r=t[e+1];t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,n,o,i,a,s){for(var c=this._nRounds,u=t[e]^r[0],f=t[e+1]^r[1],l=t[e+2]^r[2],p=t[e+3]^r[3],h=4,d=1;d<c;d++){var m=n[u>>>24]^o[f>>>16&255]^i[l>>>8&255]^a[255&p]^r[h++],y=n[f>>>24]^o[l>>>16&255]^i[p>>>8&255]^a[255&u]^r[h++],v=n[l>>>24]^o[p>>>16&255]^i[u>>>8&255]^a[255&f]^r[h++],g=n[p>>>24]^o[u>>>16&255]^i[f>>>8&255]^a[255&l]^r[h++];u=m,f=y,l=v,p=g}m=(s[u>>>24]<<24|s[f>>>16&255]<<16|s[l>>>8&255]<<8|s[255&p])^r[h++],y=(s[f>>>24]<<24|s[l>>>16&255]<<16|s[p>>>8&255]<<8|s[255&u])^r[h++],v=(s[l>>>24]<<24|s[p>>>16&255]<<16|s[u>>>8&255]<<8|s[255&f])^r[h++],g=(s[p>>>24]<<24|s[u>>>16&255]<<16|s[f>>>8&255]<<8|s[255&l])^r[h++];t[e]=m,t[e+1]=y,t[e+2]=v,t[e+3]=g},keySize:8});t.AES=e._createHelper(n)}(),o.AES},"object"==typeof r?e.exports=r=o(t("./core"),t("./enc-base64"),t("./md5"),t("./evpkdf"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53,"./enc-base64":54,"./evpkdf":56,"./md5":61}],52:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,c,o,i,a,s,u,f,l,p,h,d,m,y,v,g;t.lib.Cipher||(r=(e=t).lib,n=r.Base,c=r.WordArray,o=r.BufferedBlockAlgorithm,(i=e.enc).Utf8,a=i.Base64,s=e.algo.EvpKDF,u=r.Cipher=o.extend({cfg:n.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(){function o(t){return"string"==typeof t?g:y}return function(n){return{encrypt:function(t,e,r){return o(e).encrypt(n,t,e,r)},decrypt:function(t,e,r){return o(e).decrypt(n,t,e,r)}}}}()}),r.StreamCipher=u.extend({_doFinalize:function(){return this._process(!0)},blockSize:1}),f=e.mode={},l=r.BlockCipherMode=n.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),p=f.CBC=function(){var t=l.extend();function i(t,e,r){var n=this._iv;if(n){var o=n;this._iv=void 0}else o=this._prevBlock;for(var i=0;i<r;i++)t[e+i]^=o[i]}return t.Encryptor=t.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize;i.call(this,t,e,n),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+n)}}),t.Decryptor=t.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize,o=t.slice(e,e+n);r.decryptBlock(t,e),i.call(this,t,e,n),this._prevBlock=o}}),t}(),h=(e.pad={}).Pkcs7={pad:function(t,e){for(var r=4*e,n=r-t.sigBytes%r,o=n<<24|n<<16|n<<8|n,i=[],a=0;a<n;a+=4)i.push(o);var s=c.create(i,n);t.concat(s)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},r.BlockCipher=u.extend({cfg:u.cfg.extend({mode:p,padding:h}),reset:function(){u.reset.call(this);var t=this.cfg,e=t.iv,r=t.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=r.createEncryptor;else{n=r.createDecryptor;this._minBufferSize=1}this._mode=n.call(r,this,e&&e.words)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){t.pad(this._data,this.blockSize);var e=this._process(!0)}else{e=this._process(!0);t.unpad(e)}return e},blockSize:4}),d=r.CipherParams=n.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}}),m=(e.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext,r=t.salt;if(r)var n=c.create([1398893684,1701076831]).concat(r).concat(e);else n=e;return n.toString(a)},parse:function(t){var e=a.parse(t),r=e.words;if(1398893684==r[0]&&1701076831==r[1]){var n=c.create(r.slice(2,4));r.splice(0,4),e.sigBytes-=16}return d.create({ciphertext:e,salt:n})}},y=r.SerializableCipher=n.extend({cfg:n.extend({format:m}),encrypt:function(t,e,r,n){n=this.cfg.extend(n);var o=t.createEncryptor(r,n),i=o.finalize(e),a=o.cfg;return d.create({ciphertext:i,key:r,iv:a.iv,algorithm:t,mode:a.mode,padding:a.padding,blockSize:t.blockSize,formatter:n.format})},decrypt:function(t,e,r,n){return n=this.cfg.extend(n),e=this._parse(e,n.format),t.createDecryptor(r,n).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),v=(e.kdf={}).OpenSSL={execute:function(t,e,r,n){n||(n=c.random(8));var o=s.create({keySize:e+r}).compute(t,n),i=c.create(o.words.slice(e),4*r);return o.sigBytes=4*e,d.create({key:o,iv:i,salt:n})}},g=r.PasswordBasedCipher=y.extend({cfg:y.cfg.extend({kdf:v}),encrypt:function(t,e,r,n){var o=(n=this.cfg.extend(n)).kdf.execute(r,t.keySize,t.ivSize);n.iv=o.iv;var i=y.encrypt.call(this,t,e,o.key,n);return i.mixIn(o),i},decrypt:function(t,e,r,n){n=this.cfg.extend(n),e=this._parse(e,n.format);var o=n.kdf.execute(r,t.keySize,t.ivSize,e.salt);return n.iv=o.iv,y.decrypt.call(this,t,e,o.key,n)}}))},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],53:[function(t,e,r){var n,o;n=this,o=function(){var f,t,e,r,l,n,o,i,a,s,c,u=u||(f=Math,e=(t={}).lib={},r=e.Base=function(){function r(){}return{extend:function(t){r.prototype=this;var e=new r;return t&&e.mixIn(t),e.hasOwnProperty("init")||(e.init=function(){e.$super.init.apply(this,arguments)}),(e.init.prototype=e).$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),l=e.WordArray=r.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||o).stringify(this)},concat:function(t){var e=this.words,r=t.words,n=this.sigBytes,o=t.sigBytes;if(this.clamp(),n%4)for(var i=0;i<o;i++){var a=r[i>>>2]>>>24-i%4*8&255;e[n+i>>>2]|=a<<24-(n+i)%4*8}else if(65535<r.length)for(i=0;i<o;i+=4)e[n+i>>>2]=r[i>>>2];else e.push.apply(e,r);return this.sigBytes+=o,this},clamp:function(){var t=this.words,e=this.sigBytes;t[e>>>2]&=4294967295<<32-e%4*8,t.length=f.ceil(e/4)},clone:function(){var t=r.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e,r=[],n=function(e){e=e;var r=987654321,n=4294967295;return function(){var t=((r=36969*(65535&r)+(r>>16)&n)<<16)+(e=18e3*(65535&e)+(e>>16)&n)&n;return t/=4294967296,(t+=.5)*(.5<f.random()?1:-1)}},o=0;o<t;o+=4){var i=n(4294967296*(e||f.random()));e=987654071*i(),r.push(4294967296*i()|0)}return new l.init(r,t)}}),n=t.enc={},o=n.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o++){var i=e[o>>>2]>>>24-o%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n+=2)r[n>>>3]|=parseInt(t.substr(n,2),16)<<24-n%8*4;return new l.init(r,e/2)}},i=n.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o++){var i=e[o>>>2]>>>24-o%4*8&255;n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n++)r[n>>>2]|=(255&t.charCodeAt(n))<<24-n%4*8;return new l.init(r,e)}},a=n.Utf8={stringify:function(t){try{return decodeURIComponent(escape(i.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return i.parse(unescape(encodeURIComponent(t)))}},s=e.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new l.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=a.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(t){var e=this._data,r=e.words,n=e.sigBytes,o=this.blockSize,i=n/(4*o),a=(i=t?f.ceil(i):f.max((0|i)-this._minBufferSize,0))*o,s=f.min(4*a,n);if(a){for(var c=0;c<a;c+=o)this._doProcessBlock(r,c);var u=r.splice(0,a);e.sigBytes-=s}return new l.init(u,s)},clone:function(){var t=r.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),e.Hasher=s.extend({cfg:r.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){s.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(r){return function(t,e){return new r.init(e).finalize(t)}},_createHmacHelper:function(r){return function(t,e){return new c.HMAC.init(r,e).finalize(t)}}}),c=t.algo={},t);return u},"object"==typeof r?e.exports=r=o():"function"==typeof define&&define.amd?define([],o):n.CryptoJS=o()},{}],54:[function(t,e,r){var n,o;n=this,o=function(t){var e,f;return f=(e=t).lib.WordArray,e.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,n=this._map;t.clamp();for(var o=[],i=0;i<r;i+=3)for(var a=(e[i>>>2]>>>24-i%4*8&255)<<16|(e[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|e[i+2>>>2]>>>24-(i+2)%4*8&255,s=0;s<4&&i+.75*s<r;s++)o.push(n.charAt(a>>>6*(3-s)&63));var c=n.charAt(64);if(c)for(;o.length%4;)o.push(c);return o.join("")},parse:function(t){var e=t.length,r=this._map,n=r.charAt(64);if(n){var o=t.indexOf(n);-1!=o&&(e=o)}for(var i=[],a=0,s=0;s<e;s++)if(s%4){var c=r.indexOf(t.charAt(s-1))<<s%4*2,u=r.indexOf(t.charAt(s))>>>6-s%4*2;i[a>>>2]|=(c|u)<<24-a%4*8,a++}return f.create(i,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},t.enc.Base64},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],55:[function(t,e,r){var n,o;n=this,o=function(r){return function(){var t=r,o=t.lib.WordArray,e=t.enc;e.Utf16=e.Utf16BE={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o+=2){var i=e[o>>>2]>>>16-o%4*8&65535;n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n++)r[n>>>1]|=t.charCodeAt(n)<<16-n%2*16;return o.create(r,2*e)}};function a(t){return t<<8&4278255360|t>>>8&16711935}e.Utf16LE={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o+=2){var i=a(e[o>>>2]>>>16-o%4*8&65535);n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n++)r[n>>>1]|=a(t.charCodeAt(n)<<16-n%2*16);return o.create(r,2*e)}}}(),r.enc.Utf16},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],56:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,f,o,i,a;return r=(e=t).lib,n=r.Base,f=r.WordArray,o=e.algo,i=o.MD5,a=o.EvpKDF=n.extend({cfg:n.extend({keySize:4,hasher:i,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,n=r.hasher.create(),o=f.create(),i=o.words,a=r.keySize,s=r.iterations;i.length<a;){c&&n.update(c);var c=n.update(t).finalize(e);n.reset();for(var u=1;u<s;u++)c=n.finalize(c),n.reset();o.concat(c)}return o.sigBytes=4*a,o}}),e.EvpKDF=function(t,e,r){return a.create(r).compute(t,e)},t.EvpKDF},"object"==typeof r?e.exports=r=o(t("./core"),t("./sha1"),t("./hmac")):"function"==typeof define&&define.amd?define(["./core","./sha1","./hmac"],o):o(n.CryptoJS)},{"./core":53,"./hmac":58,"./sha1":77}],57:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n;return r=(e=t).lib.CipherParams,n=e.enc.Hex,e.format.Hex={stringify:function(t){return t.ciphertext.toString(n)},parse:function(t){var e=n.parse(t);return r.create({ciphertext:e})}},t.format.Hex},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],58:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,u;r=(e=t).lib.Base,u=e.enc.Utf8,e.algo.HMAC=r.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=u.parse(e));var r=t.blockSize,n=4*r;e.sigBytes>n&&(e=t.finalize(e)),e.clamp();for(var o=this._oKey=e.clone(),i=this._iKey=e.clone(),a=o.words,s=i.words,c=0;c<r;c++)a[c]^=1549556828,s[c]^=909522486;o.sigBytes=i.sigBytes=n,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,r=e.finalize(t);return e.reset(),e.finalize(this._oKey.clone().concat(r))}})},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],59:[function(t,e,r){var n,o;n=this,o=function(t){return t},"object"==typeof r?e.exports=r=o(t("./core"),t("./x64-core"),t("./lib-typedarrays"),t("./enc-utf16"),t("./enc-base64"),t("./md5"),t("./sha1"),t("./sha256"),t("./sha224"),t("./sha512"),t("./sha384"),t("./sha3"),t("./ripemd160"),t("./hmac"),t("./pbkdf2"),t("./evpkdf"),t("./cipher-core"),t("./mode-cfb"),t("./mode-ctr"),t("./mode-ctr-gladman"),t("./mode-ofb"),t("./mode-ecb"),t("./pad-ansix923"),t("./pad-iso10126"),t("./pad-iso97971"),t("./pad-zeropadding"),t("./pad-nopadding"),t("./format-hex"),t("./aes"),t("./tripledes"),t("./rc4"),t("./rabbit"),t("./rabbit-legacy")):"function"==typeof define&&define.amd?define(["./core","./x64-core","./lib-typedarrays","./enc-utf16","./enc-base64","./md5","./sha1","./sha256","./sha224","./sha512","./sha384","./sha3","./ripemd160","./hmac","./pbkdf2","./evpkdf","./cipher-core","./mode-cfb","./mode-ctr","./mode-ctr-gladman","./mode-ofb","./mode-ecb","./pad-ansix923","./pad-iso10126","./pad-iso97971","./pad-zeropadding","./pad-nopadding","./format-hex","./aes","./tripledes","./rc4","./rabbit","./rabbit-legacy"],o):n.CryptoJS=o(n.CryptoJS)},{"./aes":51,"./cipher-core":52,"./core":53,"./enc-base64":54,"./enc-utf16":55,"./evpkdf":56,"./format-hex":57,"./hmac":58,"./lib-typedarrays":60,"./md5":61,"./mode-cfb":62,"./mode-ctr":64,"./mode-ctr-gladman":63,"./mode-ecb":65,"./mode-ofb":66,"./pad-ansix923":67,"./pad-iso10126":68,"./pad-iso97971":69,"./pad-nopadding":70,"./pad-zeropadding":71,"./pbkdf2":72,"./rabbit":74,"./rabbit-legacy":73,"./rc4":75,"./ripemd160":76,"./sha1":77,"./sha224":78,"./sha256":79,"./sha3":80,"./sha384":81,"./sha512":82,"./tripledes":83,"./x64-core":84}],60:[function(t,e,r){var n,o;n=this,o=function(e){return function(){if("function"==typeof ArrayBuffer){var t=e.lib.WordArray,o=t.init;(t.init=function(t){if(t instanceof ArrayBuffer&&(t=new Uint8Array(t)),(t instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array)&&(t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),t instanceof Uint8Array){for(var e=t.byteLength,r=[],n=0;n<e;n++)r[n>>>2]|=t[n]<<24-n%4*8;o.call(this,r,e)}else o.apply(this,arguments)}).prototype=t}}(),e.lib.WordArray},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],61:[function(t,e,r){var n,o;n=this,o=function(a){return function(f){var t=a,e=t.lib,r=e.WordArray,n=e.Hasher,o=t.algo,A=[];!function(){for(var t=0;t<64;t++)A[t]=4294967296*f.abs(f.sin(t+1))|0}();var i=o.MD5=n.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var n=e+r,o=t[n];t[n]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8)}var i=this._hash.words,a=t[e+0],s=t[e+1],c=t[e+2],u=t[e+3],f=t[e+4],l=t[e+5],p=t[e+6],h=t[e+7],d=t[e+8],m=t[e+9],y=t[e+10],v=t[e+11],g=t[e+12],b=t[e+13],_=t[e+14],w=t[e+15],x=i[0],k=i[1],B=i[2],S=i[3];k=N(k=N(k=N(k=N(k=I(k=I(k=I(k=I(k=F(k=F(k=F(k=F(k=C(k=C(k=C(k=C(k,B=C(B,S=C(S,x=C(x,k,B,S,a,7,A[0]),k,B,s,12,A[1]),x,k,c,17,A[2]),S,x,u,22,A[3]),B=C(B,S=C(S,x=C(x,k,B,S,f,7,A[4]),k,B,l,12,A[5]),x,k,p,17,A[6]),S,x,h,22,A[7]),B=C(B,S=C(S,x=C(x,k,B,S,d,7,A[8]),k,B,m,12,A[9]),x,k,y,17,A[10]),S,x,v,22,A[11]),B=C(B,S=C(S,x=C(x,k,B,S,g,7,A[12]),k,B,b,12,A[13]),x,k,_,17,A[14]),S,x,w,22,A[15]),B=F(B,S=F(S,x=F(x,k,B,S,s,5,A[16]),k,B,p,9,A[17]),x,k,v,14,A[18]),S,x,a,20,A[19]),B=F(B,S=F(S,x=F(x,k,B,S,l,5,A[20]),k,B,y,9,A[21]),x,k,w,14,A[22]),S,x,f,20,A[23]),B=F(B,S=F(S,x=F(x,k,B,S,m,5,A[24]),k,B,_,9,A[25]),x,k,u,14,A[26]),S,x,d,20,A[27]),B=F(B,S=F(S,x=F(x,k,B,S,b,5,A[28]),k,B,c,9,A[29]),x,k,h,14,A[30]),S,x,g,20,A[31]),B=I(B,S=I(S,x=I(x,k,B,S,l,4,A[32]),k,B,d,11,A[33]),x,k,v,16,A[34]),S,x,_,23,A[35]),B=I(B,S=I(S,x=I(x,k,B,S,s,4,A[36]),k,B,f,11,A[37]),x,k,h,16,A[38]),S,x,y,23,A[39]),B=I(B,S=I(S,x=I(x,k,B,S,b,4,A[40]),k,B,a,11,A[41]),x,k,u,16,A[42]),S,x,p,23,A[43]),B=I(B,S=I(S,x=I(x,k,B,S,m,4,A[44]),k,B,g,11,A[45]),x,k,w,16,A[46]),S,x,c,23,A[47]),B=N(B,S=N(S,x=N(x,k,B,S,a,6,A[48]),k,B,h,10,A[49]),x,k,_,15,A[50]),S,x,l,21,A[51]),B=N(B,S=N(S,x=N(x,k,B,S,g,6,A[52]),k,B,u,10,A[53]),x,k,y,15,A[54]),S,x,s,21,A[55]),B=N(B,S=N(S,x=N(x,k,B,S,d,6,A[56]),k,B,w,10,A[57]),x,k,p,15,A[58]),S,x,b,21,A[59]),B=N(B,S=N(S,x=N(x,k,B,S,f,6,A[60]),k,B,v,10,A[61]),x,k,c,15,A[62]),S,x,m,21,A[63]),i[0]=i[0]+x|0,i[1]=i[1]+k|0,i[2]=i[2]+B|0,i[3]=i[3]+S|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;e[n>>>5]|=128<<24-n%32;var o=f.floor(r/4294967296),i=r;e[15+(n+64>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),e[14+(n+64>>>9<<4)]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8),t.sigBytes=4*(e.length+1),this._process();for(var a=this._hash,s=a.words,c=0;c<4;c++){var u=s[c];s[c]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8)}return a},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});function C(t,e,r,n,o,i,a){var s=t+(e&r|~e&n)+o+a;return(s<<i|s>>>32-i)+e}function F(t,e,r,n,o,i,a){var s=t+(e&n|r&~n)+o+a;return(s<<i|s>>>32-i)+e}function I(t,e,r,n,o,i,a){var s=t+(e^r^n)+o+a;return(s<<i|s>>>32-i)+e}function N(t,e,r,n,o,i,a){var s=t+(r^(e|~n))+o+a;return(s<<i|s>>>32-i)+e}t.MD5=n._createHelper(i),t.HmacMD5=n._createHmacHelper(i)}(Math),a.MD5},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],62:[function(t,e,r){var n,o;n=this,o=function(e){return e.mode.CFB=function(){var t=e.lib.BlockCipherMode.extend();function i(t,e,r,n){var o=this._iv;if(o){var i=o.slice(0);this._iv=void 0}else i=this._prevBlock;n.encryptBlock(i,0);for(var a=0;a<r;a++)t[e+a]^=i[a]}return t.Encryptor=t.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize;i.call(this,t,e,n,r),this._prevBlock=t.slice(e,e+n)}}),t.Decryptor=t.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize,o=t.slice(e,e+n);i.call(this,t,e,n,r),this._prevBlock=o}}),t}(),e.mode.CFB},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],63:[function(t,e,r){var n,o;n=this,o=function(r){return r.mode.CTRGladman=function(){var t=r.lib.BlockCipherMode.extend();function u(t){if(255==(t>>24&255)){var e=t>>16&255,r=t>>8&255,n=255&t;255===e?(e=0,255===r?(r=0,255===n?n=0:++n):++r):++e,t=0,t+=e<<16,t+=r<<8,t+=n}else t+=1<<24;return t}var e=t.Encryptor=t.extend({processBlock:function(t,e){var r,n=this._cipher,o=n.blockSize,i=this._iv,a=this._counter;i&&(a=this._counter=i.slice(0),this._iv=void 0),0===((r=a)[0]=u(r[0]))&&(r[1]=u(r[1]));var s=a.slice(0);n.encryptBlock(s,0);for(var c=0;c<o;c++)t[e+c]^=s[c]}});return t.Decryptor=e,t}(),r.mode.CTRGladman},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],64:[function(t,e,r){var n,o;n=this,o=function(t){var e,r;return t.mode.CTR=(e=t.lib.BlockCipherMode.extend(),r=e.Encryptor=e.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize,o=this._iv,i=this._counter;o&&(i=this._counter=o.slice(0),this._iv=void 0);var a=i.slice(0);r.encryptBlock(a,0),i[n-1]=i[n-1]+1|0;for(var s=0;s<n;s++)t[e+s]^=a[s]}}),e.Decryptor=r,e),t.mode.CTR},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],65:[function(t,e,r){var n,o;n=this,o=function(t){var e;return t.mode.ECB=((e=t.lib.BlockCipherMode.extend()).Encryptor=e.extend({processBlock:function(t,e){this._cipher.encryptBlock(t,e)}}),e.Decryptor=e.extend({processBlock:function(t,e){this._cipher.decryptBlock(t,e)}}),e),t.mode.ECB},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],66:[function(t,e,r){var n,o;n=this,o=function(t){var e,r;return t.mode.OFB=(e=t.lib.BlockCipherMode.extend(),r=e.Encryptor=e.extend({processBlock:function(t,e){var r=this._cipher,n=r.blockSize,o=this._iv,i=this._keystream;o&&(i=this._keystream=o.slice(0),this._iv=void 0),r.encryptBlock(i,0);for(var a=0;a<n;a++)t[e+a]^=i[a]}}),e.Decryptor=r,e),t.mode.OFB},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],67:[function(t,e,r){var n,o;n=this,o=function(t){return t.pad.AnsiX923={pad:function(t,e){var r=t.sigBytes,n=4*e,o=n-r%n,i=r+o-1;t.clamp(),t.words[i>>>2]|=o<<24-i%4*8,t.sigBytes+=o},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},t.pad.Ansix923},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],68:[function(t,e,r){var n,o;n=this,o=function(o){return o.pad.Iso10126={pad:function(t,e){var r=4*e,n=r-t.sigBytes%r;t.concat(o.lib.WordArray.random(n-1)).concat(o.lib.WordArray.create([n<<24],1))},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},o.pad.Iso10126},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],69:[function(t,e,r){var n,o;n=this,o=function(r){return r.pad.Iso97971={pad:function(t,e){t.concat(r.lib.WordArray.create([2147483648],1)),r.pad.ZeroPadding.pad(t,e)},unpad:function(t){r.pad.ZeroPadding.unpad(t),t.sigBytes--}},r.pad.Iso97971},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],70:[function(t,e,r){var n,o;n=this,o=function(t){return t.pad.NoPadding={pad:function(){},unpad:function(){}},t.pad.NoPadding},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],71:[function(t,e,r){var n,o;n=this,o=function(t){return t.pad.ZeroPadding={pad:function(t,e){var r=4*e;t.clamp(),t.sigBytes+=r-(t.sigBytes%r||r)},unpad:function(t){for(var e=t.words,r=t.sigBytes-1;!(e[r>>>2]>>>24-r%4*8&255);)r--;t.sigBytes=r+1}},t.pad.ZeroPadding},"object"==typeof r?e.exports=r=o(t("./core"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53}],72:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,v,o,i,g,a;return r=(e=t).lib,n=r.Base,v=r.WordArray,o=e.algo,i=o.SHA1,g=o.HMAC,a=o.PBKDF2=n.extend({cfg:n.extend({keySize:4,hasher:i,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,n=g.create(r.hasher,t),o=v.create(),i=v.create([1]),a=o.words,s=i.words,c=r.keySize,u=r.iterations;a.length<c;){var f=n.update(e).finalize(i);n.reset();for(var l=f.words,p=l.length,h=f,d=1;d<u;d++){h=n.finalize(h),n.reset();for(var m=h.words,y=0;y<p;y++)l[y]^=m[y]}o.concat(f),s[0]++}return o.sigBytes=4*c,o}}),e.PBKDF2=function(t,e,r){return a.create(r).compute(t,e)},t.PBKDF2},"object"==typeof r?e.exports=r=o(t("./core"),t("./sha1"),t("./hmac")):"function"==typeof define&&define.amd?define(["./core","./sha1","./hmac"],o):o(n.CryptoJS)},{"./core":53,"./hmac":58,"./sha1":77}],73:[function(t,e,r){var n,o;n=this,o=function(i){return function(){var t=i,e=t.lib.StreamCipher,r=t.algo,o=[],c=[],u=[],n=r.RabbitLegacy=e.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],n=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],o=this._b=0;o<4;o++)p.call(this);for(o=0;o<8;o++)n[o]^=r[o+4&7];if(e){var i=e.words,a=i[0],s=i[1],c=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),u=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),f=c>>>16|4294901760&u,l=u<<16|65535&c;n[0]^=c,n[1]^=f,n[2]^=u,n[3]^=l,n[4]^=c,n[5]^=f,n[6]^=u,n[7]^=l;for(o=0;o<4;o++)p.call(this)}},_doProcessBlock:function(t,e){var r=this._X;p.call(this),o[0]=r[0]^r[5]>>>16^r[3]<<16,o[1]=r[2]^r[7]>>>16^r[5]<<16,o[2]=r[4]^r[1]>>>16^r[7]<<16,o[3]=r[6]^r[3]>>>16^r[1]<<16;for(var n=0;n<4;n++)o[n]=16711935&(o[n]<<8|o[n]>>>24)|4278255360&(o[n]<<24|o[n]>>>8),t[e+n]^=o[n]},blockSize:4,ivSize:2});function p(){for(var t=this._X,e=this._C,r=0;r<8;r++)c[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<c[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<c[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<c[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<c[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<c[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<c[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<c[6]>>>0?1:0)|0,this._b=e[7]>>>0<c[7]>>>0?1:0;for(r=0;r<8;r++){var n=t[r]+e[r],o=65535&n,i=n>>>16,a=((o*o>>>17)+o*i>>>15)+i*i,s=((4294901760&n)*n|0)+((65535&n)*n|0);u[r]=a^s}t[0]=u[0]+(u[7]<<16|u[7]>>>16)+(u[6]<<16|u[6]>>>16)|0,t[1]=u[1]+(u[0]<<8|u[0]>>>24)+u[7]|0,t[2]=u[2]+(u[1]<<16|u[1]>>>16)+(u[0]<<16|u[0]>>>16)|0,t[3]=u[3]+(u[2]<<8|u[2]>>>24)+u[1]|0,t[4]=u[4]+(u[3]<<16|u[3]>>>16)+(u[2]<<16|u[2]>>>16)|0,t[5]=u[5]+(u[4]<<8|u[4]>>>24)+u[3]|0,t[6]=u[6]+(u[5]<<16|u[5]>>>16)+(u[4]<<16|u[4]>>>16)|0,t[7]=u[7]+(u[6]<<8|u[6]>>>24)+u[5]|0}t.RabbitLegacy=e._createHelper(n)}(),i.RabbitLegacy},"object"==typeof r?e.exports=r=o(t("./core"),t("./enc-base64"),t("./md5"),t("./evpkdf"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53,"./enc-base64":54,"./evpkdf":56,"./md5":61}],74:[function(t,e,r){var n,o;n=this,o=function(i){return function(){var t=i,e=t.lib.StreamCipher,r=t.algo,o=[],c=[],u=[],n=r.Rabbit=e.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=0;r<4;r++)t[r]=16711935&(t[r]<<8|t[r]>>>24)|4278255360&(t[r]<<24|t[r]>>>8);var n=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],o=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]];for(r=this._b=0;r<4;r++)p.call(this);for(r=0;r<8;r++)o[r]^=n[r+4&7];if(e){var i=e.words,a=i[0],s=i[1],c=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),u=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),f=c>>>16|4294901760&u,l=u<<16|65535&c;o[0]^=c,o[1]^=f,o[2]^=u,o[3]^=l,o[4]^=c,o[5]^=f,o[6]^=u,o[7]^=l;for(r=0;r<4;r++)p.call(this)}},_doProcessBlock:function(t,e){var r=this._X;p.call(this),o[0]=r[0]^r[5]>>>16^r[3]<<16,o[1]=r[2]^r[7]>>>16^r[5]<<16,o[2]=r[4]^r[1]>>>16^r[7]<<16,o[3]=r[6]^r[3]>>>16^r[1]<<16;for(var n=0;n<4;n++)o[n]=16711935&(o[n]<<8|o[n]>>>24)|4278255360&(o[n]<<24|o[n]>>>8),t[e+n]^=o[n]},blockSize:4,ivSize:2});function p(){for(var t=this._X,e=this._C,r=0;r<8;r++)c[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<c[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<c[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<c[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<c[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<c[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<c[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<c[6]>>>0?1:0)|0,this._b=e[7]>>>0<c[7]>>>0?1:0;for(r=0;r<8;r++){var n=t[r]+e[r],o=65535&n,i=n>>>16,a=((o*o>>>17)+o*i>>>15)+i*i,s=((4294901760&n)*n|0)+((65535&n)*n|0);u[r]=a^s}t[0]=u[0]+(u[7]<<16|u[7]>>>16)+(u[6]<<16|u[6]>>>16)|0,t[1]=u[1]+(u[0]<<8|u[0]>>>24)+u[7]|0,t[2]=u[2]+(u[1]<<16|u[1]>>>16)+(u[0]<<16|u[0]>>>16)|0,t[3]=u[3]+(u[2]<<8|u[2]>>>24)+u[1]|0,t[4]=u[4]+(u[3]<<16|u[3]>>>16)+(u[2]<<16|u[2]>>>16)|0,t[5]=u[5]+(u[4]<<8|u[4]>>>24)+u[3]|0,t[6]=u[6]+(u[5]<<16|u[5]>>>16)+(u[4]<<16|u[4]>>>16)|0,t[7]=u[7]+(u[6]<<8|u[6]>>>24)+u[5]|0}t.Rabbit=e._createHelper(n)}(),i.Rabbit},"object"==typeof r?e.exports=r=o(t("./core"),t("./enc-base64"),t("./md5"),t("./evpkdf"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53,"./enc-base64":54,"./evpkdf":56,"./md5":61}],75:[function(t,e,r){var n,o;n=this,o=function(a){return function(){var t=a,e=t.lib.StreamCipher,r=t.algo,n=r.RC4=e.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,n=this._S=[],o=0;o<256;o++)n[o]=o;o=0;for(var i=0;o<256;o++){var a=o%r,s=e[a>>>2]>>>24-a%4*8&255;i=(i+n[o]+s)%256;var c=n[o];n[o]=n[i],n[i]=c}this._i=this._j=0},_doProcessBlock:function(t,e){t[e]^=o.call(this)},keySize:8,ivSize:0});function o(){for(var t=this._S,e=this._i,r=this._j,n=0,o=0;o<4;o++){r=(r+t[e=(e+1)%256])%256;var i=t[e];t[e]=t[r],t[r]=i,n|=t[(t[e]+t[r])%256]<<24-8*o}return this._i=e,this._j=r,n}t.RC4=e._createHelper(n);var i=r.RC4Drop=n.extend({cfg:n.cfg.extend({drop:192}),_doReset:function(){n._doReset.call(this);for(var t=this.cfg.drop;0<t;t--)o.call(this)}});t.RC4Drop=e._createHelper(i)}(),a.RC4},"object"==typeof r?e.exports=r=o(t("./core"),t("./enc-base64"),t("./md5"),t("./evpkdf"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53,"./enc-base64":54,"./evpkdf":56,"./md5":61}],76:[function(t,e,r){var n,o;n=this,o=function(s){return function(t){var e=s,r=e.lib,n=r.WordArray,o=r.Hasher,i=e.algo,k=n.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),B=n.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),S=n.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=n.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),C=n.create([0,1518500249,1859775393,2400959708,2840853838]),F=n.create([1352829926,1548603684,1836072691,2053994217,0]),a=i.RIPEMD160=o.extend({_doReset:function(){this._hash=n.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var n=e+r,o=t[n];t[n]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8)}var i,a,s,c,u,f,l,p,h,d,m,y=this._hash.words,v=C.words,g=F.words,b=k.words,_=B.words,w=S.words,x=A.words;f=i=y[0],l=a=y[1],p=s=y[2],h=c=y[3],d=u=y[4];for(r=0;r<80;r+=1)m=i+t[e+b[r]]|0,m+=r<16?I(a,s,c)+v[0]:r<32?N(a,s,c)+v[1]:r<48?O(a,s,c)+v[2]:r<64?P(a,s,c)+v[3]:T(a,s,c)+v[4],m=(m=D(m|=0,w[r]))+u|0,i=u,u=c,c=D(s,10),s=a,a=m,m=f+t[e+_[r]]|0,m+=r<16?T(l,p,h)+g[0]:r<32?P(l,p,h)+g[1]:r<48?O(l,p,h)+g[2]:r<64?N(l,p,h)+g[3]:I(l,p,h)+g[4],m=(m=D(m|=0,x[r]))+d|0,f=d,d=h,h=D(p,10),p=l,l=m;m=y[1]+s+h|0,y[1]=y[2]+c+d|0,y[2]=y[3]+u+f|0,y[3]=y[4]+i+l|0,y[4]=y[0]+a+p|0,y[0]=m},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;e[n>>>5]|=128<<24-n%32,e[14+(n+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process();for(var o=this._hash,i=o.words,a=0;a<5;a++){var s=i[a];i[a]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8)}return o},clone:function(){var t=o.clone.call(this);return t._hash=this._hash.clone(),t}});function I(t,e,r){return t^e^r}function N(t,e,r){return t&e|~t&r}function O(t,e,r){return(t|~e)^r}function P(t,e,r){return t&r|e&~r}function T(t,e,r){return t^(e|~r)}function D(t,e){return t<<e|t>>>32-e}e.RIPEMD160=o._createHelper(a),e.HmacRIPEMD160=o._createHmacHelper(a)}(Math),s.RIPEMD160},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],77:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,o,i,l,a;return r=(e=t).lib,n=r.WordArray,o=r.Hasher,i=e.algo,l=[],a=i.SHA1=o.extend({_doReset:function(){this._hash=new n.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,n=r[0],o=r[1],i=r[2],a=r[3],s=r[4],c=0;c<80;c++){if(c<16)l[c]=0|t[e+c];else{var u=l[c-3]^l[c-8]^l[c-14]^l[c-16];l[c]=u<<1|u>>>31}var f=(n<<5|n>>>27)+s+l[c];f+=c<20?1518500249+(o&i|~o&a):c<40?1859775393+(o^i^a):c<60?(o&i|o&a|i&a)-1894007588:(o^i^a)-899497514,s=a,a=i,i=o<<30|o>>>2,o=n,n=f}r[0]=r[0]+n|0,r[1]=r[1]+o|0,r[2]=r[2]+i|0,r[3]=r[3]+a|0,r[4]=r[4]+s|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;return e[n>>>5]|=128<<24-n%32,e[14+(n+64>>>9<<4)]=Math.floor(r/4294967296),e[15+(n+64>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=o.clone.call(this);return t._hash=this._hash.clone(),t}}),e.SHA1=o._createHelper(a),e.HmacSHA1=o._createHmacHelper(a),t.SHA1},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],78:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,o,i;return r=(e=t).lib.WordArray,n=e.algo,o=n.SHA256,i=n.SHA224=o.extend({_doReset:function(){this._hash=new r.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=o._doFinalize.call(this);return t.sigBytes-=4,t}}),e.SHA224=o._createHelper(i),e.HmacSHA224=o._createHmacHelper(i),t.SHA224},"object"==typeof r?e.exports=r=o(t("./core"),t("./sha256")):"function"==typeof define&&define.amd?define(["./core","./sha256"],o):o(n.CryptoJS)},{"./core":53,"./sha256":79}],79:[function(t,e,r){var n,o;n=this,o=function(c){return function(o){var t=c,e=t.lib,r=e.WordArray,n=e.Hasher,i=t.algo,a=[],b=[];!function(){function t(t){for(var e=o.sqrt(t),r=2;r<=e;r++)if(!(t%r))return!1;return!0}function e(t){return 4294967296*(t-(0|t))|0}for(var r=2,n=0;n<64;)t(r)&&(n<8&&(a[n]=e(o.pow(r,.5))),b[n]=e(o.pow(r,1/3)),n++),r++}();var _=[],s=i.SHA256=n.extend({_doReset:function(){this._hash=new r.init(a.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,n=r[0],o=r[1],i=r[2],a=r[3],s=r[4],c=r[5],u=r[6],f=r[7],l=0;l<64;l++){if(l<16)_[l]=0|t[e+l];else{var p=_[l-15],h=(p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3,d=_[l-2],m=(d<<15|d>>>17)^(d<<13|d>>>19)^d>>>10;_[l]=h+_[l-7]+m+_[l-16]}var y=n&o^n&i^o&i,v=(n<<30|n>>>2)^(n<<19|n>>>13)^(n<<10|n>>>22),g=f+((s<<26|s>>>6)^(s<<21|s>>>11)^(s<<7|s>>>25))+(s&c^~s&u)+b[l]+_[l];f=u,u=c,c=s,s=a+g|0,a=i,i=o,o=n,n=g+(v+y)|0}r[0]=r[0]+n|0,r[1]=r[1]+o|0,r[2]=r[2]+i|0,r[3]=r[3]+a|0,r[4]=r[4]+s|0,r[5]=r[5]+c|0,r[6]=r[6]+u|0,r[7]=r[7]+f|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;return e[n>>>5]|=128<<24-n%32,e[14+(n+64>>>9<<4)]=o.floor(r/4294967296),e[15+(n+64>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA256=n._createHelper(s),t.HmacSHA256=n._createHmacHelper(s)}(Math),c.SHA256},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],80:[function(t,e,r){var n,o;n=this,o=function(i){return function(p){var t=i,e=t.lib,h=e.WordArray,n=e.Hasher,f=t.x64.Word,r=t.algo,I=[],N=[],O=[];!function(){for(var t=1,e=0,r=0;r<24;r++){I[t+5*e]=(r+1)*(r+2)/2%64;var n=(2*t+3*e)%5;t=e%5,e=n}for(t=0;t<5;t++)for(e=0;e<5;e++)N[t+5*e]=e+(2*t+3*e)%5*5;for(var o=1,i=0;i<24;i++){for(var a=0,s=0,c=0;c<7;c++){if(1&o){var u=(1<<c)-1;u<32?s^=1<<u:a^=1<<u-32}128&o?o=o<<1^113:o<<=1}O[i]=f.create(a,s)}}();var P=[];!function(){for(var t=0;t<25;t++)P[t]=f.create()}();var o=r.SHA3=n.extend({cfg:n.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],e=0;e<25;e++)t[e]=new f.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,e){for(var r=this._state,n=this.blockSize/2,o=0;o<n;o++){var i=t[e+2*o],a=t[e+2*o+1];i=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8),a=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),(B=r[o]).high^=a,B.low^=i}for(var s=0;s<24;s++){for(var c=0;c<5;c++){for(var u=0,f=0,l=0;l<5;l++){u^=(B=r[c+5*l]).high,f^=B.low}var p=P[c];p.high=u,p.low=f}for(c=0;c<5;c++){var h=P[(c+4)%5],d=P[(c+1)%5],m=d.high,y=d.low;for(u=h.high^(m<<1|y>>>31),f=h.low^(y<<1|m>>>31),l=0;l<5;l++){(B=r[c+5*l]).high^=u,B.low^=f}}for(var v=1;v<25;v++){var g=(B=r[v]).high,b=B.low,_=I[v];if(_<32)u=g<<_|b>>>32-_,f=b<<_|g>>>32-_;else u=b<<_-32|g>>>64-_,f=g<<_-32|b>>>64-_;var w=P[N[v]];w.high=u,w.low=f}var x=P[0],k=r[0];x.high=k.high,x.low=k.low;for(c=0;c<5;c++)for(l=0;l<5;l++){var B=r[v=c+5*l],S=P[v],A=P[(c+1)%5+5*l],C=P[(c+2)%5+5*l];B.high=S.high^~A.high&C.high,B.low=S.low^~A.low&C.low}B=r[0];var F=O[s];B.high^=F.high,B.low^=F.low}},_doFinalize:function(){var t=this._data,e=t.words,r=(this._nDataBytes,8*t.sigBytes),n=32*this.blockSize;e[r>>>5]|=1<<24-r%32,e[(p.ceil((r+1)/n)*n>>>5)-1]|=128,t.sigBytes=4*e.length,this._process();for(var o=this._state,i=this.cfg.outputLength/8,a=i/8,s=[],c=0;c<a;c++){var u=o[c],f=u.high,l=u.low;f=16711935&(f<<8|f>>>24)|4278255360&(f<<24|f>>>8),l=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8),s.push(l),s.push(f)}return new h.init(s,i)},clone:function(){for(var t=n.clone.call(this),e=t._state=this._state.slice(0),r=0;r<25;r++)e[r]=e[r].clone();return t}});t.SHA3=n._createHelper(o),t.HmacSHA3=n._createHmacHelper(o)}(Math),i.SHA3},"object"==typeof r?e.exports=r=o(t("./core"),t("./x64-core")):"function"==typeof define&&define.amd?define(["./core","./x64-core"],o):o(n.CryptoJS)},{"./core":53,"./x64-core":84}],81:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,n,o,i,a,s;return r=(e=t).x64,n=r.Word,o=r.WordArray,i=e.algo,a=i.SHA512,s=i.SHA384=a.extend({_doReset:function(){this._hash=new o.init([new n.init(3418070365,3238371032),new n.init(1654270250,914150663),new n.init(2438529370,812702999),new n.init(355462360,4144912697),new n.init(1731405415,4290775857),new n.init(2394180231,1750603025),new n.init(3675008525,1694076839),new n.init(1203062813,3204075428)])},_doFinalize:function(){var t=a._doFinalize.call(this);return t.sigBytes-=16,t}}),e.SHA384=a._createHelper(s),e.HmacSHA384=a._createHmacHelper(s),t.SHA384},"object"==typeof r?e.exports=r=o(t("./core"),t("./x64-core"),t("./sha512")):"function"==typeof define&&define.amd?define(["./core","./x64-core","./sha512"],o):o(n.CryptoJS)},{"./core":53,"./sha512":82,"./x64-core":84}],82:[function(t,e,r){var n,o;n=this,o=function(c){return function(){var t=c,e=t.lib.Hasher,r=t.x64,n=r.Word,o=r.WordArray,i=t.algo;function a(){return n.create.apply(n,arguments)}var kt=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],Bt=[];!function(){for(var t=0;t<80;t++)Bt[t]=a()}();var s=i.SHA512=e.extend({_doReset:function(){this._hash=new o.init([new n.init(1779033703,4089235720),new n.init(3144134277,2227873595),new n.init(1013904242,4271175723),new n.init(2773480762,1595750129),new n.init(1359893119,2917565137),new n.init(2600822924,725511199),new n.init(528734635,4215389547),new n.init(1541459225,327033209)])},_doProcessBlock:function(t,e){for(var r=this._hash.words,n=r[0],o=r[1],i=r[2],a=r[3],s=r[4],c=r[5],u=r[6],f=r[7],l=n.high,p=n.low,h=o.high,d=o.low,m=i.high,y=i.low,v=a.high,g=a.low,b=s.high,_=s.low,w=c.high,x=c.low,k=u.high,B=u.low,S=f.high,A=f.low,C=l,F=p,I=h,N=d,O=m,P=y,T=v,D=g,E=b,R=_,M=w,j=x,H=k,q=B,z=S,L=A,U=0;U<80;U++){var W=Bt[U];if(U<16)var J=W.high=0|t[e+2*U],K=W.low=0|t[e+2*U+1];else{var G=Bt[U-15],$=G.high,V=G.low,X=($>>>1|V<<31)^($>>>8|V<<24)^$>>>7,Z=(V>>>1|$<<31)^(V>>>8|$<<24)^(V>>>7|$<<25),Y=Bt[U-2],Q=Y.high,tt=Y.low,et=(Q>>>19|tt<<13)^(Q<<3|tt>>>29)^Q>>>6,rt=(tt>>>19|Q<<13)^(tt<<3|Q>>>29)^(tt>>>6|Q<<26),nt=Bt[U-7],ot=nt.high,it=nt.low,at=Bt[U-16],st=at.high,ct=at.low;J=(J=(J=X+ot+((K=Z+it)>>>0<Z>>>0?1:0))+et+((K=K+rt)>>>0<rt>>>0?1:0))+st+((K=K+ct)>>>0<ct>>>0?1:0);W.high=J,W.low=K}var ut,ft=E&M^~E&H,lt=R&j^~R&q,pt=C&I^C&O^I&O,ht=F&N^F&P^N&P,dt=(C>>>28|F<<4)^(C<<30|F>>>2)^(C<<25|F>>>7),mt=(F>>>28|C<<4)^(F<<30|C>>>2)^(F<<25|C>>>7),yt=(E>>>14|R<<18)^(E>>>18|R<<14)^(E<<23|R>>>9),vt=(R>>>14|E<<18)^(R>>>18|E<<14)^(R<<23|E>>>9),gt=kt[U],bt=gt.high,_t=gt.low,wt=z+yt+((ut=L+vt)>>>0<L>>>0?1:0),xt=mt+ht;z=H,L=q,H=M,q=j,M=E,j=R,E=T+(wt=(wt=(wt=wt+ft+((ut=ut+lt)>>>0<lt>>>0?1:0))+bt+((ut=ut+_t)>>>0<_t>>>0?1:0))+J+((ut=ut+K)>>>0<K>>>0?1:0))+((R=D+ut|0)>>>0<D>>>0?1:0)|0,T=O,D=P,O=I,P=N,I=C,N=F,C=wt+(dt+pt+(xt>>>0<mt>>>0?1:0))+((F=ut+xt|0)>>>0<ut>>>0?1:0)|0}p=n.low=p+F,n.high=l+C+(p>>>0<F>>>0?1:0),d=o.low=d+N,o.high=h+I+(d>>>0<N>>>0?1:0),y=i.low=y+P,i.high=m+O+(y>>>0<P>>>0?1:0),g=a.low=g+D,a.high=v+T+(g>>>0<D>>>0?1:0),_=s.low=_+R,s.high=b+E+(_>>>0<R>>>0?1:0),x=c.low=x+j,c.high=w+M+(x>>>0<j>>>0?1:0),B=u.low=B+q,u.high=k+H+(B>>>0<q>>>0?1:0),A=f.low=A+L,f.high=S+z+(A>>>0<L>>>0?1:0)},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;return e[n>>>5]|=128<<24-n%32,e[30+(n+128>>>10<<5)]=Math.floor(r/4294967296),e[31+(n+128>>>10<<5)]=r,t.sigBytes=4*e.length,this._process(),this._hash.toX32()},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32});t.SHA512=e._createHelper(s),t.HmacSHA512=e._createHmacHelper(s)}(),c.SHA512},"object"==typeof r?e.exports=r=o(t("./core"),t("./x64-core")):"function"==typeof define&&define.amd?define(["./core","./x64-core"],o):o(n.CryptoJS)},{"./core":53,"./x64-core":84}],83:[function(t,e,r){var n,o;n=this,o=function(s){return function(){var t=s,e=t.lib,r=e.WordArray,n=e.BlockCipher,o=t.algo,u=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],f=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],l=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],p=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],h=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],i=o.DES=n.extend({_doReset:function(){for(var t=this._key.words,e=[],r=0;r<56;r++){var n=u[r]-1;e[r]=t[n>>>5]>>>31-n%32&1}for(var o=this._subKeys=[],i=0;i<16;i++){var a=o[i]=[],s=l[i];for(r=0;r<24;r++)a[r/6|0]|=e[(f[r]-1+s)%28]<<31-r%6,a[4+(r/6|0)]|=e[28+(f[r+24]-1+s)%28]<<31-r%6;a[0]=a[0]<<1|a[0]>>>31;for(r=1;r<7;r++)a[r]=a[r]>>>4*(r-1)+3;a[7]=a[7]<<5|a[7]>>>27}var c=this._invSubKeys=[];for(r=0;r<16;r++)c[r]=o[15-r]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,e,r){this._lBlock=t[e],this._rBlock=t[e+1],d.call(this,4,252645135),d.call(this,16,65535),m.call(this,2,858993459),m.call(this,8,16711935),d.call(this,1,1431655765);for(var n=0;n<16;n++){for(var o=r[n],i=this._lBlock,a=this._rBlock,s=0,c=0;c<8;c++)s|=p[c][((a^o[c])&h[c])>>>0];this._lBlock=a,this._rBlock=i^s}var u=this._lBlock;this._lBlock=this._rBlock,this._rBlock=u,d.call(this,1,1431655765),m.call(this,8,16711935),m.call(this,2,858993459),d.call(this,16,65535),d.call(this,4,252645135),t[e]=this._lBlock,t[e+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function d(t,e){var r=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=r,this._lBlock^=r<<t}function m(t,e){var r=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=r,this._rBlock^=r<<t}t.DES=n._createHelper(i);var a=o.TripleDES=n.extend({_doReset:function(){var t=this._key.words;this._des1=i.createEncryptor(r.create(t.slice(0,2))),this._des2=i.createEncryptor(r.create(t.slice(2,4))),this._des3=i.createEncryptor(r.create(t.slice(4,6)))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2});t.TripleDES=n._createHelper(a)}(),s.TripleDES},"object"==typeof r?e.exports=r=o(t("./core"),t("./enc-base64"),t("./md5"),t("./evpkdf"),t("./cipher-core")):"function"==typeof define&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],o):o(n.CryptoJS)},{"./cipher-core":52,"./core":53,"./enc-base64":54,"./evpkdf":56,"./md5":61}],84:[function(t,e,r){var n,o;n=this,o=function(t){var e,r,o,i,n;return r=(e=t).lib,o=r.Base,i=r.WordArray,(n=e.x64={}).Word=o.extend({init:function(t,e){this.high=t,this.low=e}}),n.WordArray=o.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:8*t.length},toX32:function(){for(var t=this.words,e=t.length,r=[],n=0;n<e;n++){var o=t[n];r.push(o.high),r.push(o.low)}return i.create(r,this.sigBytes)},clone:function(){for(var t=o.clone.call(this),e=t.words=this.words.slice(0),r=e.length,n=0;n<r;n++)e[n]=e[n].clone();return t}}),t},"object"==typeof r?e.exports=r=o(t("./core")):"function"==typeof define&&define.amd?define(["./core"],o):o(n.CryptoJS)},{"./core":53}],85:[function(t,v,g){!function(t){var e="object"==typeof g&&g,r="object"==typeof v&&v&&v.exports==e&&v,n="object"==typeof global&&global;n.global!==n&&n.window!==n||(t=n);var o,i,a,s=String.fromCharCode;function c(t){for(var e,r,n=[],o=0,i=t.length;o<i;)55296<=(e=t.charCodeAt(o++))&&e<=56319&&o<i?56320==(64512&(r=t.charCodeAt(o++)))?n.push(((1023&e)<<10)+(1023&r)+65536):(n.push(e),o--):n.push(e);return n}function u(t){if(55296<=t&&t<=57343)throw Error("Lone surrogate U+"+t.toString(16).toUpperCase()+" is not a scalar value")}function f(t,e){return s(t>>e&63|128)}function l(t){if(0==(4294967168&t))return s(t);var e="";return 0==(4294965248&t)?e=s(t>>6&31|192):0==(4294901760&t)?(u(t),e=s(t>>12&15|224),e+=f(t,6)):0==(4292870144&t)&&(e=s(t>>18&7|240),e+=f(t,12),e+=f(t,6)),e+=s(63&t|128)}function p(){if(i<=a)throw Error("Invalid byte index");var t=255&o[a];if(a++,128==(192&t))return 63&t;throw Error("Invalid continuation byte")}function h(){var t,e;if(i<a)throw Error("Invalid byte index");if(a==i)return!1;if(t=255&o[a],a++,0==(128&t))return t;if(192==(224&t)){if(128<=(e=(31&t)<<6|p()))return e;throw Error("Invalid continuation byte")}if(224==(240&t)){if(2048<=(e=(15&t)<<12|p()<<6|p()))return u(e),e;throw Error("Invalid continuation byte")}if(240==(248&t)&&65536<=(e=(15&t)<<18|p()<<12|p()<<6|p())&&e<=1114111)return e;throw Error("Invalid UTF-8 detected")}var d={version:"2.0.0",encode:function(t){for(var e=c(t),r=e.length,n=-1,o="";++n<r;)o+=l(e[n]);return o},decode:function(t){o=c(t),i=o.length,a=0;for(var e,r=[];!1!==(e=h());)r.push(e);return function(t){for(var e,r=t.length,n=-1,o="";++n<r;)65535<(e=t[n])&&(o+=s((e-=65536)>>>10&1023|55296),e=56320|1023&e),o+=s(e);return o}(r)}};if("function"==typeof define&&"object"==typeof define.amd&&define.amd)define(function(){return d});else if(e&&!e.nodeType)if(r)r.exports=d;else{var m={}.hasOwnProperty;for(var y in d)m.call(d,y)&&(e[y]=d[y])}else t.utf8=d}(this)},{}],86:[function(t,e,r){e.exports=XMLHttpRequest},{}],"bignumber.js":[function(r,n,t){!function(t){"use strict";var e,D,E,R=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,M=Math.ceil,j=Math.floor,H=" not a boolean or binary digit",q="rounding mode",z="number type has more than 15 significant digits",L="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_",U=1e14,W=14,i=9007199254740991,J=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13],K=1e7,G=1e9;function $(t){var e=0|t;return 0<t||t===e?e:e-1}function V(t){for(var e,r,n=1,o=t.length,i=t[0]+"";n<o;){for(e=t[n++]+"",r=W-e.length;r--;e="0"+e);i+=e}for(o=i.length;48===i.charCodeAt(--o););return i.slice(0,o+1||1)}function X(t,e){var r,n,o=t.c,i=e.c,a=t.s,s=e.s,c=t.e,u=e.e;if(!a||!s)return null;if(r=o&&!o[0],n=i&&!i[0],r||n)return r?n?0:-s:a;if(a!=s)return a;if(r=a<0,n=c==u,!o||!i)return n?0:!o^r?1:-1;if(!n)return u<c^r?1:-1;for(s=(c=o.length)<(u=i.length)?c:u,a=0;a<s;a++)if(o[a]!=i[a])return o[a]>i[a]^r?1:-1;return c==u?0:u<c^r?1:-1}function Z(t,e,r){return(t=rt(t))>=e&&t<=r}function Y(t){return"[object Array]"==Object.prototype.toString.call(t)}function Q(t,e,r){for(var n,o,i=[0],a=0,s=t.length;a<s;){for(o=i.length;o--;i[o]*=e);for(i[n=0]+=L.indexOf(t.charAt(a++));n<i.length;n++)i[n]>r-1&&(null==i[n+1]&&(i[n+1]=0),i[n+1]+=i[n]/r|0,i[n]%=r)}return i.reverse()}function tt(t,e){return(1<t.length?t.charAt(0)+"."+t.slice(1):t)+(e<0?"e":"e+")+e}function et(t,e){var r,n;if(e<0){for(n="0.";++e;n+="0");t=n+t}else if(++e>(r=t.length)){for(n="0",e-=r;--e;n+="0");t+=n}else e<r&&(t=t.slice(0,e)+"."+t.slice(e));return t}function rt(t){return(t=parseFloat(t))<0?M(t):j(t)}if(e=function t(e){var y,r,u,a,s,c,f,l,_=0,n=F.prototype,v=new F(1),d=20,g=4,p=-7,h=21,m=-1e7,b=1e7,w=!0,x=N,k=!1,B=1,S=100,A={decimalSeparator:".",groupSeparator:",",groupSize:3,secondaryGroupSize:0,fractionGroupSeparator:" ",fractionGroupSize:0};function F(t,e){var r,n,o,i,a,s,c=this;if(!(c instanceof F))return w&&P(26,"constructor call without new",t),new F(t,e);if(null!=e&&x(e,2,64,_,"base")){if(s=t+"",10==(e|=0))return T(c=new F(t instanceof F?t:s),d+c.e+1,g);if((i="number"==typeof t)&&0*t!=0||!new RegExp("^-?"+(r="["+L.slice(0,e)+"]+")+"(?:\\."+r+")?$",e<37?"i":"").test(s))return E(c,s,i,e);i?(c.s=1/t<0?(s=s.slice(1),-1):1,w&&15<s.replace(/^0\.0*|\./,"").length&&P(_,z,t),i=!1):c.s=45===s.charCodeAt(0)?(s=s.slice(1),-1):1,s=C(s,10,e,c.s)}else{if(t instanceof F)return c.s=t.s,c.e=t.e,c.c=(t=t.c)?t.slice():t,void(_=0);if((i="number"==typeof t)&&0*t==0){if(c.s=1/t<0?(t=-t,-1):1,t===~~t){for(n=0,o=t;10<=o;o/=10,n++);return c.e=n,c.c=[t],void(_=0)}s=t+""}else{if(!R.test(s=t+""))return E(c,s,i);c.s=45===s.charCodeAt(0)?(s=s.slice(1),-1):1}}for(-1<(n=s.indexOf("."))&&(s=s.replace(".","")),0<(o=s.search(/e/i))?(n<0&&(n=o),n+=+s.slice(o+1),s=s.substring(0,o)):n<0&&(n=s.length),o=0;48===s.charCodeAt(o);o++);for(a=s.length;48===s.charCodeAt(--a););if(s=s.slice(o,a+1))if(a=s.length,i&&w&&15<a&&P(_,z,c.s*t),b<(n=n-o-1))c.c=c.e=null;else if(n<m)c.c=[c.e=0];else{if(c.e=n,c.c=[],o=(n+1)%W,n<0&&(o+=W),o<a){for(o&&c.c.push(+s.slice(0,o)),a-=W;o<a;)c.c.push(+s.slice(o,o+=W));s=s.slice(o),o=W-s.length}else o-=a;for(;o--;s+="0");c.c.push(+s)}else c.c=[c.e=0];_=0}function C(t,e,r,n){var o,i,a,s,c,u,f,l=t.indexOf("."),p=d,h=g;for(r<37&&(t=t.toLowerCase()),0<=l&&(a=S,S=0,t=t.replace(".",""),c=(f=new F(r)).pow(t.length-l),S=a,f.c=Q(et(V(c.c),c.e),10,e),f.e=f.c.length),i=a=(u=Q(t,r,e)).length;0==u[--a];u.pop());if(!u[0])return"0";if(l<0?--i:(c.c=u,c.e=i,c.s=n,u=(c=y(c,f,p,h,e)).c,s=c.r,i=c.e),l=u[o=i+p+1],a=e/2,s=s||o<0||null!=u[o+1],s=h<4?(null!=l||s)&&(0==h||h==(c.s<0?3:2)):a<l||l==a&&(4==h||s||6==h&&1&u[o-1]||h==(c.s<0?8:7)),o<1||!u[0])t=s?et("1",-p):"0";else{if(u.length=o,s)for(--e;++u[--o]>e;)u[o]=0,o||(++i,u.unshift(1));for(a=u.length;!u[--a];);for(l=0,t="";l<=a;t+=L.charAt(u[l++]));t=et(t,i)}return t}function I(t,e,r,n){var o,i,a,s,c;if(r=null!=r&&x(r,0,8,n,q)?0|r:g,!t.c)return t.toString();if(o=t.c[0],a=t.e,null==e)c=V(t.c),c=19==n||24==n&&a<=p?tt(c,a):et(c,a);else if(i=(t=T(new F(t),e,r)).e,s=(c=V(t.c)).length,19==n||24==n&&(e<=i||i<=p)){for(;s<e;c+="0",s++);c=tt(c,i)}else if(e-=a,c=et(c,i),s<i+1){if(0<--e)for(c+=".";e--;c+="0");}else if(0<(e+=i-s))for(i+1==s&&(c+=".");e--;c+="0");return t.s<0&&o?"-"+c:c}function o(t,e){var r,n,o=0;for(Y(t[0])&&(t=t[0]),r=new F(t[0]);++o<t.length;){if(!(n=new F(t[o])).s){r=n;break}e.call(r,n)&&(r=n)}return r}function N(t,e,r,n,o){return(t<e||r<t||t!=rt(t))&&P(n,(o||"decimal places")+(t<e||r<t?" out of range":" not an integer"),t),!0}function O(t,e,r){for(var n=1,o=e.length;!e[--o];e.pop());for(o=e[0];10<=o;o/=10,n++);return(r=n+r*W-1)>b?t.c=t.e=null:t.c=r<m?[t.e=0]:(t.e=r,e),t}function P(t,e,r){var n=new Error(["new BigNumber","cmp","config","div","divToInt","eq","gt","gte","lt","lte","minus","mod","plus","precision","random","round","shift","times","toDigits","toExponential","toFixed","toFormat","toFraction","pow","toPrecision","toString","BigNumber"][t]+"() "+e+": "+r);throw n.name="BigNumber Error",_=0,n}function T(t,e,r,n){var o,i,a,s,c,u,f,l=t.c,p=J;if(l){t:{for(o=1,s=l[0];10<=s;s/=10,o++);if((i=e-o)<0)i+=W,a=e,f=(c=l[u=0])/p[o-a-1]%10|0;else if((u=M((i+1)/W))>=l.length){if(!n)break t;for(;l.length<=u;l.push(0));c=f=0,a=(i%=W)-W+(o=1)}else{for(c=s=l[u],o=1;10<=s;s/=10,o++);f=(a=(i%=W)-W+o)<0?0:c/p[o-a-1]%10|0}if(n=n||e<0||null!=l[u+1]||(a<0?c:c%p[o-a-1]),n=r<4?(f||n)&&(0==r||r==(t.s<0?3:2)):5<f||5==f&&(4==r||n||6==r&&(0<i?0<a?c/p[o-a]:0:l[u-1])%10&1||r==(t.s<0?8:7)),e<1||!l[0])return l.length=0,n?(e-=t.e+1,l[0]=p[e%W],t.e=-e||0):l[0]=t.e=0,t;if(0==i?(l.length=u,s=1,u--):(l.length=u+1,s=p[W-i],l[u]=0<a?j(c/p[o-a]%p[a])*s:0),n)for(;;){if(0==u){for(i=1,a=l[0];10<=a;a/=10,i++);for(a=l[0]+=s,s=1;10<=a;a/=10,s++);i!=s&&(t.e++,l[0]==U&&(l[0]=1));break}if(l[u]+=s,l[u]!=U)break;l[u--]=0,s=1}for(i=l.length;0===l[--i];l.pop());}t.e>b?t.c=t.e=null:t.e<m&&(t.c=[t.e=0])}return t}return F.another=t,F.ROUND_UP=0,F.ROUND_DOWN=1,F.ROUND_CEIL=2,F.ROUND_FLOOR=3,F.ROUND_HALF_UP=4,F.ROUND_HALF_DOWN=5,F.ROUND_HALF_EVEN=6,F.ROUND_HALF_CEIL=7,F.ROUND_HALF_FLOOR=8,F.EUCLID=9,F.config=function(){var t,e,r=0,n={},o=arguments,i=o[0],a=i&&"object"==typeof i?function(){if(i.hasOwnProperty(e))return null!=(t=i[e])}:function(){if(o.length>r)return null!=(t=o[r++])};return a(e="DECIMAL_PLACES")&&x(t,0,G,2,e)&&(d=0|t),n[e]=d,a(e="ROUNDING_MODE")&&x(t,0,8,2,e)&&(g=0|t),n[e]=g,a(e="EXPONENTIAL_AT")&&(Y(t)?x(t[0],-G,0,2,e)&&x(t[1],0,G,2,e)&&(p=0|t[0],h=0|t[1]):x(t,-G,G,2,e)&&(p=-(h=0|(t<0?-t:t)))),n[e]=[p,h],a(e="RANGE")&&(Y(t)?x(t[0],-G,-1,2,e)&&x(t[1],1,G,2,e)&&(m=0|t[0],b=0|t[1]):x(t,-G,G,2,e)&&(0|t?m=-(b=0|(t<0?-t:t)):w&&P(2,e+" cannot be zero",t))),n[e]=[m,b],a(e="ERRORS")&&(t===!!t||1===t||0===t?(_=0,x=(w=!!t)?N:Z):w&&P(2,e+H,t)),n[e]=w,a(e="CRYPTO")&&(t===!!t||1===t||0===t?(k=!(!t||!D||"object"!=typeof D),t&&!k&&w&&P(2,"crypto unavailable",D)):w&&P(2,e+H,t)),n[e]=k,a(e="MODULO_MODE")&&x(t,0,9,2,e)&&(B=0|t),n[e]=B,a(e="POW_PRECISION")&&x(t,0,G,2,e)&&(S=0|t),n[e]=S,a(e="FORMAT")&&("object"==typeof t?A=t:w&&P(2,e+" not an object",t)),n[e]=A,n},F.max=function(){return o(arguments,n.lt)},F.min=function(){return o(arguments,n.gt)},F.random=(r=9007199254740992,u=Math.random()*r&2097151?function(){return j(Math.random()*r)}:function(){return 8388608*(1073741824*Math.random()|0)+(8388608*Math.random()|0)},function(t){var e,r,n,o,i,a=0,s=[],c=new F(v);if(t=null!=t&&x(t,0,G,14)?0|t:d,o=M(t/W),k)if(D&&D.getRandomValues){for(e=D.getRandomValues(new Uint32Array(o*=2));a<o;)9e15<=(i=131072*e[a]+(e[a+1]>>>11))?(r=D.getRandomValues(new Uint32Array(2)),e[a]=r[0],e[a+1]=r[1]):(s.push(i%1e14),a+=2);a=o/2}else if(D&&D.randomBytes){for(e=D.randomBytes(o*=7);a<o;)9e15<=(i=281474976710656*(31&e[a])+1099511627776*e[a+1]+4294967296*e[a+2]+16777216*e[a+3]+(e[a+4]<<16)+(e[a+5]<<8)+e[a+6])?D.randomBytes(7).copy(e,a):(s.push(i%1e14),a+=7);a=o/7}else w&&P(14,"crypto unavailable",D);if(!a)for(;a<o;)(i=u())<9e15&&(s[a++]=i%1e14);for(o=s[--a],t%=W,o&&t&&(i=J[W-t],s[a]=j(o/i)*i);0===s[a];s.pop(),a--);if(a<0)s=[n=0];else{for(n=-1;0===s[0];s.shift(),n-=W);for(a=1,i=s[0];10<=i;i/=10,a++);a<W&&(n-=W-a)}return c.e=n,c.c=s,c}),y=function(){function S(t,e,r){var n,o,i,a,s=0,c=t.length,u=e%K,f=e/K|0;for(t=t.slice();c--;)s=((o=u*(i=t[c]%K)+(n=f*i+(a=t[c]/K|0)*u)%K*K+s)/r|0)+(n/K|0)+f*a,t[c]=o%r;return s&&t.unshift(s),t}function A(t,e,r,n){var o,i;if(r!=n)i=n<r?1:-1;else for(o=i=0;o<r;o++)if(t[o]!=e[o]){i=t[o]>e[o]?1:-1;break}return i}function C(t,e,r,n){for(var o=0;r--;)t[r]-=o,o=t[r]<e[r]?1:0,t[r]=o*n+t[r]-e[r];for(;!t[0]&&1<t.length;t.shift());}return function(t,e,r,n,o){var i,a,s,c,u,f,l,p,h,d,m,y,v,g,b,_,w,x=t.s==e.s?1:-1,k=t.c,B=e.c;if(!(k&&k[0]&&B&&B[0]))return new F(t.s&&e.s&&(k?!B||k[0]!=B[0]:B)?k&&0==k[0]||!B?0*x:x/0:NaN);for(h=(p=new F(x)).c=[],x=r+(a=t.e-e.e)+1,o||(o=U,a=$(t.e/W)-$(e.e/W),x=x/W|0),s=0;B[s]==(k[s]||0);s++);if(B[s]>(k[s]||0)&&a--,x<0)h.push(1),c=!0;else{for(g=k.length,_=B.length,x+=2,1<(u=j(o/(B[s=0]+1)))&&(B=S(B,u,o),k=S(k,u,o),_=B.length,g=k.length),v=_,m=(d=k.slice(0,_)).length;m<_;d[m++]=0);(w=B.slice()).unshift(0),b=B[0],B[1]>=o/2&&b++;do{if(u=0,(i=A(B,d,_,m))<0){if(y=d[0],_!=m&&(y=y*o+(d[1]||0)),1<(u=j(y/b)))for(o<=u&&(u=o-1),l=(f=S(B,u,o)).length,m=d.length;1==A(f,d,l,m);)u--,C(f,_<l?w:B,l,o),l=f.length,i=1;else 0==u&&(i=u=1),l=(f=B.slice()).length;if(l<m&&f.unshift(0),C(d,f,m,o),m=d.length,-1==i)for(;A(B,d,_,m)<1;)u++,C(d,_<m?w:B,m,o),m=d.length}else 0===i&&(u++,d=[0]);h[s++]=u,d[0]?d[m++]=k[v]||0:(d=[k[v]],m=1)}while((v++<g||null!=d[0])&&x--);c=null!=d[0],h[0]||h.shift()}if(o==U){for(s=1,x=h[0];10<=x;x/=10,s++);T(p,r+(p.e=s+a*W-1)+1,n,c)}else p.e=a,p.r=+c;return p}}(),a=/^(-?)0([xbo])/i,s=/^([^.]+)\.$/,c=/^\.([^.]+)$/,f=/^-?(Infinity|NaN)$/,l=/^\s*\+|^\s+|\s+$/g,E=function(t,e,r,n){var o,i=r?e:e.replace(l,"");if(f.test(i))t.s=isNaN(i)?null:i<0?-1:1;else{if(!r&&(i=i.replace(a,function(t,e,r){return o="x"==(r=r.toLowerCase())?16:"b"==r?2:8,n&&n!=o?t:e}),n&&(o=n,i=i.replace(s,"$1").replace(c,"0.$1")),e!=i))return new F(i,o);w&&P(_,"not a"+(n?" base "+n:"")+" number",e),t.s=null}t.c=t.e=null,_=0},n.absoluteValue=n.abs=function(){var t=new F(this);return t.s<0&&(t.s=1),t},n.ceil=function(){return T(new F(this),this.e+1,2)},n.comparedTo=n.cmp=function(t,e){return _=1,X(this,new F(t,e))},n.decimalPlaces=n.dp=function(){var t,e,r=this.c;if(!r)return null;if(t=((e=r.length-1)-$(this.e/W))*W,e=r[e])for(;e%10==0;e/=10,t--);return t<0&&(t=0),t},n.dividedBy=n.div=function(t,e){return _=3,y(this,new F(t,e),d,g)},n.dividedToIntegerBy=n.divToInt=function(t,e){return _=4,y(this,new F(t,e),0,1)},n.equals=n.eq=function(t,e){return _=5,0===X(this,new F(t,e))},n.floor=function(){return T(new F(this),this.e+1,3)},n.greaterThan=n.gt=function(t,e){return _=6,0<X(this,new F(t,e))},n.greaterThanOrEqualTo=n.gte=function(t,e){return _=7,1===(e=X(this,new F(t,e)))||0===e},n.isFinite=function(){return!!this.c},n.isInteger=n.isInt=function(){return!!this.c&&$(this.e/W)>this.c.length-2},n.isNaN=function(){return!this.s},n.isNegative=n.isNeg=function(){return this.s<0},n.isZero=function(){return!!this.c&&0==this.c[0]},n.lessThan=n.lt=function(t,e){return _=8,X(this,new F(t,e))<0},n.lessThanOrEqualTo=n.lte=function(t,e){return _=9,-1===(e=X(this,new F(t,e)))||0===e},n.minus=n.sub=function(t,e){var r,n,o,i,a=this,s=a.s;if(_=10,e=(t=new F(t,e)).s,!s||!e)return new F(NaN);if(s!=e)return t.s=-e,a.plus(t);var c=a.e/W,u=t.e/W,f=a.c,l=t.c;if(!c||!u){if(!f||!l)return f?(t.s=-e,t):new F(l?a:NaN);if(!f[0]||!l[0])return l[0]?(t.s=-e,t):new F(f[0]?a:3==g?-0:0)}if(c=$(c),u=$(u),f=f.slice(),s=c-u){for((o=(i=s<0)?(s=-s,f):(u=c,l)).reverse(),e=s;e--;o.push(0));o.reverse()}else for(n=(i=(s=f.length)<(e=l.length))?s:e,s=e=0;e<n;e++)if(f[e]!=l[e]){i=f[e]<l[e];break}if(i&&(o=f,f=l,l=o,t.s=-t.s),0<(e=(n=l.length)-(r=f.length)))for(;e--;f[r++]=0);for(e=U-1;s<n;){if(f[--n]<l[n]){for(r=n;r&&!f[--r];f[r]=e);--f[r],f[n]+=U}f[n]-=l[n]}for(;0==f[0];f.shift(),--u);return f[0]?O(t,f,u):(t.s=3==g?-1:1,t.c=[t.e=0],t)},n.modulo=n.mod=function(t,e){var r,n,o=this;return _=11,t=new F(t,e),!o.c||!t.s||t.c&&!t.c[0]?new F(NaN):!t.c||o.c&&!o.c[0]?new F(o):(9==B?(n=t.s,t.s=1,r=y(o,t,0,3),t.s=n,r.s*=n):r=y(o,t,0,B),o.minus(r.times(t)))},n.negated=n.neg=function(){var t=new F(this);return t.s=-t.s||null,t},n.plus=n.add=function(t,e){var r,n=this,o=n.s;if(_=12,e=(t=new F(t,e)).s,!o||!e)return new F(NaN);if(o!=e)return t.s=-e,n.minus(t);var i=n.e/W,a=t.e/W,s=n.c,c=t.c;if(!i||!a){if(!s||!c)return new F(o/0);if(!s[0]||!c[0])return c[0]?t:new F(s[0]?n:0*o)}if(i=$(i),a=$(a),s=s.slice(),o=i-a){for((r=0<o?(a=i,c):(o=-o,s)).reverse();o--;r.push(0));r.reverse()}for((o=s.length)-(e=c.length)<0&&(r=c,c=s,s=r,e=o),o=0;e;)o=(s[--e]=s[e]+c[e]+o)/U|0,s[e]%=U;return o&&(s.unshift(o),++a),O(t,s,a)},n.precision=n.sd=function(t){var e,r,n=this.c;if(null!=t&&t!==!!t&&1!==t&&0!==t&&(w&&P(13,"argument"+H,t),t!=!!t&&(t=null)),!n)return null;if(e=(r=n.length-1)*W+1,r=n[r]){for(;r%10==0;r/=10,e--);for(r=n[0];10<=r;r/=10,e++);}return t&&this.e+1>e&&(e=this.e+1),e},n.round=function(t,e){var r=new F(this);return(null==t||x(t,0,G,15))&&T(r,~~t+this.e+1,null!=e&&x(e,0,8,15,q)?0|e:g),r},n.shift=function(t){var e=this;return x(t,-i,i,16,"argument")?e.times("1e"+rt(t)):new F(e.c&&e.c[0]&&(t<-i||i<t)?e.s*(t<0?0:1/0):e)},n.squareRoot=n.sqrt=function(){var t,e,r,n,o,i=this,a=i.c,s=i.s,c=i.e,u=d+4,f=new F("0.5");if(1!==s||!a||!a[0])return new F(!s||s<0&&(!a||a[0])?NaN:a?i:1/0);if((r=0==(s=Math.sqrt(+i))||s==1/0?(((e=V(a)).length+c)%2==0&&(e+="0"),s=Math.sqrt(e),c=$((c+1)/2)-(c<0||c%2),new F(e=s==1/0?"1e"+c:(e=s.toExponential()).slice(0,e.indexOf("e")+1)+c)):new F(s+"")).c[0])for((s=(c=r.e)+u)<3&&(s=0);;)if(o=r,r=f.times(o.plus(y(i,o,u,1))),V(o.c).slice(0,s)===(e=V(r.c)).slice(0,s)){if(r.e<c&&--s,"9999"!=(e=e.slice(s-3,s+1))&&(n||"4999"!=e)){+e&&(+e.slice(1)||"5"!=e.charAt(0))||(T(r,r.e+d+2,1),t=!r.times(r).eq(i));break}if(!n&&(T(o,o.e+d+2,0),o.times(o).eq(i))){r=o;break}u+=4,s+=4,n=1}return T(r,r.e+d+1,g,t)},n.times=n.mul=function(t,e){var r,n,o,i,a,s,c,u,f,l,p,h,d,m,y,v=this,g=v.c,b=(_=17,t=new F(t,e)).c;if(!(g&&b&&g[0]&&b[0]))return!v.s||!t.s||g&&!g[0]&&!b||b&&!b[0]&&!g?t.c=t.e=t.s=null:(t.s*=v.s,g&&b?(t.c=[0],t.e=0):t.c=t.e=null),t;for(n=$(v.e/W)+$(t.e/W),t.s*=v.s,(c=g.length)<(l=b.length)&&(d=g,g=b,b=d,o=c,c=l,l=o),o=c+l,d=[];o--;d.push(0));for(m=U,y=K,o=l;0<=--o;){for(r=0,p=b[o]%y,h=b[o]/y|0,i=o+(a=c);o<i;)r=((u=p*(u=g[--a]%y)+(s=h*u+(f=g[a]/y|0)*p)%y*y+d[i]+r)/m|0)+(s/y|0)+h*f,d[i--]=u%m;d[i]=r}return r?++n:d.shift(),O(t,d,n)},n.toDigits=function(t,e){var r=new F(this);return t=null!=t&&x(t,1,G,18,"precision")?0|t:null,e=null!=e&&x(e,0,8,18,q)?0|e:g,t?T(r,t,e):r},n.toExponential=function(t,e){return I(this,null!=t&&x(t,0,G,19)?1+~~t:null,e,19)},n.toFixed=function(t,e){return I(this,null!=t&&x(t,0,G,20)?~~t+this.e+1:null,e,20)},n.toFormat=function(t,e){var r=I(this,null!=t&&x(t,0,G,21)?~~t+this.e+1:null,e,21);if(this.c){var n,o=r.split("."),i=+A.groupSize,a=+A.secondaryGroupSize,s=A.groupSeparator,c=o[0],u=o[1],f=this.s<0,l=f?c.slice(1):c,p=l.length;if(a&&(n=i,i=a,p-=a=n),0<i&&0<p){for(n=p%i||i,c=l.substr(0,n);n<p;n+=i)c+=s+l.substr(n,i);0<a&&(c+=s+l.slice(n)),f&&(c="-"+c)}r=u?c+A.decimalSeparator+((a=+A.fractionGroupSize)?u.replace(new RegExp("\\d{"+a+"}\\B","g"),"$&"+A.fractionGroupSeparator):u):c}return r},n.toFraction=function(t){var e,r,n,o,i,a,s,c,u,f=w,l=this,p=l.c,h=new F(v),d=r=new F(v),m=s=new F(v);if(null!=t&&(w=!1,a=new F(t),w=f,(f=a.isInt())&&!a.lt(v)||(w&&P(22,"max denominator "+(f?"out of range":"not an integer"),t),t=!f&&a.c&&T(a,a.e+1,1).gte(v)?a:null)),!p)return l.toString();for(u=V(p),o=h.e=u.length-l.e-1,h.c[0]=J[(i=o%W)<0?W+i:i],t=!t||0<a.cmp(h)?0<o?h:d:a,i=b,b=1/0,a=new F(u),s.c[0]=0;c=y(a,h,0,1),1!=(n=r.plus(c.times(m))).cmp(t);)r=m,m=n,d=s.plus(c.times(n=d)),s=n,h=a.minus(c.times(n=h)),a=n;return n=y(t.minus(r),m,0,1),s=s.plus(n.times(d)),r=r.plus(n.times(m)),s.s=d.s=l.s,e=y(d,m,o*=2,g).minus(l).abs().cmp(y(s,r,o,g).minus(l).abs())<1?[d.toString(),m.toString()]:[s.toString(),r.toString()],b=i,e},n.toNumber=function(){return+this||(this.s?0*this.s:NaN)},n.toPower=n.pow=function(t){var e,r,n=j(t<0?-t:+t),o=this;if(!x(t,-i,i,23,"exponent")&&(!isFinite(t)||i<n&&(t/=0)||parseFloat(t)!=t&&!(t=NaN)))return new F(Math.pow(+o,t));for(e=S?M(S/W+2):0,r=new F(v);;){if(n%2){if(!(r=r.times(o)).c)break;e&&r.c.length>e&&(r.c.length=e)}if(!(n=j(n/2)))break;o=o.times(o),e&&o.c&&o.c.length>e&&(o.c.length=e)}return t<0&&(r=v.div(r)),e?T(r,S,g):r},n.toPrecision=function(t,e){return I(this,null!=t&&x(t,1,G,24,"precision")?0|t:null,e,24)},n.toString=function(t){var e,r=this.s,n=this.e;return null===n?r?(e="Infinity",r<0&&(e="-"+e)):e="NaN":(e=V(this.c),e=null!=t&&x(t,2,64,25,"base")?C(et(e,n),0|t,10,r):n<=p||h<=n?tt(e,n):et(e,n),r<0&&this.c[0]&&(e="-"+e)),e},n.truncated=n.trunc=function(){return T(new F(this),this.e+1,1)},n.valueOf=n.toJSON=function(){return this.toString()},null!=e&&F.config(e),F}(),"function"==typeof define&&define.amd)define(function(){return e});else if(void 0!==n&&n.exports){if(n.exports=e,!D)try{D=r("crypto")}catch(t){}}else t.BigNumber=e}(this)},{crypto:50}],vnt:[function(t,e,r){var n=t("./lib/vnt");"undefined"!=typeof window&&void 0===window.Vnt&&(window.Vnt=n),e.exports=n},{"./lib/vnt":23}]},{},["vnt"]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":9}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],9:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":7,"buffer":9,"ieee754":14}],10:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],11:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":16}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],13:[function(require,module,exports){
var http = require('http')
var url = require('url')

var https = module.exports

for (var key in http) {
  if (http.hasOwnProperty(key)) https[key] = http[key]
}

https.request = function (params, cb) {
  params = validateParams(params)
  return http.request.call(this, params, cb)
}

https.get = function (params, cb) {
  params = validateParams(params)
  return http.get.call(this, params, cb)
}

function validateParams (params) {
  if (typeof params === 'string') {
    params = url.parse(params)
  }
  if (!params.protocol) {
    params.protocol = 'https:'
  }
  if (params.protocol !== 'https:') {
    throw new Error('Protocol "' + params.protocol + '" not supported. Expected "https:"')
  }
  return params
}

},{"http":35,"url":41}],14:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],16:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],17:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],18:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":19}],19:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],20:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],23:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":21,"./encode":22}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":26,"./_stream_writable":28,"core-util-is":11,"inherits":15,"process-nextick-args":18}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":27,"core-util-is":11,"inherits":15}],26:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":24,"./internal/streams/BufferList":29,"./internal/streams/destroy":30,"./internal/streams/stream":31,"_process":19,"core-util-is":11,"events":12,"inherits":15,"isarray":17,"process-nextick-args":18,"safe-buffer":34,"string_decoder/":32,"util":8}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":24,"core-util-is":11,"inherits":15}],28:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"./_stream_duplex":24,"./internal/streams/destroy":30,"./internal/streams/stream":31,"_process":19,"core-util-is":11,"inherits":15,"process-nextick-args":18,"safe-buffer":34,"timers":39,"util-deprecate":43}],29:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":34,"util":8}],30:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":18}],31:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":12}],32:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":34}],33:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":24,"./lib/_stream_passthrough.js":25,"./lib/_stream_readable.js":26,"./lib/_stream_transform.js":27,"./lib/_stream_writable.js":28}],34:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":9}],35:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var response = require('./lib/response')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.ClientRequest = ClientRequest
http.IncomingMessage = response.IncomingMessage

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.globalAgent = new http.Agent()

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":37,"./lib/response":38,"builtin-status-codes":10,"url":41,"xtend":44}],36:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.writableStream = isFunction(global.WritableStream)

exports.abortController = isFunction(global.AbortController)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'))

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || ('requestTimeout' in opts && !capability.abortController)) {
		// If the use of XHR should be preferred. Not typically needed.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)
	self._fetchTimer = null

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var header = this._headers[name.toLowerCase()]
	if (header)
		return header.value
	return null
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
		if (capability.arraybuffer) {
			body = toArrayBuffer(Buffer.concat(self._body))
		} else if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	// create flattened list of headers
	var headersList = []
	Object.keys(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name
		var value = headersObj[keyName].value
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v])
			})
		} else {
			headersList.push([name, value])
		}
	})

	if (self._mode === 'fetch') {
		var signal = null
		var fetchTimer = null
		if (capability.abortController) {
			var controller = new AbortController()
			signal = controller.signal
			self._fetchAbortController = controller

			if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
				self._fetchTimer = global.setTimeout(function () {
					self.emit('requestTimeout')
					if (self._fetchAbortController)
						self._fetchAbortController.abort()
				}, opts.requestTimeout)
			}
		}

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin',
			signal: signal
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			global.clearTimeout(self._fetchTimer)
			if (!self._destroyed)
				self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('requestTimeout' in opts) {
			xhr.timeout = opts.requestTimeout
			xhr.ontimeout = function () {
				self.emit('requestTimeout')
			}
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1])
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._fetchTimer)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	global.clearTimeout(self._fetchTimer)
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	else if (self._fetchAbortController)
		self._fetchAbortController.abort()
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":36,"./response":38,"_process":19,"buffer":9,"inherits":15,"readable-stream":33,"to-arraybuffer":40}],38:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, fetchTimer) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function (header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})

		if (capability.writableStream) {
			var writable = new WritableStream({
				write: function (chunk) {
					return new Promise(function (resolve, reject) {
						if (self._destroyed) {
							reject()
						} else if(self.push(new Buffer(chunk))) {
							resolve()
						} else {
							self._resumeFetch = resolve
						}
					})
				},
				close: function () {
					global.clearTimeout(fetchTimer)
					if (!self._destroyed)
						self.push(null)
				},
				abort: function (err) {
					if (!self._destroyed)
						self.emit('error', err)
				}
			})

			try {
				response.body.pipeTo(writable).catch(function (err) {
					global.clearTimeout(fetchTimer)
					if (!self._destroyed)
						self.emit('error', err)
				})
				return
			} catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
		}
		// fallback for when writableStream or pipeTo aren't available
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					global.clearTimeout(fetchTimer)
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			}).catch(function (err) {
				global.clearTimeout(fetchTimer)
				if (!self._destroyed)
					self.emit('error', err)
			})
		}
		read()
	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {
	var self = this

	var resolve = self._resumeFetch
	if (resolve) {
		self._resumeFetch = null
		resolve()
	}
}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":36,"_process":19,"buffer":9,"inherits":15,"readable-stream":33}],39:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":19,"timers":39}],40:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":9}],41:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":42,"punycode":20,"querystring":23}],42:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],43:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],44:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[4]);
