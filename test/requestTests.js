'use strict';

var assert = require('assertthat');

var http = require('../lib/request')('http');

suite('request', function () {
  suite('http', function () {
    test('is an object.', function (done) {
      assert.that(http).is.ofType('object');
      done();
    });

    suite('request', function () {
      test('is a function.', function (done) {
        assert.that(http.request).is.ofType('function');
        done();
      });

      test('throws an error if options are missing.', function (done) {
        assert.that(function () {
          http.request();
        }).is.throwing('Options are missing.');
        done();
      });
    });

    suite('integration tests', function () {
      test('streams a website.', function (done) {
        var req;

        req = http.request('http://www.thenativeweb.io', function (res) {
          var content = '';

          assert.that(res.statusCode).is.equalTo(200);

          res.on('data', function (data) {
            content += data.toString('utf8');
          });

          res.once('end', function () {
            assert.that(content.indexOf('the native web')).is.not.equalTo(-1);
            res.removeAllListeners();
            done();
          });
        });
        req.end();
      });

      test('streams a website.', function (done) {
        var req;

        req = http.request({
          method: 'GET',
          hostname: 'www.thenativeweb.io',
          port: 80,
          path: '/'
        }, function (res) {
          var content = '';

          assert.that(res.statusCode).is.equalTo(200);

          res.on('data', function (data) {
            content += data.toString('utf8');
          });

          res.once('end', function () {
            assert.that(content.indexOf('the native web')).is.not.equalTo(-1);
            res.removeAllListeners();
            done();
          });
        });
        req.end();
      });

      test('returns a 404 if the requested path could not be found.', function (done) {
        var req;

        req = http.request('http://www.thenativeweb.io/foobar', function (res) {
          assert.that(res.statusCode).is.equalTo(404);
          done();
        });

        req.end();
      });

      test('emits an error if the host could not be resolved.', function (done) {
        var req;

        req = http.request('http://localhorst');

        req.once('error', function (err) {
          assert.that(err).is.not.null();
          done();
        });

        req.end();
      });
    });
  });
});
