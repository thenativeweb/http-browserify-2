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

var setupRequest = function (protocol) {
  var http = {};

  http.get = function (options, callback) {
    var req;

    if (typeof options === 'object') {
      options.method = 'GET';
    }

    req = http.request(options, callback);
    req.end();

    return req;
  };

  http.request = function (options, callback) {
    var header,
        req,
        reqData,
        reqMethod,
        reqUrl,
        res,
        xhr;

    if (!options) {
      throw new Error('Options are missing.');
    }

    if (typeof options === 'object') {
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

    req = new PassThrough();
    res = new PassThrough();
    reqData = '';

    req.on('data', function (data) {
      reqData += data.toString('utf8');
    });

    req.once('finish', function () {
      var bytesHandled,
          handleProgress;

      /* eslint-disable block-scoped-var, no-undef */
      xhr = new XMLHttpRequest();
      /* eslint-enable block-scoped-var, no-undef */

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

      xhr.onerror = function (err) {
        req.emit('error', err);
      };

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

          process.nextTick(function () {
            req.removeAllListeners();
            res.removeAllListeners();
          });
        }
      };

      try {
        xhr.open(reqMethod, reqUrl, true);

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

  return http;
};

module.exports = setupRequest;
