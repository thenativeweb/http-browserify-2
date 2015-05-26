'use strict';

var parseResponseHeaders = function (headersAsString) {
  var headers = {};

  if (!headersAsString) {
    return headers;
  }

  headersAsString.split('\u000d\u000a').forEach(function (keyValuePair) {
    var index = keyValuePair.indexOf('\u003a\u0020');

    var key = keyValuePair.substring(0, index),
        value = keyValuePair.substring(index + 2);

    headers[key] = value;
  });

  return headers;
};

module.exports = parseResponseHeaders;
