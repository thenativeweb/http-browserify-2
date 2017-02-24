'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stream = require('stream'),
    url = require('url');

var parseResponseHeaders = require('./parseResponseHeaders');

var PassThrough = stream.PassThrough;

var xhrStatus = {
  headersReceived: 2,
  loading: 3,
  done: 4
};

var setupRequest = function setupRequest(protocol) {
  var http = {};

  http.get = function (options, callback) {
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      options.method = 'GET';
    }

    var req = http.request(options, callback);

    req.end();

    return req;
  };

  http.request = function (options, callback) {
    var hasErrored = false;

    var reqMethod = void 0,
        reqUrl = void 0;

    if (!options) {
      throw new Error('Options are missing.');
    }

    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      options.path = options.path || '/';

      options.protocol = protocol;
      options.hostname = options.hostname || 'localhost';
      options.port = options.port || (protocol === 'http' ? 80 : 443);
      options.pathname = options.path.split('?')[0];
      options.search = options.path.split('?')[1] || '';

      reqMethod = options.method || 'GET';
      reqUrl = url.format(options);
    } else {
      reqMethod = 'GET';
      reqUrl = options;
    }

    var req = new PassThrough(),
        res = new PassThrough();

    var reqData = '';

    req.on('data', function (data) {
      reqData += data.toString('utf8');
    });

    req.once('finish', function () {
      /* eslint-disable no-undef */
      var xhr = new XMLHttpRequest();
      /* eslint-enable no-undef */

      var bytesHandled = 0;

      var handleProgress = function handleProgress() {
        var chunks = xhr.responseText,
            newChunk = chunks.substr(bytesHandled);

        if (newChunk) {
          res.write(newChunk);
        }

        bytesHandled = chunks.length;
      };

      var setResHeaders = function setResHeaders() {
        try {
          if (res.headers) {
            return;
          }

          res.statusCode = xhr.status;
          res.headers = parseResponseHeaders(xhr.getAllResponseHeaders());
          res.socket = {};
          res.socket.end = function () {
            // If you abort an XMLHttpRequest it call the onreadystatechange
            // callback, and that calls is indistinguishable from a successful
            // call. Hence, first unsubscribe.
            xhr.onreadystatechange = null;
            xhr.abort();
          };

          /* eslint-disable callback-return */
          callback(res);
          /* eslint-enable callback-return */
        } catch (err) {
          // Ignore the error, since this will be retried automatically on the
          // next state change.
        }
      };

      if ('onprogress' in xhr) {
        xhr.onprogress = handleProgress;
      }

      xhr.onerror = function (err) {
        if (hasErrored) {
          return;
        }
        hasErrored = true;

        req.emit('error', err);
      };

      xhr.ontimeout = function () {
        if (hasErrored) {
          return;
        }
        hasErrored = true;

        req.emit('error', new Error('Request time-out.'));
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === xhrStatus.headersReceived || xhr.readyState === xhrStatus.loading) {
          setResHeaders();
        } else if (xhr.readyState === xhrStatus.done) {
          setResHeaders();
          handleProgress();
          res.end();

          process.nextTick(function () {
            req.removeAllListeners();
            res.removeAllListeners();
          });
        }
      };

      try {
        xhr.open(reqMethod, reqUrl, true);

        for (var header in options.headers) {
          if (options.headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, options.headers[header]);
          }
        }

        xhr.withCredentials = false;
        xhr.send(reqData);
      } catch (err) {
        if (hasErrored) {
          return;
        }
        hasErrored = true;

        req.emit('error', err);
      }
    });

    return req;
  };

  return http;
};

module.exports = setupRequest;