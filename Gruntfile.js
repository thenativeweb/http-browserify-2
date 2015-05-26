'use strict';

var tourism = require('tourism');

module.exports = tourism({
  analyse: {
    server: [ '**/*.js', '!node_modules/**/*.js', '!coverage/**/*.js' ],
    options: {
      server: {
        language: 'es5'
      }
    }
  },
  test: {
    server: [ 'test/**/*.js' ]
  },
  shell: {
    "test-browser": "zuul --ui mocha-tdd --local 8080 --open -- test/httpTests.js"
  }
});
