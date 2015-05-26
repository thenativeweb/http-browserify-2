'use strict';

var stream = require('stream'),
    url = require('url');

var parseResponseHeaders = require('./parseResponseHeaders');

var PassThrough = stream.PassThrough;

var xhrStatus = {
  headersReceived: 2,
  loading: 3,
  done: 4
};

var http = {};

http.request = function (options, callback) {
  var header,
      req,
      reqData,
      res,
      xhr;

  if (!options) {
    throw new Error('Options are missing.');
  }

  if (typeof options === 'object') {
    options.method = options.method || 'GET';
    options.hostname = options.hostname || 'localhost';
    options.port = options.port || 80;
    options.path = options.path || '/';
    options = url.format(options);
  }

  req = new PassThrough();
  reqData = '';
  res = new PassThrough();

  req.on('data', function (data) {
    reqData += data.toString('utf8');
  });

  req.once('finish', function () {
    var bytesHandled,
        handleProgress;

    req.removeAllListeners();

    /*eslint-disable block-scoped-var,no-undef*/
    xhr = new XMLHttpRequest();
    /*eslint-enable block-scoped-var,no-undef*/

    bytesHandled = 0;
    handleProgress = function () {
      var chunks = xhr.responseText,
          newChunk = chunks.substr(bytesHandled);

      if (newChunk) {
        res.write(newChunk);
      }

      bytesHandled = chunks.length;
    };

    if ('onprogress' in xhr) {
      xhr.onprogress = handleProgress;
    }

    xhr.onreadystatechange = function () {
      var setResHeaders = function () {
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

          callback(res);
        } catch (e) {
          // Ignore the error, since this will be retried automatically on the
          // next state change.
        }
      };

      if ((xhr.readyState === xhrStatus.headersReceived) || (xhr.readyState === xhrStatus.loading)) {
        setResHeaders();
      } else if (xhr.readyState === xhrStatus.done) {
        setResHeaders();
        handleProgress();
        res.end();
      }
    };

    try {
      xhr.open(options.method, options.url, true);

      for (header in options.headers) {
        if (options.headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, options.headers[header]);
        }
      }

      xhr.withCredentials = false;
      xhr.send(reqData);
    } catch (e) {
      req.emit('error', e);
    }
  });

  return req;
};

module.exports = http;
