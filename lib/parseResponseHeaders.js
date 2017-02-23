'use strict';

const parseResponseHeaders = function (headersAsString) {
  const headers = {};

  if (!headersAsString) {
    return headers;
  }

  headersAsString.split('\u000d\u000a').forEach(keyValuePair => {
    const index = keyValuePair.indexOf('\u003a\u0020');

    const key = keyValuePair.substring(0, index),
          value = keyValuePair.substring(index + 2);

    headers[key] = value;
  });

  return headers;
};

module.exports = parseResponseHeaders;
