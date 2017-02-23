'use strict';

var parseResponseHeaders = function parseResponseHeaders(headersAsString) {
  var headers = {};

  if (!headersAsString) {
    return headers;
  }

  headersAsString.split('\r\n').forEach(function (keyValuePair) {
    var index = keyValuePair.indexOf(': ');

    var key = keyValuePair.substring(0, index),
        value = keyValuePair.substring(index + 2);

    headers[key] = value;
  });

  return headers;
};

module.exports = parseResponseHeaders;